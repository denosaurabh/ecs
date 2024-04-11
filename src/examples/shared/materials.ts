import SimpleShader from "../../shaders/materials/simple.wgsl?raw";
import SolidColorShader from "../../shaders/materials/solid_color.wgsl?raw";

import { ShadersManager, StorageManager, StorageRef } from "./storage";

type MaterialReturn = {
  materialRef: StorageRef<typeof ShadersManager>;
};

export abstract class MATERIAL {
  public static SIMPLE(storage: StorageManager): MaterialReturn {
    return {
      materialRef: storage.shaders.add({
        code: SimpleShader,
        fragFn: "fragMain",
        vertexFn: "vertexMain",
      }),
    };
  }

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
