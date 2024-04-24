import { WGPUFactory } from "./factory";

export type Geometry = {
  buffer: GPUBuffer;
  layout: GPUVertexBufferLayout;
  vertexCount: number;

  indexCount?: number;
  indexBuffer?: GPUBuffer;
};

export class GEOMETRY_FACTORY {
  private storage: WGPUFactory;

  constructor(storage: WGPUFactory) {
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

    const [buffer, layout] = this.storage.buffers.createVertex({
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

  public PLANE(): Geometry {
    const verticies = new Float32Array([
      // pos(x,y) uv(u,v)

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

    const [buffer, layout] = this.storage.buffers.createVertex({
      label: "Plane geometry",
      data: verticies,
      writeAtCreation: true,
      layout: {
        attributes: [
          {
            label: "POSITION",
            format: "float32x2",
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

    const [buffer, layout] = this.storage.buffers.createVertex({
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

  public get THREED_POSITION_NORMAL_UV_LAYOUT(): GPUVertexBufferLayout {
    return this.storage.buffers.createVertexLayout({
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
    });
  }

  public CUBE(): Geometry {
    const vertexData = new Float32Array([
      // float3 position, float3 normal, float2 uv
      0.5, 0.5, 0.5, 1, 0, 0, 0, 1, 0.5, 0.5, -0.5, 1, 0, 0, 1, 1, 0.5, -0.5,
      0.5, 1, 0, 0, 0, 0, 0.5, -0.5, -0.5, 1, 0, 0, 1, 0, -0.5, 0.5, -0.5, -1,
      0, 0, 0, 1, -0.5, 0.5, 0.5, -1, 0, 0, 1, 1, -0.5, -0.5, -0.5, -1, 0, 0, 0,
      0, -0.5, -0.5, 0.5, -1, 0, 0, 1, 0, -0.5, 0.5, -0.5, 0, 1, 0, 0, 1, 0.5,
      0.5, -0.5, 0, 1, 0, 1, 1, -0.5, 0.5, 0.5, 0, 1, 0, 0, 0, 0.5, 0.5, 0.5, 0,
      1, 0, 1, 0, -0.5, -0.5, 0.5, 0, -1, 0, 0, 1, 0.5, -0.5, 0.5, 0, -1, 0, 1,
      1, -0.5, -0.5, -0.5, 0, -1, 0, 0, 0, 0.5, -0.5, -0.5, 0, -1, 0, 1, 0,
      -0.5, 0.5, 0.5, 0, 0, 1, 0, 1, 0.5, 0.5, 0.5, 0, 0, 1, 1, 1, -0.5, -0.5,
      0.5, 0, 0, 1, 0, 0, 0.5, -0.5, 0.5, 0, 0, 1, 1, 0, 0.5, 0.5, -0.5, 0, 0,
      -1, 0, 1, -0.5, 0.5, -0.5, 0, 0, -1, 1, 1, 0.5, -0.5, -0.5, 0, 0, -1, 0,
      0, -0.5, -0.5, -0.5, 0, 0, -1, 1, 0,
    ]);

    const vertexCount = 24;

    const index = new Uint16Array([
      0, 2, 1, 2, 3, 1, 4, 6, 5, 6, 7, 5, 8, 10, 9, 10, 11, 9, 12, 14, 13, 14,
      15, 13, 16, 18, 17, 18, 19, 17, 20, 22, 21, 22, 23, 21,
    ]);
    const indexCount = 36;

    const [buffer, layout] = this.storage.buffers.createVertex({
      label: "Cube-Normal-uv geometry",
      data: vertexData,
      writeAtCreation: true,
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
    });

    const indexBuffer = this.storage.buffers.create({
      label: "Cube-Normal-uv index",
      data: index,
      writeAtCreation: true,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    });

    const data = {
      vertexCount,
      buffer,
      layout,
      indexBuffer,
      indexCount,
    };

    return data;
  }
}
