import { Init } from "@core";
import { GlobalSetup, MeshManager, World } from "@utils";

import { RenderGraph } from "./render-graph";

export const RunTriangle = async () => {
  // SETUP
  const rendererData = await Init();
  const { device, format } = rendererData;
  const globalSetup = new GlobalSetup(rendererData);
  const mesh = new MeshManager({ ...globalSetup.data, format });

  const world: World = {
    ...globalSetup.data,
    mesh,
    rendererData,
  };

  // RUN
  const renderGraph = RenderGraph(world);

  // LOOP
  let animateId = 0;
  const loop = () => {
    globalSetup.tick();

    // render
    const encoder = device.createCommandEncoder();

    renderGraph(encoder);

    device.queue.submit([encoder.finish()]);

    // end
    animateId = requestAnimationFrame(loop);
  };
  loop();

  return () => {
    cancelAnimationFrame(animateId);
  };
};

/*


export const _RunTriangle = async () => {
  const rendererData = await Init();
  const { device, format, size, context } = rendererData;
  const globalSetup = new GlobalSetup(rendererData);
  const { factory, textures } = globalSetup.data;
  const mesh = new MeshManager({ ...globalSetup.data, format });

  const world: World = {
    ...globalSetup.data,
    mesh,
    rendererData,
  };

  // textures

  // SHADOW PASS
  const shadowTarget = factory.textures.createTexture({
    size,
    format,
    usage:
      GPUTextureUsage.RENDER_ATTACHMENT |
      GPUTextureUsage.COPY_SRC |
      GPUTextureUsage.TEXTURE_BINDING,
  });

  const shadowDepth = factory.textures.createTexture({
    size,
    format: "depth24plus",
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });
  const shadowDepthView = shadowDepth.createView();

  // RENDER PASS
  const normalRender = factory.textures.createTexture({
    size,
    format,
    usage:
      GPUTextureUsage.RENDER_ATTACHMENT |
      GPUTextureUsage.COPY_SRC |
      GPUTextureUsage.TEXTURE_BINDING,
  });
  const albedoRender = factory.textures.createTexture({
    size,
    format,
    usage:
      GPUTextureUsage.RENDER_ATTACHMENT |
      GPUTextureUsage.COPY_SRC |
      GPUTextureUsage.TEXTURE_BINDING,
  });

  const anotherMultiSampleTexture = factory.textures
    .createTexture({
      size,
      format,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
      sampleCount: 4,
      depthOrArrayLayers: 1,
    })
    .createView();

  // scene
  const scene = Scene(world);

  // postprocess
  const postprocess = Postprocess(world, {
    textures: {
      albedo: albedoRender,
      normal: normalRender,
    },
  });

  let animateId = 0;
  const loop = () => {
    globalSetup.tick();

    // render
    const encoder = device.createCommandEncoder();

    const shadowPass = encoder.beginRenderPass({
      label: "shadows cubes",
      colorAttachments: [
        {
          view: shadowTarget.createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
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

    scene(shadowPass, RenderMode.SHADOW);

    shadowPass.end();

    const pass = encoder.beginRenderPass({
      label: "cubes",
      colorAttachments: [
        {
          view: textures.multisample.view,
          resolveTarget: albedoRender.createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: "clear",
          storeOp: "store",
        },
        {
          view: anotherMultiSampleTexture,
          resolveTarget: normalRender.createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
      depthStencilAttachment: {
        view: textures.depth.view,
        depthLoadOp: "clear",
        depthStoreOp: "store",
        depthClearValue: 1.0,
      },
    });

    scene(pass, RenderMode.MAIN);

    pass.end();

    // postprocess
    postprocess(encoder, context.getCurrentTexture().createView());

    // compute pipelines

    device.queue.submit([encoder.finish()]);

    // end
    animateId = requestAnimationFrame(loop);
  };
  loop();

  return () => {
    cancelAnimationFrame(animateId);
  };
};


*/
