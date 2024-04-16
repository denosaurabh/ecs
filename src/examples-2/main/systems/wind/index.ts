import { Transform } from "../../../core/transform";
import { World } from "../..";

import WindShader from "./wind.wgsl?raw";

export const Wind = ({
  storage,
  geometry,
}: Pick<World, "storage" | "geometry">) => {
  const plane = geometry.PLANE();
  const material = storage.shaders.create({
    code: WindShader,
    vertex: "vertexMain",
    frag: "fragMain",
  });

  // transform
  const transform = new Transform(storage.buffers)
    .translate(-30, 4, 0)
    .scale(10, 10, 10)
    .rotateX(-Math.PI / 2);
  transform.writeBuffer();

  const [bindGroup, layout] = storage.bindGroups.create({
    label: "box bind group",
    entries: [transform.getBindingEntry(storage.buffers)],
  });

  const [pipeline] = storage.pipelines.create({
    label: "wind pipeline",

    shader: material,
    vertexBufferLayouts: [plane.layout],
    depthStencil: "depth24plus|less|true",

    layout: {
      bindGroups: [layout],
    },

    settings: {
      cullMode: "front",
    },
  });

  return (pass: GPURenderPassEncoder) => {
    pass.setPipeline(pipeline);

    pass.setVertexBuffer(0, plane.buffer);
    pass.setBindGroup(1, bindGroup);

    pass.draw(plane.vertexCount);
  };
};
