// type RenderPass = {
//   geometry: Geometry;
//   material: Material;
//   // instance: Instance;
// };

// type Geometry = {
//   label?: string;

//   verticies: Float32Array;
//   vertexCount: number;

//   layout: Array<{
//     label?: string;
//     format: GPUVertexFormat;
//   }>;

//   topology?: GPUPrimitiveTopology;
// };

// type Material = {
//   shader: string;

//   vertexFn: string;
//   fragFn: string;

//   bindGroup: Array<BindGroup>;
// };

// // type Instance = {
// //   count: number;

// //   data: Float32Array;
// //   layout: Array<{
// //     label?: string;
// //     format: GPUVertexFormat;
// //   }>;
// // };

// type BindGroup = {
//   label?: string;
//   entries: Array<BindGroupEntry>;
// };

// type BindGroupEntry = {
//   visibility: /* typeof GPUShaderStage */ number;
//   type: BindGroupEntryTypeT<unknown>;
// };

// const renderBoxWithParams = async (
//   renderPass: RenderPass,
//   device: GPUDevice,
//   context: GPUCanvasContext
// ) => {
//   const { geometry, material } = renderPass;

//   const {
//     verticies: data,
//     layout,
//     vertexCount,
//     topology = "triangle-list",
//     label: geometryLabel,
//   } = geometry;

//   // GEOMETRY
//   const geometryBuffer = device.createBuffer({
//     label: geometryLabel,
//     size: data.byteLength,
//     usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
//     mappedAtCreation: true,
//   });

//   new Float32Array(geometryBuffer.getMappedRange()).set(data);
//   geometryBuffer.unmap();

//   const geometryBufferLayout: GPUVertexBufferLayout = {
//     stepMode: "vertex",

//     arrayStride: layout.reduce((prev, a) => {
//       return prev + vertexFormatByteLength(a.format);
//     }, 0),

//     attributes: layout.map((attribute, i) => {
//       return {
//         format: attribute.format,

//         offset: layout.slice(0, i).reduce((prev, a) => {
//           return prev + vertexFormatByteLength(a.format);
//         }, 0),
//         shaderLocation: i,
//       };
//     }),
//   };

//   device.queue.writeBuffer(geometryBuffer, 0, data);

//   // PIPELINE
//   const shader = device.createShaderModule({
//     code: material.shader,
//   });

//   const pipeline = await device.createRenderPipelineAsync({
//     layout: "auto",

//     vertex: {
//       module: shader,
//       entryPoint: material.vertexFn,
//       buffers: [geometryBufferLayout],
//     },

//     fragment: {
//       module: shader,
//       entryPoint: material.fragFn,
//       targets: [
//         {
//           format: navigator.gpu.getPreferredCanvasFormat(),
//         },
//       ],
//     },
//     primitive: {
//       topology,
//       cullMode: "back",
//     },
//   });

//   // RENDER PASS
//   const encoder = device.createCommandEncoder();

//   const pass = encoder.beginRenderPass({
//     colorAttachments: [
//       {
//         loadOp: "clear",
//         storeOp: "store",
//         view: context.getCurrentTexture().createView(),
//         clearValue: { r: 1.0, g: 1.0, b: 1.0, a: 1 },
//       },
//     ],
//   });

//   pass.setPipeline(pipeline);
//   pass.setVertexBuffer(0, geometryBuffer);

//   // pass.setVertexBuffer(1, instanceBuffer);
//   // pass.setBindGroup(0, bindGroup);

//   pass.draw(vertexCount, 1);
//   pass.end();

//   device.queue.submit([encoder.finish()]);
// };

// const FB = Float32Array.BYTES_PER_ELEMENT;
// function vertexFormatByteLength(format: GPUVertexFormat): number {
//   switch (format) {
//     case "float32":
//       return FB;
//     case "float32x2":
//       return FB * 2;
//     case "float32x3":
//       return FB * 3;
//     case "float32x4":
//       return FB * 4;
//     case "uint32":
//       return 4;
//     case "sint32":
//       return 4;
//     default:
//       throw new Error(`Unsupported format ${format}`);
//   }
// }
