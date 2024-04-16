// const sunDepthTexture = storage.textures.create({
//   size: [width, height],
//   format: "depth24plus",

//   depthOrArrayLayers: 1,

//   usage:
//     GPUTextureUsage.COPY_DST |
//     GPUTextureUsage.COPY_SRC |
//     GPUTextureUsage.TEXTURE_BINDING |
//     GPUTextureUsage.RENDER_ATTACHMENT,
// });

// const sunRenderTexture = storage.textures.create({
//   size: [width, height],
//   format: "bgra8unorm",

//   depthOrArrayLayers: 1,

//   usage:
//     GPUTextureUsage.COPY_DST |
//     GPUTextureUsage.COPY_SRC |
//     GPUTextureUsage.TEXTURE_BINDING |
//     GPUTextureUsage.RENDER_ATTACHMENT,
// });

/**
 * SHADOW ENCODER
 */
// const shadowEncoder = device.createCommandEncoder();
// sunCamera();

// const shadowPass = shadowEncoder.beginRenderPass({
//   colorAttachments: [
//     {
//       view: sunRenderTexture.createView(),
//       loadOp: "clear",
//       storeOp: "store",
//       clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
//     },
//   ],
//   depthStencilAttachment: {
//     view: sunDepthTexture.createView(),
//     depthLoadOp: "clear",
//     depthStoreOp: "store",
//     depthClearValue: 1.0,
//   },
// });

// renderCubes(shadowPass);
// wind(shadowPass);

// shadowPass.end();

export {};
