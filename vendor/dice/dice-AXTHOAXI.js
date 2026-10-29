import{a as s,e as d,f as g,g as S}from"./dice-CANMEELI.js";import{a as c}from"./dice-ZKFLCNWS.js";import{a as f}from"./dice-LUIZDWQJ.js";import{a as i,b as t}from"./dice-CAHFQYPQ.js";import{a as r,b as a}from"./dice-V3CI6MMV.js";import{a as l}from"./dice-5WFE3USX.js";import{a as m}from"./dice-3VJUVS2K.js";import{a as e}from"./dice-PY2PUUMF.js";var o="shadowOnlyPixelShader",u=`#include<sceneUboDeclaration>
uniform alpha: f32;uniform shadowColor: vec3f;
#define ADDITIONAL_UBO_DECLARATION
varying vPositionW: vec3f;
#ifdef NORMAL
varying vNormalW: vec3f;
#endif
#include<helperFunctions>
#include<lightUboDeclaration>[0..maxSimultaneousLights]
#include<lightsFragmentFunctions>
#include<shadowsFragmentFunctions>
#include<clipPlaneFragmentDeclaration>
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>
#if defined(CLUSTLIGHT_BATCH) && CLUSTLIGHT_BATCH>0
varying vViewDepth: f32;
#endif
#define CUSTOM_FRAGMENT_DEFINITIONS
@fragment
fn main(input: FragmentInputs)->FragmentOutputs {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
var viewDirectionW: vec3f=normalize(scene.vEyePosition.xyz-fragmentInputs.vPositionW);
#ifdef NORMAL
var normalW: vec3f=normalize(fragmentInputs.vNormalW);
#else
var normalW: vec3f= vec3f(1.0,1.0,1.0);
#endif
var diffuseBase: vec3f= vec3f(0.,0.,0.);var info: lightingInfo;var shadow: f32=1.;var glossiness: f32=0.;var aggShadow: f32=0.;var numLights: f32=0.;
#include<lightFragment>[0..1]
#define CUSTOM_FRAGMENT_BEFORE_LIGHT_COMPOSITION
var color: vec4f= vec4f(uniforms.shadowColor,(1.0-clamp(shadow,0.,1.))*uniforms.alpha);
#include<logDepthFragment>
#include<fogFragment>
fragmentOutputs.color=color;
#define CUSTOM_FRAGMENT_MAIN_END
}
`;e.ShadersStoreWGSL[o]||(e.ShadersStoreWGSL[o]=u);var h=[l,c,s,d,g,r,m,i,a,S,f,t];for(let n of h)e.IncludesShadersStoreWGSL[n.name]||(e.IncludesShadersStoreWGSL[n.name]=n.shader);var M={name:o,shader:u};export{M as shadowOnlyPixelShaderWGSL};
