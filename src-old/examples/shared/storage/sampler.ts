import { nanoid } from "nanoid";
import { StorageRef } from "./types";

type TextureMapValue = {
  sampler: GPUSamplerDescriptor;
};

export const SamplersManager = "SAMPLERS" as const;
type Ref = StorageRef<typeof SamplersManager>;
export class SamplerManager {
  samplers: Map<string, TextureMapValue> = new Map();

  constructor() {}

  add(samplerProps: GPUSamplerDescriptor): Ref {
    const name = nanoid(7);

    this.samplers.set(name, { sampler: samplerProps });

    return this.ref(name);
  }

  get(ref: Ref): TextureMapValue {
    const texture = this.samplers.get(ref.id);
    if (!texture) {
      throw new Error(`Shader with name ${ref.id} does not exist`);
    }

    return texture;
  }

  // device
  createSampler(ref: Ref, device: GPUDevice): GPUSampler {
    const texture = this.get(ref);
    return device.createSampler(texture.sampler);
  }

  // internal
  private ref(name: string): Ref {
    return { __manager: SamplersManager, id: name };
  }
}
