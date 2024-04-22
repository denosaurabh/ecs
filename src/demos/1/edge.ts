import { GlobalData } from "@utils";

import EdgeShader from "./shaders/edge.wgsl?raw";
import { BindGroupEntryType } from "@core";

export const EdgePostprocess = (
  { geometry, factory, bindGroups }: GlobalData,
  normalTexture: GPUTexture,
  albedoTexture: GPUTexture,
  depthTexture: GPUTexture
) => {
  const geo = geometry.POSTPROCESS_QUAD();
  const edgeShader = factory.shaders.create({
    code: EdgeShader,
    vertex: "vertexMain",
    frag: "fragmentMain",
  });

  const sampler = factory.textures.createSampler({
    magFilter: "linear",
    minFilter: "linear",
  });

  const sampler2 = factory.textures.createSampler({
    magFilter: "linear",
    minFilter: "linear",
  });

  const [pipelineBindGroup, bindGroupLayout] = factory.bindGroups.create({
    label: "edge bind group",
    entries: [
      {
        type: BindGroupEntryType.sampler({}),
        resource: sampler,
        visibility: GPUShaderStage.FRAGMENT,
      },
      {
        type: BindGroupEntryType.texture({}),
        resource: normalTexture.createView(),
        visibility: GPUShaderStage.FRAGMENT,
      },
      {
        type: BindGroupEntryType.texture({}),
        resource: albedoTexture.createView(),
        visibility: GPUShaderStage.FRAGMENT,
      },
      {
        type: BindGroupEntryType.texture({
          multisampled: true,
          sampleType: "depth",
        }),
        resource: depthTexture.createView(),
        visibility: GPUShaderStage.FRAGMENT,
      },
    ],
  });

  const [pipeline] = factory.pipelines.create({
    label: "edge pipeline",

    shader: edgeShader,
    vertexBufferLayouts: [geo.layout],
    fragmentTargets: [{ format: "bgra8unorm" }],
    layout: {
      bindGroups: [bindGroups.layout, bindGroupLayout],
    },
    settings: {
      topology: "triangle-strip",
      cullMode: "none",
    },
    multisample: {
      count: 4,
    },
  });

  return (pass: GPURenderPassEncoder) => {
    pass.setPipeline(pipeline);

    pass.setBindGroup(0, bindGroups.main);
    pass.setBindGroup(1, pipelineBindGroup);

    pass.setVertexBuffer(0, geo.buffer);

    pass.draw(geo.vertexCount);
  };
};

/*
export class EdgePostprocess_ {
  private readonly width: number = window.innerWidth;
  private readonly height: number = window.innerHeight;

  private pipeline: GPUComputePipeline;
  private bindGroup: GPUBindGroup;

  constructor(private world: GlobalData, texture: GPUTexture) {
    const { factory } = this.world;

    const shader = this.world.factory.shaders.create({
      code: EdgeComputeShader,
      compute: "main",
    });

    // bind groups
    // const sampler = factory.textures.createSampler({
    //   magFilter: "linear",
    //   minFilter: "linear",
    // });

    const tex = factory.textures.createTexture({
      size: { width: 1920, height: 1080 },
      // size: { width: size.width / 2, height: size.height / 2 },
      format: "rgba8unorm", // rgba8unorm
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.COPY_SRC |
        GPUTextureUsage.STORAGE_BINDING |
        GPUTextureUsage.TEXTURE_BINDING,
    });

    const [bindGroup, bindGroupLayout] = factory.bindGroups.create({
      entries: [
        // {
        //   type: BindGroupEntryType.sampler({}),
        //   resource: sampler,
        //   visibility: GPUShaderStage.COMPUTE,
        // },
        {
          type: BindGroupEntryType.storageTexture({
            format: "rgba8unorm",
            access: "write-only",
            // access: "read-write",
          }),
          //   resource: tex.createView(),
          resource: texture.createView({
            format: "rgba8unorm",
          }),
          visibility: GPUShaderStage.COMPUTE,
        },
      ],
    });

    this.bindGroup = bindGroup;

    // pipeline
    this.pipeline = factory.pipelines.createComputePipeline({
      label: "edge pipeline",
      layout: {
        bindGroups: [bindGroupLayout],
      },
      shader,
    });
  }

  private readonly workgroupCountX = Math.ceil(this.width / 8);
  private readonly workgroupCountY = Math.ceil(this.height / 8);

  render(encoder: GPUCommandEncoder) {
    const pass = encoder.beginComputePass({
      label: "edges pass",
    });

    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.bindGroup);

    pass.dispatchWorkgroups(this.workgroupCountX, this.workgroupCountY);

    pass.end();
  }
}

/*
export class EdgePipeline_ {
  private readonly timeDim = 128;
  private readonly batch = [4, 4];

  private readonly width: number = 1920;
  private readonly height: number = 1080;

  private pipeline: GPUComputePipeline;
  private bindGroup: GPUBindGroup;

  constructor(private world: GlobalData) {}

  private filterSize = 3;
  private blockDim = this.timeDim - (this.filterSize - 1);

  initialize(device: GPUDevice, texture: GPUTexture) {
    const { factory } = this.world;

    const shader = this.world.factory.shaders.create({
      code: EdgeComputeShader,
      compute: "main",
    });

    // pipeline
    this.pipeline = this.world.factory.pipelines.createComputePipeline({
      label: "edge pipeline",
      layout: "auto",
      shader,
    });

    // bind groups
    const sampler = factory.textures.createSampler({
      magFilter: "linear",
      minFilter: "linear",
    });

    const [bindGroup] = factory.bindGroups.create({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        {
          type: BindGroupEntryType.sampler({}),
          resource: sampler,
          visibility: GPUShaderStage.COMPUTE,
        },
        {
          type: BindGroupEntryType.texture({}),
          resource: texture.createView(),
          visibility: GPUShaderStage.COMPUTE,
        },
      ],
    });
    this.bindGroup = bindGroup;

    ////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////

    const buffer0 = (() => {
      const buffer = device.createBuffer({
        size: 4,
        mappedAtCreation: true,
        usage: GPUBufferUsage.UNIFORM,
      });
      new Uint32Array(buffer.getMappedRange())[0] = 0;
      buffer.unmap();
      return buffer;
    })();

    const buffer1 = (() => {
      const buffer = device.createBuffer({
        size: 4,
        mappedAtCreation: true,
        usage: GPUBufferUsage.UNIFORM,
      });
      new Uint32Array(buffer.getMappedRange())[0] = 1;
      buffer.unmap();
      return buffer;
    })();

    const textures = [0, 1].map(() => {
      return factory.textures.createTexture({
        size: {
          width: this.width,
          height: this.height,
        },
        format: "rgba8unorm",
        usage:
          GPUTextureUsage.COPY_DST |
          GPUTextureUsage.STORAGE_BINDING |
          GPUTextureUsage.TEXTURE_BINDING,
      });
    });

    this.computeBindGroup0 = device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(1),
      entries: [
        {
          binding: 1,
          resource: cubeTexture.createView(),
        },
        {
          binding: 2,
          resource: textures[0].createView(),
        },
        {
          binding: 3,
          resource: {
            buffer: buffer0,
          },
        },
      ],
    });

    this.computeBindGroup1 = device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(1),
      entries: [
        {
          binding: 1,
          resource: textures[0].createView(),
        },
        {
          binding: 2,
          resource: textures[1].createView(),
        },
        {
          binding: 3,
          resource: {
            buffer: buffer1,
          },
        },
      ],
    });

    this.computeBindGroup2 = device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(1),
      entries: [
        {
          binding: 1,
          resource: textures[1].createView(),
        },
        {
          binding: 2,
          resource: textures[0].createView(),
        },
        {
          binding: 3,
          resource: {
            buffer: buffer0,
          },
        },
      ],
    });
  }

  render(encoder: GPUCommandEncoder) {
    const pass = encoder.beginComputePass({
      label: "edges pass",
    });

    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.computeConstants);

    pass.setBindGroup(1, this.computeBindGroup0);
    pass.dispatchWorkgroups(
      Math.ceil(this.width / this.blockDim),
      Math.ceil(this.height / this.batch[1])
    );

    pass.setBindGroup(1, this.computeBindGroup1);
    pass.dispatchWorkgroups(
      Math.ceil(this.height / this.blockDim),
      Math.ceil(this.width / this.batch[1])
    );

    for (let i = 0; i < 10 - 1; ++i) {
      pass.setBindGroup(1, this.computeBindGroup2);
      pass.dispatchWorkgroups(
        Math.ceil(this.width / this.blockDim),
        Math.ceil(this.height / this.batch[1])
      );

      pass.setBindGroup(1, this.computeBindGroup1);
      pass.dispatchWorkgroups(
        Math.ceil(this.height / this.blockDim),
        Math.ceil(this.width / this.batch[1])
      );
    }

    pass.end();
  }
}

*/
