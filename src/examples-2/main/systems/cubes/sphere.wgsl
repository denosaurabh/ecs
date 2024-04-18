// @group(0) @binding(0) var<uniform> time : f32;
@group(0) @binding(1) var<uniform> projectionView : mat4x4f;
// @group(0) @binding(4) var<uniform> sunPos : vec3f;

struct Transform {
    modelMat: mat4x4f,
    invModelMat: mat4x4f,
};
  
@group(1) @binding(0) var<uniform> model : Transform;

struct VertexOutput {
    @builtin(position) Position : vec4f,
    @location(0) normal: vec3f,
    @location(1) uv: vec2f,
}

@vertex
fn vertexMain(
    @location(0) position : vec3f,
    @location(1) normal : vec3f,
    @location(2) uv : vec2f,
) -> VertexOutput {
    var output : VertexOutput;

    output.Position = projectionView * model.modelMat * vec4f(position, 1.0);

    var transformedNormal = model.invModelMat * vec4f(normal, 0.0);
    output.normal = normalize(vec3f(transformedNormal.x, transformedNormal.y, transformedNormal.z));

    output.uv = uv;

    return output;
}

@fragment
fn fragMain(
  @location(0) normal: vec3f,
  @location(1) uv: vec2f,
) -> @location(0) vec4f {
    var finalColor = abs(normal);

    return vec4f(finalColor, 1.0);
}

