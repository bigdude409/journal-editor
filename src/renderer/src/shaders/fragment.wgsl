@group(0) @binding(0) var myTexture: texture_2d<f32>;
@group(0) @binding(1) var mySampler: sampler;
@group(0) @binding(2) var<uniform> uniforms: Uniforms;

struct Uniforms {
  saturationValue: f32,
  widthRatio: f32,
  heightRatio: f32,
};

@fragment
fn fragment_main(@location(0) texCoord: vec2<f32>) -> @location(0) vec4<f32> {
  let color = textureSample(myTexture, mySampler, texCoord);
  let gray = dot(color.rgb, vec3<f32>(0.299, 0.587, 0.114));
  let finalColor = mix(color.rgb, vec3<f32>(gray), uniforms.saturationValue);
  return vec4<f32>(finalColor, color.a);
} 