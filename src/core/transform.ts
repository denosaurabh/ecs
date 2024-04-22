import { Mat4, mat4, Vec3 } from "wgpu-matrix";
import { BufferManager } from "./factory/buffer";
import { BindGroupEntryType, WGPUFactory } from "./factory";
import { BindGroupEntry } from "./factory/bindgroup";

export class TransformManager {
  constructor(private factory: WGPUFactory) {}

  new() {
    return new Transform(this.factory);
  }
}

export class Transform {
  private _translate: Vec3;
  private _rotate: Vec3;
  private _scale: Vec3;

  private _buffer: GPUBuffer;
  private _modelMatrix: Mat4 = mat4.create();

  constructor(private factory: WGPUFactory) {
    this._translate = [0, 0, 0];
    this._rotate = [0, 0, 0];
    this._scale = [1, 1, 1];

    this._buffer = this.factory.buffers.createUniform(
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

    this.factory.buffers.write(this._buffer, this.modelMatrix);
    this.factory.buffers.write(
      this._buffer,
      this.invModelMatrix,
      16 * Float32Array.BYTES_PER_ELEMENT
    );
  }

  createBindGroup() {
    return this.factory.bindGroups.create({
      label: "Transform Bind Group",
      entries: [this.getBindingEntry(this.factory.buffers)],
    });
  }

  get bindGroupLayout(): GPUBindGroupLayout {
    return this.factory.bindGroups.createLayout({
      label: "transform bind group layout",
      entries: [Transform.bindingEntryLayout],
    });
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
