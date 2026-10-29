/* T11 D1: dice-box 1.1.4 physics worker moved from Ammo.js (Bullet) to Havok (@babylonjs/havok 1.3.14, MIT). Same messages, same
   buffer layout and the same forces as the original, so the dice move the same way. Havok has no local scaling, so the collider points
   are scaled before the hull is built. Box shapes in Havok take full extents (Ammo took half extents). */
import { lerp } from '../helpers'
import HavokPhysics from "@babylonjs/havok"

let bodies = []
let sleepingBodies = []
let colliders = {}
let world
let HK
let worldWorkerPort
let width = 150
let height = 150
let aspect = 1
let stopLoop = false

const defaultOptions = {
	size: 9.5,
	startingHeight: 8,
	spinForce: 6,
	throwForce: 5,
	gravity: 1,
	mass: 1,
	friction: .8,
	restitution: .1,
	linearDamping: .5,
	angularDamping: .4,
	settleTimeout: 5000,
}

let config = {...defaultOptions}
let diceBufferView

self.onmessage = (e) => {
  switch (e.data.action) {
    case "rollDie":
      rollDie(e.data.sides)
      break;
    case "init":
      init(e.data).then(()=>{ self.postMessage({ action:"init-complete" }) })
      break
    case "clearDice":
			clearDice()
      break
		case "removeDie":
			removeDie(e.data.id)
			break;
		case "resize":
			width = e.data.width
			height = e.data.height
			aspect = width / height
			addBoxToWorld(config.size, config.startingHeight + 10)
			break
		case "updateConfig":
			updateConfig(e.data.options)
			break
    case "connect":
      worldWorkerPort = e.ports[0]
      worldWorkerPort.onmessage = (e) => {
        switch (e.data.action) {
					case "initBuffer":
						diceBufferView = new Float32Array(e.data.diceBuffer)
						diceBufferView[0] = -1
						break;
					case "loadModels":
						loadModels(e.data.options)
						break;
          case "addDie":
						if(e.data.options.newStartPoint){ setStartPosition() }
            rollDie(addDie(e.data.options))
            break;
          case "rollDie":
            rollDie(e.data.id)
            break;
					case "removeDie":
						removeDie(e.data.id)
						break;
          case "stopSimulation":
            stopLoop = true
            break;
          case "resumeSimulation":
						if(e.data.newStartPoint){ setStartPosition() }
            stopLoop = false
            loop()
            break;
					case "stepSimulation":
						diceBufferView = new Float32Array(e.data.diceBuffer)
						loop()
						break;
          default:
            console.error("action not found in physics worker from worldOffscreen worker:", e.data.action)
        }
      }
      break
    default:
      console.error("action not found in physics worker:", e.data.action)
  }
}

const computeGravity = (gravity = defaultOptions.gravity, mass = defaultOptions.mass) => {
	// make gravity a little bit stronger for heavy objects, so they seem heavier
	return gravity === 0 ? 0 : gravity + mass / 3
}

const computeMass = (mass = defaultOptions.mass) => {
	// high values in mass are pretty ineffective, but whole intigers make better config values, so we shave down the value
	// also prevents mass from ever being zero
	return 1 + mass / 3
}

const computeSpin = (spin = defaultOptions.spinForce, spinScale = 40) => {
	// scale down the actual spin value from a nice intiger in config to a fractional value
	return spin/spinScale
}

const computeThrowForce = (throwForce = defaultOptions.throwForce, mass = defaultOptions.mass, scale = defaultOptions.scale) => {
	return throwForce / 2 / mass * (1 + scale / 6)
}

const computeStartingHeight = (height = defaultOptions.startingHeight) => {
	// ensure minimum startingHeight of 1
	return height < 1 ? 1 : height
}




const ok = (r) => { if (r[0] !== HK.Result.RESULT_OK) throw new Error("Havok: " + r[0].value); return r[1] }

const init = async (data) => {
	width = data.width
	height = data.height
	aspect = width / height
	config = {...config,...data.options}
	config.gravity = computeGravity(config.gravity, config.mass)
	config.mass = computeMass(config.mass)
	config.spinForce = computeSpin(config.spinForce)
	config.throwForce = computeThrowForce(config.throwForce,config.mass,config.scale)
	config.startingHeight = computeStartingHeight(config.startingHeight)
	HK = await HavokPhysics({ locateFile: () => `${config.origin + config.assetPath}havok/HavokPhysics.wasm` })
	world = ok(HK.HP_World_Create())
	HK.HP_World_SetGravity(world, [0, -9.81 * config.gravity, 0])
	setStartPosition()
	addBoxToWorld(config.size, config.startingHeight + 10)
}

const updateConfig = (options) => {
	config = {...config, ...options}
	if(options.mass){ config.mass = computeMass(config.mass) }
	if(options.mass || options.gravity) { config.gravity = computeGravity(config.gravity, config.mass) }
	if(options.spinForce) { config.spinForce = computeSpin(config.spinForce) }
	if(options.throwForce || options.mass || options.scale){ config.throwForce = computeThrowForce(config.throwForce, config.mass, config.scale) }
	if(options.startingHeight) { config.startingHeight = computeStartingHeight(config.startingHeight) }
	removeBoxFromWorld()
	addBoxToWorld(config.size, config.startingHeight + 10)
	HK.HP_World_SetGravity(world, [0, -9.81 * config.gravity, 0])
	// colliders are scaled when the hull is built, so a new scale builds them again
	if (options.scale) Object.values(colliders).forEach((c) => { if (c.convexHull) { HK.HP_Shape_Release(c.convexHull); c.convexHull = createConvexHull(c) } })
}

const loadModels = async ({colliders: modelData, meshName}) => {
	let has_d100 = false
	let has_d10 = false
	modelData.forEach((model) => {
		colliders[meshName + '_' + model.name] = model
		colliders[meshName + '_' + model.name].convexHull = createConvexHull(model)
		if (!has_d10) { has_d10 = model.id === "d10_collider" }
		if (!has_d100) { has_d100 = model.id === "d100_collider" }
	})
	if (!has_d100 && has_d10) {
		colliders[`${meshName}_d100_collider`] = colliders[`${meshName}_d10_collider`]
	}
}

const setStartPosition = () => {
	let size = config.size
	let edgeOffset = .5
	let xMin = size * aspect / 2 - edgeOffset
	let xMax = size * aspect / -2 + edgeOffset
	let yMin = size / 2 - edgeOffset
	let yMax = size / -2 + edgeOffset
	let xEnvelope = lerp(xMin, xMax, Math.random())
	let yEnvelope = lerp(yMin, yMax, Math.random())
	let tossFromTop = Math.round(Math.random())
	let tossFromLeft = Math.round(Math.random())
	let tossX = Math.round(Math.random())
	config.startPosition = [
		tossX ? xEnvelope : tossFromLeft ? xMax : xMin,
		config.startingHeight,
		tossX ? tossFromTop ? yMax : yMin : yEnvelope
	]
}

const material = () => [config.friction, config.friction, config.restitution, HK.MaterialCombine.MINIMUM, HK.MaterialCombine.MAXIMUM]
const setup = (shape) => { HK.HP_Shape_SetMaterial(shape, material()); HK.HP_Shape_SetFilterInfo(shape, [1, 0xffffffff]); return shape }

const createConvexHull = (mesh) => {
	const sx = mesh.scaling[0] * config.scale, sy = mesh.scaling[1] * config.scale, sz = mesh.scaling[2] * config.scale
	const n = mesh.positions.length
	const pts = new Float32Array(n)
	for (let i = 0; i < n; i += 3) { pts[i] = mesh.positions[i] * sx; pts[i + 1] = mesh.positions[i + 1] * sy; pts[i + 2] = mesh.positions[i + 2] * sz }
	const ptr = HK._malloc(pts.byteLength)
	new Float32Array(HK.HEAPU8.buffer, ptr, n).set(pts)
	const shape = ok(HK.HP_Shape_CreateConvexHull(ptr, n / 3))
	HK._free(ptr)
	return setup(shape)
}

const quatFrom = (x, y, z, w) => { const l = Math.hypot(x, y, z, w) || 1; return [x / l, y / l, z / l, w / l] }

/* Havok is stable with masses in kilograms. dice-box masses are around 0.1 to 1, at which Havok dice bounce without end
   (tested: a d20 of mass 0.8 still bounced after 9 s, of mass 853 it rested after 2 s). So every die mass is multiplied by MASS_K
   and so is the spin impulse, which keeps the motion of the original */
const MASS_K = 1000
const createBody = (shape, mass, pos, quat) => {
	const body = ok(HK.HP_Body_Create())
	HK.HP_Body_SetShape(body, shape)
	if (mass > 0) {
		HK.HP_Body_SetMotionType(body, HK.MotionType.DYNAMIC)
		const mp = ok(HK.HP_Shape_BuildMassProperties(shape))
		const m = mass * MASS_K, k = m / (mp[1] || 1)
		HK.HP_Body_SetMassProperties(body, [mp[0], m, [mp[2][0] * k, mp[2][1] * k, mp[2][2] * k], mp[3]])
		HK.HP_Body_SetLinearDamping(body, config.linearDamping)
		HK.HP_Body_SetAngularDamping(body, config.angularDamping)
	} else {
		HK.HP_Body_SetMotionType(body, HK.MotionType.STATIC)
	}
	HK.HP_Body_SetQTransform(body, [pos, quat])
	return body
}

let boxParts = []
const addBoxToWorld = (size, height) => {
	if (!HK) return
	const tempParts = []
	const part = (id, center, half) => {
		const shape = ok(HK.HP_Shape_CreateBox([0, 0, 0], [0, 0, 0, 1], [half[0] * 2, half[1] * 2, half[2] * 2]))
		setup(shape)
		const b = createBody(shape, 0, center, [0, 0, 0, 1])
		HK.HP_World_AddBody(world, b, false)
		tempParts.push({ id, body: b, shape })
	}
	part('box_bottom', [0, -.5, 0], [size * aspect, 1, size])
	part('box_top', [0, height - .5, 0], [size * aspect, 1, size])
	part('box_wall_north', [0, 0, (size / -2) - .5], [size * aspect, height, 1])
	part('box_wall_south', [0, 0, (size / 2) + .5], [size * aspect, height, 1])
	part('box_wall_east', [(size * aspect / -2) - .5, 0, 0], [1, height, size])
	part('box_wall_west', [(size * aspect / 2) + .5, 0, 0], [1, height, size])
	if (boxParts.length) { removeBoxFromWorld() }
	boxParts = [...tempParts]
}

const removeBoxFromWorld = () => {
	boxParts.forEach(p => { HK.HP_World_RemoveBody(world, p.body); HK.HP_Body_Release(p.body); HK.HP_Shape_Release(p.shape) })
	boxParts = []
}

const addDie = (options) => {
	const { sides, id, meshName } = options
	const dieType = Number.isInteger(sides) ? `d${sides}` : sides
	const comboKey = `${meshName}_${dieType}_collider`
	const colliderMass = colliders[comboKey]?.physicsMass || .1
	const mass = colliderMass * config.mass * config.scale
	const quat = quatFrom(lerp(-1.5, 1.5, Math.random()), lerp(-1.5, 1.5, Math.random()), lerp(-1.5, 1.5, Math.random()), -1)
	const body = createBody(colliders[comboKey].convexHull, mass, config.startPosition.slice(), quat)
	const die = { id, body, timeout: config.settleTimeout, mass, lastV: 0 }
	HK.HP_World_AddBody(world, body, false)
	bodies.push(die)
	return die
}

const rollDie = (die) => {
	HK.HP_Body_SetLinearVelocity(die.body, [
		lerp(-config.startPosition[0] * .5, -config.startPosition[0] * config.throwForce, Math.random()),
		lerp(-config.startPosition[1], -config.startPosition[1] * 2, Math.random()),
		lerp(-config.startPosition[2] * .5, -config.startPosition[2] * config.throwForce, Math.random()),
	])
	const flippy = Math.random() > .5 ? 1 : -1
	const spinny = lerp(config.spinForce * .5, config.spinForce, Math.random())
	const scale = Math.abs(config.scale - 1) + config.scale * config.scale * (die.mass/config.mass) * .75
	// Ammo applyImpulse(impulse, relative position): the same push off-center, here given as a world position
	const p = ok(HK.HP_Body_GetQTransform(die.body))[0]
	HK.HP_Body_ApplyImpulse(die.body, [p[0] + scale, p[1] + scale, p[2] + scale], [spinny * flippy * MASS_K, spinny * -flippy * MASS_K, spinny * flippy * MASS_K])
}

const removeDie = (id) => {
	sleepingBodies = sleepingBodies.filter((die) => {
		const match = die.id === id
		if (match) { HK.HP_World_RemoveBody(world, die.body); HK.HP_Body_Release(die.body) }
		return !match
	})
}

const clearDice = () => {
	if (diceBufferView && diceBufferView.byteLength) { diceBufferView.fill(0) }
	stopLoop = true
	bodies.concat(sleepingBodies).forEach(d => { HK.HP_World_RemoveBody(world, d.body); HK.HP_Body_Release(d.body) })
	bodies = []
	sleepingBodies = []
}

const STEP = 1 / 90
let acc = 0
const update = (delta) => {
	// fixed steps of 1/90 s. Ammo allowed 2 per frame, so on a slow phone (under 45 frames a second) the dice moved in slow motion
	// and could hit the 5 s settle timeout still rolling. Havok steps are cheap, so up to 6 per frame keep real time down to 15 frames a second
	acc = Math.min(acc + delta / 1000, STEP * 6)
	while (acc >= STEP) { HK.HP_World_Step(world, STEP); acc -= STEP }
	diceBufferView[0] = bodies.length
	for (let i = bodies.length - 1; i >= 0; i--) {
		const d = bodies[i]
		const v = ok(HK.HP_Body_GetLinearVelocity(d.body)), w = ok(HK.HP_Body_GetAngularVelocity(d.body))
		const speed = Math.hypot(v[0], v[1], v[2]), tilt = Math.hypot(w[0], w[1], w[2])
		// a sharp drop of speed means the die hit the table, a wall or another die (for the dice sounds)
		if (d.lastV - speed > 1.5) self.postMessage({ action: "collision", body0Id: d.id, body1Id: "box", force: d.lastV - speed })
		d.lastV = speed
		if (speed < .01 && tilt < .005 || d.timeout < 0) {
			diceBufferView[(i * 8) + 1] = d.id
			diceBufferView[(i * 8) + 2] = -1
			d.asleep = true
			HK.HP_Body_SetLinearVelocity(d.body, [0, 0, 0])
			HK.HP_Body_SetAngularVelocity(d.body, [0, 0, 0])
			HK.HP_Body_SetMotionType(d.body, HK.MotionType.STATIC)
			sleepingBodies.push(bodies.splice(i, 1)[0])
			continue
		}
		d.timeout -= delta
		const t = ok(HK.HP_Body_GetQTransform(d.body)), p = t[0], q = t[1], j = i * 8 + 1
		diceBufferView[j] = d.id
		diceBufferView[j + 1] = p[0]; diceBufferView[j + 2] = p[1]; diceBufferView[j + 3] = p[2]
		diceBufferView[j + 4] = q[0]; diceBufferView[j + 5] = q[1]; diceBufferView[j + 6] = q[2]; diceBufferView[j + 7] = q[3]
	}
}

let last = performance.now()
const loop = () => {
	const now = performance.now()
	const delta = now - last
	last = now
	if (!stopLoop && diceBufferView && diceBufferView.byteLength) {
		update(delta)
		worldWorkerPort.postMessage({ action: 'updates', diceBuffer: diceBufferView.buffer }, [diceBufferView.buffer])
	}
}
