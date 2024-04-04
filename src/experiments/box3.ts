type RenderPass = {
  label?: string;

  outputAttachments: GPURenderPassColorAttachment[];
  pipelines: Pipeline[];
};

type Pipeline = {
  bindGroup: BindGroup[];
  shader: ShaderCode;

  vertexBufferLayouts: VertexBufferLayout[];

  draw: Draw[];
};

type BindGroup = {
  label?: string;
  entries: Array<BindGroupEntry>;
};

type BindGroupEntry = {
  visibility: /* typeof GPUShaderStage */ number;
  type: BindGroupEntryTypeT<unknown>;
};

type ShaderCode = {
  code: string;

  vertexFn: string;
  fragFn: string;
};

type VertexBufferLayout = Array<{
  label?: string;
  format: GPUVertexFormat;
}>;

type Draw = {
  vertexBuffers: GPUBuffer[];

  vertexCount: number;
  instanceCount?: number;
};

const renderBoxWithParams = async (
  renderPass: RenderPass,
  device: GPUDevice,
  context: GPUCanvasContext
) => {
  const {
    label,
    outputAttachments,
    bindGroup,
    shader,
    vertexBufferLayouts,
    draw,
  } = renderPass;

  // const {
  //   verticies: data,
  //   layout,
  //   vertexCount,
  //   topology = "triangle-list",
  //   label: geometryLabel,
  // } = geometry;

  // GEOMETRY
  // const geometryBuffer = device.createBuffer({
  //   label: geometryLabel,
  //   size: data.byteLength,
  //   usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  //   mappedAtCreation: true,
  // });

  // new Float32Array(geometryBuffer.getMappedRange()).set(data);
  // geometryBuffer.unmap();

  const gpuVertexBufferLayouts: GPUVertexBufferLayout[] =
    vertexBufferLayouts.map((layout) => ({
      stepMode: "vertex",

      arrayStride: layout.reduce((prev, a) => {
        return prev + vertexFormatByteLength(a.format);
      }, 0),

      attributes: layout.map((attribute, i) => {
        return {
          format: attribute.format,

          offset: layout.slice(0, i).reduce((prev, a) => {
            return prev + vertexFormatByteLength(a.format);
          }, 0),
          shaderLocation: i,
        };
      }),
    }));

  // device.queue.writeBuffer(geometryBuffer, 0, data);

  // PIPELINE
  const shaderModule = device.createShaderModule({
    code: shader.code,
  });

  const pipeline = await device.createRenderPipelineAsync({
    layout: "auto",

    vertex: {
      module: shaderModule,
      entryPoint: shader.vertexFn,
      buffers: gpuVertexBufferLayouts,
    },

    fragment: {
      module: shaderModule,
      entryPoint: shader.fragFn,
      targets: [
        {
          format: navigator.gpu.getPreferredCanvasFormat(),
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
      cullMode: "back",
    },
  });

  // RENDER PASS
  const encoder = device.createCommandEncoder();

  const pass = encoder.beginRenderPass({
    label,

    colorAttachments: outputAttachments,
  });

  pass.setPipeline(pipeline);

  draw.forEach((draw) => {
    draw.vertexBuffers.forEach((buffer, i) => {
      pass.setVertexBuffer(i, buffer);
    });

    pass.draw(draw.vertexCount, draw.instanceCount ?? 1);
  });

  pass.end();

  device.queue.submit([encoder.finish()]);
};

const FB = Float32Array.BYTES_PER_ELEMENT;
function vertexFormatByteLength(format: GPUVertexFormat): number {
  switch (format) {
    case "float32":
      return FB;
    case "float32x2":
      return FB * 2;
    case "float32x3":
      return FB * 3;
    case "float32x4":
      return FB * 4;
    case "uint32":
      return 4;
    case "sint32":
      return 4;
    default:
      throw new Error(`Unsupported format ${format}`);
  }
}
