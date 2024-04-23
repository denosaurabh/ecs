import { BindGroupEntryType, Init, OBJLoader } from "@core";
import { GlobalSetup, MeshManager, World } from "@utils";

import GrassBladeModel from "./models/grass-blade-smooth-normals.obj?raw";
import GrassShader from "./shaders/grass.wgsl?raw";

export const Foliage = async () => {
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
  const { name, vertexCount, vertexBuffer, vertexLayout } = objLoader.load(
    GrassBladeModel,
    world.factory
  );

  // pipeline
  const instances = 1000;
  const instancesBuffer = world.factory.buffers.createUniform(
    new Uint32Array([instances]),
    "grass instances"
  );

  const [instancesBind, instancesLayout] = world.factory.bindGroups.create({
    label: "grass instances",
    entries: [
      {
        resource: world.factory.buffers.getBindingResource(instancesBuffer),
        visibility: GPUShaderStage.VERTEX,
        type: BindGroupEntryType.buffer({
          type: "uniform",
        }),
      },
    ],
  });

  const [transformBind, transformLayout] = world.transform
    .new()
    .translate(0, 0, 0)
    .createBindGroup();

  const cubeObjShader = world.factory.shaders.create({
    code: GrassShader,
  });

  const [pipeline] = world.factory.pipelines.create({
    label: name,
    layout: {
      bindGroups: [world.bindGroups.layout, transformLayout, instancesLayout],
    },
    shader: cubeObjShader,
    vertexBufferLayouts: [vertexLayout],
    fragmentTargets: [{ format }],
    settings: {
      cullMode: "none",
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
    pass.setBindGroup(2, instancesBind);

    pass.setVertexBuffer(0, vertexBuffer);

    pass.draw(vertexCount, instances);

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
