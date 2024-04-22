import { World } from "@utils";

export const Scene = (world: World) => {
  const { geometry, transform } = world;

  const geo = geometry.CUBE_WITH_NORMAL();

  const cubeTransform = transform.new().translate(0, 0, 0).createBindGroup();
  const groundTransform = transform
    .new()
    .translate(0, 0, 0)
    .scale(10, 0.1, 10)
    .createBindGroup();

  return (pass: GPURenderPassEncoder) => {
    pass.setVertexBuffer(0, geo.buffer);

    pass.setBindGroup(1, cubeTransform[0]);
    pass.draw(geo.vertexCount);

    pass.setBindGroup(1, groundTransform[0]);
    pass.draw(geo.vertexCount);
  };
};
