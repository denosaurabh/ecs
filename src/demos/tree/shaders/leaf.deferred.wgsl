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

@group(2) @binding(0) var<uniform> totalInstances : u32;

struct SunProjectionView {
    projView: mat4x4f,
    invProjView: mat4x4f,
};
@group(3) @binding(0) var<uniform> sunPV : SunProjectionView;



/* **************************************** */
struct VertexInput {
    @builtin(instance_index) InstanceIndex: u32,
    @location(0) position: vec3f,
    @location(1) normal: vec3f,
    @location(2) uv: vec2f,
    // instance data
    @location(3) translation: vec3f,
}


struct VertexOutput {
  @location(0) shadowPos: vec3f,
  @location(1) pos: vec3f,
  @location(2) normal: vec3f,

  @builtin(position) Position: vec4f,
}

@vertex
fn vertexMain(
    input: VertexInput
) -> VertexOutput {
    var pos = input.position;

    let angle = atan2(input.translation.x, input.translation.z);

    let c = cos(angle);
    let s = sin(angle);

    let deg = (angle * -0.34906585); // + ((3.14) + angle * -0.34906585);
    pos = vec3f(pos.x * cos(deg) - pos.y * sin(deg), pos.x * sin(deg) + pos.y * cos(deg), pos.z);

    pos += 20. * input.translation;
    pos *=  0.5;

    // OUTPUT
    var output : VertexOutput;

    output.Position = pv.projView * model.modelMat * vec4f(pos, 1.0);
    output.pos = pos.xyz;

    let posFromLight = sunPV.projView * model.modelMat * vec4(pos, 1.0);
    output.shadowPos = vec3(
        posFromLight.xy * vec2(0.5, -0.5) + vec2(0.5),
        posFromLight.z
    );

    var thenewnormal = model.invModelMat * vec4f(input.normal, 0.0);
    output.normal = normalize(vec3f(thenewnormal.x, thenewnormal.y, thenewnormal.z));

    return output;
}


// fragment
@group(3) @binding(1) var samp: sampler_comparison;
@group(3) @binding(2) var depth: texture_depth_2d;


struct FragmentOutput {
    @location(0) shadow: vec4<f32>,
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
    output.shadow = vec4f(1. - vec3f(min(visibility * lambertFactor, 1.0)), 1.0);
    return output;
}
