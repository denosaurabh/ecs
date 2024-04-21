import {
  FinalDraw,
  FinalOutputAttachment,
  FinalRenderPass,
  RenderPass,
} from "../rendergraph";
import {
  BuffersManager,
  SamplersManager,
  StorageManager,
  StorageRef,
  TexturesManager,
} from "../storage";
import { RendererData } from "./init";

export const Prepare = (
  renderPasses: RenderPass[],
  rendererData: RendererData,
  storage: StorageManager
) => {
  const { device, format } = rendererData;

  const finalRenderGraph: FinalRenderPass[] = [];

  let i = 0;
  for (const renderPass of renderPasses) {
    const outputAttachments: FinalOutputAttachment[] =
      renderPass.outputAttachments.map((attachment) => ({
        texture: storage.textures.createTexture(attachment.texture, device),
        loadOp: attachment.loadOp,
        storeOp: attachment.storeOp,
        clearValue: attachment.clearValue,
      }));

    const finalRenderPass: FinalRenderPass = {
      outputAttachments,
      depthStencilAttachment: renderPass.depthStencilAttachment
        ? {
            ...renderPass.depthStencilAttachment,
            view: storage.textures.createTexture(
              renderPass.depthStencilAttachment.view,
              device
            ),
          }
        : undefined,
      pipelines: [], // will be updated in loop
    };

    for (const pipeline of renderPass.pipelines) {
      const bindGroupLayouts: GPUBindGroupLayout[] = pipeline.bindGroups.map(
        (bindGroup) => {
          return storage.bindGroups.createLayout(bindGroup, device);
        }
      );

      const pipelineLayout = device.createPipelineLayout({
        label: "__pipeline_layout" + pipeline.label,
        bindGroupLayouts,
      });

      const shaderCode = storage.shaders.get(pipeline.shader);
      const shaderModule = storage.shaders.createShaderModule(
        pipeline.shader,
        device
      );

      const vertexBufferLayouts = pipeline.vertexBufferLayouts.map((vb) =>
        storage.vertexBuffers.getLayout(vb)
      );

      const targets: GPUColorTargetState[] = [];

      if (pipeline.targets) {
        targets.push(...pipeline.targets);
      }

      if (!pipeline.removeDefaultTarget) {
        targets.unshift({
          format,
        });
      }

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

          targets,
        },
        primitive: {
          topology: pipeline.settings?.topology || "triangle-list",
          cullMode: pipeline.settings?.cullMode || "back",
        },

        depthStencil: pipeline.settings?.depthStencil,
      };

      const gpuPipeline = device.createRenderPipeline(renderPipelineDescriptor);

      const gpuBindGroups: GPUBindGroup[] = pipeline.bindGroups.map(
        (
          bindGroupRef
          // i
        ) => {
          const bindGroupVal = storage.bindGroups.get(bindGroupRef);

          // const bindDescriptor: GPUBindGroupDescriptor = {
          //   label: "__gpubindgroup " + bindGroupVal.data.label,
          //   layout: bindGroupLayouts[i],
          //   entries: bindGroupVal.data.entries.map(
          //     (entry, ei) =>
          //       <GPUBindGroupEntry>{
          //         binding: ei,
          //         resource: getBindingResource(entry.resource, storage, device),
          //       }
          //   ),
          // };

          return storage.bindGroups.createBindGroup(
            bindGroupRef,
            // bindDescriptor,
            bindGroupVal.data.entries.map((entry) =>
              getBindingResource(entry.resource, storage, device)
            ),
            device
          );
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
        disabled: pipeline.disabled,
        pipeline: gpuPipeline,
        draw: drawCommands,
      });
    }

    finalRenderGraph.push(finalRenderPass);

    i++;
  }

  return finalRenderGraph;
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
