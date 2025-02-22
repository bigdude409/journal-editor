struct Uniforms {
  saturationValue: f32,
  widthRatio: f32,
  heightRatio: f32,
};

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) texCoord: vec2<f32>,
};

@group(0) @binding(2) var<uniform> uniforms: Uniforms;

@vertex
fn vertex_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  let positions = array<vec2<f32>, 4>(
    vec2<f32>(uniforms.widthRatio, uniforms.heightRatio),
    vec2<f32>(uniforms.widthRatio, -uniforms.heightRatio),
    vec2<f32>(-uniforms.widthRatio, uniforms.heightRatio),
    vec2<f32>(-uniforms.widthRatio, -uniforms.heightRatio)
  );
  let texCoords = array<vec2<f32>, 4>(
    vec2<f32>(0.0, 1.0),
    vec2<f32>(1.0, 1.0),
    vec2<f32>(0.0, 0.0),
    vec2<f32>(1.0, 0.0)
  );
  var output: VertexOutput;
  output.position = vec4<f32>(positions[vertexIndex], 0.0, 1.0);
  output.texCoord = texCoords[vertexIndex];
  return output;
} 