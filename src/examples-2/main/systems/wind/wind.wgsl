@group(0) @binding(0) var<uniform> time : f32;
@group(0) @binding(1) var<uniform> projectionView : mat4x4f;
  
@group(1) @binding(0) var<uniform> modelMat : mat4x4f;

struct VertexOutput {
    @builtin(position) Position : vec4f,
    @location(1) Color : vec3f
}

@vertex
fn vertexMain(
    @location(0) position : vec2f,
    @location(1) uv : vec2f
) -> VertexOutput {
    var output : VertexOutput;

    output.Position =  projectionView * modelMat * vec4f(position, 0.0, 1.0);

    output.Color = vec3f(0.0, 1.0, 0.0);

    return output;
}

@fragment
fn fragMain(
    @location(1) color : vec3f
) -> @location(0) vec4f {
    return vec4f(color, 1.0);
}
