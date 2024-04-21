import { WGPUFactory } from "@core";

export class Player {
  private _position: [number, number, number] = [0, 0, 0];

  private float32Array = new Float32Array(3);
  public readonly positionBuffer: GPUBuffer;

  constructor(private factory: WGPUFactory) {
    this.positionBuffer = this.factory.buffers.createUniform(
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
    this.factory.buffers.write(this.positionBuffer, this.float32Array);
  }
}
