import LUTImage from "./data/lut-2.png";
// import LUTImageRaw from "./data/lut-2.png?raw";

export const LUT = async (device: GPUDevice) => {
  const lutDimensions = { width: 64, height: 64, depth: 64 };

  const lutData = await loadLUTData(LUTImage);
  const lutTexture = createLUTTexture(device, lutData, lutDimensions);

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

async function loadLUTData(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  const blob = await response.blob();

  const imageData = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Failed to create 2d context");
  }

  context.drawImage(imageData, 0, 0);
  const pixelData = context.getImageData(
    0,
    0,
    imageData.width,
    imageData.height
  ).data;
  return new Uint8Array(pixelData.buffer);

  // const arrayBuffer = await response.arrayBuffer();
  // console.log({ arrayBuffer });
  // return arrayBuffer;
}

// export const convertImageToUint8Array = async (imageUri: string) => {
//   try {
//     const blobResponse = await fetch(imageUri, { responseType: "blob" });
//     const blob = await blobResponse.blob();
//     const arrayBuffer = await new Promise((resolve) => {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         resolve(reader.result);
//       };
//       reader.readAsArrayBuffer(blob);
//     });
//     return new Uint8ClampedArray(arrayBuffer);
//   } catch (error) {
//     console.log("Error converting image:", error);
//     throw error;
//   }
// };

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
