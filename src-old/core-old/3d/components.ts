import { component } from "src/core-old/ecs";
import { FinalRenderPass, RenderPass } from "src/core-old/rendergraph";
import { Mat4, mat4 } from "wgpu-matrix";

export type OrthographicCameraProps = {
  frustumSize: number;
  near?: number;
  far?: number;

  eye: [number, number, number];
  target: [number, number, number];
  up?: [number, number, number];

  projection?: Mat4;
  view?: Mat4;
};

export const OrthographicCameraComponent = component<OrthographicCameraProps>(
  "OrthographicCameraComponent",
  {
    near: 0.01,
    far: 1000,

    up: [0, 1, 0],

    projection: mat4.create(),
    view: mat4.create(),
  }
);

export const RenderPassComponent = component<RenderPass>("RenderPass");
export const FinalRenderPassComponent =
  component<FinalRenderPass>("FinalRenderPass");
