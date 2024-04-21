import { Mat4, mat4, Vec3 } from "wgpu-matrix";
import { BufferManager } from "./factory/buffer";
import { BindGroupEntryType } from "./factory";
import { BindGroupEntry } from "./factory/bindgroup";

export class TransformManager {
  constructor(private bufferManager: BufferManager) {}

  new() {
    return new Transform(this.bufferManager);
  }
}

class Transform {
  private _translate: Vec3;
  private _rotate: Vec3;
  private _scale: Vec3;

  private _buffer: GPUBuffer;
  private _modelMatrix: Mat4 = mat4.create();

  constructor(private bufferManager: BufferManager) {
    this._translate = [0, 0, 0];
    this._rotate = [0, 0, 0];
    this._scale = [1, 1, 1];

    this._buffer = bufferManager.createUniform(
      new Float32Array(Float32Array.BYTES_PER_ELEMENT * 16 * 2) as Float32Array,
      "Transform"
    );
  }

  get modelMatrix(): Float32Array {
    return this._modelMatrix as Float32Array;
  }

  get invModelMatrix(): Float32Array {
    return mat4.transpose(mat4.inverse(this._modelMatrix)) as Float32Array;
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

  x() {
    return this._translate[0];
  }

  y() {
    return this._translate[1];
  }

  z() {
    return this._translate[2];
  }

  // data
  compute(): Float32Array {
    const finalMatrix = mat4.identity();

    mat4.translate(finalMatrix, this._translate, finalMatrix);
    mat4.rotateX(finalMatrix, this._rotate[0], finalMatrix);
    mat4.rotateY(finalMatrix, this._rotate[1], finalMatrix);
    mat4.rotateZ(finalMatrix, this._rotate[2], finalMatrix);
    mat4.scale(finalMatrix, this._scale, finalMatrix);

    this._modelMatrix = finalMatrix;

    return this._modelMatrix as Float32Array;
  }

  getBindingEntry(bufferManager: BufferManager): BindGroupEntry {
    return {
      ...Transform.bindingEntryLayout,
      resource: bufferManager.getBindingResource(this._buffer),
    };
  }

  // write
  writeBuffer() {
    this.compute();

    this.bufferManager.write(this._buffer, this.modelMatrix);
    this.bufferManager.write(
      this._buffer,
      this.invModelMatrix,
      16 * Float32Array.BYTES_PER_ELEMENT
    );
  }

  static get bindingEntryLayout() {
    return {
      visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
      type: BindGroupEntryType.buffer({
        type: "uniform",
        minBindingSize: Float32Array.BYTES_PER_ELEMENT * 16 * 2,
        hasDynamicOffset: false,
      }),
    };
  }

  // gets
  get size() {
    return Float32Array.BYTES_PER_ELEMENT * 16 * 2;
  }

  get usage() {
    return GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;
  }
}
