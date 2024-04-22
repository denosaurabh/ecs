import { World } from "@utils";
import { Scene } from "./scene";

import ShadowShader from "./shaders/shadow.wgsl?raw";
import DeferredShader from "./shaders/deferred.wgsl?raw";
import ShadowRenderShader from "./shaders/shadow-render.wgsl?raw";
import CanvasShader from "./shaders/canvas.wgsl?raw";

import { BindGroupEntryType } from "@core";

export const RenderGraph = (world: World) => {
  const {
    sun,
    factory,

    rendererData: { format, size, context },
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
  // const shadowTarget = factory.textures.createTexture({
  //   size,
  //   format,
  //   usage,
  // });
  // const shadowTargetView = shadowTarget.createView();

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
  const deferredDepth = factory.textures.createTexture({
    size,
    format: "depth24plus",
    usage,
  });
  const deferredDepthView = deferredDepth.createView();

  ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////
  // SHADOWS
  const shadowRender = factory.textures.createTexture({
    size,
    format,
    usage,
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
    vertexBufferLayouts: [geometry.THREED_POSITION_NORMAL_LAYOUT],
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
    vertexBufferLayouts: [geometry.THREED_POSITION_NORMAL_LAYOUT],
    depthStencil: "depth24plus|less|true",
    fragmentTargets: [
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
        //   type: BindGroupEntryType.buffer({}),
        //   resource: factory.buffers.getBindingResource(
        //     transform.new().projViewAndInvProjViewBuffer
        //   ),
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
      bindGroups: [shadowRenderBindGroupLayout],
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
          resource: shadowRender.createView(),
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

  /* ******************************************************************************************************************* */
  /* ******************************************************************************************************************* */

  const scene = Scene(world);

  /* ******************************************************************************************************************* */
  /* ******************************************************************************************************************* */

  return (encoder: GPUCommandEncoder) => {
    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    // shadow pass
    const shadowPass = encoder.beginRenderPass({
      label: "shadow pass",
      colorAttachments: [
        // {
        //   view: shadowTargetView,
        //   loadOp: "clear",
        //   storeOp: "store",
        // },
      ],
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
          view: shadowRender.createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
        },
      ],
    });

    shadowRenderPass.setPipeline(shadowRenderPipeline);
    shadowRenderPass.setBindGroup(0, shadowRenderBindGroup);

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
          view: context.getCurrentTexture().createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
        },
      ],
    });

    canvasPass.setPipeline(canvasPipeline);
    canvasPass.setBindGroup(0, canvasPipelineBindGroup);

    canvasPass.setVertexBuffer(0, canvasGeo.buffer);
    canvasPass.draw(canvasGeo.vertexCount);

    canvasPass.end();
  };
};
