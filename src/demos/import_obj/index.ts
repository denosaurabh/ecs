import { Init, OBJLoader } from "@core";
import { GlobalSetup, MeshManager, World } from "@utils";

import CubeOBJ from "./models/cube-triangulated-mesh.obj?raw";
import CubeOBJShader from "./shaders/cube-obj.wgsl?raw";

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

  const cubeModel = objLoader.parse(CubeOBJ);
  console.log(cubeModel);

  const [vertexBuffer, vertexBufferLayout] = objLoader.createBuffer(
    world.factory,
    cubeModel
  );

  // pipeline

  const [transformBind, transformLayout] = world.transform
    .new()
    .translate(0, 0, 0)
    .createBindGroup();

  const cubeObjShader = world.factory.shaders.create({
    code: CubeOBJShader,
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
          view: context.getCurrentTexture().createView(),
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });

    pass.setPipeline(pipeline);

    pass.setBindGroup(0, world.bindGroups.main);
    pass.setBindGroup(1, transformBind);

    pass.setVertexBuffer(0, vertexBuffer);

    pass.draw(cubeModel.vertexCount, 1);

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
