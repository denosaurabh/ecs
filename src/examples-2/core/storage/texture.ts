type CreateTexureProps = {
  size: [number, number];

  /**
   * use {@link GPUTextureUsageFlags}
   */
  usage: /* typeof GPUTextureUsageFlags */ number;

  /**
   * default - `1`
   */
  depthOrArrayLayers?: number;

  /**
   * default - `rgba8unorm`
   */
  format?: GPUTextureFormat;
};

export class TextureManager {
  constructor(private device: GPUDevice) {}

  create(textureProps: CreateTexureProps): GPUTexture {
    const textureDescriptor = {
      size: {
        width: textureProps.size[0],
        height: textureProps.size[1],
        depthOrArrayLayers: textureProps.depthOrArrayLayers || 1,
      },
      format: textureProps.format || "rgba8unorm",
      usage: textureProps.usage,
    };

    const gpuTexture = this.device.createTexture(textureDescriptor);

    return gpuTexture;
  }
}
