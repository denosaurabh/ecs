import { Camera } from "./camera";
import { State } from "./state";

import { Depth } from "./depth";
import { Interactions } from "./interations";
import { PostProcess } from "./postprocess";
import { Renderer } from "./renderer";
import { Scene } from "./scene";
// import { Texture } from "./utils/texture";
import { ScenePipelineType } from "./utils/types";

export class Engine {
  private state!: State;

  constructor() {}

  public async initialize() {
    const renderer = new Renderer();
    const coreState = await renderer.initialize();

    if (coreState) {
      this.state = new State(coreState);
    }
  }

  public async setup() {
    // order of calls is important here
    this.state.depth = new Depth(this.state);
    this.state.camera = new Camera(this.state, {
      frustumSize: 15, // 15
      near: 0.01, // 0.01
      far: 30.0, // 30
      eye: [10, 10, 10],
      target: [0, 0, 0],
      // eye: [0, 5, 0],
      // target: [0, 0, 0],
    });

    // this.state.textureDepth = await Texture.createTextureFromGPUTexture(
    //   this.state.device,
    //   this.state.depth.depthStencilBuffer
    // );
    // this.state.textureRender = await Texture.createEmptyTexture(
    //   this.state.device,
    //   this.state.width,
    //   this.state.height,
    //   this.state.format
    // );
    // this.state.textureNormal = await Texture.createEmptyTexture(
    //   this.state.device,
    //   this.state.width,
    //   this.state.height,
    //   this.state.format
    // );
    // this.state.textureSurfaceId = await Texture.createEmptyTexture(
    //   this.state.device,
    //   this.state.width,
    //   this.state.height,
    //   this.state.format
    // );

    this.state.scene = new Scene(this.state);
    await this.state.scene.setup();

    this.state.postprocess = new PostProcess(this.state);
    await this.state.postprocess.setup();

    this.state.interactions = new Interactions(this.state);
    this.state.interactions.setup();
  }

  public render() {
    const {
      device,
      // postprocess,
      // interactions,
      context,
      // textureRender,
      // textureNormal,
      // textureSurfaceId,
    } = this.state;

    // interactions
    // interactions.render();

    /* *********************************** */
    // CORE RENDER
    const encoder = device.createCommandEncoder();
    this.state.scene.render(
      encoder,
      textureRender.texture.createView(),
      ScenePipelineType.Render
    );
    this.state.scene.render(
      encoder,
      textureNormal.texture.createView(),
      ScenePipelineType.Normal
    );
    this.state.scene.render(
      encoder,
      textureSurfaceId.texture.createView(),
      ScenePipelineType.SurfaceId
    );
    device.queue.submit([encoder.finish()]);

    /* *********************************** */
    // POSTPROCESS
    // postprocess.render(context.getCurrentTexture().createView());

    /* *********************************** */
    // frames
    requestAnimationFrame(() => this.render());
  }
}
