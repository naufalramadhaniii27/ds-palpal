import{a as m,b as s,c as S,d as p,e as u,f as L,g as V}from"./dice-UX6IO7ZW.js";import{a as x}from"./dice-3VJUVS2K.js";import{a as r,b as o,c as a,d as l,e as c,f,g as d}from"./dice-YVGBSQ37.js";import{a as n}from"./dice-5WFE3USX.js";import{a as e}from"./dice-PY2PUUMF.js";var i="shadowOnlyVertexShader",W=`attribute position: vec3f;
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
`;e.ShadersStoreWGSL[i]||(e.ShadersStoreWGSL[i]=W);var v=[r,o,m,n,a,x,s,S,p,l,c,f,d,V,u,L];for(let t of v)e.IncludesShadersStoreWGSL[t.name]||(e.IncludesShadersStoreWGSL[t.name]=t.shader);var R={name:i,shader:W};export{R as shadowOnlyVertexShaderWGSL};
