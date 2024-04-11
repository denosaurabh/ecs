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
