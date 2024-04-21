import { BindGroupManager } from "./bindgroup";
import { BufferManager } from "./buffer";
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

  constructor() {
    this.shaders = new ShaderManager();
    this.buffers = new BufferManager();
    this.vertexBuffers = new VertexBufferManager();
    this.bindGroups = new BindGroupManager();
    this.textures = new TextureManager();
    this.samplers = new SamplerManager();
  }
}

export type { StorageRef } from "./types";

export { ShadersManager } from "./shaders";
export { BindgroupManager } from "./bindgroup";
export { BuffersManager } from "./buffer";
export { VertexBuffersManager } from "./vertexbuffer";
export { TexturesManager } from "./texture";
export { SamplersManager } from "./sampler";

export { BindGroupEntryType } from "./bindgroup";
