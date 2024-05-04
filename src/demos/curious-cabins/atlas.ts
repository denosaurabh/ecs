import AtlasTexture from "./data/atlas.png";

export const ATLAS = async (device: GPUDevice) => {
  const img = new Image();
  img.src = AtlasTexture;
  await img.decode();

  console.log(img);

  const { width, height } = img;

  //   const { arrayBuffer, width, height } = await importImage(AtlasTexture);

  const texture = device.createTexture({
    size: [width, height, 1],
    format: "rgba8unorm",
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  });
  const view = texture.createView();

  // device.queue.copyExternalImageToTexture({ source: img }, { texture }, [
  //   width,
  //   height,
  // ]);

  //   device.queue.writeTexture(
  // { texture },
  // arrayBuffer
  // { bytesPerRow: width * 4, rowsPerImage: height },
  // {
  //   width: size.width,
  //   height: size.height,
  //   depthOrArrayLayers: size.depth,
  // }
  //   );

  // Create a sampler for the texture
  const sampler = device.createSampler({
    magFilter: "linear",
    minFilter: "linear",
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge",
  });

  return { texture, view, sampler };
};
