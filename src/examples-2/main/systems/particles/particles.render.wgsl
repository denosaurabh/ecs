@group(1) @binding(0) var<storage, read> mvpMatrix : array<mat4x4<f32>>;

struct VertexOutput {
    @builtin(position) Position : vec4<f32>,
    @location(0) fragUV : vec2<f32>,
    @location(1) fragPosition: vec4<f32>

};

@vertex
fn vertexMain(
    @builtin(instance_index) index : u32,
    @location(0) position : vec2<f32>, // @location(0) position : vec4<f32>,
    @location(1) uv : vec2<f32>
) -> VertexOutput {
    var output : VertexOutput;

    var pos = vec4f(position, 0.0, 1.0);

    output.Position = mvpMatrix[index] * pos;
    output.fragUV = uv;
    output.fragPosition = 0.5 * (pos + vec4<f32>(1.0, 1.0, 1.0, 1.0));
    return output;
}


@fragment
fn fragMain(
    @location(0) fragUV: vec2<f32>,
    @location(1) fragPosition: vec4<f32>
) -> @location(0) vec4<f32> {
    // return fragPosition;
    return vec4f(1.0, 1.0, 1.0, 1.0);
}






// // struct Transform {
// //     modelMat: mat4x4f,
// //     invModelMat: mat4x4f,
// // };

// // @group(1) @binding(0) var<uniform> model : Transform;
// @group(1) @binding(0) var<storage, read> positions : array<vec3<f32>>;

// struct VertexOutput {
//     @builtin(position) Position : vec4f,
//     @location(0) uv: vec2f
// }

// @vertex
// fn vertexMain(
//     @builtin(instance_index) instance_index : u32,
//     @location(0) position : vec2f,
//     @location(1) uv : vec2f
// ) -> VertexOutput {
//     var output : VertexOutput;

//     var pos = position;
//     pos.x += positions[instance_index].x;
//     pos.y += positions[instance_index].y;

//     // pos.x = rand(instance_index) * 2. - 1.;
//     // pos.y = rand(instance_index) * 2. - 1.;

//     // projectionView * model.modelMat *
//     output.Position = vec4f(pos * 0.01, 0.0, 1.0);
//     output.uv = uv;

//     return output;
// }

// @fragment
// fn fragMain(
//   @location(0) uv: vec2f,
// ) -> @location(0) vec4f {

//     var finalColor = vec3f(0., 0., 1.);

//     return vec4f(finalColor, 1.0);
// }


// fn rand(seed: u32) -> f32 {
//     let x = f32(seed);
//     let y = fract(sin(x * 1597.0) * 43758.5453123);
//     return y; // * 2.0 - 1.0
// }