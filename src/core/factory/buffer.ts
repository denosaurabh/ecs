export type BufferStorageDescriptor = {
  label?: string;

  size?: number;
  usage: GPUBufferUsageFlags;

  writeAtCreation?: boolean;

  data?: Float32Array | Uint16Array;
};

type VertexBufferLayout = {
  step?: GPUVertexStepMode;
  beginLocationAt?: number;

  attributes: Array<{
    label?: string;
    format: GPUVertexFormat;
  }>;
};

export type AddVertexBuffer = Omit<BufferStorageDescriptor, "usage"> & {
  layout: VertexBufferLayout;
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

  createVertex(props: AddVertexBuffer): [GPUBuffer, GPUVertexBufferLayout] {
    const { label, size: desSize, data, writeAtCreation, layout } = props;

    const size = Number(data?.byteLength || desSize);

    if (!size) {
      console.warn(
        "Buffer size is 0. either pass `data` or define `size` manually"
      );
    }

    const buffer = this.create({
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      writeAtCreation,
      data,
      label,
      size,
    });

    // layout
    const bufferLayout = {
      stepMode: layout.step || "vertex",
      arrayStride: layout.attributes.reduce((prev, a) => {
        return prev + this.vertexFormatByteLength(a.format);
      }, 0),

      attributes: layout.attributes.map((attribute, i) => {
        return {
          format: attribute.format,
          offset: layout.attributes.slice(0, i).reduce((prev, a) => {
            return prev + this.vertexFormatByteLength(a.format);
          }, 0),
          shaderLocation: i + (layout.beginLocationAt || 0),
        };
      }),
    };

    return [buffer, bufferLayout];
  }

  write(buffer: GPUBuffer, data: Float32Array, offset: number = 0) {
    this.device.queue.writeBuffer(buffer, offset, data);
  }

  getBindingResource(buffer: GPUBuffer, offset: number = 0): GPUBufferBinding {
    return { size: buffer.size, buffer, offset };
  }

  // internal
  private vertexFormatByteLength = (format: GPUVertexFormat): number => {
    switch (format) {
      case "float32":
        return Float32Array.BYTES_PER_ELEMENT;
      case "float32x2":
        return Float32Array.BYTES_PER_ELEMENT * 2;
      case "float32x3":
        return Float32Array.BYTES_PER_ELEMENT * 3;
      case "float32x4":
        return Float32Array.BYTES_PER_ELEMENT * 4;
      case "uint32":
        return 4;
      case "sint32":
        return 4;
      default:
        throw new Error(`Unsupported format ${format}`);
    }
  };
}
