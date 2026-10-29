import{a as t}from"./dice-IHLPQ3FA.js";import{a as s,b as p,c as x,d as h,e as u}from"./dice-N2IPCLXQ.js";import{a as r,b as n,c as l,d as c,e as d,f,g as m}from"./dice-E3XPRCMA.js";import{a as S,b as v}from"./dice-NIYFJWRC.js";import{a as V}from"./dice-BCN7XT3O.js";import{a}from"./dice-7VDB6THZ.js";import{a as e}from"./dice-PY2PUUMF.js";var o="shadowOnlyVertexShader",D=`precision highp float;attribute vec3 position;
#ifdef NORMAL
attribute vec3 normal;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<instancesDeclaration>
#include<__decl__sceneVertex>
#ifdef POINTSIZE
uniform float pointSize;
#endif
varying vec3 vPositionW;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif
#include<clipPlaneVertexDeclaration>
#include<logDepthDeclaration>
#include<fogVertexDeclaration>
#include<__decl__lightFragment>[0..maxSimultaneousLights]
#if defined(CLUSTLIGHT_BATCH) && CLUSTLIGHT_BATCH>0
varying float vViewDepth;
#endif
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=finalWorld*vec4(position,1.0);gl_Position=viewProjection*worldPos;vPositionW=vec3(worldPos);
#ifdef NORMAL
vNormalW=normalize(vec3(finalWorld*vec4(normal,0.0)));
#endif
#include<clipPlaneVertex>
#include<logDepthVertex>
#include<fogVertex>
#include<shadowsVertex>[0..maxSimultaneousLights]
#if defined(POINTSIZE) && !defined(WEBGPU)
gl_PointSize=pointSize;
#endif
#define CUSTOM_VERTEX_MAIN_END
}
`;e.ShadersStore[o]||(e.ShadersStore[o]=D);var g=[r,n,s,t,a,l,V,p,S,v,c,d,f,m,u,x,h];for(let i of g)e.IncludesShadersStore[i.name]||(e.IncludesShadersStore[i.name]=i.shader);var z={name:o,shader:D};export{z as shadowOnlyVertexShader};
