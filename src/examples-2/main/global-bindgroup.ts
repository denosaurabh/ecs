import { BindGroupEntryType, StorageManager } from "../core";
import { IsometricCamera } from "./defaults/isometric-camera";
import { Time } from "./defaults/time";

export type BindTimeAndProjView = {
  time: Time;
  camera: IsometricCamera;

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
  const camera = new IsometricCamera(size, storage);

  const [timeProjectionViewBindGroup, timeProjectionViewBindGroupLayout] =
    storage.bindGroups.create({
      label: "time-projection-view",
      entries: [
        {
          type: BindGroupEntryType.buffer({
            type: "uniform",
            minBindingSize: 4,
          }),
          resource: storage.buffers.getBindingResource(time.buffer),
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        },
        {
          type: BindGroupEntryType.buffer({}),
          resource: storage.buffers.getBindingResource(
            camera.projectionViewBuffer
          ),
          visibility: GPUShaderStage.VERTEX,
        },
      ],
    });

  return {
    time,
    camera,

    bindings: {
      timeProjectionView: {
        bindGroup: timeProjectionViewBindGroup,
        layout: timeProjectionViewBindGroupLayout,
      },
    },
  };
};
