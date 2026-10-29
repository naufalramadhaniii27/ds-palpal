import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { CustomMaterial } from '@babylonjs/materials/custom/customMaterial';
import { SerializationHelper } from '@babylonjs/core/Misc/decorators.serialization' /* T11 D1: moved in Babylon 9 */
import { deepCopy } from '../helpers'
import { RawCubeTexture } from '@babylonjs/core/Materials/Textures/rawCubeTexture'
import { FresnelParameters } from '@babylonjs/core/Materials/fresnelParameters'
import { Color3 } from '@babylonjs/core/Maths/math.color'

/* T11 D1: glossy resin finish. A small studio light box made in code (no file, works offline and in the worker): a bright soft
   panel above, a warm one at the side, dark below. The dice reflect it at their edges (fresnel), and the lights draw sharp highlights,
   so they read as polished plastic dice instead of flat paint */
function studioEnv(scene){
  if(scene.__diceEnv) return scene.__diceEnv
  const N = 64, faces = []
  const dir = (f, u, v) => [[1,-v,-u],[-1,-v,u],[u,1,v],[u,-1,-v],[u,-v,1],[-u,-v,-1]][f]
  const lamp = (d, L, w) => { const n = Math.hypot(d[0],d[1],d[2]), c = (d[0]*L[0]+d[1]*L[1]+d[2]*L[2])/n; return Math.pow(Math.max(0,c), w) }
  for (let f = 0; f < 6; f++) {
    const a = new Uint8Array(N*N*4)
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const d = dir(f, (x+.5)/N*2-1, (y+.5)/N*2-1), n = Math.hypot(d[0],d[1],d[2]), up = d[1]/n
      let r = 18 + 70*Math.max(0, up+.2), g = r, b = r + 8
      const top = lamp(d, [-.3,1,.4], 24)*200, side = lamp(d, [.9,.3,-.3], 40)*150, spark = lamp(d, [.2,1,-.5], 900)*255
      r += top + side*1.0 + spark; g += top + side*.85 + spark; b += top + side*.7 + spark
      const i = (y*N+x)*4; a[i] = Math.min(255,r); a[i+1] = Math.min(255,g); a[i+2] = Math.min(255,b); a[i+3] = 255
    }
    faces.push(a)
  }
  scene.__diceEnv = new RawCubeTexture(scene, faces, N, 5 /* RGBA */, 0 /* UNSIGNED_BYTE */, true)
  return scene.__diceEnv
}
function glossy(mat, scene){
  mat.specularTexture = null /* the theme map dulled every highlight */
  mat.specularColor = new Color3(1, 1, 1)
  mat.specularPower = 96
  mat.reflectionTexture = studioEnv(scene)
  mat.reflectionTexture.level = 1
  mat.reflectionFresnelParameters = new FresnelParameters({ bias: .22, power: 1.6, leftColor: Color3.White(), rightColor: Color3.Black() })
  /* glass: a soft inner glow toward the rims, the body stays a solid clay colour in the middle */
  mat.emissiveFresnelParameters = new FresnelParameters({ bias: 0, power: 2.6, leftColor: new Color3(.42, .3, .32), rightColor: Color3.Black() })
  mat.useReflectionFresnelFromSpecular = false
}

// this is a monkey patch for cloning CustomMaterial in BabylonJS
CustomMaterial.prototype.clone = function (name)  {
  const th = this
  const result = SerializationHelper.Clone(() => new CustomMaterial(name, this.getScene()), this)

  result.name = name
  result.id = name  
  result.CustomParts.Fragment_Begin = th.CustomParts.Fragment_Begin
  result.CustomParts.Fragment_Definitions = th.CustomParts.Fragment_Definitions
  result.CustomParts.Fragment_MainBegin = th.CustomParts.Fragment_MainBegin
  result.CustomParts.Fragment_Custom_Diffuse = th.CustomParts.Fragment_Custom_Diffuse
  result.CustomParts.Fragment_Before_Lights = th.CustomParts.Fragment_Before_Lights
  result.CustomParts.Fragment_Before_Fog = th.CustomParts.Fragment_Before_Fog
  result.CustomParts.Fragment_Custom_Alpha = th.CustomParts.Fragment_Custom_Alpha
  result.CustomParts.Fragment_Before_FragColor = th.CustomParts.Fragment_Before_FragColor
  result.CustomParts.Vertex_Begin = th.CustomParts.Vertex_Begin
  result.CustomParts.Vertex_Definitions = th.CustomParts.Vertex_Definitions
  result.CustomParts.Vertex_MainBegin = th.CustomParts.Vertex_MainBegin
  result.CustomParts.Vertex_Before_PositionUpdated = th.CustomParts.Vertex_Before_PositionUpdated
  result.CustomParts.Vertex_Before_NormalUpdated = th.CustomParts.Vertex_Before_NormalUpdated
  result.CustomParts.Vertex_After_WorldPosComputed = th.CustomParts.Vertex_After_WorldPosComputed
  result.CustomParts.Vertex_MainEnd = th.CustomParts.Vertex_MainEnd 

  return result
}

class ThemeLoader {
  loadedThemes = {}
  themeData = {}
  constructor(options) {
    this.scene = options.scene
  }

  async loadStandardMaterial(options) {
    const {theme, material: matParams} = options
    //TODO: apply more matParams
    const diceMaterial = new StandardMaterial(theme, this.scene);

    // TODO: make these methods reusable getDiffuseTexture(matParams, material)
    if(matParams.diffuseTexture){
      diceMaterial.diffuseTexture = await this.getTexture('diffuse', options)
    }
    if(matParams.bumpTexture){
      diceMaterial.bumpTexture = await this.getTexture('bump', options)
    }
    if(matParams.specularTexture){
      diceMaterial.specularTexture = await this.getTexture('specular', options)
    }

    diceMaterial.allowShaderHotSwapping = false

    // other fun params for the future
    // diceMaterial.useAlphaFromDiffuseTexture
    // diceMaterial.useEmissiveAsIllumination
    // diceMaterial.opacityTexture
    // diceMaterial.emissiveTexture
    // diceMaterial.ambientTexture
    // diceMaterial.reflectionTexture
    // diceMaterial.refractionTexture
    // diceMaterial.lightmapTexture

  }

  // this will create two materials - one with light text and one with dark text, the underlying color can be changed by color instance buffers
  async loadColorMaterial(options) {
    const {theme, material: matParams} = options
    // create the custom color material with white/light numbers
    const diceMatLight = new CustomMaterial(theme+'_light',this.scene)
    // Other fun params for the future
    // diceMatLight.useEmissiveAsIllumination = true
    // diceMatLight.useAlphaFromDiffuseTexture = true
    // diceMatLight.ambientColor = Color3.White()
    // diceMatLight.ambientTexture = diceTexture
    // diceMatLight.emissiveTexture = diceTexture
    // diceMatLight.opacityTexture = diceTexture
    const opts = deepCopy(options)
    if(matParams.diffuseTexture && matParams.diffuseTexture.light){
      opts.material.diffuseTexture = options.material.diffuseTexture.light
      diceMatLight.diffuseTexture = await this.getTexture('diffuse', opts)
    }
    if(matParams.bumpTexture){
      diceMatLight.bumpTexture = await this.getTexture('bump', options)
      if(diceMatLight.bumpTexture) diceMatLight.bumpTexture.level = .9 /* T11: deeper engraved numbers */
    }
    if(matParams.specularTexture){
      diceMatLight.specularTexture = await this.getTexture('specular', options)
    }
  
    diceMatLight.allowShaderHotSwapping = false
    glossy(diceMatLight, this.scene)
  
    // the magic that allows for the material color to be changed on instances
    diceMatLight.Vertex_Definitions(`
      attribute vec3 customColor;
      varying vec3 vColor;
    `)
    .Vertex_MainEnd(`
      vColor = customColor;
    `)
    .Fragment_Definitions(`
      varying vec3 vColor;
    `)
    .Fragment_Custom_Diffuse(`
      baseColor.rgb = mix(vColor.rgb, baseColor.rgb, baseColor.a);
    `)

    diceMatLight.AddAttribute('customColor')
  
    // create the custom color material with black/dark numbers
    const diceMatDark = diceMatLight.clone(theme+'_dark')
    if(matParams.diffuseTexture && matParams.diffuseTexture.dark){
      opts.material.diffuseTexture = options.material.diffuseTexture.dark
      diceMatDark.diffuseTexture = await this.getTexture('diffuse', opts)
    }
    // this must be set again for some reason - does not clone
    diceMatDark.AddAttribute('customColor')
    glossy(diceMatDark, this.scene)
  }

  async getTexture(type, options){
    const {basePath, material: matParams, theme} = options
    let texture
    const level = type + 'Level'
    const textureKey = type + 'Texture'
    // const power = type + 'Power'
    try {        
      switch (type) {
        case "diffuse":
          texture = await this.importTextureAsync(`${basePath}/${matParams[textureKey]}`, theme)
          if(matParams[level]) {
            texture.level = matParams[level]
          }
          break;
        case "bump":
          texture = await this.importTextureAsync(`${basePath}/${matParams[textureKey]}`, theme)
          if(matParams[level]) {
            texture.level = matParams[level]
          }
          break;
        case "specular":    
            texture = await this.importTextureAsync(`${basePath}/${matParams[textureKey]}`, theme)
            if(matParams.specularPower){
              texture.specularPower = matParams.specularPower
            }
          break;
      
        default:
          throw new Error(`Texture type: ${type} is not supported`)
      }
    } catch (error) {
      console.error(error)
    }
    return texture
  }

  async importTextureAsync(url,theme) {
    return new Promise((resolve, reject) => {
      let fileName = url.match(/^(.*\/)(.*)$/)
      let texture = new Texture(
          url, // url: Nullable<string>
          this.scene, // sceneOrEngine: Nullable<Scene | ThinEngine>
          undefined, // noMipmapOrOptions?: boolean | ITextureCreationOptions
          true, // invertY?: boolean
          undefined, // samplingMode?: number
          () => resolve(texture), // onLoad?: Nullable<() => void>
          () => reject(`Unable to load texture '${fileName[2]}' for theme: '${theme}'. Check that your assetPath is configured correctly and that the files exist at path: '${fileName[1]}'`) // onError?: Nullable<(message?: string
        )
    }).catch(error => console.error(error))
  }

  async load(options){
    const { material } = options

    if(material.type === "color") {
      await this.loadColorMaterial(options)
    } 
    else if (material.type === "standard") {
      await this.loadStandardMaterial(options)
    } 
    //TODO: more material options
    // else if (material.type === "semiTransparent") {
    //   await this.loadSemiTransparentMaterial(options)
    // }
    else {
      console.error(`Material type: ${material.type} not supported`)
    }
  }
}


export default ThemeLoader