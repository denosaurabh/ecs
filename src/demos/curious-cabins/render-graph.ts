import { World } from "@utils";
import { Scene } from "./scene";

import ShadowShader from "./shaders/shadow.wgsl?raw";
import DeferredShader from "./shaders/deferred.wgsl?raw";
import ShadowRenderShader from "./shaders/shadow-render.wgsl?raw";
import CanvasShader from "./shaders/canvas.wgsl?raw";

import { BindGroupEntryType } from "@core";
import { LUT } from "./lut";
import { ATLAS } from "./atlas";

export const RenderGraph = async (world: World) => {
  const {
    sun,
    factory,

    rendererData: { device, format, size, context },
    bindGroups,
    geometry,
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
  const normalRenderView = normalRender.createView();
  const albedoRender = factory.textures.createTexture({
    size,
    format,
    usage,
  });
  const albedoRenderView = albedoRender.createView();
  const shadowRender = factory.textures.createTexture({
    size,
    format,
    usage,
  });
  const shadowRenderView = shadowRender.createView();
  const surfaceIdRender = factory.textures.createTexture({
    size,
    format,
    usage,
  });
  const surfaceIdRenderView = surfaceIdRender.createView();
  // const viewNormalRender = factory.textures.createTexture({
  //   size,
  //   format,
  //   usage,
  // });
  // const viewNormalRenderView = viewNormalRender.createView();

  const deferredDepth = factory.textures.createTexture({
    size,
    format: "depth24plus",
    usage,
  });
  const deferredDepthView = deferredDepth.createView();

  ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////
  // SHADOWS
  const showShadowRender = factory.textures.createTexture({
    size,
    format,
    usage,
  });

  /* ******************************************************************************************************************* */
  /* ******************************************************************************************************************* */

  const lut = await LUT(device);
  const atlas = await ATLAS(device);

  /* ******************************************************************************************************************* */
  /* ******************************************************************************************************************* */

  const { render: renderScene, vertexBufferLayouts: sceneVertexBufferLayouts } =
    Scene(world);

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
      bindGroups: [bindGroups.layout],
    },
    shader: shadowShader,
    vertexBufferLayouts: sceneVertexBufferLayouts,
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
        {
          type: BindGroupEntryType.sampler({}),
          resource: atlas.sampler,
          visibility: GPUShaderStage.FRAGMENT,
        },
        {
          type: BindGroupEntryType.texture({}),
          resource: atlas.view,
          visibility: GPUShaderStage.FRAGMENT,
        },
      ],
    });

  // const [deferredShadowMapBinding, deferredShadowMapBindGroupLayout] =
  //   factory.bindGroups.create({
  //     label: "deferred shadow map bind group",
  //     entries: [
  //       {
  //         type: BindGroupEntryType.sampler({
  //           type: "comparison",
  //         }),
  //         resource: factory.textures.createSampler({
  //           compare: "less",
  //           magFilter: "linear",
  //           minFilter: "linear",
  //         }),
  //         visibility: GPUShaderStage.FRAGMENT,
  //       },
  //       {
  //         type: BindGroupEntryType.texture({
  //           sampleType: "depth",
  //         }),
  //         resource: shadowDepthView,
  //         visibility: GPUShaderStage.FRAGMENT,
  //       },
  //     ],
  //   });

  const deferredShader = factory.shaders.create({
    label: "deferred shader",
    code: DeferredShader,
  });

  const [deferredPipeline] = factory.pipelines.create({
    label: "deferred pipeline",
    layout: {
      bindGroups: [
        bindGroups.layout,
        deferredBindGroupLayout,
        // deferredShadowMapBindGroupLayout,
      ],
    },
    shader: deferredShader,
    vertexBufferLayouts: sceneVertexBufferLayouts,
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
      // {
      //   format,
      // },
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
          resource: albedoRenderView,
          visibility,
        },
        {
          type: BindGroupEntryType.texture({}),
          resource: normalRenderView,
          visibility,
        },
        {
          type: BindGroupEntryType.texture({}),
          resource: shadowRenderView,
          visibility,
        },
        {
          type: BindGroupEntryType.texture({}),
          resource: surfaceIdRenderView,
          visibility,
        },
        // {
        //   type: BindGroupEntryType.texture({}),
        //   resource: viewNormalRenderView,
        //   visibility,
        // },
      ],
    });

  const shadowRenderGeo = geometry.POSTPROCESS_QUAD();
  const shadowRenderShader = factory.shaders.create({
    label: "shadow render shader",
    code: ShadowRenderShader,
  });

  const [shadowRenderPipeline] = factory.pipelines.create({
    label: "shadow render pipeline",
    layout: {
      bindGroups: [bindGroups.layout, shadowRenderBindGroupLayout],
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
      cullMode: "none",
    },
  });

  ///////////////////////////////////////////////////////////////
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
        {
          type: BindGroupEntryType.sampler({}),
          resource: lut.sampler,
          visibility,
        },
        {
          type: BindGroupEntryType.texture({
            viewDimension: "3d",
          }),
          resource: lut.texture.createView(),
          visibility,
        },
      ],
    });

  const [canvasPipeline] = factory.pipelines.create({
    label: "canvas pipeline",
    layout: {
      bindGroups: [canvasPipelineBindGroupLayout, bindGroups.layout],
    },
    shader: canvasShader,
    vertexBufferLayouts: [canvasGeo.layout],
    fragmentTargets: [
      {
        format,
      },
    ],
    multisample: {
      count: 4,
    },
    settings: {
      topology: "triangle-list",
      cullMode: "none",
    },
  });

  const canvasMultisampleRender = factory.textures.createTexture({
    size,
    format,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
    sampleCount: 4,
  });
  const canvasMultisampleRenderView = canvasMultisampleRender.createView();

  /* ******************************************************************************************************************* */
  /* ******************************************************************************************************************* */

  return (encoder: GPUCommandEncoder) => {
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

    renderScene(shadowPass);

    shadowPass.end();

    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    // deferred pass
    const deferredPass = encoder.beginRenderPass({
      label: "deferred pass",

      colorAttachments: [
        {
          view: albedoRenderView,
          loadOp: "clear",
          storeOp: "store",
          // clearValue: { r: 0, g: 0, b: 0, a: 1 },
          clearValue: { r: 0.99, g: 0.85, b: 0.86, a: 1 },
        },
        {
          view: normalRenderView,
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
        },
        {
          view: shadowRenderView,
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
        },
        {
          view: surfaceIdRenderView,
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
        },
        // {
        //   view: viewNormalRenderView,
        //   loadOp: "clear",
        //   storeOp: "store",
        //   clearValue: { r: 0, g: 0, b: 0, a: 1 },
        // },
      ],
      depthStencilAttachment: {
        view: deferredDepthView,
        depthLoadOp: "clear",
        depthStoreOp: "store",
        depthClearValue: 1.0,
      },
    });

    deferredPass.setBindGroup(0, bindGroups.main);
    deferredPass.setBindGroup(1, deferredBindGroup);
    // deferredPass.setBindGroup(2, deferredShadowMapBinding);

    deferredPass.setPipeline(deferredPipeline);

    renderScene(deferredPass);

    deferredPass.end();

    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    // shadow pass
    const shadowRenderPass = encoder.beginRenderPass({
      label: "shadow render pass",
      colorAttachments: [
        {
          view: showShadowRender.createView(),
          loadOp: "clear",
          storeOp: "store",
          // clearValue: { r: 0.9, g: 0.81, b: 0.66, a: 1 },
          clearValue: { r: 0.99, g: 0.85, b: 0.86, a: 1 },
          // clearValue: { r: 0, g: 0, b: 0, a: 1 },
        },
      ],
    });

    shadowRenderPass.setPipeline(shadowRenderPipeline);

    shadowRenderPass.setBindGroup(0, bindGroups.main);
    shadowRenderPass.setBindGroup(1, shadowRenderBindGroup);

    shadowRenderPass.setVertexBuffer(0, shadowRenderGeo.buffer);
    shadowRenderPass.draw(shadowRenderGeo.vertexCount);

    shadowRenderPass.end();

    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    // final canvas
    const canvasPass = encoder.beginRenderPass({
      label: "final canvas pass",
      colorAttachments: [
        {
          // view: context.getCurrentTexture().createView(),
          view: canvasMultisampleRenderView,
          resolveTarget: context.getCurrentTexture().createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0.99, g: 0.85, b: 0.86, a: 1 },
          // rgba(99.581%, 85.36%, 86.503%)
          // clearValue: { r: 0, g: 0, b: 0, a: 1 },
        },
      ],
    });

    canvasPass.setPipeline(canvasPipeline);

    canvasPass.setBindGroup(0, canvasPipelineBindGroup);
    canvasPass.setBindGroup(1, bindGroups.main);

    canvasPass.setVertexBuffer(0, canvasGeo.buffer);
    canvasPass.draw(canvasGeo.vertexCount);

    canvasPass.end();
  };
};
