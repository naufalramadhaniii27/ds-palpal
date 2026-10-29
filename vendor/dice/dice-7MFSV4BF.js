import{a as l}from"./dice-24BCGM62.js";import{a}from"./dice-BCN7XT3O.js";import{a as o,b as i}from"./dice-2DL3VECA.js";import{a as e}from"./dice-PY2PUUMF.js";var n="linePixelShader",t=`#include<clipPlaneFragmentDeclaration>
uniform vec4 color;
#ifdef LOGARITHMICDEPTH
#extension GL_EXT_frag_depth : enable
#endif
#include<logDepthDeclaration>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<logDepthFragment>
#include<clipPlaneFragment>
gl_FragColor=color;
#define CUSTOM_FRAGMENT_MAIN_END
}`;e.ShadersStore[n]||(e.ShadersStore[n]=t);var c=[o,a,l,i];for(let r of c)e.IncludesShadersStore[r.name]||(e.IncludesShadersStore[r.name]=r.shader);var s={name:n,shader:t};export{s as linePixelShader};
