import {
  FinalDraw,
  FinalOutputAttachment,
  FinalRenderPass,
  RenderPass,
} from "@rendergraph";
import SolidColorShaderWgsl from "./shaders/materials/solid_color.wgsl?raw";

import {
  BindGroupEntryType,
  BuffersManager,
  SamplersManager,
  StorageManager,
  StorageRef,
  TexturesManager,
} from "@storage";
import { Component, component, Schedule, World } from "@ecs";

import { renderer_data } from "@3d/resources";
import { Renderer } from "@3d/systems";

import { animate } from "./utils";
import { mat4, Mat4 } from "wgpu-matrix";

import { Transform } from "@utils";

// import "./test";
const run = true;

const storage = new StorageManager();

const cubeVerticies = new Float32Array([
  // float4 position, float4 color, float2 uv,
  1, -1, 1, 1, 1, 0, 1, 1, 0, 1, -1, -1, 1, 1, 0, 0, 1, 1, 1, 1, -1, -1, -1, 1,
  0, 0, 0, 1, 1, 0, 1, -1, -1, 1, 1, 0, 0, 1, 0, 0, 1, -1, 1, 1, 1, 0, 1, 1, 0,
  1, -1, -1, -1, 1, 0, 0, 0, 1, 1, 0,

  1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, -1, 1, 1, 1, 0, 1, 1, 1, 1, 1, -1, -1, 1, 1,
  0, 0, 1, 1, 0, 1, 1, -1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1,
  -1, -1, 1, 1, 0, 0, 1, 1, 0,

  -1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, -1, 1, 1,
  1, 0, 1, 1, 0, -1, 1, -1, 1, 0, 1, 0, 1, 0, 0, -1, 1, 1, 1, 0, 1, 1, 1, 0, 1,
  1, 1, -1, 1, 1, 1, 0, 1, 1, 0,

  -1, -1, 1, 1, 0, 0, 1, 1, 0, 1, -1, 1, 1, 1, 0, 1, 1, 1, 1, 1, -1, 1, -1, 1,
  0, 1, 0, 1, 1, 0, -1, -1, -1, 1, 0, 0, 0, 1, 0, 0, -1, -1, 1, 1, 0, 0, 1, 1,
  0, 1, -1, 1, -1, 1, 0, 1, 0, 1, 1, 0,

  1, 1, 1, 1, 1, 1, 1, 1, 0, 1, -1, 1, 1, 1, 0, 1, 1, 1, 1, 1, -1, -1, 1, 1, 0,
  0, 1, 1, 1, 0, -1, -1, 1, 1, 0, 0, 1, 1, 1, 0, 1, -1, 1, 1, 1, 0, 1, 1, 0, 0,
  1, 1, 1, 1, 1, 1, 1, 1, 0, 1,

  1, -1, -1, 1, 1, 0, 0, 1, 0, 1, -1, -1, -1, 1, 0, 0, 0, 1, 1, 1, -1, 1, -1, 1,
  0, 1, 0, 1, 1, 0, 1, 1, -1, 1, 1, 1, 0, 1, 0, 0, 1, -1, -1, 1, 1, 0, 0, 1, 0,
  1, -1, 1, -1, 1, 0, 1, 0, 1, 1, 0,
]);
const boxVertexCount = 36;

const BoxVertexBuffer = storage.vertexBuffers.add({
  descriptor: {
    label: "BOX geometry",
    size: cubeVerticies.byteLength,
  },
  layout: {
    attributes: [
      {
        label: "POSITION",
        format: "float32x4",
      },
      {
        label: "COLOR",
        format: "float32x4",
      },
      {
        label: "UV",
        format: "float32x2",
      },
    ],
  },
});

const timeBuffer = storage.buffers.add({
  label: "time",
  size: 64,
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

const projectionViewBuffer = storage.buffers.add({
  label: "projectionView",
  size: 64, // mat4
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

const generalBindGroup = storage.bindGroups.add({
  label: "general bind group",
  entries: [
    {
      visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
      resource: timeBuffer,
      type: BindGroupEntryType.buffer({
        type: "uniform",
        minBindingSize: 64,
        hasDynamicOffset: false,
      }),
    },
    {
      visibility: GPUShaderStage.VERTEX,
      resource: projectionViewBuffer,
      type: BindGroupEntryType.buffer({ type: "uniform" }),
    },
    // {
    //   visibility: GPUShaderStage.VERTEX,
    //   resource: storage.samplers.add({}),
    //   type: BindGroupEntryType.sampler({}),
    // },
    // {
    //   visibility: GPUShaderStage.VERTEX,
    //   resource: storage.textures.add({
    //     size: [100, 100],
    //     usage:
    //       GPUTextureUsage.COPY_DST |
    //       GPUTextureUsage.TEXTURE_BINDING |
    //       GPUTextureUsage.RENDER_ATTACHMENT,
    //   }),
    //   type: BindGroupEntryType.texture({}),
    // },
  ],
});

const BoxTransform = new Transform().translate(0, 0, 0).scale(1, 1, 1);

const boxBindGroup = storage.bindGroups.add({
  label: "box bind group",
  entries: [
    {
      visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
      resource: BoxTransform.getStorageBuffer(storage.buffers),
      type: BindGroupEntryType.buffer({
        type: "uniform",
        minBindingSize: 64,
        hasDynamicOffset: false,
      }),
    },
  ],
});

const SolidColorShader = storage.shaders.add({
  code: SolidColorShaderWgsl,
  fragFn: "fragMain",
  vertexFn: "vertexMain",
});

/* *************************  COMPONENTS  ************************************* */

const RenderPassComponent = component<RenderPass>("RenderPass");
const FinalRenderPassComponent = component<FinalRenderPass>("FinalRenderPass");

const BoxRenderPass = RenderPassComponent({
  label: "BOX",

  outputAttachments: [],

  pipelines: [
    {
      label: "box render",

      bindGroups: [generalBindGroup, boxBindGroup],
      shader: SolidColorShader,

      vertexBufferLayouts: [BoxVertexBuffer],

      draw: [
        {
          vertexBuffers: [BoxVertexBuffer],
          vertexCount: boxVertexCount,
        },
      ],
    },
  ],
});

type OrthographicCameraProps = {
  frustumSize: number;
  near?: number;
  far?: number;

  eye: [number, number, number];
  target: [number, number, number];
  up?: [number, number, number];

  projection?: Mat4;
  view?: Mat4;
};

const OrthographicCameraComponent = component<OrthographicCameraProps>(
  "OrthofraphicCameraComponent",
  {
    near: 0.01,
    far: 1000,

    up: [0, 1, 0],

    projection: mat4.create(),
    view: mat4.create(),
  }
);

const OrthographicCamera = OrthographicCameraComponent({
  eye: [50, 50, 50],
  target: [0, 0, 0],

  frustumSize: 15,
});

/* *************************  WORLD  ************************************* */

const world = new World();

world.spawn(BoxRenderPass, OrthographicCamera);

/* *************************  RESOURCES  *********************************** */

// world.insert_resource(delta);
world.insert_resource(renderer_data);

/* *************************  SETUP  *********************************** */

const setup = new Schedule(world);

setup.add_system(Renderer);
setup.add_system(Prepare);
setup.add_system(OrthographicCameraSystemInit);
setup.add_system(WriteBuffer);

if (run) {
  await setup.run_promise();
}
/* *************************  RENDER  *********************************** */

const render = new Schedule(world);
render.add_system(UpdateTime);
render.add_system(Render);

const loop = () => {
  render.run();

  animate(loop);
};

if (run) {
  loop();
}

/* *************************  SYSTEMS  *********************************** */

function Prepare(world: World) {
  const renderPassEntities = world.query.exact(RenderPassComponent);

  const { device, context, format } = renderer_data.get()!;

  if (!device || !context || !format) {
    throw new Error("no device or context");
  }

  const finalRenderGraph: FinalRenderPass[] = [];

  let i = 0;
  for (const entity of renderPassEntities) {
    const [_id, components] = entity;
    const renderPassComp = components.get(RenderPassComponent.factoryId);

    if (!renderPassComp) {
      throw new Error("no render pass");
    }

    const renderPass: RenderPass = renderPassComp.get();

    const outputAttachments: FinalOutputAttachment[] =
      renderPass.outputAttachments.map((attachment) => ({
        texture: storage.textures.createTexture(attachment.texture, device),
        loadOp: attachment.loadOp,
        storeOp: attachment.storeOp,
        clearValue: attachment.clearValue,
      }));

    const finalRenderPass: FinalRenderPass = {
      outputAttachments,
      pipelines: [], // will be updated in loop
    };

    for (const pipeline of renderPass.pipelines) {
      const bindGroupsLayouts: GPUBindGroupLayout[] = pipeline.bindGroups.map(
        (bindGroup) => {
          return storage.bindGroups.createLayout(bindGroup, device);
        }
      );

      const pipelineLayout = device.createPipelineLayout({
        bindGroupLayouts: bindGroupsLayouts,
      });

      const shaderCode = storage.shaders.get(pipeline.shader);
      const shaderModule = storage.shaders.createShaderModule(
        pipeline.shader,
        device
      );

      const vertexBufferLayouts = pipeline.vertexBufferLayouts.map((vb) =>
        storage.vertexBuffers.getLayout(vb)
      );

      const renderPipelineDescriptor: GPURenderPipelineDescriptor = {
        label: pipeline.label,
        layout: pipelineLayout,

        vertex: {
          module: shaderModule,
          entryPoint: shaderCode.vertexFn,

          buffers: vertexBufferLayouts,
        },
        fragment: {
          module: shaderModule,
          entryPoint: shaderCode.fragFn,

          targets: [
            {
              format,
            },
          ],
        },
        primitive: {
          topology: "triangle-list",
          cullMode: "back",
        },
      };

      const gpuPipeline = device.createRenderPipeline(renderPipelineDescriptor);

      const gpuBindGroups: GPUBindGroup[] = pipeline.bindGroups.map(
        (bindGroup, i) => {
          const bindGroupVal = storage.bindGroups.get(bindGroup);

          const bindDescriptor: GPUBindGroupDescriptor = {
            layout: bindGroupsLayouts[i],
            entries: bindGroupVal.data.entries.map(
              (entry, ei) =>
                <GPUBindGroupEntry>{
                  binding: ei,
                  resource: getBindingResource(entry.resource, storage, device),
                }
            ),
          };

          return device.createBindGroup(bindDescriptor);
        }
      );

      const drawCommands: FinalDraw[] = pipeline.draw.map((d) => {
        return {
          vertexCount: d.vertexCount,
          instanceCount: d.instanceCount || 1,

          vertexBuffers: d.vertexBuffers.map((vb) =>
            storage.vertexBuffers.createBuffer(vb, device)
          ),
          bindGroups: gpuBindGroups,
        };
      });

      finalRenderPass.pipelines.push({
        pipeline: gpuPipeline,
        draw: drawCommands,
      });
    }

    finalRenderGraph.push(finalRenderPass);

    i++;
  }

  console.log("finalRenderGraph", finalRenderGraph);

  world.spawn(
    ...finalRenderGraph.map((renderPass) =>
      FinalRenderPassComponent(renderPass)
    )
  );
}

function OrthographicCameraSystemInit(world: World) {
  const finalRenderGraphs = world.query.exact(OrthographicCameraComponent);

  const { device, context, width, height } = renderer_data.get()!;

  if (!device || !context) {
    throw new Error("no device or context");
  }

  const orthoCameraEntity: Map<string, Component<any>> = finalRenderGraphs
    .values()
    .next().value;

  const cam: OrthographicCameraProps = orthoCameraEntity
    .get(OrthographicCameraComponent.factoryId)
    ?.get();

  if (!cam) {
    throw new Error("whoooeeereeee is he!!! (orthoCamera)");
  }

  const {
    frustumSize,
    projection,
    view,
    eye,
    target,
    up = [0, 1, 0],
    near = 0.001,
    far = 100,
  } = cam;

  if (!projection || !view) {
    throw new Error("no projection or view");
  }

  let aspectRatio = width / height;

  const left = (-frustumSize * aspectRatio) / 2;
  const right = (frustumSize * aspectRatio) / 2;
  const bottom = -frustumSize / 2;
  const top = frustumSize / 2;

  mat4.ortho(left, right, bottom, top, near, far, projection);
  mat4.lookAt(eye, target, up, view);

  // set
  orthoCameraEntity
    .get(OrthographicCameraComponent.factoryId)
    ?.set({ ...cam, projection, view });
}

function WriteBuffer() {
  const { device, context, format } = renderer_data.get()!;

  if (!device || !context || !format) {
    throw new Error("no device or context");
  }

  const finalRenderGraphs = world.query.exact(OrthographicCameraComponent);

  const orthoCameraEntity: Map<string, Component<any>> = finalRenderGraphs
    .values()
    .next().value;

  const cam: OrthographicCameraProps = orthoCameraEntity
    .get(OrthographicCameraComponent.factoryId)
    ?.get();

  if (!cam || !cam.projection || !cam.view) {
    throw new Error("whoooeeereeee is he!!! (orthoCamera). or projection/view");
  }

  const viewProjection = mat4.multiply(
    cam.projection,
    cam.view
  ) as Float32Array;

  storage.buffers.write(projectionViewBuffer, viewProjection, device);

  // vertexes
  storage.vertexBuffers.write(BoxVertexBuffer, cubeVerticies, device);
}

function UpdateTime() {
  const { device } = renderer_data.get()!;

  if (!device) {
    throw new Error("no device");
  }

  const updatedTime = performance.now() / 1000.0;

  storage.buffers.setData(timeBuffer, [updatedTime]);
  storage.buffers.write(
    timeBuffer,
    storage.buffers.get(timeBuffer).data,
    device
  );

  // transforms
  // const s = 1 * Math.abs(Math.sin(updatedTime) * 0.1);
  // BoxTransform.rotateX(updatedTime).writeBuffer(storage.buffers, device);
}

function Render(world: World) {
  const finalRenderGraphs = world.query.exact(FinalRenderPassComponent);

  const { device, context } = renderer_data.get()!;

  if (!device || !context) {
    throw new Error("no device or context");
  }

  const finalRenderGraphEntity: Map<string, Component<any>> = finalRenderGraphs
    .values()
    .next().value;

  const finalRenderGraph: FinalRenderPass = finalRenderGraphEntity
    .get(FinalRenderPassComponent.factoryId)
    ?.get();

  if (!finalRenderGraph) {
    throw new Error("whoooeeereeee is he!!! (finalRenderGraph)");
  }

  const encoder = device.createCommandEncoder();

  const finalColorAttachments: GPURenderPassColorAttachment[] = [
    {
      view: context.getCurrentTexture().createView(),
      loadOp: "clear",
      storeOp: "store",
      clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1 },
    },
  ];

  let i = 0;
  for (const renderPass of finalRenderGraph.pipelines) {
    const isFinalRenderPass = i === finalRenderGraphs.size - 1;

    const renderPassOutputAttachments: GPURenderPassColorAttachment[] =
      finalRenderGraph.outputAttachments.map((attachment) => ({
        view: attachment.texture.createView(),

        loadOp: attachment.loadOp,
        storeOp: attachment.storeOp,

        clearValue: attachment.clearValue || {
          r: 0.1,
          g: 0.1,
          b: 0.1,
          a: 1.0,
        },
      }));

    const pass = encoder.beginRenderPass({
      colorAttachments: isFinalRenderPass
        ? finalColorAttachments
        : renderPassOutputAttachments,
    });

    pass.setPipeline(renderPass.pipeline);

    for (const draw of renderPass.draw) {
      for (let i = 0; i < draw.vertexBuffers.length; i++) {
        pass.setVertexBuffer(i, draw.vertexBuffers[i]);
      }

      for (let i = 0; i < draw.bindGroups.length; i++) {
        pass.setBindGroup(i, draw.bindGroups[i]);
      }

      pass.draw(draw.vertexCount, draw.instanceCount);
    }

    pass.end();

    i++;
  }

  device.queue.submit([encoder.finish()]);
}

function getBindingResource(
  ref: StorageRef<string>,
  storageManager: StorageManager,
  device: GPUDevice
) {
  switch (ref.__manager) {
    case BuffersManager: {
      return <GPUBufferBinding>{
        buffer: storageManager.buffers.create(
          ref as StorageRef<typeof BuffersManager>,
          device
        ),
      };
    }
    case TexturesManager: {
      return <GPUTextureView>(
        storageManager.textures
          .createTexture(ref as StorageRef<typeof TexturesManager>, device)
          .createView()
      );
    }
    case SamplersManager: {
      return <GPUSampler>(
        storageManager.samplers.createSampler(
          ref as StorageRef<typeof SamplersManager>,
          device
        )
      );
    }

    default: {
      throw new Error("binding resource type currently not supported");
    }
  }
}
