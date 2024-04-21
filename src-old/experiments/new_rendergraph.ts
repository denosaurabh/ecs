type QueueSubmit = Array<CommandsEncoder>; // [   device.queue.submit([   encoder.finish()   ])   ]

type CommandsEncoder = {
  label?: string;
  // commands:
};

type RenderPass = {
  label?: string;

  outputAttachments: FinalOutputAttachment[];
  renderPipelines: Array<Pipeline>;
};

class EncoderCommandsKlass {
  constructor() {}

  RenderPass() {}
}

const EncoderCommands = new EncoderCommandsKlass();

// test
const render = (device: GPUDevice) => {
  const encoder = device.createCommandEncoder();

  const renderPass = encoder.beginRenderPass({
    colorAttachments,
    depthStencilAttachment,
  });
  renderPass.setPipeline(pipeline);
  renderPass.setVertexBuffer();
  renderPass.setBindGroup();
  renderPass.draw();
  renderPass.end();

  const computePass = encoder.beginComputePass();
  computePass.setPipeline();
  computePass.setBindGroup();
  computePass.dispatchWorkgroups();
  computePass.end();

  device.queue.submit([encoder.finish()]);
};

// how it look work like

const renderGraph = () => {};
