const renderBox = async (device: GPUDevice, context: GPUCanvasContext) => {
  /* ***************************************************************************************************************** */
  /* *********************************************  GEOMETRY  ********************************************************* */
  /* ****************************************************************************************************************** */

  const verticies = new Float32Array();
  const vertexCount = 36;

  const boxBuffer = device.createBuffer({
    label: "box",
    size: verticies.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    // mappedAtCreation: true,
  });

  const bufferLayout: GPUVertexBufferLayout = {
    arrayStride: 24,
    attributes: [
      {
        // Position
        shaderLocation: 0,
        offset: 0,
        format: "float32x3",
      },
      {
        // Normal
        shaderLocation: 1,
        offset: 12,
        format: "float32x3",
      },
    ],
  };

  device.queue.writeBuffer(boxBuffer, 0, verticies);

  /* ****************************************************************************************************************** */
  /* *******************************************  BIND GROUP  ********************************************************* */
  /* ****************************************************************************************************************** */

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        // view & projection matrix
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: {},
      },
    ],
  });

  // view-projection matrix
  const viewProjectionMatrix = device.createBuffer({
    size: 64,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: viewProjectionMatrix,
        },
      },
    ],
  });

  /* ****************************************************************************************************************** */
  /* *********************************************  PIPELINE  ********************************************************* */
  /* ****************************************************************************************************************** */

  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout],
    label: "Scene Pipeline layout",
  });

  const sceneShader = device.createShaderModule({
    code: ``,
  });

  const pipeline = await device.createRenderPipelineAsync({
    label: "Scene Pipeline",
    layout: pipelineLayout,

    vertex: {
      module: sceneShader,
      entryPoint: "vertexMain",
      buffers: [
        bufferLayout,
        // instanceBufferLayout
      ],
    },

    fragment: {
      module: sceneShader,
      entryPoint: "fragMain",
      targets: [
        {
          format: navigator.gpu.getPreferredCanvasFormat(),
        },
      ],
    },
    primitive: {
      // topology: "triangle-list",
      topology: "triangle-list",
    },
  });

  /* ****************************************************************************************************************** */
  /* ******************************************  RENDER PASS  ********************************************************* */
  /* ****************************************************************************************************************** */

  device.queue.writeBuffer(viewProjectionMatrix, 0, new Float32Array());

  const encoder = device.createCommandEncoder();

  const pass = encoder.beginRenderPass({
    colorAttachments: [
      {
        loadOp: "clear",
        storeOp: "store",
        view: context.getCurrentTexture().createView(),
        clearValue: { r: 1.0, g: 1.0, b: 1.0, a: 1 },
      },
    ],
  });

  pass.setPipeline(pipeline);
  pass.setVertexBuffer(0, boxBuffer);
  //   pass.setVertexBuffer(1, instanceBuffer);
  pass.setBindGroup(0, bindGroup);
  pass.draw(
    vertexCount,
    1
    // instanceCount,
  );
  pass.end();

  device.queue.submit([encoder.finish()]);
};

/* ****************************************************************************************************************** */
/* **********************************************  UTILS  *********************************************************** */
/* ****************************************************************************************************************** */

type BindGroupEntryTypeT<T> = T & { __TYPE: string };

class BindGroupEntryTypeKlass {
  buffer(
    props: GPUBufferBindingLayout
  ): BindGroupEntryTypeT<GPUBufferBindingLayout> {
    return { __TYPE: "buffer", ...props };
  }

  externalTexture(
    props: GPUExternalTextureBindingLayout
  ): BindGroupEntryTypeT<GPUExternalTextureBindingLayout> {
    return { __TYPE: "externalTexture", ...props };
  }

  sampler(
    props: GPUSamplerBindingLayout
  ): BindGroupEntryTypeT<GPUSamplerBindingLayout> {
    return { __TYPE: "sampler", ...props };
  }

  storageTexture(
    props: GPUStorageTextureBindingLayout
  ): BindGroupEntryTypeT<GPUStorageTextureBindingLayout> {
    return { __TYPE: "storageTexture", ...props };
  }

  texture(
    props: GPUTextureBindingLayout
  ): BindGroupEntryTypeT<GPUTextureBindingLayout> {
    return { __TYPE: "texture", ...props };
  }
}

const BindGroupEntryType = new BindGroupEntryTypeKlass();
