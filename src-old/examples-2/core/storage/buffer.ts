export type BufferStorageDescriptor = {
  label?: string;

  size?: number;
  usage: GPUBufferUsageFlags;

  writeAtCreation?: boolean;

  data?: Float32Array | Uint16Array;
};

export class BufferManager {
  constructor(private device: GPUDevice) {}

  create(descriptor: BufferStorageDescriptor): GPUBuffer {
    const size = Number(descriptor.data?.byteLength || descriptor.size);

    if (!size) {
      console.warn("Buffer size is 0");
    }

    const buffer = this.device.createBuffer({
      label: descriptor.label,
      size,
      usage: descriptor.usage,
      mappedAtCreation: descriptor.writeAtCreation,
    });

    if (descriptor.writeAtCreation && descriptor.data) {
      const mappedRange = buffer.getMappedRange();

      let dataArray: Float32Array | Uint16Array;

      switch (descriptor.data?.constructor) {
        case Float32Array:
          dataArray = new Float32Array(mappedRange);
          dataArray.set(descriptor.data);

          break;
        case Uint16Array:
          dataArray = new Uint16Array(mappedRange);
          dataArray.set(descriptor.data);

          break;
        default:
          console.error("unsupported buffer type");
          break;
      }

      buffer.unmap();
    }

    return buffer;
  }

  createUniform(data: Float32Array, label?: string) {
    return this.create({
      label,
      data,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      writeAtCreation: true,
    });
  }

  write(buffer: GPUBuffer, data: Float32Array, offset: number = 0) {
    this.device.queue.writeBuffer(buffer, offset, data);
  }

  getBindingResource(buffer: GPUBuffer, offset: number = 0): GPUBufferBinding {
    return { size: buffer.size, buffer, offset };
  }
}
