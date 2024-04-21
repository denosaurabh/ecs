import { World } from "../..";
import RopeShader from "./rope.wgsl?raw";

export const Rope = ({
  materials,
  storage,
  bindings: { timeProjectionView },
}: World) => {
  const geometry = storage.vertexBuffers.create({
    layout: {
      attributes: [
        {
          label: "POSITION",
          format: "float32x3",
        },
      ],
    },
  });

  return (pass: GPURenderPassEncoder) => {
    // pass.setPipeline(pipeline);
    // pass.setVertexBuffer(0, geometry.buffer);
    // pass.setBindGroup(1, bindGroup);
    // if (geometry.indexBuffer && geometry.indexCount) {
    //   pass.setIndexBuffer(geometry.indexBuffer, "uint16");
    //   pass.drawIndexed(geometry.indexCount, 1, 0, 0, 0);
    // } else {
    //   pass.draw(geometry.vertexCount, 1, 0, 0);
    // }
  };
};
