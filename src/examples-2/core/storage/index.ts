import { BindGroupManager } from "./bindgroup";
import { BufferManager } from "./buffer";
import { PipelineManager } from "./pipeline";
import { SamplerManager } from "./sampler";
import { ShaderManager } from "./shaders";
import { TextureManager } from "./texture";
import { VertexBufferManager } from "./vertexbuffer";

export class StorageManager {
  shaders: ShaderManager;
  buffers: BufferManager;
  vertexBuffers: VertexBufferManager;
  bindGroups: BindGroupManager;
  textures: TextureManager;
  samplers: SamplerManager;
  pipelines: PipelineManager;

  constructor(device: GPUDevice) {
    this.shaders = new ShaderManager(device);
    this.buffers = new BufferManager(device);
    this.vertexBuffers = new VertexBufferManager(device);
    this.bindGroups = new BindGroupManager(device);
    this.textures = new TextureManager(device);
    this.samplers = new SamplerManager(device);
    this.pipelines = new PipelineManager(device);
  }
}

export { BindGroupEntryType } from "./bindgroup";
