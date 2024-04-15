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

  private angle: number = 0.0;

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

    // keyboard
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);

    this.updateBuffer();
  }

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

  private moving = false;
  private rotating = false;

  private onMouseDown = (e: MouseEvent) => {
    e.preventDefault();

    if (e.button === 0) {
      // LEFT MOUSE BUTTON
      if (e.shiftKey) {
        this.moving = true;
      } else {
        this.rotating = true;
      }
    }

    if (e.button === 2) {
      // RIGHT MOUSE BUTTON
      this.moving = true;
    }
  };

  private onMouseUp = (e: MouseEvent) => {
    if (e.button === 0) {
      // LEFT MOUSE BUTTON

      if (e.shiftKey) {
        this.moving = false;
      } else {
        this.rotating = false;
      }
    }

    if (e.button === 2) {
      // RIGHT MOUSE BUTTON
      this.moving = false;
    }
  };

  private readonly MAX_ANGLE = Math.PI;
  private onMouseMove = (e: MouseEvent) => {
    if (this.rotating) {
      const dx = e.movementX;
      const angle =
        Number((dx / (e.view?.innerWidth || 0)).toFixed(3)) * this.MAX_ANGLE;
      this.angle += angle;

      vec3.rotateY(this.eye, this.target, -angle, this.eye);
    }
  };

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
   *
   *
   *
   */

  private readonly speed = 0.1;
  private readonly magicNumber = 3.24; // 3.68
  tick() {
    const dirVec = vec3.sub(this.target, this.eye);
    vec3.normalize(dirVec, dirVec);

    const magicVector = vec3.rotateY(
      [1, 0, 1],
      [0, 0, 0],
      -this.angle + this.magicNumber
    );
    vec3.scale(magicVector, this.speed, magicVector);

    if (this.activeKeys["KeyW"] || this.activeKeys["Space"]) {
      vec3.add(this.target, magicVector, this.target);
      vec3.add(this.eye, magicVector, this.eye);
    }

    this.updateBuffer();
  }
}
