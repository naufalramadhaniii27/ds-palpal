import{a as e}from"./dice-PY2PUUMF.js";var t="instancesDeclaration",n=`#ifdef INSTANCES
attribute world0 : vec4<f32>;attribute world1 : vec4<f32>;attribute world2 : vec4<f32>;attribute world3 : vec4<f32>;
#ifdef INSTANCESCOLOR
attribute instanceColor : vec4<f32>;
#endif
#if defined(THIN_INSTANCES) && !defined(WORLD_UBO)
uniform world : mat4x4<f32>;
#endif
#if defined(VELOCITY) || defined(PREPASS_VELOCITY) || defined(PREPASS_VELOCITY_LINEAR) || defined(VELOCITY_LINEAR)
attribute previousWorld0 : vec4<f32>;attribute previousWorld1 : vec4<f32>;attribute previousWorld2 : vec4<f32>;attribute previousWorld3 : vec4<f32>;
#ifdef THIN_INSTANCES
uniform previousWorld : mat4x4<f32>;
#endif
#endif
#else
#if !defined(WORLD_UBO)
uniform world : mat4x4<f32>;
#endif
#if defined(VELOCITY) || defined(PREPASS_VELOCITY) || defined(PREPASS_VELOCITY_LINEAR) || defined(VELOCITY_LINEAR)
uniform previousWorld : mat4x4<f32>;
#endif
#endif
`;e.IncludesShadersStoreWGSL[t]||(e.IncludesShadersStoreWGSL[t]=n);var X={name:t,shader:n};var i="fogVertexDeclaration",a=`#ifdef FOG
varying vFogDistance: vec3f;
#endif
`;e.IncludesShadersStoreWGSL[i]||(e.IncludesShadersStoreWGSL[i]=a);var L={name:i,shader:a};var r="lightVxFragmentDeclaration",v=`#ifdef LIGHT{X}
uniform vLightData{X}: vec4f;uniform vLightDiffuse{X}: vec4f;
#ifdef SPECULARTERM
uniform vLightSpecular{X}: vec4f;
#else
var vLightSpecular{X}: vec4f= vec4f(0.);
#endif
#ifdef SHADOW{X}
#ifdef SHADOWCSM{X}
uniform lightMatrix{X}: mat4x4f[SHADOWCSMNUM_CASCADES{X}];varying var vPositionFromLight{X}: vec4f[SHADOWCSMNUM_CASCADES{X}];varying var vDepthMetric{X}: f32[SHADOWCSMNUM_CASCADES{X}];varying var vPositionFromCamera{X}: vec4f;
#elif defined(SHADOWCUBE{X})
#else
varying var vPositionFromLight{X}: vec4f;varying var vDepthMetric{X}: f32;uniform lightMatrix{X}: mat4x4f;
#endif
uniform shadowsInfo{X}: vec4f;uniform depthValues{X}: vec2f;
#endif
#ifdef SPOTLIGHT{X}
uniform vLightDirection{X}: vec4f;uniform vLightFalloff{X}: vec4f;
#elif defined(POINTLIGHT{X})
uniform vLightFalloff{X}: vec4f;
#elif defined(HEMILIGHT{X})
uniform vLightGround{X}: vec3f;
#endif
#if defined(AREALIGHT{X}) && defined(AREALIGHTUSED) && defined(AREALIGHTSUPPORTED)
uniform vLightWidth{X}: vec4f;uniform vLightHeight{X}: vec4f;
#endif
#endif
`;e.IncludesShadersStoreWGSL[r]||(e.IncludesShadersStoreWGSL[r]=v);var O={name:r,shader:v};var o="lightVxUboDeclaration",h=`#ifdef LIGHT{X}
struct Light{X}
{vLightData: vec4f,
vLightDiffuse: vec4f,
vLightSpecular: vec4f,
#ifdef SPOTLIGHT{X}
vLightDirection: vec4f,
vLightFalloff: vec4f,
#elif defined(POINTLIGHT{X})
vLightFalloff: vec4f,
#elif defined(HEMILIGHT{X})
vLightGround: vec3f,
#elif defined(CLUSTLIGHT{X})
vSliceData: vec2f,
vSliceRanges: array<vec4f,CLUSTLIGHT_SLICES>,
#endif
#if defined(AREALIGHT{X}) && defined(AREALIGHTUSED) && defined(AREALIGHTSUPPORTED)
vLightWidth: vec4f,
vLightHeight: vec4f,
#endif
shadowsInfo: vec4f,
depthValues: vec2f} ;var<uniform> light{X} : Light{X};
#ifdef SHADOW{X}
#ifdef SHADOWCSM{X}
#ifdef SHADOWCSMUBO{X}
struct Cascades{X} {viewFrustumZ: vec4f,
frustumLengths: vec4f,
cascadeBlendFactor: f32,
penumbraDarkness: f32,
depthCorrection: vec4f,
lightSizeUVCorrection: array<vec4f,4>,
lightMatrix: array<mat4x4f,SHADOWCSMNUM_CASCADES{X}>,};var<uniform> cascades{X} : Cascades{X};
#else
uniform lightMatrix{X}: array<mat4x4f,SHADOWCSMNUM_CASCADES{X}>;
#endif
varying vPositionFromLight{X}_0: vec4f;varying vDepthMetric{X}_0: f32;varying vPositionFromLight{X}_1: vec4f;varying vDepthMetric{X}_1: f32;varying vPositionFromLight{X}_2: vec4f;varying vDepthMetric{X}_2: f32;varying vPositionFromLight{X}_3: vec4f;varying vDepthMetric{X}_3: f32;varying vPositionFromCamera{X}: vec4f;
#elif defined(SHADOWCUBE{X})
#else
varying vPositionFromLight{X}: vec4f;varying vDepthMetric{X}: f32;uniform lightMatrix{X}: mat4x4f;
#endif
#endif
#endif
`;e.IncludesShadersStoreWGSL[o]||(e.IncludesShadersStoreWGSL[o]=h);var A={name:o,shader:h};var f="fogVertex",u=`#ifdef FOG
#ifdef SCENE_UBO
vertexOutputs.vFogDistance=(scene.view*worldPos).xyz;
#else
vertexOutputs.vFogDistance=(uniforms.view*worldPos).xyz;
#endif
#endif
`;e.IncludesShadersStoreWGSL[f]||(e.IncludesShadersStoreWGSL[f]=u);var _={name:f,shader:u};var s="shadowsVertex",S=`#ifdef SHADOWS
#if defined(SHADOWCSM{X})
#ifdef SCENE_UBO
vertexOutputs.vPositionFromCamera{X}=scene.view*worldPos;
#else
vertexOutputs.vPositionFromCamera{X}=uniforms.view*worldPos;
#endif
#if SHADOWCSMNUM_CASCADES{X}>0
#ifdef SHADOWCSMUBO{X}
vertexOutputs.vPositionFromLight{X}_0=cascades{X}.lightMatrix[0]*worldPos;
#else
vertexOutputs.vPositionFromLight{X}_0=uniforms.lightMatrix{X}[0]*worldPos;
#endif
#ifdef USE_REVERSE_DEPTHBUFFER
vertexOutputs.vDepthMetric{X}_0=(-vertexOutputs.vPositionFromLight{X}_0.z+light{X}.depthValues.x)/light{X}.depthValues.y;
#else
vertexOutputs.vDepthMetric{X}_0= (vertexOutputs.vPositionFromLight{X}_0.z+light{X}.depthValues.x)/light{X}.depthValues.y;
#endif
#endif
#if SHADOWCSMNUM_CASCADES{X}>1
#ifdef SHADOWCSMUBO{X}
vertexOutputs.vPositionFromLight{X}_1=cascades{X}.lightMatrix[1]*worldPos;
#else
vertexOutputs.vPositionFromLight{X}_1=uniforms.lightMatrix{X}[1]*worldPos;
#endif
#ifdef USE_REVERSE_DEPTHBUFFER
vertexOutputs.vDepthMetric{X}_1=(-vertexOutputs.vPositionFromLight{X}_1.z+light{X}.depthValues.x)/light{X}.depthValues.y;
#else
vertexOutputs.vDepthMetric{X}_1= (vertexOutputs.vPositionFromLight{X}_1.z+light{X}.depthValues.x)/light{X}.depthValues.y;
#endif
#endif 
#if SHADOWCSMNUM_CASCADES{X}>2
#ifdef SHADOWCSMUBO{X}
vertexOutputs.vPositionFromLight{X}_2=cascades{X}.lightMatrix[2]*worldPos;
#else
vertexOutputs.vPositionFromLight{X}_2=uniforms.lightMatrix{X}[2]*worldPos;
#endif
#ifdef USE_REVERSE_DEPTHBUFFER
vertexOutputs.vDepthMetric{X}_2=(-vertexOutputs.vPositionFromLight{X}_2.z+light{X}.depthValues.x)/light{X}.depthValues.y;
#else
vertexOutputs.vDepthMetric{X}_2= (vertexOutputs.vPositionFromLight{X}_2.z+light{X}.depthValues.x)/light{X}.depthValues.y;
#endif
#endif 
#if SHADOWCSMNUM_CASCADES{X}>3
#ifdef SHADOWCSMUBO{X}
vertexOutputs.vPositionFromLight{X}_3=cascades{X}.lightMatrix[3]*worldPos;
#else
vertexOutputs.vPositionFromLight{X}_3=uniforms.lightMatrix{X}[3]*worldPos;
#endif
#ifdef USE_REVERSE_DEPTHBUFFER
vertexOutputs.vDepthMetric{X}_3=(-vertexOutputs.vPositionFromLight{X}_3.z+light{X}.depthValues.x)/light{X}.depthValues.y;
#else
vertexOutputs.vDepthMetric{X}_3= (vertexOutputs.vPositionFromLight{X}_3.z+light{X}.depthValues.x)/light{X}.depthValues.y;
#endif
#endif 
#elif defined(SHADOW{X}) && !defined(SHADOWCUBE{X})
vertexOutputs.vPositionFromLight{X}=uniforms.lightMatrix{X}*worldPos;
#ifdef USE_REVERSE_DEPTHBUFFER
vertexOutputs.vDepthMetric{X}=(-vertexOutputs.vPositionFromLight{X}.z+light{X}.depthValues.x)/light{X}.depthValues.y;
#else
vertexOutputs.vDepthMetric{X}=(vertexOutputs.vPositionFromLight{X}.z+light{X}.depthValues.x)/light{X}.depthValues.y;
#endif
#endif
#endif
`;e.IncludesShadersStoreWGSL[s]||(e.IncludesShadersStoreWGSL[s]=S);var F={name:s,shader:S};var d="logDepthVertex",l=`#ifdef LOGARITHMICDEPTH
vertexOutputs.vFragmentDepth=1.0+vertexOutputs.position.w;vertexOutputs.position.z=log2(max(0.000001,vertexOutputs.vFragmentDepth))*uniforms.logarithmicDepthConstant;
#endif
`;e.IncludesShadersStoreWGSL[d]||(e.IncludesShadersStoreWGSL[d]=l);var V={name:d,shader:l};export{X as a,L as b,O as c,A as d,_ as e,F as f,V as g};
