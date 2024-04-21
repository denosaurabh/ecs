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
import { BindGroupEntryType } from "../shared/storage/bindgroup";

export const RunDepth = async () => {
  const storage = new StorageManager();

  const { timeBuffer, projectionViewBuffer, generalBindGroup } =
    createGeneralBindGroup(storage);

  const depthTexture = storage.textures.add({
    size: [window.innerWidth, window.innerHeight],
    format: "depth24plus",
    // usage: GPUTextureUsage.RENDER_ATTACHMENT,

    depthOrArrayLayers: 1,

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

  const GroundTransform = new Transform().translate(0, 0, 0).scale(5, 0.1, 5);
  const BoxTransform = new Transform().translate(0, -4, 0).scale(1, 1, 1);

  const depthStencil: GPUDepthStencilState = {
    depthWriteEnabled: true,
    depthCompare: "less",
    format: "depth24plus",
  };

  const groundColor = storage.buffers.add({
    size: 4 * 3,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    data: new Float32Array([1, 0, 0]),
    writeOnCreation: true,
  });

  const boxColor = storage.buffers.add({
    size: 4 * 3,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    data: new Float32Array([0, 0, 1]),
    writeOnCreation: true,
  });

  const SceneRenderPass: RenderPass = {
    label: "BOX",
    outputAttachments: [],

    depthStencilAttachment: {
      view: depthTexture,
      depthLoadOp: "clear",
      depthStoreOp: "store",
      depthClearValue: 1.0,
    },

    pipelines: [
      {
        label: "ground render",
        shader: shaderRef,
        vertexBufferLayouts: [cubeGeoRef],
        bindGroups: [
          generalBindGroup,
          storage.bindGroups.add({
            label: "ground bind group",
            entries: [
              GroundTransform.getBindingEntry(storage.buffers),
              {
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                resource: groundColor,
                type: BindGroupEntryType.buffer({
                  type: "uniform",
                  minBindingSize: 4 * 3,
                  hasDynamicOffset: false,
                }),
              },
            ],
          }),
        ],

        // removeDefaultTarget: true,
        // targets: [colorTargetState],

        draw: [
          {
            vertexBuffers: [cubeGeoRef],
            vertexCount: cubeVertexCount,
          },
        ],

        settings: {
          depthStencil,
          // cullMode: "front",
        },
      },

      {
        label: "box render",
        shader: shaderRef,
        vertexBufferLayouts: [cubeGeoRef],
        bindGroups: [
          generalBindGroup,
          storage.bindGroups.add({
            label: "box bind group",
            entries: [
              BoxTransform.getBindingEntry(storage.buffers),
              {
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                resource: boxColor,
                type: BindGroupEntryType.buffer({
                  type: "uniform",
                  minBindingSize: 4 * 3,
                  hasDynamicOffset: false,
                }),
              },
            ],
          }),
        ],

        draw: [
          {
            vertexBuffers: [cubeGeoRef],
            vertexCount: cubeVertexCount,
          },
        ],

        settings: {
          depthStencil,
          // cullMode: "back",
        },
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

  const renderPasses: RenderPass[] = [SceneRenderPass];

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
