import { mat4 } from "wgpu-matrix";

export class IsometricCamera {
  private near: number = 0.001;
  private far: number = 150;

  private top: number = 0;
  private bottom: number = 0;
  private left: number = 0;
  private right: number = 0;

  private _frustumSize: number = 30;
  private aspectRatio: number = 0;

  private _eye: [number, number, number] = [50, 50, 50];
  private _target: [number, number, number] = [0, 0, 0];
  private _up: [number, number, number] = [0, 1, 0];

  public readonly projectionView: Float32Array = new Float32Array(16);

  constructor(size: { width: number; height: number }) {
    this.setAspectRatio(size.width, size.height);
    this.updateMatrices();
  }

  /**
   *
   * PUBLIC
   *
   */
  setTarget(x: number, y: number, z: number) {
    this._target = [x, y, z];
    this.updateMatrices();
  }

  setEye(x: number, y: number, z: number) {
    this._eye = [x, y, z];
    this.updateMatrices();
  }

  setUp(x: number, y: number, z: number) {
    this._up = [x, y, z];
    this.updateMatrices();
  }

  private readonly DISABLE_LIMIT_FRUSTUM_SIZE = true;
  private readonly MAX_FRUSTUM_SIZE = 80;
  setFrustumSize(frustumSize: number) {
    if (
      (frustumSize < 5 || frustumSize > this.MAX_FRUSTUM_SIZE) &&
      !this.DISABLE_LIMIT_FRUSTUM_SIZE
    ) {
      return;
    }

    this._frustumSize = frustumSize;
    this.recalculateBoundingBox();
  }

  get eye() {
    return this._eye;
  }

  get target() {
    return this._target;
  }

  get frustumSize() {
    return this._frustumSize;
  }

  get up() {
    return this._up;
  }

  /**
   *
   * PRIVATE
   *
   */
  private setAspectRatio(width: number, height: number) {
    this.aspectRatio = width / height;
    this.recalculateBoundingBox();
  }

  private recalculateBoundingBox() {
    this.top = this._frustumSize / 2;
    this.bottom = -this._frustumSize / 2;
    this.left = (-this._frustumSize * this.aspectRatio) / 2;
    this.right = (this._frustumSize * this.aspectRatio) / 2;
  }

  // temp
  private projection: Float32Array = new Float32Array(16);
  private view: Float32Array = new Float32Array(16);
  private updateMatrices() {
    const {
      top,
      bottom,
      left,
      right,
      _eye: eye,
      _target: target,
      near,
      far,
      _up: up,
    } = this;

    mat4.ortho(left, right, bottom, top, near, far, this.projection);
    mat4.lookAt(eye, target, up, this.view);

    mat4.multiply(
      this.projection,
      this.view,
      this.projectionView
    ) as Float32Array;
  }

  /**
   *
   *
   */

  tick() {
    this.updateMatrices();
  }
}
