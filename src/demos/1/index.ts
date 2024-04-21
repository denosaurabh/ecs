import { Init } from "@core";
import { GlobalSetup, MeshManager } from "@utils";

import DiffuseShader from "./diffuse.wgsl?raw";

export const RunTriangle = async () => {
  const rendererData = await Init();
  const { device, context } = rendererData;

  const globalSetup = new GlobalSetup(rendererData);

  const { factory, geometry, textures, transform } = globalSetup.data;

  const mesh = new MeshManager(globalSetup.data);

  // objects
  const geo = geometry.CUBE_WITH_NORMAL();

  const shader = factory.shaders.create({
    code: DiffuseShader,
  });

  const cubeTransform = transform.new().translate(0, 0, 0);

  const cube = mesh.new(geo, shader);
  cube.setTransform(cubeTransform);

  cube.intitialize();

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
          clearValue: {
            r: 0.91,
            g: 0.82,
            b: 0.68,
            a: 1,
          },
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

    cube.render(pass, "MAIN");

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
