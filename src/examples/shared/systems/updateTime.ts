import { StorageManager, StorageRef } from "../storage";
import { BuffersManager } from "../storage/buffer";
import { RendererData } from "./init";

export const UpdateTime = (
  storage: StorageManager,
  timeBuffer: StorageRef<typeof BuffersManager>,
  renderer_data: RendererData
) => {
  const { device } = renderer_data;

  const updatedTime = performance.now() / 1000.0;

  storage.buffers.setData(timeBuffer, [updatedTime]);
  storage.buffers.write(
    timeBuffer,
    storage.buffers.get(timeBuffer).data,
    device
  );
};
