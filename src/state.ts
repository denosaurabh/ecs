import { Camera } from "./camera";
import { Depth } from "./depth";
import { Scene } from "./scene";

// import { Interactions } from "./interations";
// import { PostProcess } from "./postprocess";
// import { Texture } from "./utils/texture";

export class State {
  // core
  public width: number;
  public height: number;
  public device: GPUDevice;
  public context: GPUCanvasContext;
  public format: GPUTextureFormat;

  // // classes
  public scene!: Scene;
  public depth!: Depth;
  public camera!: Camera;
  // public postprocess!: PostProcess;
  // public interactions!: Interactions;

  // // textures
  // public textureRender!: Texture;
  // public textureDepth!: Texture;
  // public textureSurfaceId!: Texture;
  // public textureNormal!: Texture;

  constructor(coreState: {
    width: number;
    height: number;
    device: GPUDevice;
    context: GPUCanvasContext;
    format: GPUTextureFormat;
  }) {
    this.width = coreState.width;
    this.height = coreState.height;
    this.device = coreState.device;
    this.context = coreState.context;
    this.format = coreState.format;
  }
}
