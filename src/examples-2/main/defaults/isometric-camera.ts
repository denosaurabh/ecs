import { StorageManager } from "src/examples-2/core";
import { mat4, vec3 } from "wgpu-matrix";

export class IsometricCamera {
  private readonly storage: StorageManager;

  private near: number = 0.001;
  private far: number = 1000;

  private top: number = 0;
  private bottom: number = 0;
  private left: number = 0;
  private right: number = 0;

  private frustumSize: number = 30;
  private aspectRatio: number = 0;

  private eye: [number, number, number] = [50, 50, 50];
  private target: [number, number, number] = [0, 0, 0];
  private readonly up: [number, number, number] = [0, 1, 0];

  private _angle: number = 0.0;

  private projection: Float32Array = new Float32Array(16);
  private view: Float32Array = new Float32Array(16);

  public readonly projectionViewBuffer: GPUBuffer;

  constructor(
    size: { width: number; height: number },
    storage: StorageManager
  ) {
    this.storage = storage;

    this.setAspectRatio(size.width, size.height);
    this.projectionViewBuffer = storage.buffers.createUniform(
      new Float32Array(16),
      "isometricCamera"
    );

    // ANIMATIONS
    // wheel
    window.addEventListener("wheel", this.updateFrustumSizeOnScroll);

    // mouse
    window.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("contextmenu", (e): void => {
      e.preventDefault();
    });

    this.updateBuffer();
  }

  /**
   *
   * PUBLIC
   *
   */
  addToTarget(vec: [number, number, number]) {
    vec3.add(this.target, vec, this.target);
    vec3.add(this.eye, vec, this.eye);

    this.updateBuffer();
  }

  get position() {
    return this.eye;
  }

  get angle() {
    return this._angle;
  }

  /**
   *
   * PRIVATE
   *
   */
  private setFrustumSize(frustumSize: number) {
    this.frustumSize = frustumSize;
    this.recalculateBoundingBox();
  }

  private setAspectRatio(width: number, height: number) {
    this.aspectRatio = width / height;
    this.recalculateBoundingBox();
  }

  private recalculateBoundingBox() {
    this.top = this.frustumSize / 2;
    this.bottom = -this.frustumSize / 2;
    this.left = (-this.frustumSize * this.aspectRatio) / 2;
    this.right = (this.frustumSize * this.aspectRatio) / 2;
  }

  private updateBuffer() {
    const {
      top,
      bottom,
      left,
      right,
      eye,
      target,
      near,
      far,
      up,
      projection,
      view,
    } = this;

    mat4.ortho(left, right, bottom, top, near, far, projection);
    mat4.lookAt(eye, target, up, view);

    const viewProjection = mat4.multiply(
      this.projection,
      this.view
    ) as Float32Array;

    this.storage.buffers.write(this.projectionViewBuffer, viewProjection);
  }

  // ANIMATIONS
  private updateFrustumSizeOnScroll = (e: WheelEvent) => {
    const delta = e.deltaY * 0.01;

    this.setFrustumSize(this.frustumSize + delta);
    this.updateBuffer();
  };

  private rotating = false;

  private onMouseDown = (e: MouseEvent) => {
    e.preventDefault();

    if (e.button === 0) {
      // LEFT MOUSE BUTTON
      this.rotating = true;
    }
  };

  private onMouseUp = (e: MouseEvent) => {
    if (e.button === 0) {
      this.rotating = false;
    }
  };

  private readonly MAX_ANGLE = Math.PI * 1.5;
  private onMouseMove = (e: MouseEvent) => {
    if (this.rotating) {
      const dx = e.movementX;
      const angle =
        Number((dx / (e.view?.innerWidth || 0)).toFixed(3)) * this.MAX_ANGLE;
      this._angle += angle;

      vec3.rotateY(this.eye, this.target, -angle, this.eye);
    }
  };

  /**
   *
   *
   *
   *
   */

  tick() {
    this.updateBuffer();
  }
}
