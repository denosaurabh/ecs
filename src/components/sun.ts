import { Vec3, vec3 } from "wgpu-matrix";
import { IsometricCamera } from "./isometric-camera";

export class SunControl {
  constructor(private camera: IsometricCamera) {}

  // temp
  private tempPosition: Vec3 = vec3.create();
  private readonly delta = 0.002;

  tick() {
    this.tempPosition = vec3.rotateZ(this.camera.eye, [0, 0, 0], this.delta);
    this.camera.setEye(
      this.tempPosition[0],
      this.tempPosition[1],
      this.tempPosition[2]
    );
  }
}
