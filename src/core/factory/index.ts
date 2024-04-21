import { BindGroupManager } from "./bindgroup";
import { BufferManager } from "./buffer";
import { PipelineManager } from "./pipeline";
import { ShaderManager } from "./shaders";
import { TextureManager } from "./texture";

export class WGPUFactory {
  shaders: ShaderManager;
  buffers: BufferManager;
  bindGroups: BindGroupManager;
  textures: TextureManager;
  pipelines: PipelineManager;

  constructor(device: GPUDevice) {
    this.shaders = new ShaderManager(device);
    this.buffers = new BufferManager(device);
    this.bindGroups = new BindGroupManager(device);
    this.textures = new TextureManager(device);
    this.pipelines = new PipelineManager(device);
  }
}

export { BindGroupEntryType } from "./bindgroup";
