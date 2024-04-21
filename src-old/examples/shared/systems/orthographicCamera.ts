import { mat4 } from "wgpu-matrix";
import { OrthographicCameraProps } from "../components";
import { RendererData } from "./init";
import { BuffersManager, StorageManager, StorageRef } from "../storage";

export const OrthoCameraSetupViewAndProjMatrix = (
  cam: OrthographicCameraProps,
  renderer_data: RendererData
) => {
  const { width, height } = renderer_data;

  const { frustumSize, projection, view, eye, target, up, near, far } = cam;

  let aspectRatio = width / height;

  const left = (-frustumSize * aspectRatio) / 2;
  const right = (frustumSize * aspectRatio) / 2;
  const bottom = -frustumSize / 2;
  const top = frustumSize / 2;

  mat4.ortho(left, right, bottom, top, near, far, projection);
  mat4.lookAt(eye, target, up, view);

  return cam;
};

export const WriteCameraViewAndProjBuffer = (
  cam: OrthographicCameraProps,
  storage: StorageManager,
  projectionViewBuffer: StorageRef<typeof BuffersManager>,
  renderer_data: RendererData
) => {
  const { device } = renderer_data;

  const viewProjection = mat4.multiply(
    cam.projection,
    cam.view
  ) as Float32Array;

  storage.buffers.write(projectionViewBuffer, viewProjection, device);
};
