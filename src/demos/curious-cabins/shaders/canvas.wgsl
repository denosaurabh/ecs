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

@group(0) @binding(0) var texSampler: sampler;
@group(0) @binding(1) var tex: texture_2d<f32>;

@group(0) @binding(2) var lutSampler: sampler;
@group(0) @binding(3) var lutTexture: texture_3d<f32>;


@group(1) @binding(4) var<uniform> screenSize: vec2f;

@fragment
fn fragmentMain(
    @location(0) texCoords: vec2f
) -> @location(0) vec4f 
{
    var color: vec3f = textureSample(tex, texSampler, texCoords).rgb;

    // COLOR CORRECTION
    color = gammaCorrect(color, 2.2);
    color = adjustContrast(color, 0.8);
    color = increaseLightness(color, .15);

    // LUT
    var finalColor = textureSample(lutTexture, lutSampler, color).rgb;
    finalColor = color;

    // NOISE
    // finalColor = mix(finalColor, vec3f(noise * 0.3), 0.2);

    return vec4f(finalColor, 1.0);
    // return vec4f(vec3f(noise), 1.0);
}



// *************************************************************************************************
// *************************************** COLOR CORRECTION ****************************************
// *************************************************************************************************


// LIGHTNESS
fn increaseLightness(color: vec3f, increaseAmount: f32) -> vec3f {
    let safeIncreaseAmount = clamp(increaseAmount, 0.0, 1.0);
    var brighterColor: vec3f = color + vec3f(safeIncreaseAmount, safeIncreaseAmount, safeIncreaseAmount);
    brighterColor = clamp(brighterColor, vec3f(0.0, 0.0, 0.0), vec3f(1.0, 1.0, 1.0));

    return brighterColor;
}

// CONTRACT
fn adjustContrast(color: vec3f, contrast: f32) -> vec3f {
    let midGray = vec3f(0.5, 0.5, 0.5);
    return (color - midGray) * contrast + midGray;
}

// GAMMA
fn gammaCorrect(color: vec3f, value: f32) -> vec3f {
    return vec3f(pow(color.rgb, vec3f(1.0 / value)));
}


// *************************************************************************************************
// *************************************** WHITE NOISE *********************************************
// *************************************************************************************************

fn rand22(n: vec2f) -> f32 { return fract(sin(dot(n, vec2f(12.9898, 4.1414))) * 43758.5453); }

