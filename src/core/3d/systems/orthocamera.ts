import {
  OrthographicCameraComponent,
  OrthographicCameraProps,
} from "@3d/components";
import { renderer_data } from "@3d/resources";
import { Component, World } from "@ecs";
import { mat4 } from "wgpu-matrix";

export const OrthographicCameraSystemInit = (world: World) => {
  const finalRenderGraphs = world.query.exact(OrthographicCameraComponent);

  const { device, context, width, height } = renderer_data.get()!;

  if (!device || !context) {
    throw new Error("no device or context");
  }

  const orthoCameraEntity: Map<string, Component<any>> = finalRenderGraphs
    .values()
    .next().value;

  const cam: OrthographicCameraProps = orthoCameraEntity
    .get(OrthographicCameraComponent.factoryId)
    ?.get();

  if (!cam) {
    throw new Error("whoooeeereeee is he!!! (orthoCamera)");
  }

  const {
    frustumSize,
    projection,
    view,
    eye,
    target,
    up = [0, 1, 0],
    near = 0.001,
    far = 100,
  } = cam;

  if (!projection || !view) {
    throw new Error("no projection or view");
  }

  let aspectRatio = width / height;

  const left = (-frustumSize * aspectRatio) / 2;
  const right = (frustumSize * aspectRatio) / 2;
  const bottom = -frustumSize / 2;
  const top = frustumSize / 2;

  mat4.ortho(left, right, bottom, top, near, far, projection);
  // mat4.perspective(1, aspectRatio, 0.01, 100, projection);

  mat4.lookAt(eye, target, up, view);

  // set
  orthoCameraEntity
    .get(OrthographicCameraComponent.factoryId)
    ?.set({ ...cam, projection, view });
};

export const WriteCameraBuffer = (world: World) => {
  const { device, context, format } = renderer_data.get()!;

  if (!device || !context || !format) {
    throw new Error("no device or context");
  }

  const finalRenderGraphs = world.query.exact(OrthographicCameraComponent);

  const orthoCameraEntity: Map<string, Component<any>> = finalRenderGraphs
    .values()
    .next().value;

  const cam: OrthographicCameraProps = orthoCameraEntity
    .get(OrthographicCameraComponent.factoryId)
    ?.get();

  if (!cam || !cam.projection || !cam.view) {
    throw new Error("whoooeeereeee is he!!! (orthoCamera). or projection/view");
  }

  const viewProjection = mat4.multiply(
    cam.projection,
    cam.view
  ) as Float32Array;

  world.storage.buffers.write(projectionViewBuffer, viewProjection, device);
};
