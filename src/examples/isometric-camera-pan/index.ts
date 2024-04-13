import { Mat4, mat4, Vec3, vec3 } from "wgpu-matrix";
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
import { BufferManager } from "../shared/storage/buffer";

type ActiveKeys = {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
};

type CameraRotateState = {
  test_eye: Vec3;

  isDragging: boolean;

  prevMouseX: number;
  prevMouseY: number;

  cameraRotationX: number;
  cameraRotationY: number;

  rotationSpeed: number;
};

export const RunIsometricCameraPan = async () => {
  const storage = new StorageManager();

  const { timeBuffer, projectionViewBuffer, generalBindGroup } =
    createGeneralBindGroup(storage);

  // state
  const activeKeys: ActiveKeys = { w: false, a: false, s: false, d: false };
  let cameraRotateState: CameraRotateState = {
    test_eye: vec3.fromValues(10, 10, 10),

    isDragging: false,
    prevMouseX: 0,
    prevMouseY: 0,
    cameraRotationX: 0,
    cameraRotationY: 0,
    rotationSpeed: 0.002,
  };

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
  const BoxTransform = new Transform().translate(0, 4, 0).scale(0.4, 0.4, 0.4);

  const depthStencil: GPUDepthStencilState = {
    depthWriteEnabled: true,
    depthCompare: "less",
    format: "depth24plus",
  };

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
            entries: [GroundTransform.getBindingEntry(storage.buffers)],
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
            entries: [BoxTransform.getBindingEntry(storage.buffers)],
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
        },
      },
    ],
  };

  const renderPasses: RenderPass[] = [SceneRenderPass];

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
  storage.vertexBuffers.write(cubeGeoRef, cubeData, rendererData.device);

  let animationId: number;
  const loop = () => {
    UpdateTime(storage, timeBuffer, rendererData);

    UpdateCameraPosition(OrthographicCamera, activeKeys);
    UpdateCameraOrbit(cameraRotateState);

    AnimateBox(BoxTransform, storage.buffers, rendererData.device);

    Render(renderGraph, rendererData);

    animationId = requestAnimationFrame(() => {
      loop();
    });
  };

  loop();

  // keydown
  const onKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "w":
        activeKeys.w = true;
        break;
      case "a":
        activeKeys.a = true;
        break;
      case "s":
        activeKeys.s = true;
        break;
      case "d":
        activeKeys.d = true;
        break;
    }
  };

  const onKeyUp = (event: KeyboardEvent) => {
    console.log("keyup", event.code);

    switch (event.key) {
      case "w":
        activeKeys.w = false;
        break;
      case "a":
        activeKeys.a = false;
        break;
      case "s":
        activeKeys.s = false;
        break;
      case "d":
        activeKeys.d = false;
        break;
    }
  };

  const onMouseDown = (event: MouseEvent) => {
    cameraRotateState.isDragging = true;
    cameraRotateState.prevMouseX = event.clientX;
    cameraRotateState.prevMouseY = event.clientY;
  };

  const onMouseMove = (event: MouseEvent) => {
    if (!cameraRotateState.isDragging) return;

    const deltaX = event.clientX - cameraRotateState.prevMouseX;
    const deltaY = event.clientY - cameraRotateState.prevMouseY;

    cameraRotateState.cameraRotationY -=
      deltaX * cameraRotateState.rotationSpeed;
    cameraRotateState.cameraRotationX -=
      deltaY * cameraRotateState.rotationSpeed;

    cameraRotateState.prevMouseX = event.clientX;
    cameraRotateState.prevMouseY = event.clientY;

    // updateCameraPosition();
  };

  const onMouseUp = () => {
    cameraRotateState.isDragging = false;
  };

  const onMouseLeave = () => {
    cameraRotateState.isDragging = false;
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  window.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
  window.addEventListener("mouseleave", onMouseLeave);

  // cleanup
  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }

    rendererData.device.destroy();

    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);

    window.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
    window.removeEventListener("mouseleave", onMouseLeave);
  };
};

function UpdateCameraPosition(
  cam: OrthographicCameraProps,
  activeKeys: ActiveKeys
) {
  const speed = 0.05;

  if (activeKeys.w) {
    cam.eye[2] -= speed;
    cam.target[2] -= speed;
  }
  if (activeKeys.a) {
    cam.eye[0] -= speed;
    cam.target[0] -= speed;
  }
  if (activeKeys.s) {
    cam.eye[2] += speed;
    cam.target[2] += speed;
  }
  if (activeKeys.d) {
    cam.eye[0] += speed;
    cam.target[0] += speed;
  }

  return cam;
}

let rad = 0;

function UpdateCameraOrbit(
  // cam: OrthographicCameraProps,
  state: CameraRotateState
): CameraRotateState {
  const target = [0, 0, 0];

  // console.log(state.cameraRotationY, state.prevMouseX);

  const new_test_eye = vec3.rotateY(state.test_eye, [10, 0, 10], rad);

  console.log(
    new_test_eye[0].toFixed(2),
    new_test_eye[1].toFixed(2),
    new_test_eye[2].toFixed(2)
  );

  const test_eye: [number, number, number] = [0, 0, 0];

  rad += 0.01;

  return { ...state, test_eye };
  // return cam;
}

type BoxState = {
  target: Vec3;
  eye: Vec3;

  mat4: Mat4;

  rotation: number;

  isDragging: boolean;
  prevMouseX: number;
  prevMouseY: number;
  cameraRotationX: number;
  cameraRotationY: number;
  rotationSpeed: number;
};

let boxState: BoxState = {
  target: vec3.fromValues(0, 0, 0),
  eye: vec3.fromValues(0, 0, 0),

  mat4: mat4.identity(),

  rotation: 0.01,

  isDragging: false,
  prevMouseX: 0,
  prevMouseY: 0,
  cameraRotationX: 0,
  cameraRotationY: 0,
  rotationSpeed: 0.002,
};

function AnimateBox(
  transform: Transform,
  bufferManager: BufferManager,
  device: GPUDevice
) {
  const { mat4: boxMat4 } = boxState;

  mat4.setTranslation(boxMat4, [0, 2, 0], boxState.mat4);
  transform.hardcodeMat4(boxState.mat4);

  transform.writeBuffer(bufferManager, device);
}
