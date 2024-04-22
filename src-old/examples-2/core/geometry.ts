import { StorageManager } from "./storage";
import { VertexBufferLayout } from "./storage/vertexbuffer";

export type Geometry = {
  buffer: GPUBuffer;
  layout: GPUVertexBufferLayout;
  vertexCount: number;

  indexCount?: number;
  indexBuffer?: GPUBuffer;
};

export class GEOMETRY_FACTORY {
  private storage: StorageManager;

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

  public GRASS_BLADE(): Geometry {
    const verticies = new Float32Array([
      // position - x, y
      0.0, 1.0, 1.0, 0.0, /* */ -1.0, -1.0, 0.0, 1.0, /* */ 1.0, -1.0, 1.0, 1.0,
    ]);

    const vertexCount = 3;

    const [buffer, layout] = this.storage.vertexBuffers.create({
      label: "Grass Blade geometry",
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

    const [buffer, layout] = this.storage.vertexBuffers.create({
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

  public get THREED_POSITION_NORMAL_LAYOUT(): VertexBufferLayout {
    return {
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
    };
  }

  public CUBE_WITH_NORMAL(): Geometry {
    const topFaceData = () => {
      const topFaceNormal = [0, 0, 1];
      const topFaceData = [
        [+1, +1, +1],
        [topFaceNormal],
        [-1, +1, +1],
        [topFaceNormal],
        [-1, -1, +1],
        [topFaceNormal],
        [-1, -1, +1],
        [topFaceNormal],
        [+1, -1, +1],
        [topFaceNormal],
        [+1, +1, +1],
        [topFaceNormal],
      ];
      return topFaceData.flat().flat();
    };

    const bottomFaceData = () => {
      const bottomFaceNormal = [0, 0, -1];
      const bottomFaceData = [
        [+1, -1, -1],
        [bottomFaceNormal],
        [-1, -1, -1],
        [bottomFaceNormal],
        [-1, +1, -1],
        [bottomFaceNormal],
        [+1, +1, -1],
        [bottomFaceNormal],
        [+1, -1, -1],
        [bottomFaceNormal],
        [-1, +1, -1],
        [bottomFaceNormal],
      ];
      return bottomFaceData.flat().flat();
    };

    const frontFaceData = () => {
      const frontFaceNormal = [0, -1, 0];
      const frontFaceData = [
        [+1, -1, +1],
        [frontFaceNormal],
        [-1, -1, +1],
        [frontFaceNormal],
        [-1, -1, -1],
        [frontFaceNormal],
        [+1, -1, -1],
        [frontFaceNormal],
        [+1, -1, +1],
        [frontFaceNormal],
        [-1, -1, -1],
        [frontFaceNormal],
      ];
      return frontFaceData.flat().flat();
    };

    const backFaceData = () => {
      const backFaceNormal = [0, 1, 0];
      const backFaceData = [
        [-1, +1, +1],
        [backFaceNormal],
        [+1, +1, +1],
        [backFaceNormal],
        [+1, +1, -1],
        [backFaceNormal],
        [-1, +1, -1],
        [backFaceNormal],
        [-1, +1, +1],
        [backFaceNormal],
        [+1, +1, -1],
        [backFaceNormal],
      ];
      return backFaceData.flat().flat();
    };

    const leftFaceData = () => {
      const leftFaceNormal = [-1, 0, 0];
      const leftFaceData = [
        [-1, -1, +1],
        [leftFaceNormal],
        [-1, +1, +1],
        [leftFaceNormal],
        [-1, +1, -1],
        [leftFaceNormal],
        [-1, -1, -1],
        [leftFaceNormal],
        [-1, -1, +1],
        [leftFaceNormal],
        [-1, +1, -1],
        [leftFaceNormal],
      ];
      return leftFaceData.flat().flat();
    };

    const rightFaceData = () => {
      const rightFaceNormal = [1, 0, 0];
      const rightFaceData = [
        [+1, +1, +1],
        [rightFaceNormal],
        [+1, -1, +1],
        [rightFaceNormal],
        [+1, -1, -1],
        [rightFaceNormal],
        [+1, +1, -1],
        [rightFaceNormal],
        [+1, +1, +1],
        [rightFaceNormal],
        [+1, -1, -1],
        [rightFaceNormal],
      ];
      return rightFaceData.flat().flat();
    };

    const verticies = new Float32Array(
      [
        frontFaceData(),
        rightFaceData(),
        backFaceData(),
        leftFaceData(),
        topFaceData(),
        bottomFaceData(),
      ].flat()
    );

    const vertexCount = 36;

    const [buffer, layout] = this.storage.vertexBuffers.create({
      label: "Cube-Normal geometry",
      data: verticies,
      writeAtCreation: true,
      layout: this.THREED_POSITION_NORMAL_LAYOUT,
    });

    const data = {
      vertexCount,
      buffer,
      layout,
    };

    return data;
  }

  public CUBE_WITH_NORMAL_AND_UV(): Geometry {
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

    const [buffer, layout] = this.storage.vertexBuffers.create({
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

  public SPHERE(): Geometry {
    const vertex = new Float32Array([
      // float3 position, float3 normal, float2 uv
      0, 1, 0, 0, 1, 0, 0.05, 1, 0, 1, 0, 0, 1, 0, 0.15, 1, 0, 1, 0, 0, 1, 0,
      0.25, 1, 0, 1, 0, 0, 1, 0, 0.35, 1, 0, 1, 0, 0, 1, 0, 0.45, 1, 0, 1, 0, 0,
      1, 0, 0.55, 1, 0, 1, 0, 0, 1, 0, 0.65, 1, 0, 1, 0, 0, 1, 0, 0.75, 1, 0, 1,
      0, 0, 1, 0, 0.85, 1, 0, 1, 0, 0, 1, 0, 0.95, 1, 0, 1, 0, 0, 1, 0, 1.05, 1,
      -0.30902, 0.95106, 0, -0.30902, 0.95106, 0, 0, 0.9, -0.25, 0.95106,
      0.18164, -0.25, 0.95106, 0.18164, 0.1, 0.9, -0.09549, 0.95106, 0.29389,
      -0.09549, 0.95106, 0.29389, 0.2, 0.9, 0.09549, 0.95106, 0.29389, 0.09549,
      0.95106, 0.29389, 0.3, 0.9, 0.25, 0.95106, 0.18164, 0.25, 0.95106,
      0.18164, 0.4, 0.9, 0.30902, 0.95106, 0, 0.30902, 0.95106, 0, 0.5, 0.9,
      0.25, 0.95106, -0.18164, 0.25, 0.95106, -0.18164, 0.6, 0.9, 0.09549,
      0.95106, -0.29389, 0.09549, 0.95106, -0.29389, 0.7, 0.9, -0.09549,
      0.95106, -0.29389, -0.09549, 0.95106, -0.29389, 0.8, 0.9, -0.25, 0.95106,
      -0.18164, -0.25, 0.95106, -0.18164, 0.9, 0.9, -0.30902, 0.95106, 0,
      -0.30902, 0.95106, 0, 1, 0.9, -0.58779, 0.80902, 0, -0.58779, 0.80902, 0,
      0, 0.8, -0.47553, 0.80902, 0.34549, -0.47553, 0.80902, 0.34549, 0.1, 0.8,
      -0.18164, 0.80902, 0.55902, -0.18164, 0.80902, 0.55902, 0.2, 0.8, 0.18164,
      0.80902, 0.55902, 0.18164, 0.80902, 0.55902, 0.3, 0.8, 0.47553, 0.80902,
      0.34549, 0.47553, 0.80902, 0.34549, 0.4, 0.8, 0.58779, 0.80902, 0,
      0.58779, 0.80902, 0, 0.5, 0.8, 0.47553, 0.80902, -0.34549, 0.47553,
      0.80902, -0.34549, 0.6, 0.8, 0.18164, 0.80902, -0.55902, 0.18164, 0.80902,
      -0.55902, 0.7, 0.8, -0.18164, 0.80902, -0.55902, -0.18164, 0.80902,
      -0.55902, 0.8, 0.8, -0.47553, 0.80902, -0.34549, -0.47553, 0.80902,
      -0.34549, 0.9, 0.8, -0.58779, 0.80902, 0, -0.58779, 0.80902, 0, 1, 0.8,
      -0.80902, 0.58779, 0, -0.80902, 0.58779, 0, 0, 0.7, -0.65451, 0.58779,
      0.47553, -0.65451, 0.58779, 0.47553, 0.1, 0.7, -0.25, 0.58779, 0.76942,
      -0.25, 0.58779, 0.76942, 0.2, 0.7, 0.25, 0.58779, 0.76942, 0.25, 0.58779,
      0.76942, 0.3, 0.7, 0.65451, 0.58779, 0.47553, 0.65451, 0.58779, 0.47553,
      0.4, 0.7, 0.80902, 0.58779, 0, 0.80902, 0.58779, 0, 0.5, 0.7, 0.65451,
      0.58779, -0.47553, 0.65451, 0.58779, -0.47553, 0.6, 0.7, 0.25, 0.58779,
      -0.76942, 0.25, 0.58779, -0.76942, 0.7, 0.7, -0.25, 0.58779, -0.76942,
      -0.25, 0.58779, -0.76942, 0.8, 0.7, -0.65451, 0.58779, -0.47553, -0.65451,
      0.58779, -0.47553, 0.9, 0.7, -0.80902, 0.58779, 0, -0.80902, 0.58779, 0,
      1, 0.7, -0.95106, 0.30902, 0, -0.95106, 0.30902, 0, 0, 0.6, -0.76942,
      0.30902, 0.55902, -0.76942, 0.30902, 0.55902, 0.1, 0.6, -0.29389, 0.30902,
      0.90451, -0.29389, 0.30902, 0.90451, 0.2, 0.6, 0.29389, 0.30902, 0.90451,
      0.29389, 0.30902, 0.90451, 0.3, 0.6, 0.76942, 0.30902, 0.55902, 0.76942,
      0.30902, 0.55902, 0.4, 0.6, 0.95106, 0.30902, 0, 0.95106, 0.30902, 0, 0.5,
      0.6, 0.76942, 0.30902, -0.55902, 0.76942, 0.30902, -0.55902, 0.6, 0.6,
      0.29389, 0.30902, -0.90451, 0.29389, 0.30902, -0.90451, 0.7, 0.6,
      -0.29389, 0.30902, -0.90451, -0.29389, 0.30902, -0.90451, 0.8, 0.6,
      -0.76942, 0.30902, -0.55902, -0.76942, 0.30902, -0.55902, 0.9, 0.6,
      -0.95106, 0.30902, 0, -0.95106, 0.30902, 0, 1, 0.6, -1, 0, 0, -1, 0, 0, 0,
      0.5, -0.80902, 0, 0.58779, -0.80902, 0, 0.58779, 0.1, 0.5, -0.30902, 0,
      0.95106, -0.30902, 0, 0.95106, 0.2, 0.5, 0.30902, 0, 0.95106, 0.30902, 0,
      0.95106, 0.3, 0.5, 0.80902, 0, 0.58779, 0.80902, 0, 0.58779, 0.4, 0.5, 1,
      0, 0, 1, 0, 0, 0.5, 0.5, 0.80902, 0, -0.58779, 0.80902, 0, -0.58779, 0.6,
      0.5, 0.30902, 0, -0.95106, 0.30902, 0, -0.95106, 0.7, 0.5, -0.30902, 0,
      -0.95106, -0.30902, 0, -0.95106, 0.8, 0.5, -0.80902, 0, -0.58779,
      -0.80902, 0, -0.58779, 0.9, 0.5, -1, 0, 0, -1, 0, 0, 1, 0.5, -0.95106,
      -0.30902, 0, -0.95106, -0.30902, 0, 0, 0.4, -0.76942, -0.30902, 0.55902,
      -0.76942, -0.30902, 0.55902, 0.1, 0.4, -0.29389, -0.30902, 0.90451,
      -0.29389, -0.30902, 0.90451, 0.2, 0.4, 0.29389, -0.30902, 0.90451,
      0.29389, -0.30902, 0.90451, 0.3, 0.4, 0.76942, -0.30902, 0.55902, 0.76942,
      -0.30902, 0.55902, 0.4, 0.4, 0.95106, -0.30902, 0, 0.95106, -0.30902, 0,
      0.5, 0.4, 0.76942, -0.30902, -0.55902, 0.76942, -0.30902, -0.55902, 0.6,
      0.4, 0.29389, -0.30902, -0.90451, 0.29389, -0.30902, -0.90451, 0.7, 0.4,
      -0.29389, -0.30902, -0.90451, -0.29389, -0.30902, -0.90451, 0.8, 0.4,
      -0.76942, -0.30902, -0.55902, -0.76942, -0.30902, -0.55902, 0.9, 0.4,
      -0.95106, -0.30902, 0, -0.95106, -0.30902, 0, 1, 0.4, -0.80902, -0.58779,
      0, -0.80902, -0.58779, 0, 0, 0.3, -0.65451, -0.58779, 0.47553, -0.65451,
      -0.58779, 0.47553, 0.1, 0.3, -0.25, -0.58779, 0.76942, -0.25, -0.58779,
      0.76942, 0.2, 0.3, 0.25, -0.58779, 0.76942, 0.25, -0.58779, 0.76942, 0.3,
      0.3, 0.65451, -0.58779, 0.47553, 0.65451, -0.58779, 0.47553, 0.4, 0.3,
      0.80902, -0.58779, 0, 0.80902, -0.58779, 0, 0.5, 0.3, 0.65451, -0.58779,
      -0.47553, 0.65451, -0.58779, -0.47553, 0.6, 0.3, 0.25, -0.58779, -0.76942,
      0.25, -0.58779, -0.76942, 0.7, 0.3, -0.25, -0.58779, -0.76942, -0.25,
      -0.58779, -0.76942, 0.8, 0.3, -0.65451, -0.58779, -0.47553, -0.65451,
      -0.58779, -0.47553, 0.9, 0.3, -0.80902, -0.58779, 0, -0.80902, -0.58779,
      0, 1, 0.3, -0.58779, -0.80902, 0, -0.58779, -0.80902, 0, 0, 0.2, -0.47553,
      -0.80902, 0.34549, -0.47553, -0.80902, 0.34549, 0.1, 0.2, -0.18164,
      -0.80902, 0.55902, -0.18164, -0.80902, 0.55902, 0.2, 0.2, 0.18164,
      -0.80902, 0.55902, 0.18164, -0.80902, 0.55902, 0.3, 0.2, 0.47553,
      -0.80902, 0.34549, 0.47553, -0.80902, 0.34549, 0.4, 0.2, 0.58779,
      -0.80902, 0, 0.58779, -0.80902, 0, 0.5, 0.2, 0.47553, -0.80902, -0.34549,
      0.47553, -0.80902, -0.34549, 0.6, 0.2, 0.18164, -0.80902, -0.55902,
      0.18164, -0.80902, -0.55902, 0.7, 0.2, -0.18164, -0.80902, -0.55902,
      -0.18164, -0.80902, -0.55902, 0.8, 0.2, -0.47553, -0.80902, -0.34549,
      -0.47553, -0.80902, -0.34549, 0.9, 0.2, -0.58779, -0.80902, 0, -0.58779,
      -0.80902, 0, 1, 0.2, -0.30902, -0.95106, 0, -0.30902, -0.95106, 0, 0, 0.1,
      -0.25, -0.95106, 0.18164, -0.25, -0.95106, 0.18164, 0.1, 0.1, -0.09549,
      -0.95106, 0.29389, -0.09549, -0.95106, 0.29389, 0.2, 0.1, 0.09549,
      -0.95106, 0.29389, 0.09549, -0.95106, 0.29389, 0.3, 0.1, 0.25, -0.95106,
      0.18164, 0.25, -0.95106, 0.18164, 0.4, 0.1, 0.30902, -0.95106, 0, 0.30902,
      -0.95106, 0, 0.5, 0.1, 0.25, -0.95106, -0.18164, 0.25, -0.95106, -0.18164,
      0.6, 0.1, 0.09549, -0.95106, -0.29389, 0.09549, -0.95106, -0.29389, 0.7,
      0.1, -0.09549, -0.95106, -0.29389, -0.09549, -0.95106, -0.29389, 0.8, 0.1,
      -0.25, -0.95106, -0.18164, -0.25, -0.95106, -0.18164, 0.9, 0.1, -0.30902,
      -0.95106, 0, -0.30902, -0.95106, 0, 1, 0.1, 0, -1, 0, 0, -1, 0, -0.05, 0,
      0, -1, 0, 0, -1, 0, 0.05, 0, 0, -1, 0, 0, -1, 0, 0.15, 0, 0, -1, 0, 0, -1,
      0, 0.25, 0, 0, -1, 0, 0, -1, 0, 0.35, 0, 0, -1, 0, 0, -1, 0, 0.45, 0, 0,
      -1, 0, 0, -1, 0, 0.55, 0, 0, -1, 0, 0, -1, 0, 0.65, 0, 0, -1, 0, 0, -1, 0,
      0.75, 0, 0, -1, 0, 0, -1, 0, 0.85, 0, 0, -1, 0, 0, -1, 0, 0.95, 0,
    ]);

    const index = new Uint16Array([
      0, 11, 12, 1, 12, 13, 2, 13, 14, 3, 14, 15, 4, 15, 16, 5, 16, 17, 6, 17,
      18, 7, 18, 19, 8, 19, 20, 9, 20, 21, 12, 11, 23, 11, 22, 23, 13, 12, 24,
      12, 23, 24, 14, 13, 25, 13, 24, 25, 15, 14, 26, 14, 25, 26, 16, 15, 27,
      15, 26, 27, 17, 16, 28, 16, 27, 28, 18, 17, 29, 17, 28, 29, 19, 18, 30,
      18, 29, 30, 20, 19, 31, 19, 30, 31, 21, 20, 32, 20, 31, 32, 23, 22, 34,
      22, 33, 34, 24, 23, 35, 23, 34, 35, 25, 24, 36, 24, 35, 36, 26, 25, 37,
      25, 36, 37, 27, 26, 38, 26, 37, 38, 28, 27, 39, 27, 38, 39, 29, 28, 40,
      28, 39, 40, 30, 29, 41, 29, 40, 41, 31, 30, 42, 30, 41, 42, 32, 31, 43,
      31, 42, 43, 34, 33, 45, 33, 44, 45, 35, 34, 46, 34, 45, 46, 36, 35, 47,
      35, 46, 47, 37, 36, 48, 36, 47, 48, 38, 37, 49, 37, 48, 49, 39, 38, 50,
      38, 49, 50, 40, 39, 51, 39, 50, 51, 41, 40, 52, 40, 51, 52, 42, 41, 53,
      41, 52, 53, 43, 42, 54, 42, 53, 54, 45, 44, 56, 44, 55, 56, 46, 45, 57,
      45, 56, 57, 47, 46, 58, 46, 57, 58, 48, 47, 59, 47, 58, 59, 49, 48, 60,
      48, 59, 60, 50, 49, 61, 49, 60, 61, 51, 50, 62, 50, 61, 62, 52, 51, 63,
      51, 62, 63, 53, 52, 64, 52, 63, 64, 54, 53, 65, 53, 64, 65, 56, 55, 67,
      55, 66, 67, 57, 56, 68, 56, 67, 68, 58, 57, 69, 57, 68, 69, 59, 58, 70,
      58, 69, 70, 60, 59, 71, 59, 70, 71, 61, 60, 72, 60, 71, 72, 62, 61, 73,
      61, 72, 73, 63, 62, 74, 62, 73, 74, 64, 63, 75, 63, 74, 75, 65, 64, 76,
      64, 75, 76, 67, 66, 78, 66, 77, 78, 68, 67, 79, 67, 78, 79, 69, 68, 80,
      68, 79, 80, 70, 69, 81, 69, 80, 81, 71, 70, 82, 70, 81, 82, 72, 71, 83,
      71, 82, 83, 73, 72, 84, 72, 83, 84, 74, 73, 85, 73, 84, 85, 75, 74, 86,
      74, 85, 86, 76, 75, 87, 75, 86, 87, 78, 77, 89, 77, 88, 89, 79, 78, 90,
      78, 89, 90, 80, 79, 91, 79, 90, 91, 81, 80, 92, 80, 91, 92, 82, 81, 93,
      81, 92, 93, 83, 82, 94, 82, 93, 94, 84, 83, 95, 83, 94, 95, 85, 84, 96,
      84, 95, 96, 86, 85, 97, 85, 96, 97, 87, 86, 98, 86, 97, 98, 89, 88, 100,
      88, 99, 100, 90, 89, 101, 89, 100, 101, 91, 90, 102, 90, 101, 102, 92, 91,
      103, 91, 102, 103, 93, 92, 104, 92, 103, 104, 94, 93, 105, 93, 104, 105,
      95, 94, 106, 94, 105, 106, 96, 95, 107, 95, 106, 107, 97, 96, 108, 96,
      107, 108, 98, 97, 109, 97, 108, 109, 100, 99, 111, 101, 100, 112, 102,
      101, 113, 103, 102, 114, 104, 103, 115, 105, 104, 116, 106, 105, 117, 107,
      106, 118, 108, 107, 119, 109, 108, 120,
    ]);

    const vertexCount = 121;
    const indexCount = 540;

    const [buffer, layout] = this.storage.vertexBuffers.create({
      label: "Sphere geometry",
      data: vertex,
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
      label: "Sphere index",
      data: index,
      writeAtCreation: true,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    });

    return { buffer, vertexCount, indexCount, indexBuffer, layout };
  }
}
