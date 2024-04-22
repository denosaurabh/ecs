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

@group(0) @binding(4) var<uniform> viewSize: vec2f;

@group(1) @binding(0) var texSampler: sampler;
@group(1) @binding(1) var nTex: texture_2d<f32>;
@group(1) @binding(2) var aTex: texture_2d<f32>;
@group(1) @binding(3) var dTex: texture_depth_multisampled_2d;

@fragment
fn fragmentMain(
    @location(0) texCoords: vec2f
) -> @location(0) vec4f 
{
    // var color: vec3f = textureSample(tex, texSampler, texCoords).rgb;
    // return vec4f(color + vec3(0.5, 0.2, 0.1), 1.0);


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    // texel size
    let texelSize = vec2<f32>(viewSize.x / (viewSize.x * viewSize.y), viewSize.y / (viewSize.x * viewSize.y)); // 0.0005, 0.0005
    

    // samples
    // let tl = textureSample(aTex, texSampler, texCoords + vec2<f32>(-texelSize.x,    texelSize.y)).rgb;
    // let tt = textureSample(aTex, texSampler, texCoords + vec2<f32>(0.0,             texelSize.y)).rgb;
    // let tr = textureSample(aTex, texSampler, texCoords + vec2<f32>(texelSize.x,     texelSize.y)).rgb;

    // let cl = textureSample(aTex, texSampler, texCoords + vec2<f32>(-texelSize.x,    0.0)).rgb;
    // let cc = textureSample(aTex, texSampler, texCoords).rgb;
    // let cr = textureSample(aTex, texSampler, texCoords + vec2<f32>(texelSize.x,     0.0)).rgb;

    // let bl = textureSample(aTex, texSampler, texCoords + vec2<f32>(-texelSize.x,    -texelSize.y)).rgb;
    // let bb = textureSample(aTex, texSampler, texCoords + vec2<f32>(0.0,             -texelSize.y)).rgb;
    // let br = textureSample(aTex, texSampler, texCoords + vec2<f32>(texelSize.x,     -texelSize.y)).rgb;


    // on depth
    var texCoordsU = vec2<i32>(i32(texCoords.x * viewSize.x), i32(texCoords.y * viewSize.y));

    var samplePoint = u32(1);
    let tl: f32 = textureLoad(dTex, texCoordsU + vec2<i32>(-1,    1), samplePoint);
    let tt: f32 = textureLoad(dTex, texCoordsU + vec2<i32>(0,     1), samplePoint);
    let tr: f32 = textureLoad(dTex, texCoordsU + vec2<i32>(1,     1), samplePoint);

    let cl: f32 = textureLoad(dTex, texCoordsU + vec2<i32>(-1,    0), samplePoint);
    let cc: f32 = textureLoad(dTex, texCoordsU, samplePoint);
    let cr: f32 = textureLoad(dTex, texCoordsU + vec2<i32>(1,     0), samplePoint);

    let bl: f32 = textureLoad(dTex, texCoordsU + vec2<i32>(1,    -1), samplePoint);
    let bb: f32 = textureLoad(dTex, texCoordsU + vec2<i32>(0,    -1), samplePoint);
    let br: f32 = textureLoad(dTex, texCoordsU + vec2<i32>(1,    -1), samplePoint);

    // albeco color
    var realColor = textureSample(aTex, texSampler, texCoords).rgb;

    // functions
    var blur = (tl + tt + tr + cl + cc + cr + bl + bb + br) / 9.0;

    // SOBEL
    //   1  0 -1
    //   2  0 -2
    //   1  0 -1

    var sobelV = (1.*tl + 0.*tt + -1.*tr + 2.*cl + 0.*cc + -2.*cr + 1.*bl + 0.*bb + -1.*br) / 9.0;
    var sobelH = (1.*tl + 0.*cl + -1.*bl + 2.*tt + 0.*cc + -2.*bb + 1.*tr + 0.*cr + -1.*br) / 9.0;

    var laplacian = (0.*tl + 1.*tt + 0.*tr + 1.*cl + -4.*cc + 1.*cr + 0.*bl + 1.*bb + 0.*br); // / 9.0

    // realColor * (1. - 
    var color = realColor;
    // color = vec3f(sobelV * sobelH * 100.);
    // color = vec3f(laplacian);
    // color = vec3f(realColor * (1. - (sobelV * sobelH * 100.)));

    return vec4f(color, 1.0);



    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





    // Sample adjacent pixels
    // let leftColor = textureSample(tex, texSampler, texCoords + vec2<f32>(-texelSize.x, 0.0)).rgb;
    // let rightColor = textureSample(tex, texSampler, texCoords + vec2<f32>(texelSize.x, 0.0)).rgb;
    // let upColor = textureSample(tex, texSampler, texCoords + vec2<f32>(0.0, -texelSize.y)).rgb;
    // let downColor = textureSample(tex, texSampler, texCoords + vec2<f32>(0.0, texelSize.y)).rgb;

    // var isEdge = abs(centerColor - leftColor) + abs(centerColor - rightColor) + abs(centerColor - upColor) + abs(centerColor - downColor);

    // var realColor = textureSample(tex, texSampler, texCoords).rgb;
    // realColor = vec3f(0.91, 0.82, 0.68); 

    // // If the adjacent colors are significantly different, mark as an edge (white), else black
    // var color = vec3f(realColor); // Default to black

    // // color = vec3f(1.0);

    // // if (isEdge.x > 0.05 || isEdge.y > 0.05 || isEdge.z > 0.05) {
    // if (isEdge.x > 0.1 || isEdge.y > 0.1 || isEdge.z > 0.1) {
    //     color = mix(vec3f(0.0, 0.0, 0.0), color, 0.4); // Set to white if an edge is detected
    // }

    // return vec4f(color, 1.0);
}
