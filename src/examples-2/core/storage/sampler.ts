export class SamplerManager {
  constructor(private device: GPUDevice) {}

  create(samplerProps: GPUSamplerDescriptor): GPUSampler {
    return this.device.createSampler(samplerProps);
  }
}
