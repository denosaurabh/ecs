import { World } from "@utils";
import { InstancesBufferLoader } from "./load-instances-buffer";

import { BindGroupEntryType, OBJLoader } from "@core";

import LeafModel from "./models/leaf.obj?raw";
import LeafPoints from "./models/points.obj?raw";

export const Scene = (world: World) => {
  const objLoader = new OBJLoader();
  const { vertexCount, vertexBuffer, vertexLayout } = objLoader.load(
    LeafModel,
    world.factory
  );

  const loadPoints = new InstancesBufferLoader();
  const { instanceCount, instanceBuffer, instanceBufferLayout } =
    loadPoints.load(LeafPoints, world.factory, 3);

  const instancesBuffer = world.factory.buffers.createUniform(
    new Uint32Array([instanceCount]),
    "grass instances"
  );

  const [instancesBind, instancesBindLayout] = world.factory.bindGroups.create({
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

  return {
    vertexBufferLayouts: [vertexLayout, instanceBufferLayout],
    bindGroupLayouts: [transformLayout, instancesBindLayout],

    render: (pass: GPURenderPassEncoder) => {
      // render
      pass.setBindGroup(1, transformBind);
      pass.setBindGroup(2, instancesBind);

      pass.setVertexBuffer(0, vertexBuffer);
      pass.setVertexBuffer(1, instanceBuffer);

      pass.draw(vertexCount, instanceCount);
    },
  };
};
