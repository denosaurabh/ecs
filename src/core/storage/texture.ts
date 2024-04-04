import { nanoid } from "nanoid";
import { StorageRef } from "./types";

type TexureProps = {
  size: [number, number];
  usage: /* typeof GPUTextureUsageFlags */ number;

  depthOrArrayLayers?: number;
  format?: GPUTextureFormat;
};

type TextureMapValue = {
  texture: GPUTextureDescriptor;
};

export const TexturesManager = "TEXTURES" as const;
type Ref = StorageRef<typeof TexturesManager>;
export class TextureManager {
  textures: Map<string, TextureMapValue> = new Map();

  constructor() {}

  add(textureProps: TexureProps): Ref {
    const name = nanoid(7);

    const texture = {
      size: {
        width: textureProps.size[0],
        height: textureProps.size[1],
        depthOrArrayLayers: textureProps.depthOrArrayLayers || 1,
      },
      format: textureProps.format || "rgba8unorm",
      usage: textureProps.usage,
    };

    this.textures.set(name, { texture });

    return this.ref(name);
  }

  get(ref: Ref): TextureMapValue {
    const texture = this.textures.get(ref.id);
    if (!texture) {
      throw new Error(`Shader with name ${ref.id} does not exist`);
    }

    return texture;
  }

  // device
  createTexture(ref: Ref, device: GPUDevice): GPUTexture {
    const texture = this.get(ref);
    return device.createTexture(texture.texture);
  }

  // internal
  private ref(name: string): Ref {
    return { __manager: TexturesManager, id: name };
  }
}
