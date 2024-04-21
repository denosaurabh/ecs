import { Init } from "@core";
import { GlobalSetup } from "../../setup";

import DiffuseShader from "./diffuse.wgsl?raw";

export const RunTriangle = async () => {
  const rendererData = await Init();
  const { device, context } = rendererData;

  const globalSetup = new GlobalSetup(rendererData);
  const { factory, geometry, bindGroups, textures, transform, settings } =
    globalSetup.data;

  // objects
  const geo = geometry.CUBE_WITH_NORMAL();

  const shader = factory.shaders.create({
    // code: SimpleShader,
    code: DiffuseShader,
  });

  const cubeTransform = transform.new().translate(0, 0, 0).createBindGroup();

  const [pipeline] = factory.pipelines.create({
    label: "triangle",

    layout: {
      bindGroups: [bindGroups.layout, cubeTransform[1]],
    },

    shader,
    vertexBufferLayouts: [geo.layout],

    depthStencil: "depth24plus|less|true",

    multisample: settings.multisample,
    settings: {
      topology: "triangle-list",
      cullMode: "back",
    },
  });

  let animateId = 0;
  const loop = () => {
    globalSetup.tick();

    // render
    const encoder = device.createCommandEncoder();

    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: textures.multisample.view,
          resolveTarget: context.getCurrentTexture().createView(),
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

    pass.setPipeline(pipeline);

    pass.setBindGroup(0, bindGroups.main);
    pass.setBindGroup(1, cubeTransform[0]);

    pass.setVertexBuffer(0, geo.buffer);

    pass.draw(geo.vertexCount, 1);

    pass.end();

    device.queue.submit([encoder.finish()]);

    // end
    animateId = requestAnimationFrame(loop);
  };
  loop();

  return () => {
    cancelAnimationFrame(animateId);
  };
};
