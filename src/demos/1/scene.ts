import { RenderMode, World } from "@utils";

import DiffuseShader from "./shaders/diffuse.wgsl?raw";
import { BindGroupEntryType } from "@core";

export const Scene = (world: World, shadowDepthtexture: GPUTexture) => {
  const {
    geometry,
    transform,
    factory,
    rendererData: { format },
    mesh,
  } = world;

  const geo = geometry.CUBE_WITH_NORMAL();
  const shader = factory.shaders.create({
    code: DiffuseShader,
  });

  const formats = [{ format }, { format }];

  // shadow bind group
  const sampler = factory.textures.createSampler({
    magFilter: "linear",
    minFilter: "linear",
  });

  const shadowBindGroup = factory.bindGroups.create({
    label: "shadow bind group",
    entries: [
      {
        resource: sampler,
        type: BindGroupEntryType.sampler({}),
        visibility: GPUShaderStage.FRAGMENT,
      },
      {
        resource: shadowTextureView,
        type: BindGroupEntryType.texture({
          sampleType: "depth",
          viewDimension: "2d",
        }),
        visibility: GPUShaderStage.FRAGMENT,
      },
    ],
  });

  const cubeTransform = transform.new().translate(0, 0, 0);
  const cube = mesh.new(geo, shader, {
    label: "cubes pipeline",
    transform: cubeTransform,
    targets: formats,
  });

  const groundTransform = transform.new().translate(0, 0, 0).scale(10, 0.1, 10);
  const ground = mesh.new(geo, shader, {
    label: "ground pipeline",
    transform: groundTransform,
    targets: formats,
  });

  return (pass: GPURenderPassEncoder, mode: RenderMode) => {
    cube.render(pass, mode);
    ground.render(pass, mode);
  };
};
