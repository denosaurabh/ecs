import { nanoid } from "nanoid";
import { StorageRef } from "./types";

type VertexBufferDescriptor = {
  label?: string;

  size: number;
  mappedAtCreation?: boolean;
};

type VertexBufferLayout = {
  step?: GPUVertexStepMode;
  beginLocationAt?: number;

  attributes: Array<{
    label?: string;
    format: GPUVertexFormat;
  }>;
};

type VertexBufferMapValue = {
  descriptor: GPUBufferDescriptor;
  layout: GPUVertexBufferLayout;

  buffer?: GPUBuffer;
};

export type AddVertexBuffer = {
  descriptor: VertexBufferDescriptor;
  layout: VertexBufferLayout;
};

export const VertexBuffersManager = "VERTEX_BUFFERS" as const;
type Ref = StorageRef<typeof VertexBuffersManager>;
export class VertexBufferManager {
  private vertex: Map<string, VertexBufferMapValue> = new Map();

  add(val: AddVertexBuffer): Ref {
    const id = nanoid(7);

    const { descriptor, layout } = val;

    this.vertex.set(id, {
      descriptor: {
        label: descriptor.label,
        size: descriptor.size,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: descriptor.mappedAtCreation,
      },
      layout: {
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
      },
    });

    return this.ref(id);
  }

  getLayout(ref: Ref): GPUVertexBufferLayout {
    const value = this.vertex.get(ref.id);
    if (!value) {
      throw new Error(`Vertex with ref ${ref.id} does not exist`);
    }

    return value.layout;
  }

  getBuffer(ref: Ref): GPUBuffer {
    const value = this.vertex.get(ref.id);
    if (!value) {
      throw new Error(`Vertex with ref ${ref.id} does not exist`);
    }

    if (!value.buffer) {
      throw new Error(`Buffer with ref ${ref.id} does not exist`);
    }

    return value.buffer;
  }

  createBuffer(ref: Ref, device: GPUDevice): GPUBuffer {
    const val = this.vertex.get(ref.id);
    if (!val) {
      throw new Error(`Vertex with ref ${ref.id} does not exist`);
    }

    if (val.buffer) {
      return val.buffer;
    }

    const buffer = device.createBuffer(val.descriptor);
    this.vertex.set(ref.id, { ...val, buffer });

    return buffer;
  }

  write(ref: Ref, data: Float32Array, device: GPUDevice) {
    const value = this.vertex.get(ref.id);
    if (!value) {
      throw new Error(`Vertex with ref ${ref.id} does not exist`);
    }

    if (!value.buffer) {
      return device.queue.writeBuffer(this.createBuffer(ref, device), 0, data);
    }

    device.queue.writeBuffer(value.buffer, 0, data);
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

  private ref(name: string): Ref {
    return { __manager: VertexBuffersManager, id: name };
  }
}
