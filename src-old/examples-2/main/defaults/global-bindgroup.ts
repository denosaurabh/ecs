import { BindGroupEntryType, StorageManager } from "../../core";
import { IsometricCamera } from "./isometric-camera";
import { Player } from "./player";
import { Sun } from "./sun";
import { Time } from "./time";

export type BindTimeAndProjView = {
  time: Time;
  camera: IsometricCamera;
  player: Player;
  sun: Sun;

  buffers: {
    activeProjectionView: GPUBuffer;
    activeInvProjectionView: GPUBuffer;
    cameraEye: GPUBuffer;
  };

  bindings: {
    timeProjectionView: {
      bindGroup: GPUBindGroup;
      layout: GPUBindGroupLayout;
    };
  };
};

export const bindTimeAndProjView = (
  storage: StorageManager,
  size: { width: number; height: number }
): BindTimeAndProjView => {
  const time = new Time(storage);
  const camera = new IsometricCamera(size);
  const player = new Player(storage);
  const sun = new Sun(storage);

  const sizeBuffer = storage.buffers.createUniform(
    new Float32Array([size.width, size.height]),
    "size"
  );

  const activeProjectionView = storage.buffers.createUniform(
    new Float32Array(16),
    "active-projection-view"
  );

  const activeInvProjectionView = storage.buffers.createUniform(
    new Float32Array(16),
    "active-inv-projection-view"
  );

  const cameraEye = storage.buffers.createUniform(
    new Float32Array([0, 0, 0]),
    "camera-pos"
  );

  const [timeProjectionViewBindGroup, timeProjectionViewBindGroupLayout] =
    storage.bindGroups.create({
      label: "time-projection-view",
      entries: [
        // 0
        {
          type: BindGroupEntryType.buffer({
            type: "uniform",
            minBindingSize: 4,
          }),
          resource: storage.buffers.getBindingResource(time.buffer),
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        },
        // 1
        {
          type: BindGroupEntryType.buffer({}),
          resource: storage.buffers.getBindingResource(activeProjectionView),
          visibility: GPUShaderStage.VERTEX,
        },
        // 2
        {
          type: BindGroupEntryType.buffer({}),
          resource: storage.buffers.getBindingResource(player.buffer),
          visibility: GPUShaderStage.VERTEX,
        },
        // 3
        {
          type: BindGroupEntryType.buffer({
            type: "uniform",
            minBindingSize: 8,
          }),
          resource: storage.buffers.getBindingResource(sizeBuffer),
          visibility: GPUShaderStage.VERTEX,
        },
        // 4
        {
          type: BindGroupEntryType.buffer({
            type: "uniform",
          }),
          resource: storage.buffers.getBindingResource(sun.buffer),
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        },
        // 5
        {
          type: BindGroupEntryType.buffer({}),
          resource: storage.buffers.getBindingResource(cameraEye),
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        },
      ],
    });

  return {
    time,
    camera,
    player,
    sun,

    buffers: {
      activeProjectionView,
      activeInvProjectionView,
      cameraEye,
    },
    bindings: {
      timeProjectionView: {
        bindGroup: timeProjectionViewBindGroup,
        layout: timeProjectionViewBindGroupLayout,
      },
    },
  };
};
