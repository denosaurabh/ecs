import { WGPUFactory } from "@core";

export class Time {
  private time: number;
  private float32Array = new Float32Array(1);

  public readonly buffer: GPUBuffer;

  constructor(private storage: WGPUFactory) {
    this.time = 0;
    this.float32Array[0] = 0;
    this.buffer = storage.buffers.createUniform(this.float32Array, "time");
  }

  get value() {
    return this.time;
  }

  set value(value: number) {
    this.time = value;
    this.float32Array[0] = value;
    this.storage.buffers.write(this.buffer, this.float32Array);
  }

  tick() {
    this.value = performance.now() / 1000.0;
  }
}
