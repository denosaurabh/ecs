struct ProjectionView {
    projView: mat4x4f,
    invProjView: mat4x4f,
};
@group(0) @binding(0) var<uniform> pv : ProjectionView;
@group(0) @binding(3) var<uniform> sunPos : vec3f;
@group(0) @binding(4) var<uniform> size : vec2f;

struct Transform {
    modelMat: mat4x4f,
    invModelMat: mat4x4f,
};
@group(1) @binding(0) var<uniform> model : Transform;

struct SunProjectionView {
    projView: mat4x4f,
    invProjView: mat4x4f,
};
@group(2) @binding(0) var<uniform> sunPV : SunProjectionView;


struct VertexOutput {
  @location(0) shadowPos: vec3f,
  @location(1) pos: vec3f,
  @location(2) normal: vec3f,

  @builtin(position) Position: vec4f,
}

@vertex
fn vertexMain(
    @location(0) position : vec3f,
    @location(1) normal : vec3f
) -> VertexOutput {
    var output : VertexOutput;

    output.Position = pv.projView * model.modelMat * vec4f(position, 1.0);
    output.pos = position.xyz;

    let posFromLight = sunPV.projView * model.modelMat * vec4(position, 1.0);
    output.shadowPos = vec3(
        posFromLight.xy * vec2(0.5, -0.5) + vec2(0.5),
        posFromLight.z
    );

    var thenewnormal = model.invModelMat * vec4f(normal, 0.0);
    output.normal = normalize(vec3f(thenewnormal.x, thenewnormal.y, thenewnormal.z));

    return output;
}


// fragment
@group(3) @binding(0) var samp: sampler_comparison;
@group(3) @binding(1) var depth: texture_depth_2d;


struct FragmentOutput {
    @location(0) albedo: vec4<f32>,
    @location(1) normal: vec4<f32>,
    @location(2) shadow: vec4<f32>,
    @location(3) surfaceId: vec4<f32>
};

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

    let lambertFactor = max(dot(normalize(sunPos - input.pos), normalize(input.normal)), 0.0);

    // OUTPUT
    var output: FragmentOutput;

    output.albedo = vec4f(0.60, 0.43, 0.33, 1.0); // 0.70, 0.53, 0.43, 1.0 // vec4f(finalColor, 1.0);
    output.normal = vec4f(input.normal, 1.0);
    output.shadow = vec4f(1. - vec3f(min(visibility * lambertFactor, 1.0)), 1.0);
    output.surfaceId = vec4f(calculate_unique_color(1., input.normal), 1.0);

    // write shadow map values either vec4f(0.0) or vec4f(1.0)
    // output.shadow = vec4f(step(vec3f(0.99), 1. - vec3f(min(visibility * lambertFactor, 1.0))), 1.0);

    return output;
}


// UTILS
fn calculate_unique_color(instanceIndex: f32, normal: vec3f) -> vec3f {
    // Base color generation using instance index and normals
    let baseSeed = instanceIndex * 123.456 + normal.x * 78.9 + normal.y * 56.7 + normal.z * 34.5;
    let baseColor = vec3<f32>(
        fract(sin(baseSeed) * 43758.5453),
        fract(sin(baseSeed * 1.1) * 43758.5453),
        fract(sin(baseSeed * 1.2) * 43758.5453)
    );

    // Modify the base color using the normal to add more variation
    let colorVariation = 0.5 + 0.5 * normal; 
    return baseColor * colorVariation;
}
