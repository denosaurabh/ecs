import SolidColorShader from "../../shaders/materials/solid_color.wgsl?raw";
import {
  ShadersManager,
  StorageManager,
  StorageRef,
} from "src/core-old/storage";

type RGB = { r: number; g: number; b: number };

type MaterialReturn = {
  materialRef: StorageRef<typeof ShadersManager>;
};

export abstract class MATERIAL {
  public static SOLID_COLOR(storage: StorageManager): MaterialReturn {
    return {
      materialRef: storage.shaders.add({
        code: SolidColorShader,
        fragFn: "fragMain",
        vertexFn: "vertexMain",
      }),
    };
  }
}
