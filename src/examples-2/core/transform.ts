import { mat4, Vec3 } from "wgpu-matrix";
import { BufferManager } from "./storage/buffer";
import { BindGroupEntryType } from "./storage";
import { BindGroupEntry } from "./storage/bindgroup";

export class Transform {
  private _translate: Vec3;
  private _rotate: Vec3;
  private _scale: Vec3;

  private buffer: GPUBuffer;

  constructor(private bufferManager: BufferManager) {
    this._translate = [0, 0, 0];
    this._rotate = [0, 0, 0];
    this._scale = [1, 1, 1];

    this.buffer = bufferManager.createUniform(
      this.getFloat32Array(),
      "Transform"
    );
  }

  translate(x: number, y: number, z: number) {
    this._translate = [x, y, z];
    this.writeBuffer();

    return this;
  }

  scale(x: number, y: number, z: number) {
    this._scale = [x, y, z];
    this.writeBuffer();

    return this;
  }

  rotateX(rad: number) {
    this._rotate[0] = rad;
    this.writeBuffer();

    return this;
  }

  rotateY(rad: number) {
    this._rotate[1] = rad;
    this.writeBuffer();

    return this;
  }

  rotateZ(rad: number) {
    this._rotate[2] = rad;
    this.writeBuffer();

    return this;
  }

  // data
  getFloat32Array(): Float32Array {
    const finalMatrix = mat4.identity();

    mat4.scale(finalMatrix, this._scale, finalMatrix);
    mat4.rotateX(finalMatrix, this._rotate[0], finalMatrix);
    mat4.rotateY(finalMatrix, this._rotate[1], finalMatrix);
    mat4.rotateZ(finalMatrix, this._rotate[2], finalMatrix);
    mat4.translate(finalMatrix, this._translate, finalMatrix);

    return finalMatrix as Float32Array;
  }

  getBindingEntry(bufferManager: BufferManager): BindGroupEntry {
    return {
      ...Transform.bindingEntryLayout,
      resource: bufferManager.getBindingResource(this.buffer),
    };
  }

  // write
  writeBuffer() {
    this.bufferManager.write(this.buffer, this.getFloat32Array());
  }

  static get bindingEntryLayout() {
    return {
      visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
      type: BindGroupEntryType.buffer({
        type: "uniform",
        minBindingSize: 64,
        hasDynamicOffset: false,
      }),
    };
  }

  // gets
  get size() {
    return Float32Array.BYTES_PER_ELEMENT * 16;
  }

  get usage() {
    return GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;
  }
}
