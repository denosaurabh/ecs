struct ProjectionView {
  projView: mat4x4f,
  invProjView: mat4x4f,
};

@group(0) @binding(0) var<uniform> pv : ProjectionView;



struct VertexOutput {
  @builtin(position) Position : vec4f,
}

@vertex
fn vertexMain(
  @location(0) position : vec3f,
  @location(1) normal : vec3f,
  @location(2) uv : vec2f,
  // instance
  @location(3) translation : vec3f,
  @location(4) rotation : vec3f,
  @location(5) scale : vec3f,
  @location(6) color : vec4f,
) -> VertexOutput {
  var output : VertexOutput;

  let modelMatrix = computeModelMatrix(
      vec3f(translation.x, translation.z, -translation.y) / 2.,
      vec3f(-rotation.x, -rotation.z, rotation.y),
      vec3f(scale.x, scale.z, scale.y),
  );

  output.Position = pv.projView * modelMatrix * vec4f(position, 1.0);

  return output;
}

@fragment
fn fragMain() -> @location(0) vec4<f32> {
  return vec4f(1.0);
}







// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::



// Function to create a translation matrix
fn translationMatrix(translation: vec3f) -> mat4x4f {
    return mat4x4f(
        vec4f(1.0, 0.0, 0.0, 0.0),
        vec4f(0.0, 1.0, 0.0, 0.0),
        vec4f(0.0, 0.0, 1.0, 0.0),
        vec4f(translation, 1.0)
    );
}

// Function to create a scaling matrix
fn scalingMatrix(scale: vec3f) -> mat4x4f {
    return mat4x4f(
        vec4f(scale.x, 0.0, 0.0, 0.0),
        vec4f(0.0, scale.y, 0.0, 0.0),
        vec4f(0.0, 0.0, scale.z, 0.0),
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

fn quaternionToMatrix(q: vec4f) -> mat4x4f {
    let xx = q.x * q.x;
    let yy = q.y * q.y;
    let zz = q.z * q.z;
    let xy = q.x * q.y;
    let xz = q.x * q.z;
    let yz = q.y * q.z;
    let wx = q.w * q.x;
    let wy = q.w * q.y;
    let wz = q.w * q.z;

    return mat4x4f(
        vec4f(1.0 - 2.0 * (yy + zz), 2.0 * (xy - wz), 2.0 * (xz + wy), 0.0),
        vec4f(2.0 * (xy + wz), 1.0 - 2.0 * (xx + zz), 2.0 * (yz - wx), 0.0),
        vec4f(2.0 * (xz - wy), 2.0 * (yz + wx), 1.0 - 2.0 * (xx + yy), 0.0),
        vec4f(0.0, 0.0, 0.0, 1.0)
    );
}

// Main function to compute the model matrix
fn computeModelMatrix(translation: vec3f, rotation: vec3f, scale: vec3f) -> mat4x4f {
    let tMatrix = translationMatrix(translation);
    let rMatrix = eulerToMatrix(rotation);
    let sMatrix = scalingMatrix(scale);

    // Combine the matrices
    return tMatrix * rMatrix * sMatrix;
}
