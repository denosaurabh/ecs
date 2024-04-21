import {
  FinalRenderPassComponent,
  RenderPassComponent,
} from "src/core-old/3d/components";
import { renderer_data } from "src/core-old/3d/resources";
import { World } from "src/core-old/ecs";
import {
  FinalDraw,
  FinalOutputAttachment,
  FinalRenderPass,
  RenderPass,
} from "src/core-old/rendergraph";
import {
  BuffersManager,
  SamplersManager,
  StorageManager,
  StorageRef,
  TexturesManager,
} from "src/core-old/storage";

export const Prepare = (world: World) => {
  const { storage } = world;

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
};

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
