import { World } from "../..";
import { Geometry, Mesh, Transform } from "../../../core";

export const Cubes = ({
  geometry,
  materials,
  storage,
}: Pick<World, "geometry" | "materials" | "storage">) => {
  const meshProps = {
    name: "cubes _",
    geometry: geometry.CUBE(),
    material: materials.NORMAL_COLOR,
    storage,
  };

  const ground = Mesh({
    ...meshProps,
    transform: new Transform(storage.buffers).scale(30, 0.1, 30),
  });

  const tall = Mesh({
    ...meshProps,
    transform: new Transform(storage.buffers)
      .translate(20, 0, 0)
      .scale(1, 10, 1),
  });

  const side = Mesh({
    ...meshProps,
    transform: new Transform(storage.buffers)
      .scale(1, 1, 1)
      .translate(0, 0, 10),
  });

  return (pass: GPURenderPassEncoder) => {
    ground(pass);
    tall(pass);
    side(pass);
  };
};
