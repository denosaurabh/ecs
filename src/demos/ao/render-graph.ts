import { World } from "@utils";
import { Scene } from "./scene";

import ShadowShader from "./shaders/shadow.wgsl?raw";
import DeferredShader from "./shaders/deferred.wgsl?raw";
import ShadowRenderShader from "./shaders/shadow-render.wgsl?raw";
// import CanvasShader from "./shaders/canvas.wgsl?raw";

import { BindGroupEntryType, lerp, mat4 } from "@core";

export const RenderGraph = (world: World) => {
  const {
    sun,
    factory,
    camera,

    rendererData: { device, format, size, context },
    bindGroups,
    geometry,
    transform,
  } = world;

  // commons
  const usage =
    GPUTextureUsage.RENDER_ATTACHMENT |
    GPUTextureUsage.COPY_DST |
    GPUTextureUsage.COPY_SRC |
    GPUTextureUsage.TEXTURE_BINDING;

  ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////
  // SHADOW PASS

  const shadowDepth = factory.textures.createTexture({
    size,
    format: "depth24plus",
    usage,
  });
  const shadowDepthView = shadowDepth.createView();

  ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////
  // DEFERRED PASS
  const normalRender = factory.textures.createTexture({
    size,
    format,
    usage,
  });
  const albedoRender = factory.textures.createTexture({
    size,
    format,
    usage,
  });
  // const shadowRender = factory.textures.createTexture({
  //   size,
  //   format,
  //   usage,
  // });
  // const positionRender = factory.textures.createTexture({
  //   size,
  //   format,
  //   usage,
  // });
  const posViewRender = factory.textures.createTexture({
    size,
    format,
    usage,
  });
  const normalViewRender = factory.textures.createTexture({
    size,
    format,
    usage,
  });

  const deferredDepth = factory.textures.createTexture({
    size,
    format: "depth24plus",
    usage,
  });
  const deferredDepthView = deferredDepth.createView({});

  ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////
  // SHADOWS
  // const showShadowRender = factory.textures.createTexture({
  //   size,
  //   format,
  //   usage,
  // });

  /* ******************************************************************************************************************* */
  /* ******************************************************************************************************************* */
  /* ******************************************************************************************************************* */
  /* ******************************************************************************************************************* */
  /* ******************************************************************************************************************* */
  /* ******************************************************************************************************************* */
  // Screen space ambient occlusion
  /* ******************************************************************************************************************* */
  /* ******************************************************************************************************************* */

  // Generate texNoise
  const noiseSize = 4; // Noise texture size (e.g., 4x4)
  const noiseData = new Float32Array(noiseSize * noiseSize * 4);
  for (let i = 0; i < noiseSize * noiseSize; i++) {
    // const angle = Math.random() * Math.PI * 2;
    noiseData[i * 4] = Math.random() * 2 - 1; // Math.cos(angle);
    noiseData[i * 4 + 1] = Math.random() * 2 - 1; // Math.sin(angle);
    noiseData[i * 4 + 2] = 0;
    noiseData[i * 4 + 3] = 1;
  }

  const noiseStr = Array(noiseSize * noiseSize)
    .fill(0)
    .reduce((acc, _, i) => {
      const newAcc =
        acc +
        `vec4f(${noiseData[i * 4].toFixed(3)}, ${noiseData[i * 4 + 1].toFixed(
          3
        )}, ${noiseData[i * 4 + 2].toFixed(3)}, ${noiseData[i * 4 + 3].toFixed(
          3
        )}),\n`;

      return newAcc;
    }, "");

  console.log(noiseStr);

  // const noise = new Float32Array([
  //   Math.random() * 2 - 1,
  //   Math.random() * 2 - 1,
  //   0,
  // ]);

  console.log({ noiseData });
  const noiseBuffer = factory.buffers.createUniform(noiseData, "noise");
  const [noiseBindGroup, noiseBindGroupLayout] = factory.bindGroups.create({
    label: "noise bind group",
    entries: [
      {
        type: BindGroupEntryType.buffer({
          type: "uniform",
          minBindingSize: 4 * 4 * 4,
        }),
        resource: factory.buffers.getBindingResource(noiseBuffer),
        visibility: GPUShaderStage.FRAGMENT,
      },
    ],
  });

  console.log({ noiseData });

  const texNoise = device.createTexture({
    size: [noiseSize, noiseSize],
    format,
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.COPY_SRC,
  });
  device.queue.writeTexture(
    { texture: texNoise },
    noiseData,
    // {},
    { bytesPerRow: noiseSize * 16 },
    [noiseSize, noiseSize]
  );

  // Set kernelSize and generate kernelOffsets
  const kernelSize = 16;
  const kernelOffsets = new Float32Array(kernelSize * 3);
  for (let i = 0; i < kernelSize; i++) {
    const sample = [
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random(),
    ];

    // scale sample so they cluster near origin
    const scale = i / kernelSize;
    const scaleMul = lerp(0.1, 1, scale * scale);
    sample[0] *= scaleMul; // Adjust distribution
    sample[1] *= scaleMul; // Adjust distribution
    sample[2] *= scaleMul; // Adjust distribution

    // set
    kernelOffsets.set(sample, i * 3);

    // (sample[2] = (sample[2] * 0.5 + 0.5) ** 2); // Skew distribution towards center
    // sample[2] *= Math.random() * 0.5 + 0.5; // Adjust distribution

    // kernelOffsets[i * 3] = sample[0];
    // kernelOffsets[i * 3 + 1] = sample[1];
    // kernelOffsets[i * 3 + 2] = sample[2];
  }

  const str = Array(kernelSize)
    .fill(0)
    .reduce((acc, _, i) => {
      const newAcc =
        acc +
        `vec3f(${kernelOffsets[i * 3].toFixed(3)}, ${kernelOffsets[
          i * 3 + 1
        ].toFixed(3)}, ${kernelOffsets[i * 3 + 2].toFixed(3)}),\n`;

      return newAcc;
    }, "");

  // console.log(str);

  // Set noiseScale based on screen resolution
  const noiseScale = [size.width / noiseSize, size.height / noiseSize];

  // const aoData = new Float32Array(1184 / 4);
  // aoData.set(camera.projectionView, 0);
  // aoData.set([kernelSize, 0, 0, 0], 16);
  // aoData.set(kernelOffsets, 20);
  // aoData.set(noiseScale, 212);

  const aoData = new Float32Array([
    size.width,
    size.height,

    ...camera.projectionView,
    ...camera.invProjectionView,

    // ...noiseScale,
    // kernelSize,

    // ...kernelOffsets,

    // 0,
    // 0,
    // 0,
    // 0,

    // kernelSize (1 uint32)
    // 0,
    // 0,
    // 0, // Padding

    // 0,
    // 0,
    // 0,
    // 0,

    // kernelOffsets (16 vec3) // (64 vec3)

    // noiseScale (2 floats)

    // 0,
    // 0,
    // 0,
    // 0,
    // ...Array(37).map((_) => 0),
  ]);

  console.log({ aoData, kernelOffsets });

  // const aoBuffer = factory.buffers.createUniform(aoData, "ao data");

  const projAndInvProjMat = new Float32Array(16 * 2);

  projAndInvProjMat.set(camera.projection, 0);
  projAndInvProjMat.set(mat4.inverse(camera.projection), 16);

  console.log({ projAndInvProjMat });

  const invProjectionBuffer = factory.buffers.createUniform(
    projAndInvProjMat,
    "Projection & Inverse Projection Matrix"
  );

  const [invProjectionBindGroup, invProjectionBindGroupLayout] =
    factory.bindGroups.create({
      label: "Inverse projection bind group",
      entries: [
        {
          type: BindGroupEntryType.buffer({
            type: "uniform",
            minBindingSize: 4 * 16 * 2,
          }),
          resource: factory.buffers.getBindingResource(invProjectionBuffer),
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        },
      ],
    });

  /* ******************************************************************************************************************* */
  /* ******************************************************************************************************************* */

  const transformBindGroupLayout = transform.new().bindGroupLayout;

  ///////////////////////////////////////////////////////////////
  const shadowShader = factory.shaders.create({
    label: "shadow shader",
    code: ShadowShader,
    frag: "fragMain",
    vertex: "vertexMain",
  });

  const [shadowPipeline] = factory.pipelines.create({
    label: "shadow pipeline",
    layout: {
      bindGroups: [bindGroups.layout, transformBindGroupLayout],
    },
    shader: shadowShader,
    vertexBufferLayouts: [geometry.THREED_POSITION_NORMAL_UV_LAYOUT],
    depthStencil: "depth24plus|less|true",
    fragmentTargets: [
      // {
      //   format,
      // },
    ],
    settings: {
      topology: "triangle-list",
      cullMode: "front",
    },
  });

  ///////////////////////////////////////////////////////////////
  const [deferredBindGroup, deferredBindGroupLayout] =
    factory.bindGroups.create({
      label: "deferred bind group",
      entries: [
        {
          type: BindGroupEntryType.buffer({
            type: "uniform",
            minBindingSize: 4 * 16 * 2,
          }),
          resource: factory.buffers.getBindingResource(
            sun.projViewAndInvProjViewBuffer
          ),
          visibility: GPUShaderStage.VERTEX,
        },
      ],
    });

  const [deferredShadowMapBinding, deferredShadowMapBindGroupLayout] =
    factory.bindGroups.create({
      label: "deferred shadow map bind group",
      entries: [
        {
          type: BindGroupEntryType.sampler({
            type: "comparison",
          }),
          resource: factory.textures.createSampler({
            compare: "less",
            magFilter: "linear",
            minFilter: "linear",
          }),
          visibility: GPUShaderStage.FRAGMENT,
        },
        {
          type: BindGroupEntryType.texture({
            sampleType: "depth",
          }),
          resource: shadowDepthView,
          visibility: GPUShaderStage.FRAGMENT,
        },
      ],
    });

  const deferredShader = factory.shaders.create({
    label: "deferred shader",
    code: DeferredShader,
  });

  const [deferredPipeline] = factory.pipelines.create({
    label: "deferred pipeline",
    layout: {
      bindGroups: [
        bindGroups.layout,
        transformBindGroupLayout,
        deferredBindGroupLayout,
        deferredShadowMapBindGroupLayout,
      ],
    },
    shader: deferredShader,
    vertexBufferLayouts: [geometry.THREED_POSITION_NORMAL_UV_LAYOUT],
    depthStencil: "depth24plus|less|true",
    fragmentTargets: [
      {
        format,
      },
      {
        format,
      },
      {
        format,
      },
      {
        format,
      },
    ],
    settings: {
      topology: "triangle-list",
      cullMode: "back",
    },
  });

  ///////////////////////////////////////////////////////////////
  const visibility = GPUShaderStage.FRAGMENT;

  const sampler = factory.textures.createSampler({
    minFilter: "linear",
    magFilter: "linear",
  });

  const [shadowRenderBindGroup, shadowRenderBindGroupLayout] =
    factory.bindGroups.create({
      label: "shadow render bindgroup",
      entries: [
        {
          type: BindGroupEntryType.texture({
            sampleType: "depth",
          }),
          resource: shadowDepthView,
          visibility,
        },
        {
          type: BindGroupEntryType.texture({
            sampleType: "depth",
          }),
          resource: deferredDepthView,
          visibility,
        },
        {
          type: BindGroupEntryType.sampler({}),
          resource: sampler,
          visibility,
        },
        {
          type: BindGroupEntryType.texture({}),
          resource: albedoRender.createView(),
          visibility,
        },
        {
          type: BindGroupEntryType.texture({}),
          resource: normalRender.createView(),
          visibility,
        },
        // {
        //   type: BindGroupEntryType.texture({}),
        //   resource: shadowRender.createView(),
        //   visibility,
        // },
        // {
        //   type: BindGroupEntryType.texture({}),
        //   resource: positionRender.createView(),
        //   visibility,
        // },
        {
          type: BindGroupEntryType.texture({}),
          resource: posViewRender.createView(),
          visibility,
        },
        {
          type: BindGroupEntryType.texture({}),
          resource: normalViewRender.createView(),
          visibility,
        },
        {
          type: BindGroupEntryType.texture({}),
          resource: texNoise.createView(),
          visibility,
        },
      ],
    });

  // const [aoBindGroup, aoBindGroupLayout] = factory.bindGroups.create({
  //   label: "ao bind group",
  //   entries: [
  //     {
  //       type: BindGroupEntryType.buffer({
  //         type: "uniform",
  //         // minBindingSize: 74 * 4,
  //         // minBindingSize: 4 * 70,
  //       }),
  //       resource: factory.buffers.getBindingResource(aoBuffer),
  //       visibility,
  //     },
  //   ],
  // });

  const shadowRenderGeo = geometry.POSTPROCESS_QUAD();
  const shadowRenderShader = factory.shaders.create({
    label: "shadow render shader",
    code: ShadowRenderShader,
  });

  const [shadowRenderPipeline] = factory.pipelines.create({
    label: "shadow render pipeline",
    layout: {
      bindGroups: [
        shadowRenderBindGroupLayout,
        bindGroups.layout,
        invProjectionBindGroupLayout,
        noiseBindGroupLayout,
        // aoBindGroupLayout,
      ],
    },
    shader: shadowRenderShader,
    vertexBufferLayouts: [shadowRenderGeo.layout],
    fragmentTargets: [
      {
        format,
      },
    ],
    settings: {
      topology: "triangle-list",
      cullMode: "front",
    },
  });

  ///////////////////////////////////////////////////////////////
  /*
  const canvasGeo = geometry.POSTPROCESS_QUAD();

  const canvasShader = factory.shaders.create({
    label: "canvas shader",
    code: CanvasShader,
  });

  const canvasSampler = factory.textures.createSampler({
    minFilter: "linear",
    magFilter: "linear",
  });

  const [canvasPipelineBindGroup, canvasPipelineBindGroupLayout] =
    factory.bindGroups.create({
      label: "canvas bind group",
      entries: [
        {
          type: BindGroupEntryType.sampler({}),
          resource: canvasSampler,
          visibility,
        },
        {
          type: BindGroupEntryType.texture({}),
          resource: showShadowRender.createView(),
          visibility,
        },
      ],
    });

  const [canvasPipeline] = factory.pipelines.create({
    label: "canvas pipeline",
    layout: {
      bindGroups: [canvasPipelineBindGroupLayout],
    },
    shader: canvasShader,
    vertexBufferLayouts: [canvasGeo.layout],
    fragmentTargets: [
      {
        format,
      },
    ],
    settings: {
      topology: "triangle-list",
      cullMode: "none",
    },
  });

  */

  /* ******************************************************************************************************************* */
  /* ******************************************************************************************************************* */

  const scene = Scene(world);

  /* ******************************************************************************************************************* */
  /* ******************************************************************************************************************* */

  return (encoder: GPUCommandEncoder) => {
    // WRITE BUFFERS
    factory.buffers.write(
      invProjectionBuffer,
      camera.projection as Float32Array,
      0
    );
    factory.buffers.write(
      invProjectionBuffer,
      mat4.inverse(camera.projection) as Float32Array,
      16 * 4
    );

    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    // shadow pass
    const shadowPass = encoder.beginRenderPass({
      label: "shadow pass",
      colorAttachments: [],
      depthStencilAttachment: {
        view: shadowDepthView,
        depthLoadOp: "clear",
        depthStoreOp: "store",
        depthClearValue: 1.0,
      },
    });

    shadowPass.setBindGroup(0, bindGroups.shadow);
    shadowPass.setPipeline(shadowPipeline);

    scene(shadowPass);

    shadowPass.end();

    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    // deferred pass
    const deferredPass = encoder.beginRenderPass({
      label: "deferred pass",
      colorAttachments: [
        {
          view: albedoRender.createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
        },
        {
          view: normalRender.createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
        },
        // {
        //   view: shadowRender.createView(),
        //   loadOp: "clear",
        //   storeOp: "store",
        //   clearValue: { r: 0, g: 0, b: 0, a: 1 },
        // },
        // {
        //   view: positionRender.createView(),
        //   loadOp: "clear",
        //   storeOp: "store",
        //   clearValue: { r: 0, g: 0, b: 0, a: 1 },
        // },
        {
          view: posViewRender.createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
        },
        {
          view: normalViewRender.createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
        },
      ],
      depthStencilAttachment: {
        view: deferredDepthView,
        depthLoadOp: "clear",
        depthStoreOp: "store",
        depthClearValue: 1.0,
      },
    });

    deferredPass.setBindGroup(0, bindGroups.main);

    deferredPass.setBindGroup(2, deferredBindGroup);
    deferredPass.setBindGroup(3, deferredShadowMapBinding);

    deferredPass.setPipeline(deferredPipeline);

    scene(deferredPass);

    deferredPass.end();

    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    // shadow pass
    const shadowRenderPass = encoder.beginRenderPass({
      label: "shadow render pass",
      colorAttachments: [
        {
          // view: showShadowRender.createView(),
          view: context.getCurrentTexture().createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0.9, g: 0.81, b: 0.66, a: 1 },
          // clearValue: { r: 0, g: 0, b: 0, a: 1 },
        },
      ],
    });

    shadowRenderPass.setPipeline(shadowRenderPipeline);

    shadowRenderPass.setBindGroup(0, shadowRenderBindGroup);
    shadowRenderPass.setBindGroup(1, bindGroups.main);
    shadowRenderPass.setBindGroup(2, invProjectionBindGroup);
    shadowRenderPass.setBindGroup(3, noiseBindGroup);

    shadowRenderPass.setVertexBuffer(0, shadowRenderGeo.buffer);
    shadowRenderPass.draw(shadowRenderGeo.vertexCount);

    shadowRenderPass.end();

    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    // final canvas
    // const canvasPass = encoder.beginRenderPass({
    //   label: "final canvas pass",
    //   colorAttachments: [
    //     {
    //       view: context.getCurrentTexture().createView(),
    //       loadOp: "clear",
    //       storeOp: "store",
    //       clearValue: { r: 0.9, g: 0.81, b: 0.66, a: 1 },
    //       // clearValue: { r: 0, g: 0, b: 0, a: 1 },
    //     },
    //   ],
    // });

    // canvasPass.setPipeline(canvasPipeline);
    // canvasPass.setBindGroup(0, canvasPipelineBindGroup);

    // canvasPass.setVertexBuffer(0, canvasGeo.buffer);
    // canvasPass.draw(canvasGeo.vertexCount);

    // canvasPass.end();
  };
};
