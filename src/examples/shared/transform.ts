import { mat4, Vec3 } from "wgpu-matrix";

import { StorageRef, BindGroupEntryType, BuffersManager } from "./storage";
import { BufferManager } from "./storage/buffer";
import { BindGroupEntry } from "./storage/bindgroup";

export class Transform {
  private _translate: Vec3;
  private _rotate: Vec3;
  private _scale: Vec3;

  private ref: StorageRef<typeof BuffersManager> | undefined;

  constructor() {
    this._translate = [0, 0, 0];
    this._rotate = [0, 0, 0];
    this._scale = [1, 1, 1];
  }

  translate(x: number, y: number, z: number) {
    this._translate = [x, y, z];
    return this;
  }

  scale(x: number, y: number, z: number) {
    this._scale = [x, y, z];
    return this;
  }

  rotateX(rad: number) {
    this._rotate[0] = rad;
    return this;
  }

  rotateY(rad: number) {
    this._rotate[1] = rad;
    return this;
  }

  rotateZ(rad: number) {
    this._rotate[2] = rad;
    return this;
  }

  // data
  getFloat32Array() {
    const finalMatrix = mat4.identity();

    mat4.scale(finalMatrix, this._scale, finalMatrix);
    mat4.rotateX(finalMatrix, this._rotate[0], finalMatrix);
    mat4.rotateY(finalMatrix, this._rotate[1], finalMatrix);
    mat4.rotateZ(finalMatrix, this._rotate[2], finalMatrix);
    mat4.translate(finalMatrix, this._translate, finalMatrix);

    return finalMatrix as Float32Array;
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

  getBindingEntry(bufferManager: BufferManager): BindGroupEntry {
    if (!this.ref) {
      this.getStorageBuffer(bufferManager);
    }

    if (!this.ref) throw new Error("Transform ref is not defined!");

    return {
      visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
      resource: this.ref,
      type: BindGroupEntryType.buffer({
        type: "uniform",
        minBindingSize: 64,
        hasDynamicOffset: false,
      }),
    };
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
