import {
  StorageRef,
  ShadersManager,
  VertexBuffersManager,
  BindgroupManager,
  TexturesManager,
} from "./storage";

export type RenderPass = {
  label?: string;

  outputAttachments: OutputAttachment[];
  depthStencilAttachment?: DepthStencilAttachment;

  pipelines: Pipeline[];
};

type DepthStencilAttachment = {
  view: StorageRef<typeof TexturesManager>;

  depthClearValue?: number;
  depthLoadOp?: GPULoadOp;
  depthStoreOp?: GPUStoreOp;
  depthReadOnly?: boolean;
  stencilClearValue?: GPUStencilValue;
  stencilLoadOp?: GPULoadOp;
  stencilStoreOp?: GPUStoreOp;
  stencilReadOnly?: boolean;
};

type OutputAttachment = {
  texture: StorageRef<typeof TexturesManager>;
  loadOp: GPULoadOp;
  storeOp: GPUStoreOp;

  clearValue?: GPUColorDict;
};

type Pipeline = {
  label?: string;

  disabled?: boolean;

  bindGroups: StorageRef<typeof BindgroupManager>[];
  shader: StorageRef<typeof ShadersManager>;

  vertexBufferLayouts: StorageRef<typeof VertexBuffersManager>[]; // VertexBufferLayout

  draw: Draw[];

  removeDefaultTarget?: boolean;
  targets?: GPUColorTargetState[];
  settings?: {
    topology?: GPUPrimitiveTopology;
    cullMode?: GPUCullMode;
    depthStencil?: GPUDepthStencilState;
  };
};

type Draw = {
  vertexBuffers: StorageRef<typeof VertexBuffersManager>[];

  vertexCount: number;
  instanceCount?: number;
};

/* ****************  RENDER GRAPH  **************** */
export type FinalRenderPass = {
  outputAttachments: FinalOutputAttachment[];
  depthStencilAttachment?: FinalDepthStencilAttachment;

  pipelines: Array<{
    pipeline: GPURenderPipeline;
    draw: FinalDraw[];

    disabled?: boolean;
  }>;
};

type FinalDepthStencilAttachment = {
  view: GPUTexture;

  depthClearValue?: number;
  depthLoadOp?: GPULoadOp;
  depthStoreOp?: GPUStoreOp;
  depthReadOnly?: boolean;
  stencilClearValue?: GPUStencilValue;
  stencilLoadOp?: GPULoadOp;
  stencilStoreOp?: GPUStoreOp;
  stencilReadOnly?: boolean;
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

/* ********************************************************************************************************************** */
/* ********************************************************************************************************************** */
/* ********************************************************************************************************************** */
/* ********************************************************************************************************************** */
