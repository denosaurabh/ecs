import { StorageManager } from "../../core";
import { Vec3, vec3 } from "wgpu-matrix";

export class Sun {
  private _position: [number, number, number] = [10, 0, 0];
  private float32Array = new Float32Array(this._position);

  public readonly buffer: GPUBuffer;

  constructor(private storage: StorageManager) {
    this.buffer = this.storage.buffers.createUniform(this.float32Array, "sun");
  }

  get position() {
    return this._position;
  }

  private setPosition(x: number, y: number, z: number) {
    this._position = [x, y, z];
    this.float32Array = new Float32Array(this._position);
    this.storage.buffers.write(this.buffer, this.float32Array);
  }

  // temp
  private tempPosition: Vec3 = vec3.create();
  private readonly delta = 0.01;

  tick() {
    this.tempPosition = vec3.rotateZ(this._position, [0, 0, 0], this.delta);
    // vec3.normalize(this.tempPosition, this.tempPosition);
    this.setPosition(
      this.tempPosition[0],
      this.tempPosition[1],
      this.tempPosition[2]
    );
  }
}
