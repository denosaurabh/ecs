struct ProjectionView {
    projView: mat4x4f,
    invProjView: mat4x4f,
};

@group(0) @binding(0) var<uniform> pv : ProjectionView;
@group(0) @binding(1) var<uniform> time : f32;
@group(0) @binding(3) var<uniform> sunPos : vec3f;

struct Transform {
    modelMat: mat4x4f,
    invModelMat: mat4x4f,
};

@group(1) @binding(0) var<uniform> model : Transform;

struct VertexOutput {
    @builtin(position) Position : vec4f,
    @location(0) normal: vec3f,
    @location(1) color: vec3f,
}

@vertex
fn vertexMain(
    @location(0) position : vec3f,
    @location(1) normal : vec3f
) -> VertexOutput {
    var output : VertexOutput;
    output.Position = pv.projView * model.modelMat * vec4f(position, 1.0);

    var thenewnormal = model.invModelMat * vec4f(normal, 0.0);
    output.normal = normalize(vec3f(thenewnormal.x, thenewnormal.y, thenewnormal.z));

    output.color = vec3(0.82, 0.64, 0.53);

    return output;
}

@fragment
fn fragMain(
  @location(0) normal: vec3f,
  @location(1) color: vec3f,
) -> @location(0) vec4f {
    var finalColor = color * max(0.6, dot(normalize(sunPos), normal));
    // var finalColor = color;
    // finalColor = abs(normal);
    // finalColor = normal_mat.xyz;
    // finalColor = vec3f( max(0.0, dot(normalize(sunPos), normal )) );

    return vec4f(finalColor, 1.0);
}
