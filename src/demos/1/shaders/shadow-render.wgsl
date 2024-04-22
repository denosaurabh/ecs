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

@group(0) @binding(3) var atex: texture_2d<f32>; // albedo
@group(0) @binding(4) var ntex: texture_2d<f32>; // normal
@group(0) @binding(5) var stex: texture_2d<f32>; // shadow
@group(0) @binding(6) var itex: texture_2d<f32>; // surface id



@fragment
fn fragmentMain(
    @location(0) texCoords: vec2f
) -> @location(0) vec4f 
{
    var albedo: vec3f = textureSample(atex, samp, texCoords).rgb;
    var shadow = textureSample(stex, samp, texCoords).rgb;
    var normal = textureSample(ntex, samp, texCoords).rgb;
    var surfaceId = textureSample(itex, samp, texCoords).rgb;

    // calculate edges
    let viewSize = vec2<f32>(1527.0, 1357.0);

    let texelSize = vec2<f32>(viewSize.x / (viewSize.x * viewSize.y), viewSize.y / (viewSize.x * viewSize.y)); // 0.0005, 0.0005

    // samples
    let tl = textureSample(itex, samp, texCoords + vec2<f32>(-texelSize.x,    texelSize.y)).rgb;
    let tt = textureSample(itex, samp, texCoords + vec2<f32>(0.0,             texelSize.y)).rgb;
    let tr = textureSample(itex, samp, texCoords + vec2<f32>(texelSize.x,     texelSize.y)).rgb;

    let cl = textureSample(itex, samp, texCoords + vec2<f32>(-texelSize.x,    0.0)).rgb;
    let cc = textureSample(itex, samp, texCoords).rgb;
    let cr = textureSample(itex, samp, texCoords + vec2<f32>(texelSize.x,     0.0)).rgb;

    let bl = textureSample(itex, samp, texCoords + vec2<f32>(-texelSize.x,    -texelSize.y)).rgb;
    let bb = textureSample(itex, samp, texCoords + vec2<f32>(0.0,             -texelSize.y)).rgb;
    let br = textureSample(itex, samp, texCoords + vec2<f32>(texelSize.x,     -texelSize.y)).rgb;

    var sobelV = (1.*tl + 0.*tt + -1.*tr + 2.*cl + 0.*cc + -2.*cr + 1.*bl + 0.*bb + -1.*br) / 9.0;
    var sobelH = (1.*tl + 0.*cl + -1.*bl + 2.*tt + 0.*cc + -2.*bb + 1.*tr + 0.*cr + -1.*br) / 9.0;

    var edge = sqrt(sobelV * sobelV + sobelH * sobelH);


    // convert edge to black & white
    let edgeColor = vec3f(1.0);
    edge = (vec3f(edge.x + edge.y + edge.z) / 3.0) * 1.;

    let shadowColor = (1. - shadow) * vec3f(.4); // * vec3f(0.9);

    // final color
    var color = albedo + shadowColor - edge;
    // color = albedo;
    // color = shadow; 
    // color = surfaceId;
    // color = edge; 

    return vec4f(color, 1.0);
}
