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
  BindGroupEntryType,
} from "../shared";

export const RunSimplePostprocessing = async () => {
  const storage = new StorageManager();

  const { timeBuffer, projectionViewBuffer, generalBindGroup } =
    createGeneralBindGroup(storage);

  const firstRenderPassOutput = storage.textures.add({
    size: [window.innerWidth, window.innerHeight],
    format: "bgra8unorm",
    usage:
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.RENDER_ATTACHMENT,
  });

  //BOX
  const {
    geometryRef: cubeGeoRef,
    vertexCount: cubeVertexCount,
    data: cubeData,
  } = GEOMETRY.CUBE(storage);

  const shaderRef = MATERIAL.NORMAL_COLOR(storage).materialRef;
  const BoxTransform = new Transform().translate(0, 5, 0).scale(1, 1, 1);

  const SceneRenderPass: RenderPass = {
    label: "BOX",
    outputAttachments: [
      {
        loadOp: "clear",
        storeOp: "store",
        texture: firstRenderPassOutput,
      },
    ],

    pipelines: [
      {
        label: "box render",
        shader: shaderRef,
        vertexBufferLayouts: [cubeGeoRef],
        bindGroups: [
          generalBindGroup,
          storage.bindGroups.add({
            label: "box bind group",
            entries: [BoxTransform.getBindingEntry(storage.buffers)],
          }),
        ],

        draw: [
          {
            vertexBuffers: [cubeGeoRef],
            vertexCount: cubeVertexCount,
          },
        ],
      },
    ],
  };

  const postprocessQuadGeo = GEOMETRY.POSTPROCESS_QUAD(storage);
  const simplePostprocess = MATERIAL.SIMPLE_POSTPROCESS(storage);

  const sampler = storage.samplers.add({
    magFilter: "nearest",
    minFilter: "nearest",
  });

  const Postprocess: RenderPass = {
    label: "POSTPROCESS",
    outputAttachments: [],

    pipelines: [
      {
        label: "postprocess",

        shader: simplePostprocess.materialRef,

        bindGroups: [
          storage.bindGroups.add({
            entries: [
              {
                resource: sampler,
                type: BindGroupEntryType.sampler({}),
                visibility: GPUShaderStage.FRAGMENT,
              },
              {
                resource: firstRenderPassOutput,
                type: BindGroupEntryType.texture({}),
                visibility: GPUShaderStage.FRAGMENT,
              },
            ],
          }),
        ],

        vertexBufferLayouts: [postprocessQuadGeo.geometryRef],

        settings: {
          cullMode: "front",
          topology: "triangle-list",
        },

        draw: [
          {
            vertexBuffers: [postprocessQuadGeo.geometryRef],
            vertexCount: postprocessQuadGeo.vertexCount,
          },
        ],
      },
    ],
  };

  const renderPasses: RenderPass[] = [SceneRenderPass, Postprocess];

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

  // write buffers
  // storage.vertexBuffers.write(geometryRef, cubeData, rendererData.device);
  storage.vertexBuffers.write(cubeGeoRef, cubeData, rendererData.device);
  storage.vertexBuffers.write(
    postprocessQuadGeo.geometryRef,
    postprocessQuadGeo.data,
    rendererData.device
  );

  BoxTransform.writeBuffer(storage.buffers, rendererData.device);

  let animationId: number;
  const loop = () => {
    UpdateTime(storage, timeBuffer, rendererData);
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
