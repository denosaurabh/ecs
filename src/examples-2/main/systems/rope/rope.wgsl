// @group(0) @binding(0) var<uniform> time : f32;
@group(0) @binding(1) var<uniform> projectionView : mat4x4f;

struct Transform {
    modelMat: mat4x4f,
    invModelMat: mat4x4f,
};

@group(1) @binding(0) var<uniform> model : Transform;

struct VertexOutput {
    @builtin(position) Position : vec4f,
    @location(0) color: vec4f,
}
  
@vertex
fn vertexMain(
    @location(0) position : vec4f,
    // @location(1) color : vec4f,
    // @location(2) uv : vec2f
) -> VertexOutput {
    var output : VertexOutput;
    output.Position =  projectionView * model.modelMat * position;

    // output.color = 0.5 * (position + vec4(1.0, 1.0, 1.0, 1.0));

    return output;
}

@fragment
fn fragMain(
//   @location(0) color: vec4f,
) -> @location(0) vec4f {
    return vec4f(1., 0., 0., 1.);
}
