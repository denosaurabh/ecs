import { StorageManager } from "src/examples-2/core";

export class Player {
  private _position: [number, number, number] = [0, 0, 0];

  private float32Array = new Float32Array(3);
  public readonly buffer: GPUBuffer;

  constructor(private storage: StorageManager) {
    this.buffer = this.storage.buffers.createUniform(
      new Float32Array(3),
      "player"
    );
  }

  get position() {
    return this._position;
  }

  setPosition(x: number, y: number, z: number) {
    this._position = [x, y, z];
    this.float32Array.set(this._position);
    this.storage.buffers.write(this.buffer, this.float32Array);
  }
}
