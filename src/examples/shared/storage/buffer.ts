import { nanoid } from "nanoid";
import { StorageRef } from "./types";

export type BufferStorageDescriptor = {
  label?: string;

  size: number;
  usage: GPUBufferUsageFlags;

  mappedAtCreation?: boolean;
  writeOnCreation?: boolean;

  data?: Float32Array;
};

type VertexBufferMapValue = {
  data: Float32Array;

  descriptor: GPUBufferDescriptor & { writeOnCreation?: boolean };
  buffer?: GPUBuffer;
};

export const BuffersManager = "UNIFORM_BUFFERS" as const;
type Ref = StorageRef<typeof BuffersManager>;
export class BufferManager {
  private vertex: Map<string, VertexBufferMapValue> = new Map();

  add(descriptor: BufferStorageDescriptor): Ref {
    const id = nanoid(7);

    this.vertex.set(id, {
      data:
        descriptor.data ||
        new Float32Array(descriptor.size / Float32Array.BYTES_PER_ELEMENT),
      descriptor: {
        label: descriptor.label,
        size: descriptor.size,
        usage: descriptor.usage,
        mappedAtCreation: descriptor.mappedAtCreation,
        writeOnCreation: descriptor.writeOnCreation,
      },
    });

    return this.ref(id);
  }

  get(ref: Ref): VertexBufferMapValue {
    const val = this.vertex.get(ref.id);
    if (!val) {
      throw new Error(`Buffer with ref ${ref.id} does not exist`);
    }

    return val;
  }

  setData(ref: Ref, data: ArrayLike<number>) {
    const val = this.vertex.get(ref.id);
    if (!val) {
      throw new Error(`Buffer with ref ${ref.id} does not exist`);
    }

    val.data.set(data);

    return val.data;
  }

  create(ref: Ref, device: GPUDevice): GPUBuffer {
    const val = this.vertex.get(ref.id);
    if (!val) {
      throw new Error(`Vertex with ref ${ref.id} does not exist`);
    }

    if (val.buffer) {
      return val.buffer;
    }

    const buffer = device.createBuffer(val.descriptor);
    this.vertex.set(ref.id, { ...val, buffer });

    // writeOnCreation
    if (val.descriptor.writeOnCreation) {
      device.queue.writeBuffer(buffer, 0, val.data);
    }

    return buffer;
  }

  write(ref: Ref, data: Float32Array, device: GPUDevice) {
    const value = this.vertex.get(ref.id);
    if (!value) {
      throw new Error(`Vertex Buffer with ref ${ref.id} does not exist`);
    }

    if (!value.buffer) {
      throw new Error(`Buffer's buffer with ref ${ref.id} does not exist`);
    }

    device.queue.writeBuffer(value.buffer, 0, data);
  }

  // internal
  private ref(name: string): Ref {
    return { __manager: BuffersManager, id: name };
  }
}
