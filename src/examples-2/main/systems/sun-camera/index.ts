import { World } from "../..";
import { IsometricCamera } from "../../defaults/isometric-camera";

export const SunCamera = ({ renderer, storage, player }: World) => {
  const camera = new IsometricCamera(
    { width: renderer.width, height: renderer.height },
    storage
  );

  return () => {
    camera.tick();

    camera.setTarget(...player.position);
    // camera.setAngle;
  };
};
