////////////
struct ProjectionView {
    projView: mat4x4f,
    invProjView: mat4x4f,
};
@group(0) @binding(0) var<uniform> pv : ProjectionView;
// @group(0) @binding(1) var<uniform> time : f32;
@group(0) @binding(3) var<uniform> sunPos : vec3f;
@group(0) @binding(4) var<uniform> size : vec2f;

////////////
struct Transform {
    modelMat: mat4x4f,
    invModelMat: mat4x4f,
};
@group(1) @binding(0) var<uniform> model : Transform;

////////////
struct SunProjectionView {
    projView: mat4x4f,
    invProjView: mat4x4f,
};
@group(2) @binding(0) var<uniform> sunPV : SunProjectionView;


struct VertexOutput {
  @location(0) shadowPos: vec3f,
  @location(1) fragPos: vec3f,
  @location(2) normal: vec3f,

  @builtin(position) Position: vec4f,
}

@vertex
fn vertexMain(
    @location(0) position : vec3f,
    @location(1) normal : vec3f
) -> VertexOutput {
    var output : VertexOutput;

    // XY is in (-1, 1) space, Z is in (0, 1) space
    let posFromLight = sunPV.projView * model.modelMat * vec4(position, 1.0);

    // Convert XY to (0, 1)
    // Y is flipped because texture coords are Y-down.
    output.shadowPos = vec3(
        posFromLight.xy * vec2(0.5, -0.5) + vec2(0.5),
        posFromLight.z
    );

    output.Position = pv.projView * model.modelMat * vec4f(position, 1.0);
    output.fragPos = position.xyz;

    var thenewnormal = model.invModelMat * vec4f(normal, 0.0);
    output.normal = normalize(vec3f(thenewnormal.x, thenewnormal.y, thenewnormal.z));

    return output;
}



// fragment

@group(3) @binding(0) var samp: sampler_comparison;
@group(3) @binding(1) var depth: texture_depth_2d;


struct FragmentOutput {
    @location(0) albedo: vec4<f32>,
    @location(1) normal: vec4<f32>
};

const albedo = vec3f(0.9, 0.9, 0.9);
const ambientFactor = 0.2;


@fragment
fn fragMain(
input: VertexOutput
) -> FragmentOutput {
    let shadowDepthTextureSize: f32 = size.x;

    // Percentage-closer filtering. Sample texels in the region
    // to smooth the result.
    var visibility = 0.0;
    let oneOverShadowDepthTextureSize = 1.0 / shadowDepthTextureSize;
    for (var y = -1; y <= 1; y++) {
        for (var x = -1; x <= 1; x++) {
        let offset = vec2f(vec2(x, y)) * oneOverShadowDepthTextureSize;

        visibility += textureSampleCompare(
            depth, samp,
            input.shadowPos.xy + offset, input.shadowPos.z + 0.00 // 0.007
        );
        }
    }
    visibility /= 9.0;

    let lambertFactor = max(dot(normalize(sunPos - input.fragPos), normalize(input.normal)), 0.0);
    let lightingFactor = min(ambientFactor + visibility * lambertFactor, 1.0);


    // OUTPUT
    var output: FragmentOutput;

    output.albedo = vec4f(lightingFactor * albedo, 1.0); // vec4f(finalColor, 1.0);
    output.normal = vec4f(input.normal, 1.0);

    return output;

    // return vec4(lightingFactor * albedo, 1.0);

    /* ********************************************************************* */
    /* ********************************************************************* */

    /*

    var finalColor = color * max(0.6, dot(normalize(sunPos), normal));
    var output: FragmentOutput;

    /* ********************************************************************* */

    // var shadowCoord: vec3f = SunPosition.xyz / SunPosition.w;
    // shadowCoord = shadowCoord * 0.5 + 0.5;

    // // Sample the depth from the shadow map
    // var shadowDepth: f32 = textureSampleCompare(depth, samp, shadowCoord.xy, shadowCoord.z);

    // // Compare the depth of the current pixel with the depth from the shadow map
    // var currentDepth : f32 = shadowCoord.z;
    // var shadow : f32 = select(1.0, 0.0, currentDepth <= shadowDepth);

    /* ********************************************************************* */

    output.albedo = vec4f(finalColor, 1.0);
    output.normal = vec4f(normal, 1.0);

    return output;

    */

    /* ********************************************************************* */
    /* ********************************************************************* */
}
