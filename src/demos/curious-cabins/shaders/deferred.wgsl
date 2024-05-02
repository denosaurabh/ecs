struct ProjectionView {
    projView: mat4x4f,
    invProjView: mat4x4f,
};
@group(0) @binding(0) var<uniform> pv : ProjectionView;
@group(0) @binding(3) var<uniform> sunPos : vec3f;
@group(0) @binding(4) var<uniform> size : vec2f;
@group(0) @binding(5) var<uniform> camEye : vec3f;
@group(0) @binding(7) var<uniform> camView : mat4x4f;

struct SunProjectionView {
    projView: mat4x4f,
    invProjView: mat4x4f,
};
@group(1) @binding(0) var<uniform> sunPV : SunProjectionView;

// fragment
@group(2) @binding(0) var samp: sampler_comparison;
@group(2) @binding(1) var depth: texture_depth_2d;


struct VertexOutput {
  @location(0) shadowPos: vec3f,
  @location(1) pos: vec3f,
  @location(2) normal: vec3f,
  @location(3) color: vec4f,
  @location(4) viewNormal: vec4f,
  @location(5) uv: vec2f,

  @builtin(position) Position: vec4f,
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
        abs( vec3f(scale.x, scale.z, scale.y) ),
    );

    let modelPos = modelMatrix * vec4f(position, 1.0);

    let finalPos = pv.projView * modelPos;
    output.Position = finalPos;
    output.pos = position.xyz;

    let posFromLight = sunPV.projView * modelPos;
    output.shadowPos = vec3(
        posFromLight.xy * vec2(0.5, -0.5) + vec2(0.5),
        posFromLight.z
    );


    let normalMatrix = mat3x3<f32>(
        modelMatrix[0].xyz,
        modelMatrix[1].xyz,
        modelMatrix[2].xyz
    );

    output.normal = normalize(normalMatrix * normal);

    output.viewNormal = modelMatrix * vec4f(normal, 1.); 

    // blinn phong
    let finalColor = blinnPhong(color, finalPos.xyz, output.normal);
    output.color = vec4f(finalColor, 1.) * color;

    output.uv = uv;

    return output;
}



struct FragmentOutput {
    @location(0) albedo: vec4<f32>,
    @location(1) normal: vec4<f32>,
    @location(2) shadow: vec4<f32>,
    @location(3) surfaceId: vec4<f32>,
    // @location(4) viewNormal: vec4<f32>
};

const bias = 0.000;

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
            input.shadowPos.xy + offset, input.shadowPos.z + bias
        );
        }
    }
    visibility /= 9.0;

    let lambertFactor = max(dot(normalize(sunPos - input.pos), normalize(input.normal)), 0.0);

    // OUTPUT
    var output: FragmentOutput;


    output.albedo = input.color;
    // output.albedo = vec4f( mix(input.color.rgb, vec3f(rand22(input.uv)), 0.2) , 1.);

    output.normal = vec4f(input.normal, 1.0);
    // output.viewNormal = input.viewNormal;
    output.shadow = vec4f(1. - vec3f(min(visibility * lambertFactor, 1.0)), 1.0);
    output.surfaceId = vec4f(calculate_unique_color(1., input.viewNormal.xyz), 1.0);

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




fn rand22(n: vec2f) -> f32 { return fract(sin(dot(n, vec2f(12.9898, 4.1414))) * 43758.5453); }


// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

const u_suncolor = vec3f(1.0, 1.0, 1.0);

const u_ambient = 0.2;

const m_diffuse = 0.5;
const m_shininess = 0.5;
const m_specular = 0.5;

fn blinnPhong(albedo: vec4f, fragPos: vec3f, normal: vec3f) -> vec3f {
    // Ambient
    let ambient = u_ambient;

    // Diffuse
    let sunDirection = normalize(sunPos - fragPos);
    let diff = max(dot(normal, sunDirection), 0.0);
    let diffuse = diff * m_diffuse;

    // Specular
    let viewDirection = normalize(camEye - fragPos);
    let halfwayDir = normalize(sunDirection + viewDirection);
    let spec = pow(max(dot(normal, halfwayDir), 0.0), m_shininess);
    let specular = spec * m_specular;

    // Combine the lighting components
    let result = (ambient + diffuse ) * u_suncolor; // + specular
    return result;
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
