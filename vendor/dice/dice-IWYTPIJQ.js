import{a as i}from"./dice-LUIZDWQJ.js";import{a as t,b as o}from"./dice-V3CI6MMV.js";import{a}from"./dice-3VJUVS2K.js";import{a as e}from"./dice-PY2PUUMF.js";var r="linePixelShader",l=`#include<clipPlaneFragmentDeclaration>
uniform color: vec4f;
#include<logDepthDeclaration>
#define CUSTOM_FRAGMENT_DEFINITIONS
@fragment
fn main(input: FragmentInputs)->FragmentOutputs {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<logDepthFragment>
#include<clipPlaneFragment>
fragmentOutputs.color=uniforms.color;
#define CUSTOM_FRAGMENT_MAIN_END
}`;e.ShadersStoreWGSL[r]||(e.ShadersStoreWGSL[r]=l);var m=[t,a,i,o];for(let n of m)e.IncludesShadersStoreWGSL[n.name]||(e.IncludesShadersStoreWGSL[n.name]=n.shader);var s={name:r,shader:l};export{s as linePixelShaderWGSL};
