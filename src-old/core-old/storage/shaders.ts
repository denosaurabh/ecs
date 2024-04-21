import { nanoid } from "nanoid";
import { StorageRef } from "./types";

type ShaderCode = {
  label?: string;

  code: string;

  vertexFn: string;
  fragFn: string;
};

export const ShadersManager = "SHADERS" as const;
type Ref = StorageRef<typeof ShadersManager>;
export class ShaderManager {
  shaders: Map<string, ShaderCode> = new Map();

  constructor() {}

  add(shader: ShaderCode): Ref {
    const name = nanoid(7);
    this.shaders.set(name, shader);

    return this.ref(name);
  }

  get(ref: Ref): ShaderCode {
    const shader = this.shaders.get(ref.id);
    if (!shader) {
      throw new Error(`Shader with name ${name} does not exist`);
    }

    return shader;
  }

  // device
  createShaderModule(ref: Ref, device: GPUDevice): GPUShaderModule {
    const shader = this.get(ref);
    return device.createShaderModule({
      label: shader.label,
      code: shader.code,
    });
  }

  // internal
  private ref(name: string): Ref {
    return { __manager: ShadersManager, id: name };
  }
}
