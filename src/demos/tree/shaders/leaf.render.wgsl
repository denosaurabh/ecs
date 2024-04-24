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

@group(0) @binding(0) var sDep: texture_depth_2d; // shadow map
@group(0) @binding(1) var rDep: texture_depth_2d; // render map

@group(0) @binding(2) var samp: sampler; // sampler

@group(0) @binding(3) var stex: texture_2d<f32>; // shadow



@fragment
fn fragmentMain(
    @location(0) texCoords: vec2f
) -> @location(0) vec4f 
{
    let albedo = vec3f(0.656, 0.876, 0.493); 


    var shadow = textureSample(stex, samp, texCoords).rgb;
    let shadowColor = (1. - shadow) * vec3f(.4);

    // final color
    var color = albedo - shadowColor; // albedo + shadowColor;

    return vec4f(color, 1.0);
}
