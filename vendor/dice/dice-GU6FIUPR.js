import{c as d,d as g,e as h,f as p,g as S,h as u}from"./dice-6UTXJ77S.js";import{a as s,b as f}from"./dice-NIYFJWRC.js";import{a as c}from"./dice-BCN7XT3O.js";import{a as l}from"./dice-7VDB6THZ.js";import{a,b as m}from"./dice-2DL3VECA.js";import{a as t}from"./dice-QANJEEUT.js";import{a as e}from"./dice-PY2PUUMF.js";var i="sceneFragmentDeclaration",F=`uniform mat4 viewProjection;
#ifdef MULTIVIEW
uniform mat4 viewProjectionR;
#endif
uniform mat4 view;uniform mat4 projection;uniform vec4 vEyePosition;uniform mat4 inverseProjection;
`;e.IncludesShadersStore[i]||(e.IncludesShadersStore[i]=F);var v={name:i,shader:F};var n="imageProcessingCompatibility",_=`#ifdef IMAGEPROCESSINGPOSTPROCESS
gl_FragColor.rgb=pow(gl_FragColor.rgb,vec3(2.2));
#endif
`;e.IncludesShadersStore[n]||(e.IncludesShadersStore[n]=_);var I={name:n,shader:_};var r="shadowOnlyPixelShader",T=`precision highp float;
#include<__decl__sceneFragment>
uniform float alpha;uniform vec3 shadowColor;
#define ADDITIONAL_FRAGMENT_DECLARATION
varying vec3 vPositionW;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
#include<helperFunctions>
#include<__decl__lightFragment>[0..maxSimultaneousLights]
#include<lightsFragmentFunctions>
#include<shadowsFragmentFunctions>
#include<clipPlaneFragmentDeclaration>
#ifdef LOGARITHMICDEPTH
#extension GL_EXT_frag_depth : enable
#endif
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>
#if defined(CLUSTLIGHT_BATCH) && CLUSTLIGHT_BATCH>0
varying float vViewDepth;
#endif
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
vec3 viewDirectionW=normalize(vEyePosition.xyz-vPositionW);
#ifdef NORMAL
vec3 normalW=normalize(vNormalW);
#else
vec3 normalW=vec3(1.0,1.0,1.0);
#endif
vec3 diffuseBase=vec3(0.,0.,0.);lightingInfo info;float shadow=1.;float glossiness=0.;float aggShadow=0.;float numLights=0.;
#include<lightFragment>[0..1]
#define CUSTOM_FRAGMENT_BEFORE_LIGHT_COMPOSITION
vec4 color=vec4(shadowColor,(1.0-clamp(shadow,0.,1.))*alpha);
#include<logDepthFragment>
#include<fogFragment>
gl_FragColor=color;
#include<imageProcessingCompatibility>
#define CUSTOM_FRAGMENT_MAIN_END
}`;e.ShadersStore[r]||(e.ShadersStore[r]=T);var D=[v,l,t,s,f,d,g,a,c,h,m,p,S,u,I];for(let o of D)e.IncludesShadersStore[o.name]||(e.IncludesShadersStore[o.name]=o.shader);var V={name:r,shader:T};export{V as shadowOnlyPixelShader};
