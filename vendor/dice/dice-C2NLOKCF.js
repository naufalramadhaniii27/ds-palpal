import{a as e}from"./dice-PY2PUUMF.js";var o="fogVertexDeclaration",t=`#ifdef FOG
varying vec3 vFogDistance;
#endif
`;e.IncludesShadersStore[o]||(e.IncludesShadersStore[o]=t);var a={name:o,shader:t};var r="fogVertex",n=`#ifdef FOG
vFogDistance=(view*worldPos).xyz;
#endif
`;e.IncludesShadersStore[r]||(e.IncludesShadersStore[r]=n);var f={name:r,shader:n};export{a,f as b};
