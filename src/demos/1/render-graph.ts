import { World } from "@utils";

export const RenderGraph = (world: World) => {
  const {
    factory,
    rendererData: { format, size, context },
  } = world;

  // commons
  const usage =
    GPUTextureUsage.RENDER_ATTACHMENT |
    GPUTextureUsage.COPY_DST |
    GPUTextureUsage.TEXTURE_BINDING;

  ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////
  // SHADOW PASS
  const shadowTarget = factory.textures.createTexture({
    size,
    format,
    usage,
    sampleCount: 1,
  });
  const shadowTargetView = shadowTarget.createView();

  const shadowDepth = factory.textures.createTexture({
    size,
    format: "depth24plus",
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
    sampleCount: 1,
  });
  const shadowDepthView = shadowDepth.createView();

  ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////
  // DEFERRED PASS
  const normalRender = factory.textures.createTexture({
    size,
    format,
    usage,
  });
  const albedoRender = factory.textures.createTexture({
    size,
    format,
    usage,
  });
  const deferredDepth = factory.textures.createTexture({
    size,
    format: "depth24plus",
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
    sampleCount: 1,
  });
  const deferredDepthView = deferredDepth.createView();

  ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////
  // SHADOWS
  const shadowRender = factory.textures.createTexture({
    size,
    format,
    usage,
  });

  return (encoder: GPUCommandEncoder) => {
    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    // shadow pass
    const shadowPass = encoder.beginRenderPass({
      label: "shadow pass",
      colorAttachments: [
        {
          view: shadowTargetView,
          loadOp: "clear",
          storeOp: "store",
        },
      ],
      depthStencilAttachment: {
        view: shadowDepthView,
        depthLoadOp: "clear",
        depthStoreOp: "store",
        depthClearValue: 1.0,
      },
    });

    shadowPass.end();

    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    // deferred pass
    const deferredPass = encoder.beginRenderPass({
      label: "deferred pass",
      colorAttachments: [
        {
          view: normalRender.createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
        },
        {
          view: albedoRender.createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
        },
      ],
      depthStencilAttachment: {
        view: deferredDepthView,
        depthLoadOp: "clear",
        depthStoreOp: "store",
        depthClearValue: 1.0,
      },
    });

    deferredPass.end();

    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    // shadow pass
    const shadowRenderPass = encoder.beginRenderPass({
      label: "shadow render pass",
      colorAttachments: [
        {
          view: shadowRender.createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
        },
      ],
    });

    shadowRenderPass.end();

    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    // final canvas
    const canvasPass = encoder.beginRenderPass({
      label: "final canvas pass",
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
        },
      ],
    });

    canvasPass.end();
  };
};
