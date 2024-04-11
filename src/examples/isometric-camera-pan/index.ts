import { mat4 } from "wgpu-matrix";
import {
  GEOMETRY,
  MATERIAL,
  Init,
  OrthographicCameraProps,
  OrthoCameraSetupViewAndProjMatrix,
  Prepare,
  Render,
  RenderPass,
  StorageManager,
  Transform,
  UpdateTime,
  WriteCameraViewAndProjBuffer,
  createGeneralBindGroup,
} from "../shared";

export const RunIsometricCameraPan = async () => {
  const storage = new StorageManager();

  const { timeBuffer, projectionViewBuffer, generalBindGroup } =
    createGeneralBindGroup(storage);

  // data
  const BoxTransform = new Transform().translate(0, 0, 0).scale(2, 2, 2);

  const BoxBindGroup = storage.bindGroups.add({
    label: "box bind group",
    entries: [BoxTransform.getBindingEntry(storage.buffers)],
  });

  const { geometryRef, vertexCount } = GEOMETRY.CUBE(storage);
  const BoxRenderPass: RenderPass = {
    label: "BOX",
    outputAttachments: [],
    pipelines: [
      {
        label: "box render",
        shader: MATERIAL.SOLID_COLOR(storage).materialRef,
        bindGroups: [generalBindGroup, BoxBindGroup],
        vertexBufferLayouts: [geometryRef],
        draw: [
          {
            vertexBuffers: [geometryRef],
            vertexCount: vertexCount,
          },
        ],
      },
    ],
  };

  // camera
  let OrthographicCamera: OrthographicCameraProps = {
    eye: [10, 10, 10],
    target: [0, 0, 0],

    frustumSize: 15,

    near: 0.01,
    far: 1000,

    up: [0, 1, 0],

    projection: mat4.create(),
    view: mat4.create(),
  };

  const renderPasses: RenderPass[] = [BoxRenderPass];

  // SHARED
  const rendererData = await Init();
  const renderGraph = Prepare(renderPasses, rendererData, storage);
  OrthographicCamera = OrthoCameraSetupViewAndProjMatrix(
    OrthographicCamera,
    rendererData
  );

  WriteCameraViewAndProjBuffer(
    OrthographicCamera,
    storage,
    projectionViewBuffer,
    rendererData
  );

  const loop = () => {
    UpdateTime(storage, timeBuffer, rendererData);
    Render(renderGraph, rendererData);

    requestAnimationFrame(() => {
      loop();
    });
  };

  loop();

  // cleanup
  return () => {
    rendererData.device.destroy();
  };
};