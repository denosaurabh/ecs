////////////
struct ProjectionView {
    projView: mat4x4f,
    invProjView: mat4x4f,
};
@group(0) @binding(0) var<uniform> pv : ProjectionView;
@group(0) @binding(1) var<uniform> time : f32;
@group(0) @binding(3) var<uniform> sunPos : vec3f;

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




// vertex
struct VertexOutput {
    @builtin(position) Position : vec4f,
    @location(0) normal: vec3f,
    @location(1) color: vec3f,
    @location(2) SunPosition: vec4f,
}

@vertex
fn vertexMain(
    @location(0) position : vec3f,
    @location(1) normal : vec3f
) -> VertexOutput {
    var output : VertexOutput;

    var worldPosition = model.modelMat * vec4f(position, 1.0);

    output.Position = pv.projView * worldPosition;
    output.SunPosition = sunPV.projView * worldPosition;

    var thenewnormal = model.invModelMat * vec4f(normal, 0.0);
    output.normal = normalize(vec3f(thenewnormal.x, thenewnormal.y, thenewnormal.z));

    output.color = vec3(0.82, 0.64, 0.53);

    return output;
}



// fragment

@group(3) @binding(0) var samp: sampler_comparison;
@group(3) @binding(1) var depth: texture_depth_2d;


struct FragmentOutput {
    @location(0) albedo: vec4<f32>,
    @location(1) normal: vec4<f32>
};

@fragment
fn fragMain(
  @location(0) normal: vec3f,
  @location(1) color: vec3f,
  @location(2) SunPosition: vec4f,
) -> FragmentOutput {
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
}
