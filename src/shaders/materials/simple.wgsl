struct VertexOutput {
    @builtin(position) Position : vec4f,
}

@vertex
fn vertexMain(
    @location(0) position : vec2f,
) -> VertexOutput {
    var output : VertexOutput;

    output.Position = vec4f(position, 0.0, 1.0);

    return output;
}

@fragment
fn fragMain() -> @location(0) vec4f {
    return vec4f(1.0, 0.0, 0.0, 1.0);
}
