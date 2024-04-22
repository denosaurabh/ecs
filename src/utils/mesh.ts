import { Geometry, Shader, Transform } from "@core";
import { GlobalData } from "./setup";
import { RenderMode } from "./types";

export class MeshManager {
  constructor(private world: GlobalData & { format: GPUTextureFormat }) {}

  new(geometry: Geometry, material: Shader, options?: MeshOptions) {
    return new Mesh(this.world, geometry, material, options);
  }
}

const ShadowShaderCode = `
struct ProjectionView {
  projView: mat4x4f,
  invProjView: mat4x4f,
};

@group(0) @binding(0) var<uniform> pv : ProjectionView;

struct Transform {
  modelMat: mat4x4f,
  invModelMat: mat4x4f,
};

@group(1) @binding(0) var<uniform> model : Transform;

struct VertexOutput {
  @builtin(position) Position : vec4f,
}

@vertex
fn vertexMain(
  @location(0) position : vec3f,
  @location(1) normal : vec3f
) -> VertexOutput {
  var output : VertexOutput;
  output.Position = pv.projView * model.modelMat * vec4f(position, 1.0);
  return output;
}

@fragment
fn fragMain() -> @location(0) vec4<f32> {
  return vec4f(1.0);
}
`;

type MeshOptions = {
  label?: string;
  transform?: Transform;
  targets?: GPUColorTargetState[];
};

class Mesh {
  private mainPipeline: GPURenderPipeline | undefined;
  private shadowPipeline: GPURenderPipeline | undefined;

  private transformBindGroup: [GPUBindGroup, GPUBindGroupLayout] | undefined;

  constructor(
    private global: GlobalData & { format: GPUTextureFormat },
    public geometry: Geometry,
    public material: Shader,
    public options?: MeshOptions
  ) {
    const { factory, bindGroups, settings } = this.global;

    const meshBindGroups = [bindGroups.layout];

    this.transformBindGroup = options?.transform?.createBindGroup();
    if (this.transformBindGroup?.length) {
      meshBindGroups.push(this.transformBindGroup[1]);
    }

    // main pipeline
    const [pipeline] = factory.pipelines.create({
      label: options?.label,

      layout: {
        bindGroups: meshBindGroups,
      },

      shader: this.material,
      vertexBufferLayouts: [this.geometry.layout],

      depthStencil: "depth24plus|less|true",
      fragmentTargets: options?.targets
        ? options.targets
        : [
            {
              format: this.global.format,
            },
          ],

      multisample: settings.multisample,
      settings: {
        topology: "triangle-list",
        cullMode: "back",
      },
    });
    this.mainPipeline = pipeline;

    // shadow pipeline
    const shadowShader = this.global.factory.shaders.create({
      code: ShadowShaderCode,
    });

    const [shadowPipeline] = factory.pipelines.create({
      label: options?.label,

      layout: {
        bindGroups: meshBindGroups,
      },

      shader: shadowShader,
      vertexBufferLayouts: [this.geometry.layout],

      depthStencil: "depth24plus|less|true",
      fragmentTargets: [
        {
          format: this.global.format,
        },
      ],

      // multisample: settings.multisample,
      settings: {
        topology: "triangle-list",
        cullMode: "back",
      },
    });
    this.shadowPipeline = shadowPipeline;
  }

  render(pass: Omit<GPURenderPassEncoder, "end">, renderType?: RenderMode) {
    switch (renderType) {
      case RenderMode.MAIN:
        pass.setPipeline(this.mainPipeline!);
        pass.setBindGroup(0, this.global.bindGroups.main);
        break;
      case RenderMode.SHADOW:
        pass.setPipeline(this.shadowPipeline!);
        pass.setBindGroup(0, this.global.bindGroups.shadow);
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
