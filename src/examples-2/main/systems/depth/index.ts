import { BindGroupEntryType } from "../../../core";
import { World } from "../..";

import DepthShader from "./depth.wgsl?raw";

export const DisplayDepth = (
  { geometry, storage }: World,
  depthTex: GPUTexture
) => {
  const plane = geometry.PLANE();
  const material = storage.shaders.create({
    label: "depth shader",
    code: DepthShader,
    vertex: "vertexMain",
    frag: "fragMain",
  });

  // binding
  const sampler = storage.samplers.create({
    label: "depth sampler",
    magFilter: "nearest",
    minFilter: "nearest",
  });

  const [depthBindGroup, bindLayout] = storage.bindGroups.create({
    label: "depth bind group",
    entries: [
      {
        type: BindGroupEntryType.sampler({}),
        resource: sampler,
        visibility: GPUShaderStage.FRAGMENT,
      },
      {
        type: BindGroupEntryType.texture({ sampleType: "depth" }),
        resource: depthTex.createView(),
        visibility: GPUShaderStage.FRAGMENT,
      },
    ],
  });

  const [pipeline] = storage.pipelines.create({
    label: "depth pipeline",
    layout: {
      bindGroups: [
        // timeProjectionView.layout,
        bindLayout,
      ],
    },
    shader: material,
    vertexBufferLayouts: [plane.layout],
    settings: {
      cullMode: "front",
    },
    // depthStencil: "depth24plus|less|true",
  });

  return (pass: GPURenderPassEncoder) => {
    pass.setPipeline(pipeline);
    pass.setVertexBuffer(0, plane.buffer);
    pass.setBindGroup(1, depthBindGroup);
    pass.draw(plane.vertexCount);
  };
};
