import { World } from "../..";
import { Mesh, Transform } from "../../../core";

import NormalShader from "./normal.wgsl?raw";
import DiffuseShader from "./diffuse.wgsl?raw";
import SpecularShader from "./specular.wgsl?raw";

export const Cubes = ({
  geometry,
  storage,
  time,
  sun,
  settings: { multisample },
}: World) => {
  const normalShader = storage.shaders.create({
    code: NormalShader,
  });

  const diffuseShader = storage.shaders.create({
    code: DiffuseShader,
  });

  const specularShader = storage.shaders.create({
    code: SpecularShader,
  });

  const meshProps = {
    name: "cubes _",
    geometry: geometry.CUBE(),
    material: normalShader,
    storage,
    settings: {
      multisample,
    },
  };

  const ground = Mesh({
    ...meshProps,
    transform: new Transform(storage.buffers).scale(30, 0.1, 30),
  });

  const tallTransform = new Transform(storage.buffers)
    .translate(20, 0, 0)
    .scale(1, 10, 1);
  const tall = Mesh({
    ...meshProps,
    geometry: geometry.CUBE_WITH_NORMAL(),
    material: diffuseShader,
    transform: tallTransform,
  });

  const tall2Transform = new Transform(storage.buffers)
    .translate(-2, 0, 0)
    .scale(1, 10, 1);
  const tall2 = Mesh({
    ...meshProps,
    geometry: geometry.CUBE_WITH_NORMAL(),
    material: specularShader,
    transform: tall2Transform,
  });

  const sunTransform = new Transform(storage.buffers)
    .scale(0.1, 0.1, 0.1)
    .translate(0, 0, 10);
  const sunmesh = Mesh({
    ...meshProps,
    transform: sunTransform,
  });

  const normalTransform = new Transform(storage.buffers)
    .scale(1, 1, 1)
    .translate(0, 2, 15);
  const normal = Mesh({
    ...meshProps,
    transform: normalTransform,
  });

  return (pass: GPURenderPassEncoder) => {
    tallTransform.rotateY(time.value);
    tall2Transform.rotateY(time.value * 2 + 2);

    sunTransform.translate(
      sun.position[0] * 1,
      sun.position[1],
      sun.position[2] * 1
    );

    ground(pass);
    tall(pass);
    tall2(pass);
    sunmesh(pass);
    normal(pass);
  };
};
