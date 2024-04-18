import { CreateShaderReturn } from "./shaders";

export type CreatePipelineProps = {
  label?: string;

  /**
   * default - `auto`
   */
  layout?:
    | "auto"
    | {
        label?: string;
        bindGroups?: GPUBindGroupLayout[];
      };

  shader: CreateShaderReturn;
  vertexBufferLayouts: GPUVertexBufferLayout[];

  /**
   * default format - `bgra8unorm`
   */
  fragmentTargets?: {
    removeDefault?: boolean;
    targets: GPUColorTargetState[];
  };

  depthStencil?: "depth24plus|less|true";
  multisample?: GPUMultisampleState;

  settings?: {
    /**
     * default - `triangle-list`
     */
    topology?: GPUPrimitiveTopology;
    /**
     * default - `back`
     */
    cullMode?: GPUCullMode;
  };
};

export class PipelineManager {
  defaultBindGroupLayout: GPUBindGroupLayout | undefined = undefined;

  constructor(private device: GPUDevice) {}

  create(
    descriptor: CreatePipelineProps
  ): [GPURenderPipeline, GPUPipelineLayout | "auto"] {
    const {
      label,
      layout: descriptorLayout = "auto",
      shader,
      vertexBufferLayouts,
      fragmentTargets,
      depthStencil: descriptorDepthStencil,
      multisample,
      settings,
    } = descriptor;

    const [shaderModule, { vertex, frag }] = shader;

    ////// pipeline layout
    let layout: "auto" | GPUPipelineLayout = "auto";

    if (typeof descriptorLayout === "object") {
      if (!descriptorLayout.bindGroups) {
        throw new Error(
          "bindGroups are required if layout type is 'usebindgroups'"
        );
      }

      const bindGroups = [];

      if (this.defaultBindGroupLayout) {
        bindGroups.push(this.defaultBindGroupLayout);
      }

      layout = this.device.createPipelineLayout({
        label: descriptorLayout.label,
        bindGroupLayouts: [...bindGroups, ...descriptorLayout.bindGroups],
      });
    }

    ////// gpu pipeline

    // fragment targets
    const targets: GPUColorTargetState[] = [];

    if (!fragmentTargets?.removeDefault) {
      targets.push({
        format: "bgra8unorm",
      });
    }

    if (fragmentTargets) {
      targets.push(...fragmentTargets.targets);
    }

    // depth stencil
    let depthStencil: GPUDepthStencilState | undefined;

    switch (descriptorDepthStencil) {
      case "depth24plus|less|true": {
        depthStencil = {
          format: "depth24plus",
          depthWriteEnabled: true,
          depthCompare: "less",
        };
        break;
      }
      default: {
        depthStencil = undefined;
      }
    }

    const pipelineDescriptor: GPURenderPipelineDescriptor = {
      label,

      layout,

      depthStencil,

      vertex: {
        module: shaderModule,
        entryPoint: vertex,
        buffers: vertexBufferLayouts,
      },
      fragment: {
        module: shaderModule,
        entryPoint: frag,
        targets,
      },
      primitive: {
        topology: settings?.topology || "triangle-list",
        cullMode: settings?.cullMode || "back",
      },
      multisample,
    };

    const gpuPipeline = this.device.createRenderPipeline(pipelineDescriptor);

    return [gpuPipeline, layout];
  }

  public ADD_DEFAULT_BINDGROUPLAYOUT(layout: GPUBindGroupLayout) {
    console.info(
      "all new pipelines will this bind group layout at binding 0: ",
      layout.label
    );
    this.defaultBindGroupLayout = layout;
  }
}
