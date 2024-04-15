import { StorageManager } from "src/examples-2/core";
import { vec3 } from "wgpu-matrix";
import { IsometricCamera } from "./isometric-camera";

export class Player {
  private _position: [number, number, number] = [0, 0, 0];

  private float32Array = new Float32Array(3);
  public readonly buffer: GPUBuffer;

  constructor(private storage: StorageManager) {
    this.buffer = this.storage.buffers.createUniform(
      new Float32Array(3),
      "player"
    );

    // keyboard
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  get position() {
    return this._position;
  }

  private setPosition(x: number, y: number, z: number) {
    this._position = [x, y, z];
    this.float32Array.set(this._position);
    this.storage.buffers.write(this.buffer, this.float32Array);
  }

  // keyboard
  private readonly trackKeys = ["KeyW", "Space"] as const;
  private activeKeys = this.trackKeys.reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {} as { [key in (typeof this.trackKeys)[number]]: boolean });

  private onKeyDown = (e: KeyboardEvent) => {
    type TrackKeysValues = (typeof this.trackKeys)[number];

    if (this.trackKeys.includes(e.code as TrackKeysValues)) {
      this.activeKeys[e.code as TrackKeysValues] = true;
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    type TrackKeysValues = (typeof this.trackKeys)[number];

    if (this.trackKeys.includes(e.code as TrackKeysValues)) {
      this.activeKeys[e.code as TrackKeysValues] = false;
    }
  };

  /**
   *
   * tick
   *
   */

  private readonly speed = 0.1;
  private readonly magicNumber = 3.24;
  tick(camera: IsometricCamera) {
    const magicVector = vec3.rotateY(
      [1, 0, 1],
      [0, 0, 0],
      -camera.angle + this.magicNumber
    );
    vec3.scale(magicVector, this.speed, magicVector);

    if (this.activeKeys["KeyW"] || this.activeKeys["Space"]) {
      const newPos = vec3.add(this._position, magicVector);
      this.setPosition(newPos[0], newPos[1], newPos[2]);

      camera.addToTarget([magicVector[0], magicVector[1], magicVector[2]]);
    }
  }
}
