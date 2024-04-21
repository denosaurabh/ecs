import { Geometry, Shader, Transform } from "@core";
import { GlobalData } from "./setup";

export class MeshManager {
  constructor(private world: GlobalData) {}

  new(geometry: Geometry, material: Shader) {
    return new Mesh(this.world, geometry, material);
  }
}

class Mesh {
  private transformBindGroup: [GPUBindGroup, GPUBindGroupLayout] | undefined;

  private pipeline: GPURenderPipeline | undefined;

  constructor(
    public world: GlobalData,
    public geometry: Geometry,
    public material: Shader
  ) {}

  setTransform(transform: Transform) {
    this.transformBindGroup = transform.createBindGroup();
  }

  intitialize() {
    const { factory, bindGroups, settings } = this.world;

    const meshBindGroups = [bindGroups.layout];

    if (this.transformBindGroup) {
      meshBindGroups.push(this.transformBindGroup[1]);
    }

    const [pipeline] = factory.pipelines.create({
      label: "triangle",

      layout: {
        bindGroups: meshBindGroups,
      },

      shader: this.material,
      vertexBufferLayouts: [this.geometry.layout],

      depthStencil: "depth24plus|less|true",

      multisample: settings.multisample,
      settings: {
        topology: "triangle-list",
        cullMode: "back",
      },
    });

    this.pipeline = pipeline;
  }

  render(
    pass: Omit<GPURenderPassEncoder, "end">,
    renderType?: "MAIN" | "SHADOW"
  ) {
    pass.setPipeline(this.pipeline!);

    switch (renderType) {
      case "MAIN":
        pass.setBindGroup(0, this.world.bindGroups.main);
        break;
      case "SHADOW":
        pass.setBindGroup(0, this.world.bindGroups.shadow);
        break;
      default:
        break;
    }

    if (this.transformBindGroup) {
      pass.setBindGroup(1, this.transformBindGroup[0]);
    }

    pass.setVertexBuffer(0, this.geometry.buffer);

    pass.draw(this.geometry.vertexCount!);
  }
}
