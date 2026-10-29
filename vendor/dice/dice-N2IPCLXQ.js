import{a as e}from"./dice-PY2PUUMF.js";var t="instancesDeclaration",n=`#ifdef INSTANCES
attribute vec4 world0;attribute vec4 world1;attribute vec4 world2;attribute vec4 world3;
#ifdef INSTANCESCOLOR
attribute vec4 instanceColor;
#endif
#if defined(THIN_INSTANCES) && !defined(WORLD_UBO)
uniform mat4 world;
#endif
#if defined(VELOCITY) || defined(PREPASS_VELOCITY) || defined(PREPASS_VELOCITY_LINEAR) || defined(VELOCITY_LINEAR)
attribute vec4 previousWorld0;attribute vec4 previousWorld1;attribute vec4 previousWorld2;attribute vec4 previousWorld3;
#ifdef THIN_INSTANCES
uniform mat4 previousWorld;
#endif
#endif
#else
#if !defined(WORLD_UBO)
uniform mat4 world;
#endif
#if defined(VELOCITY) || defined(PREPASS_VELOCITY) || defined(PREPASS_VELOCITY_LINEAR) || defined(VELOCITY_LINEAR)
uniform mat4 previousWorld;
#endif
#endif
`;e.IncludesShadersStore[t]||(e.IncludesShadersStore[t]=n);var h={name:t,shader:n};var i="fogVertexDeclaration",s=`#ifdef FOG
varying vec3 vFogDistance;
#endif
`;e.IncludesShadersStore[i]||(e.IncludesShadersStore[i]=s);var m={name:i,shader:s};var o="fogVertex",a=`#ifdef FOG
vFogDistance=(view*worldPos).xyz;
#endif
`;e.IncludesShadersStore[o]||(e.IncludesShadersStore[o]=a);var p={name:o,shader:a};var r="shadowsVertex",f=`#ifdef SHADOWS
#if defined(SHADOWCSM{X})
vPositionFromCamera{X}=view*worldPos;for (int i=0; i<SHADOWCSMNUM_CASCADES{X}; i++) {vPositionFromLight{X}[i]=lightMatrix{X}[i]*worldPos;
#ifdef USE_REVERSE_DEPTHBUFFER
vDepthMetric{X}[i]=(-vPositionFromLight{X}[i].z+light{X}.depthValues.x)/light{X}.depthValues.y;
#else
vDepthMetric{X}[i]=(vPositionFromLight{X}[i].z+light{X}.depthValues.x)/light{X}.depthValues.y;
#endif
}
#elif defined(SHADOW{X}) && !defined(SHADOWCUBE{X})
vPositionFromLight{X}=lightMatrix{X}*worldPos;
#ifdef USE_REVERSE_DEPTHBUFFER
vDepthMetric{X}=(-vPositionFromLight{X}.z+light{X}.depthValues.x)/light{X}.depthValues.y;
#else
vDepthMetric{X}=(vPositionFromLight{X}.z+light{X}.depthValues.x)/light{X}.depthValues.y;
#endif
#endif
#endif
`;e.IncludesShadersStore[r]||(e.IncludesShadersStore[r]=f);var D={name:r,shader:f};var d="logDepthVertex",S=`#ifdef LOGARITHMICDEPTH
vFragmentDepth=1.0+gl_Position.w;gl_Position.z=log2(max(0.000001,vFragmentDepth))*logarithmicDepthConstant;
#endif
`;e.IncludesShadersStore[d]||(e.IncludesShadersStore[d]=S);var P={name:d,shader:S};export{h as a,m as b,p as c,D as d,P as e};
