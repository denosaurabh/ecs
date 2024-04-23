import { Init } from "@core";
import { GlobalSetup, MeshManager, World } from "@utils";

import { RenderGraph } from "./render-graph";

export const RunEdgesAndShadowMap = async () => {
  // SETUP
  const rendererData = await Init();
  const { device, format } = rendererData;
  const globalSetup = new GlobalSetup(rendererData);
  const mesh = new MeshManager({ ...globalSetup.data, format });

  const world: World = {
    ...globalSetup.data,
    mesh,
    rendererData,
  };

  // RUN
  const renderGraph = RenderGraph(world);

  // LOOP
  let animateId = 0;
  const loop = () => {
    globalSetup.tick();

    // render
    const encoder = device.createCommandEncoder();

    renderGraph(encoder);

    device.queue.submit([encoder.finish()]);

    // end
    animateId = requestAnimationFrame(loop);
  };
  loop();

  return () => {
    cancelAnimationFrame(animateId);
  };
};
