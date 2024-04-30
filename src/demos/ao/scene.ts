import { World } from "@utils";

export const Scene = (world: World) => {
  const { geometry, transform } = world;

  const geo = geometry.CUBE();

  const cube = transform
    .new()
    .translate(0, 0, 0)
    .scale(1, 10, 1)
    .createBindGroup();

  const cube2 = transform
    .new()
    .translate(3, 0, -2)
    .scale(1, 6, 1)
    .createBindGroup();

  const ground = transform
    .new()
    .translate(0, 0, 0)
    .scale(10, 0.1, 10)
    .createBindGroup();

  const bigBox = transform
    .new()
    .translate(0, 0, 0)
    .scale(4, 3, 5)
    .createBindGroup();

  return (pass: GPURenderPassEncoder) => {
    // render
    pass.setVertexBuffer(0, geo.buffer);
    pass.setIndexBuffer(geo.indexBuffer!, "uint16");

    pass.setBindGroup(1, cube[0]);
    pass.drawIndexed(geo.indexCount!);

    pass.setBindGroup(1, cube2[0]);
    pass.drawIndexed(geo.indexCount!);

    pass.setBindGroup(1, ground[0]);
    pass.drawIndexed(geo.indexCount!);

    pass.setBindGroup(1, bigBox[0]);
    pass.drawIndexed(geo.indexCount!);
  };
};
