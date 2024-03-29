import { Mat4, Vec3, mat4, vec3 } from "wgpu-matrix";
import { State } from "./state";

export class Camera {
  // camera options
  frustumSize = 0;
  left = 0;
  right = 0;
  bottom = 0;
  top = 0;
  near = 0;
  far = 0;

  // vector
  eye: Vec3;
  target: Vec3;
  up: Vec3 = [0, 1, 0];

  // rotation
  phi: number = 1;
  theta: number = 0;

  // matrix
  projection: Mat4;
  view: Mat4;

  constructor(
    { width, height }: State,
    options: {
      frustumSize: number;
      near: number;
      far: number;

      eye: Vec3;
      target: Vec3;
    }
  ) {
    // wgpu matrix
    let aspectRatio = width / height;

    // Define the orthographic projection parameters
    this.frustumSize = options.frustumSize;
    this.left = (-this.frustumSize * aspectRatio) / 2;
    this.right = (this.frustumSize * aspectRatio) / 2;
    this.bottom = -this.frustumSize / 2;
    this.top = this.frustumSize / 2;
    this.near = options.near;
    this.far = options.far;

    // options

    this.eye = options.eye;
    this.target = options.target;

    const projection = mat4.create();
    mat4.ortho(
      this.left,
      this.right,
      this.bottom,
      this.top,
      this.near,
      this.far,
      projection
    );

    const view = mat4.create();
    mat4.lookAt(this.eye, this.target, this.up, view);

    // set properties
    this.projection = projection;
    this.view = view;

    // update theta
    const direction = vec3.subtract(this.eye, this.target);
    this.theta = Math.atan2(direction[0], direction[2]);
  }

  recalculateMatrix() {
    const projection = mat4.create();
    mat4.ortho(
      this.left,
      this.right,
      this.bottom,
      this.top,
      this.near,
      this.far,
      projection
    );

    // const view = mat4.create();
    mat4.lookAt(this.eye, this.target, this.up, this.view);

    // set properties
    this.projection = projection;
    // this.view = view;
  }
}
