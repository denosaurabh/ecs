import { WGPUFactory, mat4 } from "@core";

export class IsometricCamera {
  private near: number = 0.001;
  private far: number = 150;

  private top: number = 0;
  private bottom: number = 0;
  private left: number = 0;
  private right: number = 0;

  private _frustumSize: number = 4;
  private aspectRatio: number = 0;

  private _eye: [number, number, number] = [50, 50, 50];
  private _target: [number, number, number] = [0, 0, 0];
  private _up: [number, number, number] = [0, 1, 0];

  private readonly _projection: Float32Array = new Float32Array(16);
  private readonly _view: Float32Array = new Float32Array(16);

  private readonly _projectionView: Float32Array = new Float32Array(16);
  public readonly projViewAndInvProjViewBuffer: GPUBuffer;

  constructor(
    private factory: WGPUFactory,
    size: { width: number; height: number }
  ) {
    this.projViewAndInvProjViewBuffer = this.factory.buffers.createUniform(
      new Float32Array(Float32Array.BYTES_PER_ELEMENT * 16 * 2), // 2 4x4 matrices
      "proj-and-invproj-view"
    );

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

  get projection() {
    return this._projection;
  }

  get view() {
    return this._view;
  }

  get projectionView() {
    return this._projectionView;
  }

  get invProjectionView() {
    return mat4.invert(this._projectionView) as Float32Array;
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

    mat4.ortho(left, right, bottom, top, near, far, this._projection);
    // mat4.perspective(
    //   0.2,
    //   window.innerWidth / window.innerHeight,
    //   near,
    //   far,
    //   this._projection
    // );
    mat4.lookAt(eye, target, up, this._view);

    mat4.multiply(
      this._projection,
      this._view,
      this._projectionView
    ) as Float32Array;

    // update buffer
    this.updateBuffer();
  }

  private updateBuffer() {
    this.factory.buffers.write(
      this.projViewAndInvProjViewBuffer,
      this.projectionView,
      0
    );
    this.factory.buffers.write(
      this.projViewAndInvProjViewBuffer,
      this.invProjectionView,
      Float32Array.BYTES_PER_ELEMENT * 16
    );
  }

  /**
   *
   *
   */

  tick() {
    this.updateMatrices();
  }
}
