import { World } from "@utils";
import { Scene } from "./scene";

import ShadowShader from "./shaders/leaf.shadow.wgsl?raw";
import DeferredShader from "./shaders/leaf.deferred.wgsl?raw";
import ShadowRenderShader from "./shaders/leaf.render.wgsl?raw";

import { BindGroupEntryType } from "@core";

export const RenderGraph = (world: World) => {
  const {
    sun,
    factory,

    rendererData: { format, size, context },
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
  const shadowRender = factory.textures.createTexture({
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

  /* ******************************************************************************************************************* */
  /* ******************************************************************************************************************* */

  const { vertexBufferLayouts, bindGroupLayouts, render: scene } = Scene(world);

  /* ******************************************************************************************************************* */
  /* ******************************************************************************************************************* */

  ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////
  // SHADOWS

  /* ******************************************************************************************************************* */
  /* ******************************************************************************************************************* */

  ///////////////////////////////////////////////////////////////
  const shadowShader = factory.shaders.create({
    label: "shadow shader",
    code: ShadowShader,
    frag: "fragMain",
    vertex: "vertMain",
  });

  const [shadowPipeline] = factory.pipelines.create({
    label: "shadow pipeline",
    layout: {
      bindGroups: [bindGroups.layout, ...bindGroupLayouts],
    },
    shader: shadowShader,
    vertexBufferLayouts,
    depthStencil: "depth24plus|less|true",
    fragmentTargets: [],
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

        // deferredShadowMapBinding
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

        ...bindGroupLayouts,

        deferredBindGroupLayout,
        // deferredShadowMapBindGroupLayout,
      ],
    },
    shader: deferredShader,
    vertexBufferLayouts,
    depthStencil: "depth24plus|less|true",
    fragmentTargets: [
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
          resource: shadowRender.createView(),
          visibility,
        },
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
          view: shadowRender.createView(),
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

    deferredPass.setBindGroup(3, deferredBindGroup);
    // deferredPass.setBindGroup(4, deferredShadowMapBinding);

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

    shadowRenderPass.setVertexBuffer(0, shadowRenderGeo.buffer);
    shadowRenderPass.draw(shadowRenderGeo.vertexCount);

    shadowRenderPass.end();
  };
};
