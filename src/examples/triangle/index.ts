import {
  GEOMETRY,
  MATERIAL,
  Init,
  Prepare,
  Render,
  RenderPass,
  StorageManager,
} from "../shared";

export const RunTriangle = async () => {
  const storage = new StorageManager();

  // data
  const {
    geometryRef,
    data: geometryData,
    vertexCount,
  } = GEOMETRY.TRIANGE(storage);

  const TriangleRenderPass: RenderPass = {
    label: "TRIANGLE",
    outputAttachments: [],
    pipelines: [
      {
        label: "triangle render",
        shader: MATERIAL.SIMPLE(storage).materialRef,
        bindGroups: [],
        vertexBufferLayouts: [geometryRef],
        draw: [
          {
            vertexBuffers: [geometryRef],
            vertexCount,
          },
        ],
      },
    ],
  };

  const renderPasses: RenderPass[] = [TriangleRenderPass];

  // SHARED
  const rendererData = await Init();
  const renderGraph = Prepare(renderPasses, rendererData, storage);

  storage.vertexBuffers.write(geometryRef, geometryData, rendererData.device);

  const loop = () => {
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
