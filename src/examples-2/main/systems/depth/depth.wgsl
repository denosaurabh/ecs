// @group(0) @binding(0) var<uniform> time : f32;
// @group(0) @binding(1) var<uniform> projectionView : mat4x4f;

@group(1) @binding(0) var depthSampler: sampler;
// @group(1) @binding(1) var depthTex: texture_depth_2d;
@group(1) @binding(1) var depthTex: texture_depth_multisampled_2d;

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

    // var pos =  vec2f(-0.75, 0.75);
    // var scale = 0.2;

    // pos = vec2f(0, 0);
    // scale = 1.;

    output.Position = vec4f(position, 0.0, 1.0);
    // output.Position =  vec4f(position, 0.0, 1.0);
    output.uv = uv;

    return output;
}

@fragment
fn fragMain(
    @builtin(position) Position : vec4f,
    @location(1) uv : vec2f
) -> @location(0) vec4f {
    // var coords: vec2<i32> = vec2<i32>(1, 1);
    var coords: vec2<i32> = vec2<i32>(Position.xy * 3. + vec2f(250.0)); // Position.xy

    var samplePoint = 1; // 1 to 4

    var depthFloat: f32 = textureLoad(depthTex, coords, samplePoint);

    return vec4f(vec3f(depthFloat), 1.0);
}
