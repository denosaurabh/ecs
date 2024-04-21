import { FinalRenderPassComponent } from "src/core-old/3d/components";
import { renderer_data } from "src/core-old/3d/resources";
import { Component, World } from "src/core-old/ecs";
import { FinalRenderPass } from "src/core-old/rendergraph";

export const Render = (world: World) => {
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
};
