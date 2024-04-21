import { vec3, Vec3 } from "wgpu-matrix";
import { World } from "../..";
import { IsometricCamera } from "../../defaults/isometric-camera";

export const SunCamera = ({
  renderer,
  storage,
  player,
  time,
  buffers,
}: World) => {
  const camera = new IsometricCamera({
    width: renderer.width,
    height: renderer.height,
  });

  // set initial camera settings
  let defaultEye: [number, number, number] = [50, 0, 0];
  let defaultUp: [number, number, number] = [0, 0, 1];

  let rotatedEye: Vec3 = [0, 0, 0];
  camera.setEye(10, 0, 0);
  camera.setUp(...defaultUp);

  // let delta = 0;

  return () =>
    // device: GPUDevice
    {
      // delta += 0.01;

      camera.tick();

      camera.setTarget(...player.position);

      rotatedEye = vec3.rotateZ(defaultEye, player.position, time.value);
      // if (time.value % Math.PI > Math.PI / 2) {
      //   defaultUp[1] = -1;
      //   camera.setUp(...defaultUp);
      // } else {
      //   defaultUp[1] = 1;
      //   camera.setUp(...defaultUp);
      // }

      camera.setEye(rotatedEye[0], rotatedEye[1], rotatedEye[2]);

      // render
      // storage.buffers.write(
      //   buffers.activeProjectionView,
      //   camera.projectionView
      // );

      // const encoder = device.createCommandEncoder();

      // update buffer
      // storage.buffers.write(
      //  bindings.
      // );

      // return encoder;
    };
};
