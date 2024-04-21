import SimpleShader from "../../shaders/materials/simple.wgsl?raw";
import UniformColorShader from "../../shaders/materials/uniform_color.wgsl?raw";
import NormalColorShader from "../../shaders/materials/normal_color.wgsl?raw";
import SimplePostProcess from "../../shaders/materials/simple_postprocess.wgsl?raw";

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

  public static UNIFORM_COLOR(storage: StorageManager): MaterialReturn {
    return {
      materialRef: storage.shaders.add({
        code: UniformColorShader,
        fragFn: "fragMain",
        vertexFn: "vertexMain",
      }),
    };
  }

  public static NORMAL_COLOR(storage: StorageManager): MaterialReturn {
    return {
      materialRef: storage.shaders.add({
        code: NormalColorShader,
        fragFn: "fragMain",
        vertexFn: "vertexMain",
      }),
    };
  }

  public static SIMPLE_POSTPROCESS(storage: StorageManager): MaterialReturn {
    return {
      materialRef: storage.shaders.add({
        code: SimplePostProcess,
        fragFn: "fragmentMain",
        vertexFn: "vertexMain",
      }),
    };
  }
}
