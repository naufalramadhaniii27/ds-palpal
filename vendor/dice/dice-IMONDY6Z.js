import{a as i,b as d}from"./dice-JYLEDCBK.js";import{a as n,b as a}from"./dice-2DL3VECA.js";import{a as e}from"./dice-PY2PUUMF.js";var r="colorPixelShader",l=`#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR) && defined(INSTANCES)
#define VERTEXCOLOR
varying vec4 vColor;
#else
uniform vec4 color;
#endif
#include<clipPlaneFragmentDeclaration>
#include<fogFragmentDeclaration>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR) && defined(INSTANCES)
gl_FragColor=vColor;
#else
gl_FragColor=color;
#endif
#include<fogFragment>(color,gl_FragColor)
#define CUSTOM_FRAGMENT_MAIN_END
}`;e.ShadersStore[r]||(e.ShadersStore[r]=l);var c=[n,i,a,d];for(let o of c)e.IncludesShadersStore[o.name]||(e.IncludesShadersStore[o.name]=o.shader);var C={name:r,shader:l};export{C as colorPixelShader};
