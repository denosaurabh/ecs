struct ProjectionView {
    projView: mat4x4f,
    invProjView: mat4x4f,
};
@group(0) @binding(0) var<uniform> pv : ProjectionView;
@group(0) @binding(1) var<uniform> time : f32;
@group(0) @binding(3) var<uniform> sunPos : vec3f;
@group(0) @binding(4) var<uniform> size : vec2f;

struct Transform {
    modelMat: mat4x4f,
    invModelMat: mat4x4f,
};
@group(1) @binding(0) var<uniform> model : Transform;

@group(2) @binding(0) var<uniform> totalInstances : u32;


/* ********** */
struct VertexInput {
    @builtin(instance_index) InstanceIndex: u32,
    @location(0) position: vec3f,
    @location(1) normal: vec3f,
    @location(2) uv: vec2f,
    // instance data
    @location(3) translation: vec3f,
}

struct VertexOutput {
    @builtin(position) Position: vec4f,
}

@vertex
fn vertMain(input: VertexInput) -> VertexOutput {
    var pos = input.position;

    let angle = atan2(input.translation.x, input.translation.z);

    let c = cos(angle);
    let s = sin(angle);

    let deg = (angle * -0.34906585); // + ((3.14) + angle * -0.34906585);
    pos = vec3f(pos.x * cos(deg) - pos.y * sin(deg), pos.x * sin(deg) + pos.y * cos(deg), pos.z);

    pos += 20. * input.translation;
    pos *=  0.5;

    // OUTPUT
    var output: VertexOutput;
    output.Position = pv.projView * model.modelMat * vec4f(pos, 1.0);
    return output;
}



@fragment
fn fragMain() -> @location(0) vec4<f32> {
  return vec4f(1.0);
}


fn rand(x: f32) -> f32 {
    let y = fract(sin(x * 1597.0) * 43758.5453123);
    return y; // * 2.0 - 1.0
}

