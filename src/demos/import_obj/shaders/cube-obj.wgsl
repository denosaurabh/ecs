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




/* ********** */
struct VertexInput {
    @location(0) position: vec3f,
    @location(1) normal: vec3f,
    @location(2) uv: vec2f,
}

struct VertexOutput {
    @builtin(position) Position: vec4f,
    @location(1) normal: vec3f,
}

@vertex
fn vertMain(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;

    output.Position = pv.projView * model.modelMat * vec4f(input.position, 1.0);

    var tNormal = model.invModelMat * vec4f(input.normal, 0.0);
    output.normal = normalize(vec3f(tNormal.x, tNormal.y, tNormal.z));

    return output;
}

@fragment
fn fragMain(input: VertexOutput) -> @location(0) vec4f {
    var color = vec3f(abs(input.normal));
    // var color = vec3f(1.0, 0.0, 0.0);

    return vec4f(color, 1.0);
}