import { mat4 } from "wgpu-matrix";
import { World } from ".";
import { BindGroupEntryType, StorageManager } from "../core";

export type GlobalBindGroup = {
  time: {
    data: number;
    buffer: GPUBuffer;
  };
  projectionView: {
    buffer: GPUBuffer;
  };

  bindGroup: GPUBindGroup;
  layout: GPUBindGroupLayout;
};

export const createGlobalBindGroup = (
  storage: StorageManager
): GlobalBindGroup => {
  const timeBuffer = storage.buffers.createUniform(
    new Float32Array([0]),
    "time"
  );
  const projectionViewBuffer = storage.buffers.createUniform(
    new Float32Array(16),
    "projectionView"
  );

  const [timeProjectionViewBindGroup, timeProjectionViewBindGroupLayout] =
    storage.bindGroups.create({
      label: "time-projection-view",
      entries: [
        {
          type: BindGroupEntryType.buffer({
            type: "uniform",
            minBindingSize: 4,
          }),
          resource: storage.buffers.getBindingResource(timeBuffer),
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        },
        {
          type: BindGroupEntryType.buffer({}),
          resource: storage.buffers.getBindingResource(projectionViewBuffer),
          visibility: GPUShaderStage.VERTEX,
        },
      ],
    });

  return {
    time: {
      data: 0,
      buffer: timeBuffer,
    },
    projectionView: {
      buffer: projectionViewBuffer,
    },

    bindGroup: timeProjectionViewBindGroup,
    layout: timeProjectionViewBindGroupLayout,
  };
};

// SYSTEMS
const updatedTimeFloat32 = new Float32Array([0]);

export const UpdateTime = ({
  storage,
  globals: {
    globalBindGroup: { time },
  },
}: World) => {
  const updatedTime = performance.now() / 1000.0;
  updatedTimeFloat32[0] = updatedTime;

  time.data = updatedTime;

  storage.buffers.write(time.buffer, updatedTimeFloat32);
};

/**
 * ORTHOGRAPHIC CAMERA
 */

export type OrthographicCamera = {
  eye: [number, number, number];
  target: [number, number, number];
  up: [number, number, number];

  near: number;
  far: number;

  frustumSize: number;

  projection: Float32Array;
  view: Float32Array;
};

export const defaultOrthographicCamera: OrthographicCamera = {
  eye: [10, 10, 10],
  target: [0, 0, 0],
  up: [0, 1, 0],

  near: 0.1,
  far: 100,

  frustumSize: 15,

  projection: new Float32Array(16),
  view: new Float32Array(16),
};

export const OrthoCameraUpdateMatrices = ({
  renderer: { width, height },
  globals: { camera },
}: World) => {
  const { frustumSize, projection, view, eye, target, up, near, far } = camera;

  let aspectRatio = width / height;

  const left = (-frustumSize * aspectRatio) / 2;
  const right = (frustumSize * aspectRatio) / 2;
  const bottom = -frustumSize / 2;
  const top = frustumSize / 2;

  mat4.ortho(left, right, bottom, top, near, far, projection);
  mat4.lookAt(eye, target, up, view);

  return camera;
};

export const WriteCameraBuffer = ({
  storage,
  globals: {
    camera,
    globalBindGroup: { projectionView },
  },
}: World) => {
  const viewProjection = mat4.multiply(
    camera.projection,
    camera.view
  ) as Float32Array;

  storage.buffers.write(projectionView.buffer, viewProjection);
};
