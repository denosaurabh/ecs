import { Mesh } from "./components";

type Geometry = Parameters<typeof Mesh>[0]["geometry"];

export abstract class GEOMETRY {
  public static get BOX(): Geometry {
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

    return {
      verticies,
      vertexCount: verticies.length,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
      lengthPerVertex: Float32Array.BYTES_PER_ELEMENT * 6,
      verticiesCount: 0,
      attributes: [
        {
          type: "POSITION",
          offset: 0,
          format: "float32x3",
        },
        {
          type: "NORMAL",
          format: "float32x3",
          offset: 3,
        },
      ],
    };
  }

  public static get CUBE(): Geometry {
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

    const cubeVertexSize = 4 * 10; // Byte size of one cube vertex.
    const cubePositionOffset = 0;
    // const cubeColorOffset = 4 * 4; // Byte offset of cube vertex color attribute.
    const cubeUVOffset = 4 * 8;
    const cubeVertexCount = 36;

    return {
      verticies,
      vertexCount: verticies.byteLength,

      usage: GPUBufferUsage.VERTEX,

      lengthPerVertex: cubeVertexSize,
      verticiesCount: cubeVertexCount,

      attributes: [
        {
          type: "POSITION",
          format: "float32x4",
          offset: cubePositionOffset,
        },
        {
          type: "UV",
          format: "float32x2",
          offset: cubeUVOffset,
        },
      ],
    };
  }
}

/*


import { Mesh } from "./components";

type Geometry = Parameters<typeof Mesh>[0]["geometry"];

export abstract class GEOMETRY {
  public static BOX(length: number, width: number, height: number): Geometry {
    const halfLength = length / 2;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const topFaceData = () => {
      const topFaceNormal = [0, 0, 1];
      const topFaceData = [
        [+halfLength, +halfWidth, +halfHeight, ...topFaceNormal],
        [-halfLength, +halfWidth, +halfHeight, ...topFaceNormal],
        [-halfLength, -halfWidth, +halfHeight, ...topFaceNormal],
        [-halfLength, -halfWidth, +halfHeight, ...topFaceNormal],
        [+halfLength, -halfWidth, +halfHeight, ...topFaceNormal],
        [+halfLength, +halfWidth, +halfHeight, ...topFaceNormal],
      ];
      return topFaceData.flat();
    };

    const bottomFaceData = () => {
      const bottomFaceNormal = [0, 0, -1];
      const bottomFaceData = [
        [+halfLength, -halfWidth, -halfHeight, ...bottomFaceNormal],
        [-halfLength, -halfWidth, -halfHeight, ...bottomFaceNormal],
        [-halfLength, +halfWidth, -halfHeight, ...bottomFaceNormal],
        [+halfLength, +halfWidth, -halfHeight, ...bottomFaceNormal],
        [+halfLength, -halfWidth, -halfHeight, ...bottomFaceNormal],
        [-halfLength, +halfWidth, -halfHeight, ...bottomFaceNormal],
      ];
      return bottomFaceData.flat();
    };

    const frontFaceData = () => {
      const frontFaceNormal = [0, -1, 0];
      const frontFaceData = [
        [+halfLength, -halfWidth, +halfHeight, ...frontFaceNormal],
        [-halfLength, -halfWidth, +halfHeight, ...frontFaceNormal],
        [-halfLength, -halfWidth, -halfHeight, ...frontFaceNormal],
        [+halfLength, -halfWidth, -halfHeight, ...frontFaceNormal],
        [+halfLength, -halfWidth, +halfHeight, ...frontFaceNormal],
        [-halfLength, -halfWidth, -halfHeight, ...frontFaceNormal],
      ];
      return frontFaceData.flat();
    };

    const backFaceData = () => {
      const backFaceNormal = [0, 1, 0];
      const backFaceData = [
        [-halfLength, +halfWidth, +halfHeight, ...backFaceNormal],
        [+halfLength, +halfWidth, +halfHeight, ...backFaceNormal],
        [+halfLength, +halfWidth, -halfHeight, ...backFaceNormal],
        [-halfLength, +halfWidth, -halfHeight, ...backFaceNormal],
        [-halfLength, +halfWidth, +halfHeight, ...backFaceNormal],
        [+halfLength, +halfWidth, -halfHeight, ...backFaceNormal],
      ];
      return backFaceData.flat();
    };

    const leftFaceData = () => {
      const leftFaceNormal = [-1, 0, 0];
      const leftFaceData = [
        [-halfLength, -halfWidth, +halfHeight, ...leftFaceNormal],
        [-halfLength, +halfWidth, +halfHeight, ...leftFaceNormal],
        [-halfLength, +halfWidth, -halfHeight, ...leftFaceNormal],
        [-halfLength, -halfWidth, -halfHeight, ...leftFaceNormal],
        [-halfLength, -halfWidth, +halfHeight, ...leftFaceNormal],
        [-halfLength, +halfWidth, -halfHeight, ...leftFaceNormal],
      ];
      return leftFaceData.flat();
    };

    const rightFaceData = () => {
      const rightFaceNormal = [1, 0, 0];
      const rightFaceData = [
        [+halfLength, +halfWidth, +halfHeight, ...rightFaceNormal],
        [+halfLength, -halfWidth, +halfHeight, ...rightFaceNormal],
        [+halfLength, -halfWidth, -halfHeight, ...rightFaceNormal],
        [+halfLength, +halfWidth, -halfHeight, ...rightFaceNormal],
        [+halfLength, +halfWidth, +halfHeight, ...rightFaceNormal],
        [+halfLength, -halfWidth, -halfHeight, ...rightFaceNormal],
      ];
      return rightFaceData.flat();
    };

    const vertices = new Float32Array(
      [
        frontFaceData(),
        rightFaceData(),
        backFaceData(),
        leftFaceData(),
        topFaceData(),
        bottomFaceData(),
      ].flat()
    );

    return {
      vertices,
      vertexCount: vertices.length / 6, // Each vertex has 3 position components and 3 normal components
      attributes: [
        {
          type: "POSITION",
          length: 3,
        },
        {
          type: "NORMAL",
          length: 3,
        },
      ],
    };
  }
}



*/
