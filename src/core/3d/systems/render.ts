import { World } from "@ecs";

export const render = (_world: World) => {
  //   const {
  //     device,
  //     postprocess,
  //     interactions,
  //     context,
  //     textureRender,
  //     textureNormal,
  //     textureSurfaceId,
  //   } = this.state;
  //   // interactions
  //   interactions.render();
  //   /* *********************************** */
  //   // CORE RENDER
  //   const encoder = device.createCommandEncoder();
  //   this.state.scene.render(
  //     encoder,
  //     textureRender.texture.createView(),
  //     ScenePipelineType.Render
  //   );
  //   this.state.scene.render(
  //     encoder,
  //     textureNormal.texture.createView(),
  //     ScenePipelineType.Normal
  //   );
  //   this.state.scene.render(
  //     encoder,
  //     textureSurfaceId.texture.createView(),
  //     ScenePipelineType.SurfaceId
  //   );
  //   device.queue.submit([encoder.finish()]);
  //   /* *********************************** */
  //   // POSTPROCESS
  //   postprocess.render(context.getCurrentTexture().createView());
};
