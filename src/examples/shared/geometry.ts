import { StorageManager, VertexBuffersManager, StorageRef } from "./storage";

type GeometryReturn = {
  vertexCount: number;
  data: Float32Array;
  geometryRef: StorageRef<typeof VertexBuffersManager>;
};

export abstract class GEOMETRY {
  public static TRIANGE(
    storage: StorageManager,
    options?: { offset?: number; color?: [number, number, number] }
  ): GeometryReturn {
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

    return {
      vertexCount,
      data: verticies,
      geometryRef: storage.vertexBuffers.add({
        descriptor: {
          label: "TRIANGLE geometry",
          size: verticies.byteLength,
        },
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
      }),
    };
  }

  public static POSTPROCESS_QUAD(storage: StorageManager): GeometryReturn {
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

    return {
      vertexCount,
      data: verticies,
      geometryRef: storage.vertexBuffers.add({
        descriptor: {
          label: "POSTPROCESS_QUAD geometry",
          size: verticies.byteLength,
        },
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
      }),
    };
  }

  public static CUBE(storage: StorageManager): GeometryReturn {
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

    return {
      vertexCount,
      data: verticies,
      geometryRef: storage.vertexBuffers.add({
        descriptor: {
          label: "BOX geometry",
          size: verticies.byteLength,
        },
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
      }),
    };
  }
}
