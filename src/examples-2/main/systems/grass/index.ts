import { Transform } from "../../../core";
import { World } from "../..";

import GrassShader from "./grass.wgsl?raw";

export const Grass = ({ geometry, storage }: World) => {
  const geo = geometry.GRASS_BLADE();
  const mat = storage.shaders.create({
    label: "grass material",

    code: GrassShader,
    vertex: "vertexMain",
    frag: "fragMain",
  });

  // transform
  const transform = new Transform(storage.buffers)
    .translate(0, 15, 0)
    .scale(0.2, 1, 1);
  transform.writeBuffer();

  const [bindGroup, layout] = storage.bindGroups.create({
    label: "grass bind group",
    entries: [transform.getBindingEntry(storage.buffers)],
  });

  const [pipeline] = storage.pipelines.create({
    label: "grass pipeline",
    layout: {
      bindGroups: [layout],
    },
    shader: mat,
    vertexBufferLayouts: [geo.layout],
    depthStencil: "depth24plus|less|true",
    settings: {
      cullMode: "none",
    },
  });

  return (pass: GPURenderPassEncoder) => {
    pass.setPipeline(pipeline);
    pass.setBindGroup(1, bindGroup);
    pass.setVertexBuffer(0, geo.buffer);
    pass.draw(geo.vertexCount);
  };
};
