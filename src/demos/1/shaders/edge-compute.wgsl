// @group(0) @binding(0) var outputTexture: texture_storage_2d<bgra8unorm, write>;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  // let coords = vec2<i32>(global_id.xy);
  // let size = vec2<i32>(textureDimensions(outputTexture));

  // if (coords.x >= size.x || coords.y >= size.y) {
  //   return;
  // }

  // Perform compute operations and write the result to the output texture
  // let color = vec4<f32>(f32(coords.x) / f32(size.x), f32(coords.y) / f32(size.y), 0.0, 1.0);

  // textureStore(outputTexture, coords, color);
}