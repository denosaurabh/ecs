import { WGPUFactory } from "@core";
import LeafPositionsOBJ from "./models/points.obj?raw";

type InstancesBufferLoaderParseReturn = {
  name: string;
  instanceCount: number;
  float32Array: Float32Array;
};

export class InstancesBufferLoader {
  constructor() {}

  load(model: string, factory: WGPUFactory, beginLocationAt: number) {
    const data = this.parse(model);
    const [buffer, layout] = this.createBuffer(
      factory,
      this.parse(model),
      beginLocationAt
    );

    return {
      name: data.name,
      instanceCount: data.instanceCount,
      instanceBuffer: buffer,
      instanceBufferLayout: layout,
    };
  }

  parse(data: string): InstancesBufferLoaderParseReturn {
    const lines = data.split("\n");

    const returnData = {
      name: "",
      vertexCount: 0,
    };

    const vertices = [];

    for (const line of lines) {
      // empty line
      if (!line.trim()) {
        continue;
      }

      const [type, ...values] = line.trim().split(" ");

      if (!type || !values) {
        continue;
      }

      // comment
      if (type === "#") {
        continue;
      }

      // name
      if (type === "o") {
        returnData.name = values[0];
        continue;
      }

      // vertices
      if (type === "v") {
        const pos = values.map((v) => parseFloat(v));
        vertices.push(...pos);

        returnData.vertexCount += 1;

        continue;
      }
    }

    // create Float32Array
    const float32Array = new Float32Array(vertices);

    return {
      name: returnData.name,
      instanceCount: float32Array.length / 3,
      float32Array,
    };
  }

  createBuffer(
    factory: WGPUFactory,
    data: InstancesBufferLoaderParseReturn,
    beginLocationAt: number
  ) {
    const { name, float32Array } = data;

    const bufferAndLayout = factory.buffers.createVertex({
      label: name,
      layout: {
        beginLocationAt,
        step: "instance",
        attributes: [
          {
            label: "POSITION",
            format: "float32x3",
          },
        ],
      },
      data: float32Array,
      writeAtCreation: true,
    });

    return bufferAndLayout;
  }
}

export const getLeafPositionsFloat32Array = () => {
  const leafPositions = LeafPositionsOBJ.split(",").map(parseFloat);
  return new Float32Array(leafPositions);
};

// export const LeafsInstancesData = new Float32Array([
//   // position - x, y, z | scale
//   10, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, -0.1, 0.0, 0.0, 1.0, -0.2, 0.0, 0.0,
//   1.0, -0.3, 0.0, 0.0, 1.0, -0.4, 0.0, 0.0, 1.0, -0.5, 0.0, 0.0, 1.0, -0.6, 0.0,
//   0.0, 1.0, -0.7, 0.0, 0.0, 1.0, -0.8, 0.0, 0.0, 1.0, -0.9, 0.0, 0.0, 1.0, -1.0,
//   0.0, 0.0, 1.0, 0.2, 0.0, 0.0, 1.0, 0.3, 0.0, 0.0, 1.0, 0.4, 0.0, 0.0, 1.0,
//   0.5, 0.0, 0.0, 1.0, 0.6, 0.0, 0.0, 1.0, 0.7, 0.0, 0.0, 1.0, 0.8, 0.0, 0.0,
//   1.0, 0.9, 0.0, 0.0, 1.0,
// ]);

/*


0.1, 0.0, 0.0, 1.0,
0.0, 0.0, 0.0, 1.0,
-0.1, 0.0, 0.0, 1.0,
-0.2, 0.0, 0.0, 1.0,
-0.3, 0.0, 0.0, 1.0,
-0.4, 0.0, 0.0, 1.0,
-0.5, 0.0, 0.0, 1.0,
-0.6, 0.0, 0.0, 1.0,
-0.7, 0.0, 0.0, 1.0,
-0.8, 0.0, 0.0, 1.0,
-0.9, 0.0, 0.0, 1.0,
-1.0, 0.0, 0.0, 1.0,
0.2 , 0.0, 0.0, 1.0,
0.3 , 0.0, 0.0, 1.0,
0.4 , 0.0, 0.0, 1.0,
0.5 , 0.0, 0.0, 1.0,
0.6 , 0.0, 0.0, 1.0,
0.7 , 0.0, 0.0, 1.0,
0.8 , 0.0, 0.0, 1.0,
0.9, 0.0, 0.0, 1.0


*/
