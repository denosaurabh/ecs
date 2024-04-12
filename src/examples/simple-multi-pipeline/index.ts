import {
  GEOMETRY,
  MATERIAL,
  Init,
  Prepare,
  Render,
  RenderPass,
  StorageManager,
} from "../shared";

export const RunSimpleMultiPipeline = async () => {
  const storage = new StorageManager();

  const depthTexture = storage.textures.add({
    size: [window.innerWidth, window.innerHeight],
    format: "depth24plus",

    depthOrArrayLayers: 1,

    usage:
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.RENDER_ATTACHMENT,
  });

  //BOX
  const {
    geometryRef: tri1Ref,
    vertexCount: tri1Count,
    data: tri1Data,
  } = GEOMETRY.TRIANGE(storage);

  const {
    geometryRef: tri2Ref,
    vertexCount: tri2Count,
    data: tri2Data,
  } = GEOMETRY.TRIANGE(storage, { offset: 0.4, color: [0.0, 1.0, 0.0] });

  const simpleColorShaderRef = MATERIAL.SIMPLE(storage).materialRef;

  const depthStencil: GPUDepthStencilState = {
    depthWriteEnabled: true,
    depthCompare: "less",
    format: "depth24plus",
  };

  const SceneRenderPass: RenderPass = {
    label: "TRIANGLE PASS",
    outputAttachments: [],

    depthStencilAttachment: {
      view: depthTexture,
      depthLoadOp: "clear",
      depthStoreOp: "store",
      depthClearValue: 1.0,
    },

    pipelines: [
      {
        label: "1",
        shader: simpleColorShaderRef,
        vertexBufferLayouts: [tri1Ref],
        bindGroups: [],

        draw: [
          {
            vertexBuffers: [tri1Ref],
            vertexCount: tri1Count,
          },
        ],

        settings: {
          depthStencil,
        },
      },

      {
        label: "2",
        shader: simpleColorShaderRef,
        vertexBufferLayouts: [tri2Ref],
        bindGroups: [],

        draw: [
          {
            vertexBuffers: [tri2Ref],
            vertexCount: tri2Count,
          },
        ],

        settings: {
          depthStencil,
        },
      },
    ],
  };

  const renderPasses: RenderPass[] = [SceneRenderPass];

  // SHARED
  const rendererData = await Init();
  const renderGraph = Prepare(renderPasses, rendererData, storage);

  // write buffers
  storage.vertexBuffers.write(tri1Ref, tri1Data, rendererData.device);
  storage.vertexBuffers.write(tri2Ref, tri2Data, rendererData.device);

  let animationId: number;
  const loop = () => {
    Render(renderGraph, rendererData);

    animationId = requestAnimationFrame(() => {
      loop();
    });
  };

  loop();

  // cleanup
  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }

    rendererData.device.destroy();
  };
};
