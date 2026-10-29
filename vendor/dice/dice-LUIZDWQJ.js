import{a as t}from"./dice-PY2PUUMF.js";var e="logDepthFragment",r=`#ifdef LOGARITHMICDEPTH
fragmentOutputs.fragDepth=log2(fragmentInputs.vFragmentDepth)*uniforms.logarithmicDepthConstant*0.5;
#endif
`;t.IncludesShadersStoreWGSL[e]||(t.IncludesShadersStoreWGSL[e]=r);var o={name:e,shader:r};export{o as a};
