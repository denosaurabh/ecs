import { World } from "@utils";

export const Scene = (world: World) => {
  const { geometry, transform } = world;

  const geo = geometry.CUBE();

  const cubeTransform = transform
    .new()
    .translate(0, 0, 0)
    .scale(1, 10, 1)
    .createBindGroup();

  const cube2Transform = transform
    .new()
    .translate(3, 0, -2)
    .scale(1, 6, 1)
    .createBindGroup();

  const groundTransform = transform
    .new()
    .translate(0, 0, 0)
    .scale(10, 0.1, 10)
    .createBindGroup();

  return (pass: GPURenderPassEncoder) => {
    // render
    pass.setVertexBuffer(0, geo.buffer);
    pass.setIndexBuffer(geo.indexBuffer!, "uint16");

    pass.setBindGroup(1, cubeTransform[0]);
    pass.drawIndexed(geo.indexCount!);

    pass.setBindGroup(1, cube2Transform[0]);
    pass.drawIndexed(geo.indexCount!);

    pass.setBindGroup(1, groundTransform[0]);
    pass.drawIndexed(geo.indexCount!);
  };
};
