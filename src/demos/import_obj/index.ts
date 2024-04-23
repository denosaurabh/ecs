import { Init, OBJLoader } from "@core";
import { GlobalSetup, MeshManager, World } from "@utils";

import OBJModel from "./models/monke-smooth.obj?raw";
import OBJShader from "./shaders/cube-obj.wgsl?raw";

export const ImportObj = async () => {
  // SETUP
  const rendererData = await Init();
  const { device, format, context } = rendererData;
  const globalSetup = new GlobalSetup(rendererData);
  const mesh = new MeshManager({ ...globalSetup.data, format });

  const world: World = {
    ...globalSetup.data,
    mesh,
    rendererData,
  };

  // RUN
  const objLoader = new OBJLoader();

  const objModel = objLoader.parse(OBJModel);

  const [vertexBuffer, vertexBufferLayout] = objLoader.createBuffer(
    world.factory,
    objModel
  );

  // pipeline

  const [transformBind, transformLayout] = world.transform
    .new()
    .translate(0, 0, 0)
    .createBindGroup();

  const cubeObjShader = world.factory.shaders.create({
    code: OBJShader,
  });

  const [pipeline] = world.factory.pipelines.create({
    label: "Cube OBJ",
    layout: {
      bindGroups: [world.bindGroups.layout, transformLayout],
    },
    shader: cubeObjShader,
    vertexBufferLayouts: [vertexBufferLayout],
    fragmentTargets: [{ format }],
    settings: {
      cullMode: "back",
      topology: "triangle-list",
    },
    depthStencil: "depth24plus|less|true",
    multisample: world.settings.multisample,
  });

  // LOOP
  let animateId = 0;
  const loop = () => {
    globalSetup.tick();

    // render
    const encoder = device.createCommandEncoder();

    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: world.textures.multisample.view,
          resolveTarget: context.getCurrentTexture().createView(),
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
      depthStencilAttachment: {
        view: world.textures.depth.view,
        depthLoadOp: "clear",
        depthStoreOp: "store",
        depthClearValue: 1.0,
      },
    });

    pass.setPipeline(pipeline);

    pass.setBindGroup(0, world.bindGroups.main);
    pass.setBindGroup(1, transformBind);

    pass.setVertexBuffer(0, vertexBuffer);

    pass.draw(objModel.vertexCount, 1);

    pass.end();

    device.queue.submit([encoder.finish()]);

    // end
    animateId = requestAnimationFrame(loop);
  };
  loop();

  return () => {
    device.destroy();
    cancelAnimationFrame(animateId);
  };
};
