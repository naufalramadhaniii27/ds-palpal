import{a as e}from"./dice-PY2PUUMF.js";var r="meshUboDeclaration",o=`struct Mesh {world : mat4x4<f32>,
visibility : f32,};var<uniform> mesh : Mesh;
#define WORLD_UBO
`;e.IncludesShadersStoreWGSL[r]||(e.IncludesShadersStoreWGSL[r]=o);var t={name:r,shader:o};export{t as a};
