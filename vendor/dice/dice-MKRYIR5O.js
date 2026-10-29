import{a as u,b as L,c as V}from"./dice-ZR5QXYQL.js";import{a,b as s}from"./dice-Q3UL3P7R.js";import{a as r,b as o,c as f,d}from"./dice-2OYSZKFX.js";import{a as x}from"./dice-VDN6L732.js";import{a as S}from"./dice-5WFE3USX.js";import{a as p}from"./dice-3VJUVS2K.js";import{a as l}from"./dice-KRLBIMGK.js";import{a as n,b as c,c as m}from"./dice-3Q6MGWKV.js";import{a as e}from"./dice-PY2PUUMF.js";var i="shadowOnlyVertexShader",W=`attribute position: vec3f;
#ifdef NORMAL
attribute normal: vec3f;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<instancesDeclaration>
#include<sceneUboDeclaration>
#ifdef POINTSIZE
uniform pointSize: f32;
#endif
varying vPositionW: vec3f;
#ifdef NORMAL
varying vNormalW: vec3f;
#endif
#ifdef VERTEXCOLOR
varying vColor: vec4f;
#endif
#include<clipPlaneVertexDeclaration>
#include<logDepthDeclaration>
#include<fogVertexDeclaration>
#include<__decl__lightVxFragment>[0..maxSimultaneousLights]
#if defined(CLUSTLIGHT_BATCH) && CLUSTLIGHT_BATCH>0
varying vViewDepth: f32;
#endif
#define CUSTOM_VERTEX_DEFINITIONS
@vertex
fn main(input : VertexInputs)->FragmentInputs {
#define CUSTOM_VERTEX_MAIN_BEGIN
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
var worldPos: vec4f=finalWorld* vec4f(vertexInputs.position,1.0);vertexOutputs.position=scene.viewProjection*worldPos;vertexOutputs.vPositionW= worldPos.xyz;
#ifdef NORMAL
vertexOutputs.vNormalW=normalize(( finalWorld* vec4f(vertexInputs.normal,0.0)).xyz);
#endif
#include<clipPlaneVertex>
#include<logDepthVertex>
#include<fogVertex>
#include<shadowsVertex>[0..maxSimultaneousLights]
#define CUSTOM_VERTEX_MAIN_END
}
`;e.ShadersStoreWGSL[i]||(e.ShadersStoreWGSL[i]=W);var v=[r,o,l,S,n,p,a,u,L,c,f,d,m,x,s,V];for(let t of v)e.IncludesShadersStoreWGSL[t.name]||(e.IncludesShadersStoreWGSL[t.name]=t.shader);var R={name:i,shader:W};export{R as shadowOnlyVertexShaderWGSL};
