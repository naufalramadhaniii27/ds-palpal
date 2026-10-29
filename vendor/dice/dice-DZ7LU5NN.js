import{a as S}from"./dice-72T4DCPI.js";import{a,b as s}from"./dice-Q3UL3P7R.js";import{a as i,b as t,c as d,d as l}from"./dice-2OYSZKFX.js";import{a as c}from"./dice-KRLBIMGK.js";import{a as n,b as f,c as m}from"./dice-3Q6MGWKV.js";import{a as e}from"./dice-PY2PUUMF.js";var o="colorVertexShader",x=`attribute position: vec3f;
#ifdef VERTEXCOLOR
attribute color: vec4f;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<clipPlaneVertexDeclaration>
#include<fogVertexDeclaration>
#ifdef FOG
uniform view: mat4x4f;
#endif
#include<instancesDeclaration>
uniform viewProjection: mat4x4f;
#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR) && defined(INSTANCES)
varying vColor: vec4f;
#endif
#define CUSTOM_VERTEX_DEFINITIONS
@vertex
fn main(input : VertexInputs)->FragmentInputs {
#define CUSTOM_VERTEX_MAIN_BEGIN
#ifdef VERTEXCOLOR
var colorUpdated: vec4f=vertexInputs.color;
#endif
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
var worldPos: vec4f=finalWorld* vec4f(vertexInputs.position,1.0);vertexOutputs.position=uniforms.viewProjection*worldPos;
#include<clipPlaneVertex>
#include<fogVertex>
#include<vertexColorMixing>
#define CUSTOM_VERTEX_MAIN_END
}`;e.ShadersStoreWGSL[o]||(e.ShadersStoreWGSL[o]=x);var p=[i,t,n,a,c,f,d,l,m,s,S];for(let r of p)e.IncludesShadersStoreWGSL[r.name]||(e.IncludesShadersStoreWGSL[r.name]=r.shader);var b={name:o,shader:x};export{b as colorVertexShaderWGSL};
