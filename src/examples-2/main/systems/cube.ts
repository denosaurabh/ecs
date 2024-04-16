import { Geometry, Transform } from "../../core";
import { World } from "..";

class CubesFactory {
  private pipeline: GPURenderPipeline;
  private cube: Geometry;

  private boxBindGroups: GPUBindGroup[];

  constructor(
    private world: Pick<World, "geometry" | "materials" | "storage">
  ) {
    const { geometry, materials, storage } = world;

    this.cube = geometry.CUBE();
    const mat = materials.NORMAL_COLOR;

    const bindGroupLayout = storage.bindGroups.createLayout({
      label: "box bind group",
      entries: [Transform.bindingEntryLayout],
    });

    [this.pipeline] = storage.pipelines.create({
      label: "cube pipeline",
      layout: {
        bindGroups: [bindGroupLayout],
      },
      shader: mat,
      depthStencil: "depth24plus|less|true",
      vertexBufferLayouts: [this.cube.layout],
      settings: {
        topology: "triangle-list",
      },
    });

    this.boxBindGroups = [];
  }

  new(transform: Transform) {
    const [bindGroup] = this.world.storage.bindGroups.create({
      label: "box bind group",
      entries: [transform.getBindingEntry(this.world.storage.buffers)],
    });

    this.boxBindGroups.push(bindGroup);
  }

  render(pass: GPURenderPassEncoder) {
    pass.setPipeline(this.pipeline);
    pass.setVertexBuffer(0, this.cube.buffer);

    this.boxBindGroups.forEach((bindGroup) => {
      pass.setBindGroup(1, bindGroup);
      pass.draw(this.cube.vertexCount);
    });
  }
}

export const Cubes = (
  world: Pick<World, "geometry" | "materials" | "storage">
) => {
  const cubes = new CubesFactory(world);

  const ground = new Transform(world.storage.buffers).scale(30, 0.1, 30);
  const tall = new Transform(world.storage.buffers)
    .translate(20, 0, 0)
    .scale(1, 10, 1);
  const side = new Transform(world.storage.buffers)
    .scale(1, 1, 1)
    .translate(0, 0, 10);

  cubes.new(ground);
  cubes.new(tall);
  cubes.new(side);

  return (pass: GPURenderPassEncoder) => {
    cubes.render(pass);
  };
};
