import { Init } from "@core";
import { GlobalSetup } from "../../setup";

import SimpleShader from "./simple.wgsl?raw";

export const RunTriangle = async () => {
  const rendererData = await Init();
  const { device, context } = rendererData;

  const globalSetup = new GlobalSetup(rendererData);
  const { factory, geometry, bindGroups } = globalSetup.data;

  // objects
  const geo = geometry.TRIANGE();

  const shader = factory.shaders.create({
    code: SimpleShader,
  });

  const [pipeline] = factory.pipelines.create({
    label: "triangle",

    layout: {
      bindGroups: [bindGroups.layout],
    },

    shader,
    vertexBufferLayouts: [geo.layout],
  });

  let animateId = 0;
  const loop = () => {
    globalSetup.tick();

    // render
    console.log("render");

    const encoder = device.createCommandEncoder();

    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });

    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroups.main);
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
