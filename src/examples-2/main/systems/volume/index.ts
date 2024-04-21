import { Transform } from "../../../core";
import { World } from "../..";
import VolumeShader from "./volume.wgsl?raw";

export const Volume = ({
  storage,
  geometry,
  settings: { multisample },
}: World) => {
  const plane = geometry.PLANE();
  const material = storage.shaders.create({
    code: VolumeShader,
  });

  // transform
  const transform = new Transform(storage.buffers)
    .translate(0, 15, 0)
    .scale(10, 10, 10)
    .rotateX(-Math.PI / 2);
  transform.writeBuffer();

  const [bindGroup, layout] = storage.bindGroups.create({
    label: "volume bind group",
    entries: [transform.getBindingEntry(storage.buffers)],
  });

  const [pipeline] = storage.pipelines.create({
    label: "volume pipeline",

    shader: material,
    vertexBufferLayouts: [plane.layout],
    depthStencil: "depth24plus|less|true",

    layout: {
      bindGroups: [layout],
    },

    settings: {
      cullMode: "front",
    },

    multisample,
  });

  return (pass: GPURenderPassEncoder) => {
    pass.setPipeline(pipeline);

    pass.setVertexBuffer(0, plane.buffer);
    pass.setBindGroup(1, bindGroup);

    pass.draw(plane.vertexCount);
  };
};
