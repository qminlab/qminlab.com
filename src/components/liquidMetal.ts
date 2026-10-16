// Only the pieces LiquidWord needs, so the lazy chunk stays small (a dynamic import of the package
// itself would pull every Paper shader).
export { ShaderMount, liquidMetalFragmentShader, toProcessedLiquidMetal, getShaderColorFromString, ShaderFitOptions, LiquidMetalShapes } from '@paper-design/shaders';
