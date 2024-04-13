import { Geometry, StorageManager, Transform } from "../../core";
import { World } from "..";

class CubesFactory {
  private storage: StorageManager;

  private pipeline: GPURenderPipeline;
  private cube: Geometry;

  private boxBindGroups: GPUBindGroup[];

  constructor({
    geometry,
    material,
    storage,
    globals: { globalBindGroup },
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
        bindGroups: [globalBindGroup.layout, bindGroupLayout],
      },
      shader: mat,
      vertexBufferLayouts: [this.cube.layout],
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

  render(pass: GPURenderPassEncoder, { globals: { globalBindGroup } }: World) {
    pass.setPipeline(this.pipeline);

    pass.setVertexBuffer(0, this.cube.buffer);

    pass.setBindGroup(0, globalBindGroup.bindGroup);

    this.boxBindGroups.forEach((bindGroup) => {
      pass.setBindGroup(1, bindGroup);
      pass.draw(this.cube.vertexCount);
    });
  }
}

let cubes: CubesFactory;

export const SetupCube = (world: World) => {
  cubes = new CubesFactory(world);

  cubes.new(
    new Transform(world.storage.buffers).translate(0, 0, 0).scale(1, 1, 1)
  );
  cubes.new(
    new Transform(world.storage.buffers).translate(0, 5, 0).scale(1, 1, 1)
  );
};

export const DrawCube = (pass: GPURenderPassEncoder, world: World) => {
  // rotate
  // transform.rotateY(globalBindGroup.time.data);

  // pipeline
  // pass.setPipeline(pipeline);

  // pass.setVertexBuffer(0, cube.buffer);

  // pass.setBindGroup(0, globalBindGroup.bindGroup);
  // pass.setBindGroup(1, bindGroup);

  // pass.draw(cube.vertexCount);

  cubes.render(pass, world);
};
