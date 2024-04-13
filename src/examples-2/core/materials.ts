import SimpleShader from "../../shaders/materials/simple.wgsl?raw";
import UniformColorShader from "../../shaders/materials/uniform_color.wgsl?raw";
import NormalColorShader from "../../shaders/materials/normal_color.wgsl?raw";
import SimplePostProcess from "../../shaders/materials/simple_postprocess.wgsl?raw";

import { StorageManager } from "./storage";
import { CreateShaderReturn } from "./storage/shaders";

export type Material = CreateShaderReturn;

export class MATERIAL_FACTORY {
  storage: StorageManager;

  constructor(storage: StorageManager) {
    this.storage = storage;
  }

  public get SIMPLE(): Material {
    return this.storage.shaders.create({
      code: SimpleShader,
      frag: "fragMain",
      vertex: "vertexMain",
    });
  }

  public get UNIFORM_COLOR(): Material {
    return this.storage.shaders.create({
      code: UniformColorShader,
      frag: "fragMain",
      vertex: "vertexMain",
    });
  }

  public get NORMAL_COLOR(): Material {
    return this.storage.shaders.create({
      code: NormalColorShader,
      frag: "fragMain",
      vertex: "vertexMain",
    });
  }

  public get SIMPLE_POSTPROCESS(): Material {
    return this.storage.shaders.create({
      code: SimplePostProcess,
      frag: "fragmentMain",
      vertex: "vertexMain",
    });
  }
}
