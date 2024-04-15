import { World } from "..";
import { Geometry } from "../../core";

let pipeline: GPURenderPipeline;
let triangle: Geometry;

export const Triangle = ({ geometry, materials: material, storage }: World) => {
  triangle = geometry.TRIANGE();
  const simpleMaterial = material.SIMPLE;

  [pipeline] = storage.pipelines.create({
    label: "triangle pipeline",
    shader: simpleMaterial,
    vertexBufferLayouts: [triangle.layout],
    depthStencil: "depth24plus|less|true",
  });

  // render
  return (pass: GPURenderPassEncoder) => {
    pass.setPipeline(pipeline);
    pass.setVertexBuffer(0, triangle.buffer);
    pass.draw(triangle.vertexCount);
  };
};
