// @group(0) @binding(0) var<uniform> time : f32;
// @group(0) @binding(1) var<uniform> projectionView : mat4x4f;

@group(1) @binding(0) var depthSampler: sampler;
@group(1) @binding(1) var depthTex: texture_depth_2d;

struct VertexOutput {
    @builtin(position) Position : vec4f,
    @location(1) uv : vec2f
}

@vertex
fn vertexMain(
    @location(0) position : vec2f,
    @location(1) uv : vec2f
) -> VertexOutput {
    var output : VertexOutput;

    output.Position = vec4f(position*0.2 + vec2f(-0.75, 0.75), 0.0, 1.0);
    // output.Position =  vec4f(position, 0.0, 1.0);
    output.uv = uv;

    return output;
}

@fragment
fn fragMain(
    @builtin(position) Position : vec4f,
    @location(1) uv : vec2f
) -> @location(0) vec4f {
    var depthFloat: f32 = textureSample(depthTex, depthSampler, uv);
    return vec4f(vec3f(depthFloat), 1.0);
}
