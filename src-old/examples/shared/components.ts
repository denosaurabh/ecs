import { Mat4 } from "wgpu-matrix";

export type OrthographicCameraProps = {
  frustumSize: number;
  near: number;
  far: number;

  eye: [number, number, number];
  target: [number, number, number];
  up: [number, number, number];

  projection: Mat4;
  view: Mat4;
};
