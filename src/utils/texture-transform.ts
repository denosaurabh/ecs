// import { GlobalData } from "./setup";

// export class TextureTransformManager {
//   constructor(private world: GlobalData) {}

//   new(from: GPUTexture, to: GPUTexture) {
//     return new TextureTransform(this.world);
//   }
// }

// export class TextureTransform {
//   constructor(private world: GlobalData, from: GPUTexture, to: GPUTexture) {}
// }

export const textureTransformFromBGRA8UNORMtoRGBA8UNORM = (
  device: GPUDevice,
  from: GPUTexture,
  to: GPUTexture
) => {
  // Create bind group layouts and bind groups for format conversion
  const conversionBindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        texture: { sampleType: "float" },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.FRAGMENT,
        storageTexture: { access: "write-only", format: "rgba8unorm" },
      },
    ],
  });

  const conversionBindGroup = device.createBindGroup({
    layout: conversionBindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: from.createView(),
      },
      {
        binding: 1,
        resource: to.createView(),
      },
    ],
  });

  // Create a render pipeline for format conversion
  const conversionPipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [conversionBindGroupLayout],
  });
  const conversionPipeline = device.createRenderPipeline({
    layout: conversionPipelineLayout,
    vertex: {
      module: device.createShaderModule({
        code: `
        @vertex
        fn main(@builtin(vertex_index) vertexIndex : u32) -> @builtin(position) vec4<f32> {
          var pos = array<vec2<f32>, 6>(
            vec2<f32>( 1.0,  1.0),
            vec2<f32>( 1.0, -1.0),
            vec2<f32>(-1.0, -1.0),
            vec2<f32>( 1.0,  1.0),
            vec2<f32>(-1.0, -1.0),
            vec2<f32>(-1.0,  1.0)
          );
          return vec4<f32>(pos[vertexIndex], 0.0, 1.0);
        }
      `,
      }),
      entryPoint: "main",
    },
    fragment: {
      module: device.createShaderModule({
        code: `
        @group(0) @binding(0) var srcTexture: texture_2d<f32>;
        @group(0) @binding(1) var dstTexture: texture_storage_2d<rgba8unorm, write>;

        @fragment
        fn main(@builtin(position) position: vec4<f32>) {
          let texCoord = (position.xy + vec2<f32>(1.0, 1.0)) * 0.5;
          let bgra = textureSample(srcTexture, texCoord);
          let rgba = bgra.bgra; // Swizzle components from BGRA to RGBA
          textureStore(dstTexture, texCoord * vec2<f32>(textureDimensions(dstTexture)), rgba);
        }
      `,
      }),
      entryPoint: "main",
      targets: [],
    },
  });

  // Create a command encoder and a render pass encoder for format conversion
  return (encoder: GPUCommandEncoder) => {
    const converionPass: GPURenderPassEncoder = encoder.beginRenderPass({
      colorAttachments: [],
    });

    converionPass.setPipeline(conversionPipeline);
    converionPass.setBindGroup(0, conversionBindGroup);
    converionPass.draw(6, 1, 0, 0);

    converionPass.end();
  };
};
