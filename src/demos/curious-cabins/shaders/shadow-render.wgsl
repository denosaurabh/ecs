@group(0) @binding(3) var<uniform> sunPos: vec3f; // window size
@group(0) @binding(4) var<uniform> viewSize: vec2f; // window size

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

@group(1) @binding(0) var sDep: texture_depth_2d; // shadow map
@group(1) @binding(1) var rDep: texture_depth_2d; // render map

@group(1) @binding(2) var samp: sampler; // sampler

@group(1) @binding(3) var atex: texture_2d<f32>; // albedo
@group(1) @binding(4) var ntex: texture_2d<f32>; // normal
@group(1) @binding(5) var stex: texture_2d<f32>; // shadow
@group(1) @binding(6) var itex: texture_2d<f32>; // surface id



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
    var texelSize = vec2<f32>(viewSize.x / (viewSize.x * viewSize.y), viewSize.y / (viewSize.x * viewSize.y));
    // texelSize *= vec2f(0.01);

    // samples
    var edge = calcEdges(texCoords, texelSize * vec2f(0.01));
    var edge2 = calcEdges(texCoords + vec2f(0., texelSize.y * 3.), texelSize);

    // let diffuse = vec3f(0.5) * dot(normal, sunPos);
    var shadowColor = (1. - shadow) * vec3f(.5);

    // FINAL COLOR
    albedo = vec3f(1.);
    var color = albedo + shadowColor;

    color -= edge2 * 5.;
    // color -= ceil( pow(edge, vec3f(.15)) * 0.1 );

    // color = albedo;
    // color = normal;
    // color = pow(1. - shadow, vec3f(1.) ); 
    // color = surfaceId;
    // color = edge; 

    return vec4f(color, 1.0);
}





fn calcEdges(texCoords: vec2f, texelSize: vec2f) -> vec3f {
    let tl = textureSample(itex, samp, texCoords + vec2<f32>(-texelSize.x,    texelSize.y)).rgb;
    let tt = textureSample(itex, samp, texCoords + vec2<f32>(0.0,             texelSize.y)).rgb;
    let tr = textureSample(itex, samp, texCoords + vec2<f32>(texelSize.x,     texelSize.y)).rgb;

    let cl = textureSample(itex, samp, texCoords + vec2<f32>(-texelSize.x,    0.0)).rgb;
    let cc = textureSample(itex, samp, texCoords).rgb;
    let cr = textureSample(itex, samp, texCoords + vec2<f32>(texelSize.x,     0.0)).rgb;

    let bl = textureSample(itex, samp, texCoords + vec2<f32>(-texelSize.x,    -texelSize.y)).rgb;
    let bb = textureSample(itex, samp, texCoords + vec2<f32>(0.0,             -texelSize.y)).rgb;
    let br = textureSample(itex, samp, texCoords + vec2<f32>(texelSize.x,     -texelSize.y)).rgb;

    let sobelV = (1.*tl + 0.*tt + -1.*tr + 2.*cl + 0.*cc + -2.*cr + 1.*bl + 0.*bb + -1.*br) / 9.;
    let sobelH = (1.*tl + 0.*cl + -1.*bl + 2.*tt + 0.*cc + -2.*bb + 1.*tr + 0.*cr + -1.*br) / 9.;

    let edge = sqrt(sobelV * sobelV + sobelH * sobelH);

    return vec3f(edge.x + edge.y + edge.z) / 3.0;
}