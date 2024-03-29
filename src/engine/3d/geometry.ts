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
