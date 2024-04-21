import { renderer_data } from "src/core-old/3d/resources";
import { World } from "src/core-old/ecs";

export const UpdateTime = ({ storage }: World) => {
  const { device } = renderer_data.get()!;

  if (!device) {
    throw new Error("no device");
  }

  const updatedTime = performance.now() / 1000.0;

  storage.buffers.setData(timeBuffer, [updatedTime]);
  storage.buffers.write(
    timeBuffer,
    storage.buffers.get(timeBuffer).data,
    device
  );
};