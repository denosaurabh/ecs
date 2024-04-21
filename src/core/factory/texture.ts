type CreateTexureProps = {
  size: { width: number; height: number };

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

  sampleCount?: number;
};

export class TextureManager {
  constructor(private device: GPUDevice) {}

  createTexture(textureProps: CreateTexureProps): GPUTexture {
    const textureDescriptor: GPUTextureDescriptor = {
      size: {
        width: textureProps.size.width,
        height: textureProps.size.height,
        depthOrArrayLayers: textureProps.depthOrArrayLayers || 1,
      },
      format: textureProps.format || "rgba8unorm",
      usage: textureProps.usage,
      sampleCount: textureProps.sampleCount,
    };

    const gpuTexture = this.device.createTexture(textureDescriptor);

    return gpuTexture;
  }

  createSampler(samplerProps: GPUSamplerDescriptor): GPUSampler {
    return this.device.createSampler(samplerProps);
  }
}
