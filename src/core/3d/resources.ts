import { resource } from "@ecs";

export const renderer_data = resource<{
  width: number;
  height: number;

  device?: GPUDevice;
  context?: GPUCanvasContext;
  format?: GPUTextureFormat;
}>({
  width: 0,
  height: 0,
});

export const render = resource<{
  uniformBuffer: GPUBuffer;
  uniformBindGroup: GPUBindGroup;
  renderPassDescriptor: GPURenderPassDescriptor;
  pipeline: GPURenderPipeline;
  verticesBuffer: GPUBuffer;
  vertexCount: number;
}>();

export const delta = resource({ delta: 0 });
