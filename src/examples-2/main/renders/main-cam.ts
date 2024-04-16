import { World } from "..";

export const MainCamRender = (
  { storage, bindings, renderer: { width, height, context } }: World,
  encoder: GPUCommandEncoder
) => {
  const depthTexture = storage.textures.create({
    size: [width, height],
    format: "depth24plus",

    depthOrArrayLayers: 1,

    usage:
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.COPY_SRC |
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.RENDER_ATTACHMENT,
  });

  return () => {
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
        },
      ],
      depthStencilAttachment: {
        view: depthTexture.createView(),
        depthLoadOp: "clear",
        depthStoreOp: "store",
        depthClearValue: 1.0,
      },
    });

    pass.setBindGroup(0, bindings.timeProjectionView.bindGroup);
  };
};
