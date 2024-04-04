import {
  StorageRef,
  ShadersManager,
  VertexBuffersManager,
  BindgroupManager,
  TexturesManager,
} from "@storage";

export type RenderPass = {
  label?: string;

  outputAttachments: OutputAttachment[];
  pipelines: Pipeline[];
};

type OutputAttachment = {
  texture: StorageRef<typeof TexturesManager>;
  loadOp: GPULoadOp;
  storeOp: GPUStoreOp;

  clearValue?: GPUColorDict;
};

type Pipeline = {
  label?: string;

  bindGroups: StorageRef<typeof BindgroupManager>[];
  shader: StorageRef<typeof ShadersManager>;

  vertexBufferLayouts: StorageRef<typeof VertexBuffersManager>[]; // VertexBufferLayout

  draw: Draw[];
};

type Draw = {
  vertexBuffers: StorageRef<typeof VertexBuffersManager>[];

  vertexCount: number;
  instanceCount?: number;
};

/* ****************  FINAL  **************** */
export type FinalRenderPass = {
  outputAttachments: FinalOutputAttachment[];
  pipelines: Array<{
    pipeline: GPURenderPipeline;
    draw: FinalDraw[];
  }>;
};

export type FinalOutputAttachment = {
  texture: GPUTexture;
  loadOp: GPULoadOp;
  storeOp: GPUStoreOp;

  clearValue?: GPUColorDict;
};

export type FinalDraw = {
  vertexBuffers: GPUBuffer[];
  bindGroups: GPUBindGroup[];

  vertexCount: number;
  instanceCount: number;
};

// type BindGroup = {
//   label?: string;
//   entries: Array<BindGroupEntry>;
// };

// type BindGroupEntry = {
//   visibility: /* typeof GPUShaderStage */ number;
//   type: BindGroupEntryTypeT<unknown>;
// };

// type ShaderCode = {
//   code: string;

//   vertexFn: string;
//   fragFn: string;
// };

// type VertexBufferLayout = Array<{
//   label?: string;
//   format: GPUVertexFormat;
// }>;
