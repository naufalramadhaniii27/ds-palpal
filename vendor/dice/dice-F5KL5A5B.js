import{a as s}from"./dice-2HLT6BHF.js";import{a as f}from"./dice-ORUMGLY4.js";import{a as d}from"./dice-7VDB6THZ.js";import{a as m}from"./dice-BCN7XT3O.js";import{a}from"./dice-NN4PMZJN.js";import{a as t,b as c,c as l}from"./dice-CSOAHGAZ.js";import{a as e}from"./dice-PY2PUUMF.js";var i="lineVertexDeclaration",S=`uniform mat4 viewProjection;
#define ADDITIONAL_VERTEX_DECLARATION
`;e.IncludesShadersStore[i]||(e.IncludesShadersStore[i]=S);var p={name:i,shader:S};var r="lineUboDeclaration",x=`layout(std140,column_major) uniform;
#include<sceneUboDeclaration>
#include<meshUboDeclaration>
`;e.IncludesShadersStore[r]||(e.IncludesShadersStore[r]=x);var P={name:r,shader:x};var n="lineVertexShader",D=`#include<__decl__lineVertex>
#include<instancesDeclaration>
#include<clipPlaneVertexDeclaration>
attribute vec3 position;attribute vec4 normal;uniform float width;uniform float aspectRatio;
#include<logDepthDeclaration>
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
#include<instancesVertex>
mat4 worldViewProjection=viewProjection*finalWorld;vec4 viewPosition=worldViewProjection*vec4(position,1.0);vec4 viewPositionNext=worldViewProjection*vec4(normal.xyz,1.0);vec2 currentScreen=viewPosition.xy/viewPosition.w;vec2 nextScreen=viewPositionNext.xy/viewPositionNext.w;currentScreen.x*=aspectRatio;nextScreen.x*=aspectRatio;vec2 dir=normalize(nextScreen-currentScreen);vec2 normalDir=vec2(-dir.y,dir.x);normalDir*=width/2.0;normalDir.x/=aspectRatio;vec4 offset=vec4(normalDir*normal.w,0.0,0.0);gl_Position=viewPosition+offset;
#if defined(CLIPPLANE) || defined(CLIPPLANE2) || defined(CLIPPLANE3) || defined(CLIPPLANE4) || defined(CLIPPLANE5) || defined(CLIPPLANE6)
vec4 worldPos=finalWorld*vec4(position,1.0);
#include<clipPlaneVertex>
#endif
#include<logDepthVertex>
#define CUSTOM_VERTEX_MAIN_END
}`;e.ShadersStore[n]||(e.ShadersStore[n]=D);var u=[p,d,s,P,a,t,m,c,l,f];for(let o of u)e.IncludesShadersStore[o.name]||(e.IncludesShadersStore[o.name]=o.shader);var g={name:n,shader:D};export{g as lineVertexShader};
