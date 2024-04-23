import { WGPUFactory } from "./factory";

type ParsedDataReturn = {
  name: string;
  vertexCount: number;

  float32Array: Float32Array;
};

export class OBJLoader {
  constructor() {}

  parse(data: string): ParsedDataReturn {
    const lines = data.split("\n");

    const returnData = {
      name: "",
      vertexCount: 0,
    };

    const vertices = [];
    const normals = [];
    const uvs = [];
    const faces: Array<{ v: number; n: number; t: number }> = [];

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
        vertices.push(pos);

        returnData.vertexCount += 1;

        continue;
      }

      // normals
      if (type === "vn") {
        const norms = values.map((v) => parseFloat(v));
        normals.push(norms);

        continue;
      }

      // uvs
      if (type === "vt") {
        const uv = values.map((v) => parseFloat(v));
        uvs.push(uv);

        continue;
      }

      // faces
      if (type === "f") {
        values.map((f) => {
          const [v, t, n] = f.split("/").map((v) => parseInt(v, 10) - 1);
          faces.push({ v, t, n });
        });

        continue;
      }

      console.log({ vertices, normals, uvs, faces });
    }

    // create Float32Array
    const float32Array = new Float32Array(
      faces.length * 3 + faces.length * 3 + faces.length * 2
    );

    let i = 0;
    for (const face of faces) {
      const { v, t, n } = face;

      float32Array.set(vertices[v], i);
      float32Array.set(normals[n], i + 3);
      float32Array.set(uvs[t], i + 6);

      i += 8;
    }

    return {
      name: returnData.name,
      vertexCount: float32Array.length / 8,
      float32Array,
    };
  }

  createBuffer(factory: WGPUFactory, data: ParsedDataReturn) {
    const { name, float32Array } = data;

    const bufferAndLayout = factory.buffers.createVertex({
      label: name,
      layout: {
        attributes: [
          {
            label: "POSITION",
            format: "float32x3",
          },
          {
            label: "NORMAL",
            format: "float32x3",
          },
          {
            label: "UV",
            format: "float32x2",
          },
        ],
      },
      data: float32Array,
      writeAtCreation: true,
    });

    return bufferAndLayout;
  }
}
