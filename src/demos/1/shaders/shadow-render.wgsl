struct VertexOut {
    @builtin(position) position: vec4f,
    @location(0) texCoords: vec2f
}

@vertex 
fn vertexMain(
    @location(0) pos: vec2f,
    @location(1) inTexCoords: vec2f, 
) -> VertexOut 
{ 
    var output : VertexOut; 

    output.position = vec4f(pos, 0.0, 1.0);
    output.texCoords = inTexCoords;

    return output;
}

@group(0) @binding(0) var sDep: texture_depth_2d;
@group(0) @binding(1) var rDep: texture_depth_2d;
@group(0) @binding(2) var samp: sampler;
@group(0) @binding(3) var atex: texture_2d<f32>;
@group(0) @binding(4) var ntex: texture_2d<f32>;

@fragment
fn fragmentMain(
    @location(0) texCoords: vec2f
) -> @location(0) vec4f 
{
    var color: vec3f = textureSample(atex, samp, texCoords).rgb;
    return vec4f(color, 1.0);
}
