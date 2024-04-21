struct VertexOutput {
    @builtin(position) Position : vec4f,
    @location(1) Color : vec3f
}

@vertex
fn vertexMain(
    @location(0) position : vec2f,
    @location(1) color : vec3f
) -> VertexOutput {
    var output : VertexOutput;

    output.Position = vec4f(position, 0.0, 1.0);
    output.Color = color;

    return output;
}

@fragment
fn fragMain(
    @location(1) color : vec3f
) -> @location(0) vec4f {
    return vec4f(color, 1.0);
}
