import { Geometry, StorageManager, Transform } from "../../core";
import { World } from "..";

class CubesFactory {
  private storage: StorageManager;

  private pipeline: GPURenderPipeline;
  private cube: Geometry;

  private boxBindGroups: GPUBindGroup[];

  constructor({
    geometry,
    materials: material,
    storage,
    bindings: { timeProjectionView },
  }: World) {
    this.storage = storage;

    this.cube = geometry.CUBE();
    const mat = material.NORMAL_COLOR;

    const bindGroupLayout = storage.bindGroups.createLayout({
      label: "box bind group",
      entries: [Transform.bindingEntryLayout],
    });

    [this.pipeline] = storage.pipelines.create({
      label: "cube pipeline",
      layout: {
        bindGroups: [timeProjectionView.layout, bindGroupLayout],
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
    const [bindGroup] = this.storage.bindGroups.create({
      label: "box bind group",
      entries: [transform.getBindingEntry(this.storage.buffers)],
    });

    this.boxBindGroups.push(bindGroup);
  }

  render(
    pass: GPURenderPassEncoder,
    { bindings: { timeProjectionView } }: World
  ) {
    pass.setPipeline(this.pipeline);

    pass.setVertexBuffer(0, this.cube.buffer);

    pass.setBindGroup(0, timeProjectionView.bindGroup);

    this.boxBindGroups.forEach((bindGroup) => {
      pass.setBindGroup(1, bindGroup);
      pass.draw(this.cube.vertexCount);
    });
  }
}

export const Cubes = (world: World) => {
  const cubes = new CubesFactory(world);

  const ground = new Transform(world.storage.buffers).scale(10, 1, 10);

  const cube = new Transform(world.storage.buffers)
    .translate(0, 1, 0)
    .scale(1, 1, 1);

  const cube2 = new Transform(world.storage.buffers)
    .translate(5, 1, 0)
    .scale(1, 1, 1);

  const cube3 = new Transform(world.storage.buffers)
    .translate(-20, 0, 0)
    .scale(1, 1, 1);

  cubes.new(ground);
  cubes.new(cube);
  cubes.new(cube2);
  cubes.new(cube3);

  return (pass: GPURenderPassEncoder) => {
    cubes.render(pass, world);
  };
};
