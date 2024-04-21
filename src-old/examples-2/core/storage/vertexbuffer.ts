type VertexBufferLayout = {
  step?: GPUVertexStepMode;
  beginLocationAt?: number;

  attributes: Array<{
    label?: string;
    format: GPUVertexFormat;
  }>;
};

export type AddVertexBuffer = {
  label?: string;

  /**
   * you don't have to define `size` if `data` is provided
   */
  size?: number;

  writeAtCreation?: boolean;

  data?: Float32Array;

  layout: VertexBufferLayout;
};

export class VertexBufferManager {
  constructor(private device: GPUDevice) {}

  create(props: AddVertexBuffer): [GPUBuffer, GPUVertexBufferLayout] {
    const { label, size: desSize, data, writeAtCreation, layout } = props;

    const size = Number(data?.byteLength || desSize);

    if (!size) {
      console.warn(
        "Buffer size is 0. either pass `data` or define `size` manually"
      );
    }

    // buffer
    const buffer = this.device.createBuffer({
      label,
      size,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: writeAtCreation,
    });

    if (writeAtCreation && data) {
      const mappedRange = buffer.getMappedRange();
      const dataArray = new Float32Array(mappedRange);
      dataArray.set(data);
      buffer.unmap();
      // device.queue.writeBuffer(buffer, 0, data);
    }

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
    device.queue.writeBuffer(buffer, offset, data);
  }

  // internal
  private readonly FB = Float32Array.BYTES_PER_ELEMENT;
  private vertexFormatByteLength = (format: GPUVertexFormat): number => {
    switch (format) {
      case "float32":
        return this.FB;
      case "float32x2":
        return this.FB * 2;
      case "float32x3":
        return this.FB * 3;
      case "float32x4":
        return this.FB * 4;
      case "uint32":
        return 4;
      case "sint32":
        return 4;
      default:
        throw new Error(`Unsupported format ${format}`);
    }
  };
}
