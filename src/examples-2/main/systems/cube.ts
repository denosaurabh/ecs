import { Geometry, StorageManager, Transform } from "../../core";
import { World } from "..";
import { vec2, vec3 } from "wgpu-matrix";

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

export const Cubes = (world: World) => {
  const cubes = new CubesFactory(world);

  const ground = new Transform(world.storage.buffers).scale(10, 0.1, 10);

  const cube = new Transform(world.storage.buffers)
    .translate(0, 1, 0)
    .scale(1, 1, 1);

  cubes.new(ground);
  cubes.new(cube);

  // const cameraRadiusFromCharacter = 4;
  // const cameraHeightFromCharacter = 4;

  return (pass: GPURenderPassEncoder) => {
    // // rotation
    // const angle = world.globals.globalBindGroup.time.data;

    // const x = Math.cos(angle * 2) * cameraRadiusFromCharacter;
    // const z = Math.sin(angle * 2) * cameraRadiusFromCharacter;

    // camera.translate(
    //   x + character.x(),
    //   cameraHeightFromCharacter + character.y(),
    //   z + character.z()
    // );

    // // updated character pos
    // character.translate(character.x(), character.y(), character.z() - 0.005);

    cubes.render(pass, world);
  };
};
