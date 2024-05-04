import LUTImage from "./data/lut-2.png";
import { importImage } from "./utils";
// import LUTImageRaw from "./data/lut-2.png?raw";

export const LUT = async (device: GPUDevice) => {
  const lutDimensions = { width: 64, height: 64, depth: 64 };

  const lutData = await importImage(LUTImage);
  const lutTexture = createLUTTexture(
    device,
    lutData.arrayBuffer,
    lutDimensions
  );

  const lutSampler = device.createSampler({
    magFilter: "linear",
    minFilter: "linear",
  });

  return {
    texture: lutTexture,
    dimensions: lutDimensions,
    sampler: lutSampler,
  };
};

// Create a WGPU texture from the LUT data
function createLUTTexture(
  device: GPUDevice,
  lutData: Uint8Array,
  size: { width: number; height: number; depth: number }
): GPUTexture {
  const texture = device.createTexture({
    size: {
      width: size.width,
      height: size.height,
      depthOrArrayLayers: size.depth,
    },
    format: "rgba8unorm",
    usage:
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.COPY_SRC |
      GPUTextureUsage.TEXTURE_BINDING,
    dimension: "3d",
  });

  device.queue.writeTexture(
    { texture },
    lutData,
    { bytesPerRow: size.width * 4, rowsPerImage: size.height },
    {
      width: size.width,
      height: size.height,
      depthOrArrayLayers: size.depth,
    }
  );

  return texture;
}
