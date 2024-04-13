import { StorageManager } from "./storage";

export type Geometry = {
  buffer: GPUBuffer;
  layout: GPUVertexBufferLayout;

  vertexCount: number;
};

export class GEOMETRY_FACTORY {
  storage: StorageManager;

  constructor(storage: StorageManager) {
    this.storage = storage;
  }

  public TRIANGE(options?: {
    offset?: number;
    color?: [number, number, number];
  }): Geometry {
    const color = options?.color || [1.0, 0.0, 0.0];

    const verticies = new Float32Array([
      // position - x, y
      0.0 + (options?.offset || 0),
      0.5 + (options?.offset || 0),
      ...color,
      -0.5 + (options?.offset || 0),
      -0.5 + (options?.offset || 0),
      ...color,
      0.5 + (options?.offset || 0),
      -0.5 + (options?.offset || 0),
      ...color,
    ]);

    const vertexCount = 3;

    const [buffer, layout] = this.storage.vertexBuffers.create({
      label: "Triangle geometry",
      data: verticies,
      writeAtCreation: true,
      layout: {
        attributes: [
          {
            label: "POSITION",
            format: "float32x2",
          },
          {
            label: "COLOR",
            format: "float32x3",
          },
        ],
      },
    });

    const data = {
      vertexCount,
      buffer,
      layout,
    };

    return data;
  }

  public POSTPROCESS_QUAD(): Geometry {
    const verticies = new Float32Array([
      // pos(x,y) tex(u,v)

      // first triangle
      // top left
      -1.0, 1.0, 0.0, 0.0,
      // top right
      1.0, 1.0, 1.0, 0.0,
      // bottom left
      -1.0, -1.0, 0.0, 1.0,

      // second triangle
      // bottom left
      -1.0, -1.0, 0.0, 1.0,
      // top right
      1.0, 1.0, 1.0, 0.0,
      // bottom right
      1.0, -1.0, 1.0, 1.0,
    ]);

    const vertexCount = 6;

    const [buffer, layout] = this.storage.vertexBuffers.create({
      label: "Postprocess Quad geometry",
      data: verticies,
      writeAtCreation: true,
      layout: {
        attributes: [
          {
            label: "POSITION",
            format: "float32x2",
          },
          {
            label: "TEX_COORDS",
            format: "float32x2",
          },
        ],
      },
    });

    const data = {
      vertexCount,
      buffer,
      layout,
    };

    return data;
  }

  public CUBE(): Geometry {
    const verticies = new Float32Array([
      // float4 position, float4 color, float2 uv,
      1, -1, 1, 1, 1, 0, 1, 1, 0, 1, -1, -1, 1, 1, 0, 0, 1, 1, 1, 1, -1, -1, -1,
      1, 0, 0, 0, 1, 1, 0, 1, -1, -1, 1, 1, 0, 0, 1, 0, 0, 1, -1, 1, 1, 1, 0, 1,
      1, 0, 1, -1, -1, -1, 1, 0, 0, 0, 1, 1, 0,

      1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, -1, 1, 1, 1, 0, 1, 1, 1, 1, 1, -1, -1, 1,
      1, 0, 0, 1, 1, 0, 1, 1, -1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1,
      0, 1, 1, -1, -1, 1, 1, 0, 0, 1, 1, 0,

      -1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, -1, 1,
      1, 1, 0, 1, 1, 0, -1, 1, -1, 1, 0, 1, 0, 1, 0, 0, -1, 1, 1, 1, 0, 1, 1, 1,
      0, 1, 1, 1, -1, 1, 1, 1, 0, 1, 1, 0,

      -1, -1, 1, 1, 0, 0, 1, 1, 0, 1, -1, 1, 1, 1, 0, 1, 1, 1, 1, 1, -1, 1, -1,
      1, 0, 1, 0, 1, 1, 0, -1, -1, -1, 1, 0, 0, 0, 1, 0, 0, -1, -1, 1, 1, 0, 0,
      1, 1, 0, 1, -1, 1, -1, 1, 0, 1, 0, 1, 1, 0,

      1, 1, 1, 1, 1, 1, 1, 1, 0, 1, -1, 1, 1, 1, 0, 1, 1, 1, 1, 1, -1, -1, 1, 1,
      0, 0, 1, 1, 1, 0, -1, -1, 1, 1, 0, 0, 1, 1, 1, 0, 1, -1, 1, 1, 1, 0, 1, 1,
      0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1,

      1, -1, -1, 1, 1, 0, 0, 1, 0, 1, -1, -1, -1, 1, 0, 0, 0, 1, 1, 1, -1, 1,
      -1, 1, 0, 1, 0, 1, 1, 0, 1, 1, -1, 1, 1, 1, 0, 1, 0, 0, 1, -1, -1, 1, 1,
      0, 0, 1, 0, 1, -1, 1, -1, 1, 0, 1, 0, 1, 1, 0,
    ]);

    const vertexCount = 36;

    const [buffer, layout] = this.storage.vertexBuffers.create({
      label: "Cube geometry",
      data: verticies,
      writeAtCreation: true,
      layout: {
        attributes: [
          {
            label: "POSITION",
            format: "float32x4",
          },
          {
            label: "COLOR",
            format: "float32x4",
          },
          {
            label: "UV",
            format: "float32x2",
          },
        ],
      },
    });

    const data = {
      vertexCount,
      buffer,
      layout,
    };

    return data;
  }
}
