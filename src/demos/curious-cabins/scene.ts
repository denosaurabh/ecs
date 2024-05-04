import { World } from "@utils";

// import CubesData from "./data/only-house.txt?raw";
// import CubesData from "./data/some-boxes-colors.txt?raw";
// import CubesData from "./data/gamma-img-22-blender-1.txt?raw";
import CubesData from "./data/cubes_data.txt?raw";

import { VertexBufferLayout } from "@core";

export const Scene = (world: World) => {
  const { geometry, factory } = world;

  const {
    data: instancesData,
    layout: instanceLayout,
    count: instancesCount,
  } = parseInstanceData(CubesData);
  const [instanceBuffer, instanceBufferLayout] = factory.buffers.createVertex({
    label: "cube instances",
    data: instancesData,
    layout: instanceLayout,
    writeAtCreation: true,
  });

  const geo = geometry.CUBE();

  return {
    vertexBufferLayouts: [geo.layout, instanceBufferLayout],
    render: (pass: GPURenderPassEncoder) => {
      // render
      pass.setVertexBuffer(0, geo.buffer);
      pass.setVertexBuffer(1, instanceBuffer);
      pass.setIndexBuffer(geo.indexBuffer!, "uint16");

      pass.drawIndexed(geo.indexCount!, instancesCount);
    },
  };
};

function parseInstanceData(modelData: string) {
  const rawInstanceDataList = modelData.split("\n");

  const instancesRawData = rawInstanceDataList.map((instanceData) =>
    instanceData.split(" ").map(Number).flat(1)
  );
  const instancesData = new Float32Array(instancesRawData.flat());

  const instanceBufferLayout: VertexBufferLayout = {
    beginLocationAt: 3,
    step: "instance",
    attributes: [
      {
        label: "position",
        format: "float32x3",
      },
      {
        label: "rotation",
        format: "float32x3",
      },
      {
        label: "scale",
        format: "float32x3",
      },
      {
        label: "color",
        format: "float32x4",
      },
    ],
  };

  return {
    data: instancesData,
    layout: instanceBufferLayout,
    count: instancesData.length / (3 + 3 + 3 + 4),
  };
}
