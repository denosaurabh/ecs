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

@group(0) @binding(1) var rDep: texture_depth_2d; // render depth map

@group(0) @binding(2) var samp: sampler; // sampler

@group(0) @binding(5) var pvtex: texture_2d<f32>; // position in view space
@group(0) @binding(6) var nvtex: texture_2d<f32>; // normal in view space


struct ProjectionView {
    projView: mat4x4f, // camera projection-view matrix
    invProjView: mat4x4f, // camera inverse projection-view matrix
};
@group(1) @binding(0) var<uniform> pv : ProjectionView;
@group(1) @binding(4) var<uniform> size : vec2f; //  window size (in px) - normally => vec2f(1920,1080)
@group(1) @binding(7) var<uniform> camView : mat4x4<f32>; // camera view matrix

struct Projection {
    projMat: mat4x4f, // camera projection matrix
    invProjMat: mat4x4f, // camera inverse projection matrix
};
@group(2) @binding(0) var<uniform> cam : Projection;

const kernelSize: u32 = 16u;
const kernelSamples: array<vec3f, kernelSize> = array<vec3f, kernelSize>(
    vec3f(-0.056, -0.008, 0.046),
    vec3f(0.050, -0.053, 0.050),
    vec3f(0.011, -0.056, 0.048),
    vec3f(0.045, 0.037, 0.127),
    vec3f(0.112, 0.107, 0.023),
    vec3f(-0.002, -0.092, 0.084),
    vec3f(0.064, -0.117, 0.039),
    vec3f(-0.264, 0.127, 0.228),
    vec3f(-0.105, -0.055, 0.284),
    vec3f(-0.297, 0.237, 0.166),
    vec3f(-0.353, 0.154, 0.202),
    vec3f(0.122, 0.383, 0.439),
    vec3f(-0.379, -0.149, 0.017),
    vec3f(-0.386, -0.182, 0.658),
    vec3f(0.219, 0.136, 0.455),
    vec3f(0.723, 0.220, 0.287),
);

const radius = 1.;
const bias = 0.025;
const power = 1.;

const noiseSize = 4.;

const noiseArr = array<vec4f, 16>(
    vec4f(-0.646, 0.680, 0.000, 1.000),
    vec4f(-0.810, 0.794, 0.000, 1.000),
    vec4f(-0.741, -0.310, 0.000, 1.000),
    vec4f(-0.974, -0.780, 0.000, 1.000),
    vec4f(-0.648, -0.981, 0.000, 1.000),
    vec4f(-0.236, 0.600, 0.000, 1.000),
    vec4f(0.596, 0.808, 0.000, 1.000),
    vec4f(0.786, -0.306, 0.000, 1.000),
    vec4f(-0.232, -0.108, 0.000, 1.000),
    vec4f(0.225, -0.148, 0.000, 1.000),
    vec4f(0.457, -0.434, 0.000, 1.000),
    vec4f(-0.766, 0.696, 0.000, 1.000),
    vec4f(0.930, 0.814, 0.000, 1.000),
    vec4f(0.741, 0.177, 0.000, 1.000),
    vec4f(-0.090, 0.866, 0.000, 1.000),
    vec4f(-0.993, 0.370, 0.000, 1.000),
);

@fragment
fn fragmentMain(
    @location(0) texCoords: vec2f
) -> @location(0) vec4f 
{
    let noiseScale = vec2f(size.x / noiseSize, size.y / noiseSize);

    let vTexCoord = vec2<i32>(texCoords.xy * size);
    let vPosition = textureLoad(pvtex, vTexCoord, 0).xyz;

    let vNormal = mat3x3<f32>(camView[0].xyz, camView[1].xyz, camView[2].xyz) * normal;

    let noiseX = i32((texCoords.x * size.x) - 0.5) % 4;
    let noiseY = i32((texCoords.y * size.y) - 0.5) % 4;
    let randomVec = vec4f(noiseArr[noiseX + (noiseY * 4)]).xyz;

    /* ********************* AO *********************** */

    let tangent = normalize( randomVec - vNormal * dot(randomVec, vNormal) );
    let bitangent = cross(vNormal, tangent);
    let TBN = mat3x3<f32>(tangent, bitangent, vNormal);

    var occlusion = 0.0;

    for (var i = 0u; i < kernelSize; i++)
    {
        let sample_vec = radius * (TBN * kernelSamples[i].xyz);
        let sample_pos = vPosition + (sample_vec);

        let sample_clip_pos = cam.projMat * vec4<f32>(sample_pos, 1.0);
        let sample_ndc = sample_clip_pos.xy;

        let sample_uv = sample_ndc * vec2<f32>(0.5, -0.5) + 0.5;
        var sample_coords = vec2<i32>(floor(sample_uv * vec2<f32>(size)));
        sample_coords = clamp(sample_coords, vec2<i32>(0), vec2<i32>(size) - 1);

        let sample_depth: f32 = textureLoad(rDep, sample_coords, 0);
        if (sample_depth == 1.0) {
            continue;
        }

        let z = screen_space_depth_to_view_space_z(sample_depth);
        occlusion = occlusion + select(0.0, 1.0, z >= sample_pos.z + bias);
    }


    /* ***************** FINAL COLOR ***************** */

    var color = vec3f(0.0);

    color = vec3f( 1.0 - (occlusion / f32(kernelSize)) );

    return vec4f(color, 1.0);
}



fn screen_space_depth_to_view_space_z(d: f32) -> f32 {
    let near = 0.001; // cam.near;
    let far = 150.; //cam.far;
    return mix(near, far, d);
}