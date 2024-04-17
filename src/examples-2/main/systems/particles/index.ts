import { World } from "../..";
import { BindGroupEntryType } from "../../../core";

import ParticlesRenderShader from "./particles.render.wgsl?raw";
import ParticlesComputeShader from "./particles.compute.wgsl?raw";
import { mat4, vec3 } from "wgpu-matrix";

export const Particles = ({
  geometry,
  storage,
  buffers: { activeProjectionView },
  bindings: { timeProjectionView },
  renderer: { device, context },
}: World) => {
  const NUM = 150,
    MAX = 300;

  /*


    SHARED BUFFERS



    */

  const inputBuffer = device.createBuffer({
    label: "GPUBuffer store input vars",
    size: 7 * 4, // float32 * 7
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  const modelBuffer = device.createBuffer({
    label: "GPUBuffer store MAX model matrix",
    size: 4 * 4 * 4 * MAX, // mat4x4 x float32 x MAX
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  //   const projectionBuffer = device.createBuffer({
  //     label: "GPUBuffer store camera projection",
  //     size: 4 * 4 * 4, // mat4x4 x float32
  //     usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  //   });
  const mvpBuffer = device.createBuffer({
    label: "GPUBuffer store MAX MVP",
    size: 4 * 4 * 4 * MAX, // mat4x4 x float32 x MAX
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  const velocityBuffer = device.createBuffer({
    label: "GPUBuffer store MAX velocity",
    size: 4 * 4 * MAX, // 4 position x float32 x MAX
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  /*

    PARTICLES RENDER PIPELINE

    */
  const quad = geometry.PLANE();
  const particleRenderMat = storage.shaders.create({
    code: ParticlesRenderShader,
  });

  const [particlesRenderBindGroup, particlesRenderBindGroupLayout] =
    storage.bindGroups.create({
      label: "particles bind group layout",
      entries: [
        {
          type: BindGroupEntryType.buffer({
            type: "read-only-storage",
          }),
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          resource: storage.buffers.getBindingResource(mvpBuffer),
        },
      ],
    });

  const [pipeline] = storage.pipelines.create({
    label: "particles pipeline",
    layout: {
      bindGroups: [particlesRenderBindGroupLayout],
    },
    shader: particleRenderMat,
    vertexBufferLayouts: [quad.layout],
    // depthStencil: "depth24plus|less|true",
    settings: {
      topology: "triangle-list",
      cullMode: "none",
    },
  });

  /*


  PARTICLES COMPUTE PIPELINE



  */

  const [particleComputeShader, { compute }] = storage.shaders.create({
    code: ParticlesComputeShader,
    compute: "computeMain",
  });

  const computePipeline = device.createComputePipeline({
    layout: "auto",
    compute: {
      module: particleComputeShader,
      entryPoint: compute,
    },
  });

  // create bindGroup for computePass
  const computeBindGroup = device.createBindGroup({
    label: "Particles computePass bindgroup",
    layout: computePipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: inputBuffer,
        },
      },
      {
        binding: 1,
        resource: {
          buffer: velocityBuffer,
        },
      },
      {
        binding: 2,
        resource: {
          buffer: modelBuffer,
        },
      },
      //   {
      //     binding: 3,
      //     resource: {
      //       buffer: projectionBuffer,
      //     },
      //   },
      {
        binding: 3,
        resource: {
          buffer: mvpBuffer,
        },
      },
      {
        binding: 4,
        resource: {
          buffer: activeProjectionView,
        },
      },
    ],
  });

  /*



  DATA


  */

  //   const inputArray = new Float32Array([NUM, -500, 500, -250, 250, -500, 500]); // count, xmin/max, ymin/max, zmin/max
  const inputArray = new Float32Array([NUM, 70, 120, -50, 50, -50, 50]); // count, xmin/max, ymin/max, zmin/max
  const modelArray = new Float32Array(MAX * 4 * 4);
  const velocityArray = new Float32Array(MAX * 4);
  for (let i = 0; i < MAX; i++) {
    // const x = Math.random() * 1000 - 500;
    // const y = Math.random() * 500 - 250;
    // const z = Math.random() * 1000 - 500;
    const x = Math.random() * 100 - 50;
    const y = Math.random() * 100 - 50;
    const z = Math.random() * 100 - 50;

    const modelMatrix = getModelMatrix(
      { x, y, z },
      { x: Math.PI / 2, y: 0, z: 0 },
      { x: 0.2, y: 0.2, z: 0.2 }
    );
    modelArray.set(modelMatrix, i * 4 * 4);

    velocityArray[i * 4 + 0] = Math.random() - 0.5; // x
    velocityArray[i * 4 + 1] = Math.random() - 0.5; // y
    velocityArray[i * 4 + 2] = Math.random() - 0.5; // z
    velocityArray[i * 4 + 3] = 1; // w
  }
  device.queue.writeBuffer(velocityBuffer, 0, velocityArray);
  device.queue.writeBuffer(modelBuffer, 0, modelArray);
  device.queue.writeBuffer(inputBuffer, 0, inputArray);

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /*
  const inputArray = new Float32Array([NUM, -500, 500, -250, 250, -500, 500]); // count, xmin/max, ymin/max, zmin/max
  //   const inputArray = new Float32Array([NUM, -500, 500, -250, 250, -500, 500]); // count, xmin/max, ymin/max, zmin/max

  //   const modelArray = new Float32Array(MAX * 4 * 4);
  const positionArray = new Float32Array(MAX * 3);
  for (let i = 0; i < MAX; i++) {
    // const x = Math.random() * 1000 - 500;
    // const y = Math.random() * 500 - 250;
    // const z = Math.random() * 1000 - 500;
    // const modelMatrix = getModelViewMatrix(
    //   { x, y, z },
    //   { x: 0, y: 0, z: 0 },
    //   { x: 2, y: 2, z: 2 }
    // );
    // modelArray.set(modelMatrix, i * 4 * 4);

    positionArray[i * 3 + 0] = Math.random() * 2 - 1; // x
    positionArray[i * 3 + 1] = Math.random() * 2 - 1; // y
    positionArray[i * 3 + 2] = Math.random() * 2 - 1; // z
    // positionArray[i * 4 + 3] = 1; // w
  }
  device.queue.writeBuffer(inputBuffer, 0, inputArray);
  device.queue.writeBuffer(positionBuffer, 0, positionArray);
  // device.queue.writeBuffer(pipelineObj.modelBuffer, 0, modelArray);
  */

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (encoder: GPUCommandEncoder) => {
    const computePass = encoder.beginComputePass();

    computePass.setPipeline(computePipeline);
    computePass.setBindGroup(0, computeBindGroup);
    computePass.dispatchWorkgroups(Math.ceil(NUM / 128));
    computePass.end();

    const renderPass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          loadOp: "load",
          storeOp: "store",
        },
      ],
      //   depthStencilAttachment: {
      //     view: pipelineObj.depthView,
      //     depthClearValue: 1.0,
      //     depthLoadOp: "clear",
      //     depthStoreOp: "store",
      //   },
    });
    renderPass.setPipeline(pipeline);
    renderPass.setVertexBuffer(0, quad.buffer);
    // passEncoder.setIndexBuffer(indexBuffer, "uint16");
    renderPass.setBindGroup(0, timeProjectionView.bindGroup);
    renderPass.setBindGroup(1, particlesRenderBindGroup);

    renderPass.draw(quad.vertexCount, NUM);
    // passEncoder.drawIndexed(quad.indexCount, NUM);
    renderPass.end();
  };
};

function getModelMatrix(
  position = { x: 0, y: 0, z: 0 },
  rotation = { x: 0, y: 0, z: 0 },
  scale = { x: 1, y: 1, z: 1 }
) {
  // get modelView Matrix
  const modelMatrix = mat4.identity();
  // translate position
  mat4.translate(
    modelMatrix,
    vec3.fromValues(position.x, position.y, position.z),
    modelMatrix
  );
  // rotate
  mat4.rotateX(modelMatrix, rotation.x, modelMatrix);
  mat4.rotateY(modelMatrix, rotation.y, modelMatrix);
  mat4.rotateZ(modelMatrix, rotation.z, modelMatrix);
  // scale
  mat4.scale(
    modelMatrix,
    vec3.fromValues(scale.x, scale.y, scale.z),
    modelMatrix
  );

  // return matrix as Float32Array
  return modelMatrix as Float32Array;
}
