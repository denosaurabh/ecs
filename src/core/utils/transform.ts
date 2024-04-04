import { mat4, Mat4 } from "wgpu-matrix";
import { BufferManager, BuffersManager } from "../storage/buffer";
import { StorageRef } from "../storage/types";

export class Transform {
  modelMat: Mat4;
  ref: StorageRef<typeof BuffersManager> | undefined;

  constructor() {
    this.modelMat = mat4.identity();
  }

  translate(x: number, y: number, z: number) {
    mat4.translate(this.modelMat, [x, y, z], this.modelMat);
    return this;
  }

  scale(x: number, y: number, z: number) {
    mat4.scale(this.modelMat, [x, y, z], this.modelMat);
    return this;
  }

  rotateX(rad: number) {
    mat4.rotateX(this.modelMat, rad, this.modelMat);
    return this;
  }

  rotateY(rad: number) {
    mat4.rotateY(this.modelMat, rad, this.modelMat);
    return this;
  }

  rotateZ(rad: number) {
    mat4.rotateZ(this.modelMat, rad, this.modelMat);
    return this;
  }

  // data
  getFloat32Array() {
    return this.modelMat as Float32Array;
  }

  getStorageBuffer(
    bufferManager: BufferManager
  ): StorageRef<typeof BuffersManager> {
    const ref = bufferManager.add({
      size: this.size,
      usage: this.usage,

      data: this.getFloat32Array(),

      label: "Transform",

      writeOnCreation: true,
    });

    this.ref = ref;

    return ref;
  }

  // write
  writeBuffer(bufferManager: BufferManager, device: GPUDevice) {
    if (!this.ref) throw new Error("Transform ref is not defined!");

    bufferManager.write(this.ref, this.getFloat32Array(), device);
  }

  // gets
  get size() {
    return Float32Array.BYTES_PER_ELEMENT * 16;
  }

  get usage() {
    return GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;
  }
}
