@group(0) @binding(0) var<uniform> time : f32;
@group(0) @binding(1) var<uniform> projectionView : mat4x4f;
  
struct Transform {
    modelMat: mat4x4f,
    invModelMat: mat4x4f,
};
  
@group(1) @binding(0) var<uniform> model : Transform;

struct VertexOutput {
    @builtin(position) Position : vec4f,
    @location(1) uv : vec2f,
}

@vertex
fn vertexMain(
    @builtin(instance_index) instance_index : u32,
    @builtin(vertex_index) vertex_index : u32,
    @location(0) position : vec2f,
    @location(1) uv : vec2f
) -> VertexOutput {
    // var output : VertexOutput;

    // const MAX_BLADES_PER_ROW: u32 = 100;

    // var x : u32 = instance_index % MAX_BLADES_PER_ROW;
    // var z : u32 = instance_index / MAX_BLADES_PER_ROW;

    // var pos = vec2f(f32(x), f32(z));
    // pos.x += (rand(x-z) * 2.0 - 1.0) * 1.;
    // pos.y += (rand(x+z) * 2.0 - 1.0) * 1.;

    // var randomAngle = rand(x+z) * 3.141;

    // var finalPos = vec3f(position.x + pos.x, position.y, pos.y);
    // var finalPosVec4 = vec4f(finalPos, 1.0); 

    // output.Position = projectionView * model.modelMat * finalPosVec4;
    // output.uv = uv;

    // return output;


    


    const MAX_BLADES_PER_ROW: u32 = 100;

    const minToMaxX = vec2f(0., 10.);
    const minToMaxZ = vec2f(0., 10.);

    let ii = instance_index;
    let vi = vertex_index;

    // POSITION
    var x : u32 = instance_index % MAX_BLADES_PER_ROW;
    var z : u32 = instance_index / MAX_BLADES_PER_ROW;

    // var x : u32 = instance_index + vertex_index;
    // var z : u32 = instance_index * vertex_index;

    // var pos = vec2f(f32(x)*0.1, f32(z)*0.3);
    // pos.x += (rand(x-z) * 2.0 - 1.0) * 1.1;
    // pos.y += (rand(x+z) * 2.0 - 1.0) * 1.;

    var pos = vec2f(
        mix(minToMaxX.x, minToMaxX.y, rand(ii)),
        mix(minToMaxZ.x, minToMaxZ.y, rand(ii+100000))
    );
    // pos.x += (rand(x+z) * 2.0 - 1.0) * 2.;
    // pos.y += (rand(x-z) * 2.0 - 1.0) * 2.;

    // ROTATION
    var randomAngle = rand(x*z) * 3.141;

    // RETURN
    var output : VertexOutput;

    let modelMatrix = computeModelMatrix(
        pos,
        randomAngle,
    );

    output.Position = projectionView * modelMatrix * vec4f(position, 0.0, 1.0);
    output.uv = uv;

    return output;
}

@fragment
fn fragMain(
    @builtin(position) fragCoord : vec4f,
    @location(1) uv : vec2f
) -> @location(0) vec4f {
    const colorTop = vec3(0.04, 0.9, 0.45);
    const colorBottom = vec3(0.04, 0.239, 0.141);

    let color = mix(colorBottom, colorTop, 1.0 - uv.y*1.5);

    // return vec4f(uv, 0.0, 1.0);
    return vec4f(color, 1.0);
    // return vec4f(rand11(uv.x), rand11(uv.y), 0.0, 1.0);
}

fn pcg(n: u32) -> u32 {
    var h = n * 747796405u + 2891336453u;
    h = ((h >> ((h >> 28u) + 4u)) ^ h) * 277803737u;
    return (h >> 22u) ^ h;
}

fn rand(seed: u32) -> f32 {
    let x = f32(seed);
    let y = fract(sin(x * 1597.0) * 43758.5453123);
    return y; // * 2.0 - 1.0
}

fn translationMatrix(translation: vec2f) -> mat4x4f {
    return mat4x4f(
        vec4f(1.0, 0.0, 0.0, 0.0),
        vec4f(0.0, 1.0, 0.0, 0.0),
        vec4f(0.0, 0.0, 1.0, 0.0),
        vec4f(translation.x, 0.0, translation.y, 1.0)
    );
}

// Function to create a scaling matrix
fn scalingMatrix() -> mat4x4f {
    return mat4x4f(
        vec4f(.3, 0.0, 0.0, 0.0),
        vec4f(0.0, 1.0, 0.0, 0.0),
        vec4f(0.0, 0.0, 1.0, 0.0),
        vec4f(0.0, 0.0, 0.0, 1.0)
    );
}

// Function to create a rotation matrix from Euler angles
fn eulerToMatrix(euler: vec3f) -> mat4x4f {
    let cosX = cos(euler.x);
    let sinX = sin(euler.x);
    let cosY = cos(euler.y);
    let sinY = sin(euler.y);
    let cosZ = cos(euler.z);
    let sinZ = sin(euler.z);

    // Rotation matrices for each axis
    let rotX = mat4x4f(
        vec4f(1.0, 0.0, 0.0, 0.0),
        vec4f(0.0, cosX, -sinX, 0.0),
        vec4f(0.0, sinX, cosX, 0.0),
        vec4f(0.0, 0.0, 0.0, 1.0)
    );

    let rotY = mat4x4f(
        vec4f(cosY, 0.0, sinY, 0.0),
        vec4f(0.0, 1.0, 0.0, 0.0),
        vec4f(-sinY, 0.0, cosY, 0.0),
        vec4f(0.0, 0.0, 0.0, 1.0)
    );

    let rotZ = mat4x4f(
        vec4f(cosZ, -sinZ, 0.0, 0.0),
        vec4f(sinZ, cosZ, 0.0, 0.0),
        vec4f(0.0, 0.0, 1.0, 0.0),
        vec4f(0.0, 0.0, 0.0, 1.0)
    );

    // Combine the rotation matrices (order: Z * Y * X)
    return rotZ * rotY * rotX;
}

// Main function to compute the model matrix
fn computeModelMatrix(translation: vec2f, rotationY: f32) -> mat4x4f {
    let tMatrix = translationMatrix(translation);
    let rMatrix = eulerToMatrix(vec3f(0.0, rotationY, 0.0));
    let sMatrix = scalingMatrix();

    // Combine the matrices
    return tMatrix * rMatrix * sMatrix;
}