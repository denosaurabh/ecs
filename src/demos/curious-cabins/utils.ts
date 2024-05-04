export async function importImage(
  url: string
  //   size: { width: number; height: number; depth: number }
): Promise<{
  width: number;
  height: number;
  arrayBuffer: Uint8Array;
}> {
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

  return {
    width: imageData.width,
    height: imageData.height,
    arrayBuffer: new Uint8Array(pixelData.buffer),
  };
}
