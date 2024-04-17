import { StorageManager } from "../../core";
import { vec3, Vec3 } from "wgpu-matrix";

export class Sun {
  private _position: Vec3 = vec3.create(50, 0, 0);
  private float32Array = new Float32Array(3);

  public readonly buffer: GPUBuffer;

  constructor(private storage: StorageManager) {
    this.buffer = this.storage.buffers.createUniform(this.float32Array, "sun");
  }

  get position() {
    return this._position;
  }

  tick(playerPosition: [number, number, number], time: number) {
    vec3.rotateZ(this._position, playerPosition, time, this.position);
  }
}
