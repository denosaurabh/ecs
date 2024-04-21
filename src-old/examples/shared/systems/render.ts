import { FinalRenderPass } from "../rendergraph";
import { RendererData } from "./init";

export const Render = (
  renderGraph: FinalRenderPass[],
  rendererData: RendererData
) => {
  const { device, context } = rendererData;

  const encoder = device.createCommandEncoder();

  const finalColorAttachments: GPURenderPassColorAttachment[] = [
    {
      view: context.getCurrentTexture().createView(),
      loadOp: "clear",
      storeOp: "store",
      clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 },
    },
  ];

  let renderPassIndex = 0;
  for (const renderPass of renderGraph) {
    let pipelineIndex = 0;

    const isFinalRenderPass = renderPassIndex === renderGraph.length - 1;

    const renderPassOutputAttachments: GPURenderPassColorAttachment[] =
      renderPass.outputAttachments.map((attachment) => ({
        view: attachment.texture.createView(),

        loadOp: attachment.loadOp,
        storeOp: attachment.storeOp,

        clearValue: attachment.clearValue,
      }));

    const depthStencilAttachment:
      | GPURenderPassDepthStencilAttachment
      | undefined = renderPass.depthStencilAttachment
      ? {
          ...renderPass.depthStencilAttachment,
          view: renderPass.depthStencilAttachment.view.createView({
            format: "depth24plus",
            dimension: "2d",
            aspect: "all",
            arrayLayerCount: 1,
            label: "depth stencil view",
          }),
        }
      : undefined;

    const colorAttachments =
      isFinalRenderPass && renderPassOutputAttachments.length === 0
        ? finalColorAttachments
        : renderPassOutputAttachments;

    const pass = encoder.beginRenderPass({
      colorAttachments,
      depthStencilAttachment,
    });

    for (const renderPipeline of renderPass.pipelines) {
      // const isFinalPipeline =
      //   pipelineIndex === renderPass.pipelines.length - 1 &&
      //   renderPassIndex === renderGraph.length - 1;

      if (renderPipeline.disabled) {
        pipelineIndex++;
        continue;
      }

      pass.setPipeline(renderPipeline.pipeline);

      for (const draw of renderPipeline.draw) {
        for (let i = 0; i < draw.vertexBuffers.length; i++) {
          pass.setVertexBuffer(i, draw.vertexBuffers[i]);
        }

        for (let i = 0; i < draw.bindGroups.length; i++) {
          pass.setBindGroup(i, draw.bindGroups[i]);
        }

        pass.draw(draw.vertexCount, draw.instanceCount);
      }

      pipelineIndex++;
    }

    pass.end();

    renderPassIndex++;
  }

  device.queue.submit([encoder.finish()]);
};
