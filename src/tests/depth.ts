import { mat4, vec3 } from "wgpu-matrix";

export const cubeVertexSize = 4 * 10; // Byte size of one cube vertex.
export const cubePositionOffset = 0;
export const cubeColorOffset = 4 * 4; // Byte offset of cube vertex color attribute.
export const cubeUVOffset = 4 * 8;
export const cubeVertexCount = 36;

// prettier-ignore
export const cubeVertexArray = new Float32Array([
  // float4 position, float4 color, float2 uv,
  1, -1, 1, 1,   1, 0, 1, 1,  0, 1,
  -1, -1, 1, 1,  0, 0, 1, 1,  1, 1,
  -1, -1, -1, 1, 0, 0, 0, 1,  1, 0,
  1, -1, -1, 1,  1, 0, 0, 1,  0, 0,
  1, -1, 1, 1,   1, 0, 1, 1,  0, 1,
  -1, -1, -1, 1, 0, 0, 0, 1,  1, 0,

  1, 1, 1, 1,    1, 1, 1, 1,  0, 1,
  1, -1, 1, 1,   1, 0, 1, 1,  1, 1,
  1, -1, -1, 1,  1, 0, 0, 1,  1, 0,
  1, 1, -1, 1,   1, 1, 0, 1,  0, 0,
  1, 1, 1, 1,    1, 1, 1, 1,  0, 1,
  1, -1, -1, 1,  1, 0, 0, 1,  1, 0,

  -1, 1, 1, 1,   0, 1, 1, 1,  0, 1,
  1, 1, 1, 1,    1, 1, 1, 1,  1, 1,
  1, 1, -1, 1,   1, 1, 0, 1,  1, 0,
  -1, 1, -1, 1,  0, 1, 0, 1,  0, 0,
  -1, 1, 1, 1,   0, 1, 1, 1,  0, 1,
  1, 1, -1, 1,   1, 1, 0, 1,  1, 0,

  -1, -1, 1, 1,  0, 0, 1, 1,  0, 1,
  -1, 1, 1, 1,   0, 1, 1, 1,  1, 1,
  -1, 1, -1, 1,  0, 1, 0, 1,  1, 0,
  -1, -1, -1, 1, 0, 0, 0, 1,  0, 0,
  -1, -1, 1, 1,  0, 0, 1, 1,  0, 1,
  -1, 1, -1, 1,  0, 1, 0, 1,  1, 0,

  1, 1, 1, 1,    1, 1, 1, 1,  0, 1,
  -1, 1, 1, 1,   0, 1, 1, 1,  1, 1,
  -1, -1, 1, 1,  0, 0, 1, 1,  1, 0,
  -1, -1, 1, 1,  0, 0, 1, 1,  1, 0,
  1, -1, 1, 1,   1, 0, 1, 1,  0, 0,
  1, 1, 1, 1,    1, 1, 1, 1,  0, 1,

  1, -1, -1, 1,  1, 0, 0, 1,  0, 1,
  -1, -1, -1, 1, 0, 0, 0, 1,  1, 1,
  -1, 1, -1, 1,  0, 1, 0, 1,  1, 0,
  1, 1, -1, 1,   1, 1, 0, 1,  0, 0,
  1, -1, -1, 1,  1, 0, 0, 1,  0, 1,
  -1, 1, -1, 1,  0, 1, 0, 1,  1, 0,
]);

const basicVertWGSL = `
struct Uniforms {
    modelViewProjectionMatrix : mat4x4f,
  }
  @binding(0) @group(0) var<uniform> uniforms : Uniforms;
  
  struct VertexOutput {
    @builtin(position) Position : vec4f,
    @location(0) fragUV : vec2f,
    @location(1) fragPosition: vec4f,
  }
  
  @vertex
  fn main(
    @location(0) position : vec4f,
    @location(1) uv : vec2f
  ) -> VertexOutput {
    var output : VertexOutput;
    output.Position = uniforms.modelViewProjectionMatrix * position;
    output.fragUV = uv;
    output.fragPosition = 0.5 * (position + vec4(1.0, 1.0, 1.0, 1.0));
    return output;
  }
  
`;

const vertexPositionColorWGSL = `
@fragment
fn main(
  @location(0) fragUV: vec2f,
  @location(1) fragPosition: vec4f
) -> @location(0) vec4f {
  return fragPosition;
}

`;

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();

const context = canvas.getContext("webgpu") as GPUCanvasContext;

const devicePixelRatio = window.devicePixelRatio;
canvas.width = canvas.clientWidth * devicePixelRatio;
canvas.height = canvas.clientHeight * devicePixelRatio;
const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

context.configure({
  device,
  format: presentationFormat,
  alphaMode: "premultiplied",
});

// const depthTexture = device.createTexture({
//   size: {
//     width: canvas.width,
//     height: canvas.height,
//     depthOrArrayLayers: 1,
//   },

//   format: "depth24plus",
//   usage:
//     GPUTextureUsage.COPY_DST |
//     GPUTextureUsage.TEXTURE_BINDING |
//     GPUTextureUsage.RENDER_ATTACHMENT,
// });

// Create a vertex buffer from the cube data.
const verticesBuffer = device.createBuffer({
  size: cubeVertexArray.byteLength,
  usage: GPUBufferUsage.VERTEX,
  mappedAtCreation: true,
});
new Float32Array(verticesBuffer.getMappedRange()).set(cubeVertexArray);
verticesBuffer.unmap();

const pipeline = device.createRenderPipeline({
  layout: "auto",
  vertex: {
    module: device.createShaderModule({
      code: basicVertWGSL,
    }),
    buffers: [
      {
        arrayStride: cubeVertexSize,
        attributes: [
          {
            // position
            shaderLocation: 0,
            offset: cubePositionOffset,
            format: "float32x4",
          },
          {
            // uv
            shaderLocation: 1,
            offset: cubeUVOffset,
            format: "float32x2",
          },
        ],
      },
    ],
  },
  fragment: {
    module: device.createShaderModule({
      code: vertexPositionColorWGSL,
    }),
    targets: [
      {
        format: presentationFormat,
      },
    ],
  },
  primitive: {
    topology: "triangle-list",
    cullMode: "back",
  },

  // depthStencil: {
  //   depthWriteEnabled: true,
  //   depthCompare: "less",
  //   format: "depth24plus",
  // },
});

const pipeline2 = device.createRenderPipeline({
  layout: "auto",
  vertex: {
    module: device.createShaderModule({
      code: basicVertWGSL,
    }),
    buffers: [
      {
        arrayStride: cubeVertexSize,
        attributes: [
          {
            // position
            shaderLocation: 0,
            offset: cubePositionOffset,
            format: "float32x4",
          },
          {
            // uv
            shaderLocation: 1,
            offset: cubeUVOffset,
            format: "float32x2",
          },
        ],
      },
    ],
  },
  fragment: {
    module: device.createShaderModule({
      code: vertexPositionColorWGSL,
    }),
    targets: [
      {
        format: presentationFormat,
      },
    ],
  },
  primitive: {
    topology: "triangle-list",
    cullMode: "back",
  },

  // depthStencil: {
  //   depthWriteEnabled: true,
  //   depthCompare: "less",
  //   format: "depth24plus",
  // },
});

const matrixSize = 4 * 16; // 4x4 matrix
const offset = 256; // uniformBindGroup offset must be 256-byte aligned
const uniformBufferSize = offset + matrixSize;

const uniformBuffer = device.createBuffer({
  size: uniformBufferSize,
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

const uniformBindGroup1 = device.createBindGroup({
  layout: pipeline.getBindGroupLayout(0),
  entries: [
    {
      binding: 0,
      resource: {
        buffer: uniformBuffer,
        offset: 0,
        size: matrixSize,
      },
    },
  ],
});

const uniformBindGroup2 = device.createBindGroup({
  layout: pipeline2.getBindGroupLayout(0),
  entries: [
    {
      binding: 0,
      resource: {
        buffer: uniformBuffer,
        offset: offset,
        size: matrixSize,
      },
    },
  ],
});

const renderPassDescriptor: GPURenderPassDescriptor = {
  colorAttachments: [
    {
      view: undefined, // Assigned later

      clearValue: [0.5, 0.5, 0.5, 1.0],
      loadOp: "clear",
      storeOp: "store",
    },
  ],
  // depthStencilAttachment: {
  //   view: undefined, // Assigned later

  //   depthClearValue: 1.0,
  //   depthLoadOp: "clear",
  //   depthStoreOp: "store",
  // },
};

const aspect = canvas.width / canvas.height;
const projectionMatrix = mat4.perspective((2 * Math.PI) / 5, aspect, 1, 100.0);

const modelMatrix1 = mat4.translation(vec3.create(-2, 0, 0));
const modelMatrix2 = mat4.translation(vec3.create(2, 0, 0));
const modelViewProjectionMatrix1 = mat4.create() as Float32Array;
const modelViewProjectionMatrix2 = mat4.create() as Float32Array;
const viewMatrix = mat4.translation(vec3.fromValues(0, 0, -7));

const tmpMat41 = mat4.create();
const tmpMat42 = mat4.create();

function updateTransformationMatrix() {
  const now = Date.now() / 1000;

  mat4.rotate(
    modelMatrix1,
    vec3.fromValues(Math.sin(now), Math.cos(now), 0),
    1,
    tmpMat41
  );
  mat4.rotate(
    modelMatrix2,
    vec3.fromValues(Math.cos(now), Math.sin(now), 0),
    1,
    tmpMat42
  );

  mat4.multiply(viewMatrix, tmpMat41, modelViewProjectionMatrix1);
  mat4.multiply(
    projectionMatrix,
    modelViewProjectionMatrix1,
    modelViewProjectionMatrix1
  );
  mat4.multiply(viewMatrix, tmpMat42, modelViewProjectionMatrix2);
  mat4.multiply(
    projectionMatrix,
    modelViewProjectionMatrix2,
    modelViewProjectionMatrix2
  );
}

// renderPassDescriptor.depthStencilAttachment.view = depthTexture.createView();

function frame() {
  updateTransformationMatrix();
  device.queue.writeBuffer(
    uniformBuffer,
    0,
    modelViewProjectionMatrix1.buffer,
    modelViewProjectionMatrix1.byteOffset,
    modelViewProjectionMatrix1.byteLength
  );
  device.queue.writeBuffer(
    uniformBuffer,
    offset,
    modelViewProjectionMatrix2.buffer,
    modelViewProjectionMatrix2.byteOffset,
    modelViewProjectionMatrix2.byteLength
  );

  renderPassDescriptor.colorAttachments[0].view = context
    .getCurrentTexture()
    .createView();

  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

  passEncoder.setPipeline(pipeline);
  passEncoder.setVertexBuffer(0, verticesBuffer);
  passEncoder.setBindGroup(0, uniformBindGroup1);
  passEncoder.draw(cubeVertexCount, 1);

  passEncoder.setPipeline(pipeline2);
  passEncoder.setVertexBuffer(0, verticesBuffer);
  passEncoder.setBindGroup(0, uniformBindGroup2);
  passEncoder.draw(cubeVertexCount, 1);

  passEncoder.end();

  device.queue.submit([commandEncoder.finish()]);

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
