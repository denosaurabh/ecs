struct ProjectionView {
  projView: mat4x4f,
  invProjView: mat4x4f,
};

@group(0) @binding(0) var<uniform> pv : ProjectionView;

struct Transform {
  modelMat: mat4x4f,
  invModelMat: mat4x4f,
};

@group(1) @binding(0) var<uniform> model : Transform;

struct VertexOutput {
  @builtin(position) Position : vec4f,
}

@vertex
fn vertexMain(
  @location(0) position : vec3f,
  @location(1) normal : vec3f
) -> VertexOutput {
  var output : VertexOutput;
  output.Position = pv.projView * model.modelMat * vec4f(position, 1.0);
  return output;
}

@fragment
fn fragMain() -> @location(0) vec4<f32> {
  return vec4f(1.0);
}