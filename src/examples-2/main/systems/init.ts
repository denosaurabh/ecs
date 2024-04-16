export type RendererData = {
  width: number;
  height: number;
  pixelRatio: number;

  device: GPUDevice;
  context: GPUCanvasContext;
  format: GPUTextureFormat;
};

export const Init = async (): Promise<RendererData> => {
  if (!navigator.gpu) {
    alert("WebGPU is not supported on your browser!");
    throw new Error("WebGPU is not supported on your browser!");
  }

  const adapter = await navigator.gpu.requestAdapter({
    powerPreference: "high-performance",
  });

  if (!adapter) {
    throw new Error("No appropriate GPUAdapter found.");
  }

  // get gpu device
  const device = await adapter.requestDevice();

  // setup canvas
  const canvas = document.querySelector("canvas");

  if (!canvas) {
    throw new Error("Canvas not found!");
  }

  const pixelRatio = window.devicePixelRatio;

  const width = window.innerWidth;
  const height = window.innerHeight;

  // set width & height here, setting in class="" will cause pixelation
  canvas.setAttribute("width", width.toString());
  canvas.setAttribute("height", height.toString());

  const context = canvas.getContext("webgpu");
  const format = navigator.gpu.getPreferredCanvasFormat();
  // const canvasFormat = "bgra8unorm-srgb";
  console.log("format", format);

  if (!context) {
    throw new Error("context not found!");
  }

  context?.configure({
    device,
    format,
    // colorSpace: "srgb",
    alphaMode: "premultiplied",
  });

  const data = {
    width,
    height,
    pixelRatio,

    device,
    context,
    format,
  };

  return data;
};
