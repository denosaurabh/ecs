struct ProjectionView {
    projView: mat4x4f,
    invProjView: mat4x4f,
};
@group(0) @binding(0) var<uniform> pv : ProjectionView;
@group(0) @binding(6) var<uniform> camProjection : mat4x4f;
@group(0) @binding(7) var<uniform> camView : mat4x4f;



struct Transform {
    modelMat: mat4x4f,
    invModelMat: mat4x4f,
};
@group(1) @binding(0) var<uniform> model : Transform;


struct VertexOutput {
  @builtin(position) Position: vec4f,
  @location(0) normal: vec3f,
  @location(1) viewPos: vec4f,
  @location(2) viewNormal: vec4f,
}

@vertex
fn vertexMain(
    @location(0) position : vec3f,
    @location(1) normal : vec3f
) -> VertexOutput {
    var output : VertexOutput;

    output.Position = pv.projView * model.modelMat * vec4f(position, 1.0);

    var thenewnormal = model.invModelMat * vec4f(normal, 0.0);
    output.normal = abs( normalize(vec3f(thenewnormal.xyz)) );

    // VIEW SPACE ******************************************************************************************

    // let viewPos = camView * model.modelMat * vec4f(position, 1.0);
    // output.viewPos = vec4f(viewPos.xyz, 1.0);

    /* transform the normal vector from model space to view space */

    // 1) METHOD 1
    // let normalMatrix = transpose(inverse(mat3f(camView * model.modelMat)));
    // output.viewNormal = normalMatrix * normal;

    // 1) METHOD 2
    // let mvp = camProjection * camView * model.modelMat;
    // let clipNormal = mvp * vec4f(normal, 0.0);
    // output.viewNormal = vec4f(normalize(clipNormal.xyz), 1.0);

    // 1) METHOD 3 
    // output.viewNormal = normalize(thenewnormal * camView);
    // output.viewNormal = vec4f( normalize((camView * thenewnormal).xyz), 1.);  // <-------   FINNALY PICKED 

    // can it work? possibly?
    // output.viewNormal = vec4f( normalize(vec3f(thenewnormal.xyz)), 1.);







    let viewPosNew = camView * model.modelMat * vec4f(position, 1.0);
    output.viewPos = vec4f(viewPosNew.xyz, 1.0);

    let worldNormal = normalize((model.invModelMat * vec4f(normal, 0.0)).xyz);
    output.viewNormal = vec4f(normalize((camView * vec4f(worldNormal, 0.0)).xyz), 0.0);


    return output;
}

struct FragmentOutput {
    @location(0) albedo: vec4<f32>,
    @location(1) normal: vec4<f32>,
    @location(2) posView: vec4<f32>,
    @location(3) normalView: vec4<f32>,
};

@fragment
fn fragMain(
input: VertexOutput
) -> FragmentOutput {
    // OUTPUT
    var output: FragmentOutput;

    output.albedo = vec4f(0.60, 0.43, 0.33, 1.0);
    output.normal = vec4f(input.normal, 1.0);

    output.posView = input.viewPos;
    output.normalView = input.viewNormal;

    return output;
}


