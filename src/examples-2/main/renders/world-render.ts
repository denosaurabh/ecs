import { World } from "..";
import { Cubes } from "../systems/cube";
import { Wind } from "../systems/wind";

export const WorldRender = (
  world: World,

  pass: GPURenderPassEncoder,
  globalBindGroup: GPUBindGroup
) => {
  const renderCubes = Cubes(world);
  const wind = Wind(world);

  return () => {
    pass.setBindGroup(0, globalBindGroup);

    renderCubes(pass);
    wind(pass);
  };
};
