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


/* ********** */
struct VertexInput {
    @builtin(instance_index) InstanceIndex: u32,
    @location(0) position: vec3f,
    @location(1) normal: vec3f,
    @location(2) uv: vec2f,
}

struct VertexOutput {
    @builtin(position) Position: vec4f,
    @location(1) normal: vec3f,
}

// const xSize: f32 = 25.;
// const zSize: f32 = 25.;

@vertex
fn vertMain(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;

    var pos = input.position;

    var totalInstancesSqrt = sqrt(f32(totalInstances));

    // rotate around y
    var angle = 3.141 * 2. * rand(input.InstanceIndex);
    var x = pos.x * cos(angle) - pos.z * sin(angle);
    var z = pos.x * sin(angle) + pos.z * cos(angle);

    pos.x = x;
    pos.z = z;


    // square position
    var groupiness = 1.;

    pos.x += f32(totalInstancesSqrt/(2. / groupiness)) - (groupiness *  (f32(input.InstanceIndex % u32(totalInstancesSqrt)))  );
    pos.z += f32(totalInstancesSqrt/(2. / groupiness)) - (groupiness *  (f32(input.InstanceIndex / u32(totalInstancesSqrt)))  );

    // position offset
    pos.x += 2. * rand(input.InstanceIndex) * 2. - 1.;
    pos.z += 2. * rand(input.InstanceIndex + u32(totalInstances)) * 2. - 1.;



    output.Position = pv.projView * model.modelMat * vec4f(pos, 1.0);

    var tNormal = model.invModelMat * vec4f(input.normal, 0.0);
    output.normal = normalize(vec3f(tNormal.x, tNormal.y, tNormal.z));

    return output;
}

@fragment
fn fragMain(input: VertexOutput) -> @location(0) vec4f {
    var albedo = vec3f(0.143, 0.529, 0.394);

    var color = vec3f(albedo * dot(vec3f(1, 0, 0), normalize(input.normal)));
    // var color = vec3f(1.0, 0.0, 0.0);

    return vec4f(color, 1.0);
}



fn rand(seed: u32) -> f32 {
    let x = f32(seed);
    let y = fract(sin(x * 1597.0) * 43758.5453123);
    return y; // * 2.0 - 1.0
}