import { Geometry } from "./geometry";
import { Material } from "./materials";
import { StorageManager } from "./storage";
import { CreatePipelineProps } from "./storage/pipeline";
import { Transform } from "./transform";

export type MeshProps = {
  name?: string;

  geometry: Geometry;
  material: Material;

  transform: Transform;

  storage: StorageManager;

  settings?: {
    depthStencil?: CreatePipelineProps["depthStencil"];
    cullMode?: GPUCullMode;
    topology?: GPUPrimitiveTopology;
    multisample: GPUMultisampleState;
  };
};

export const Mesh = ({
  name,
  storage,
  geometry,
  material,
  transform,
  settings,
}: MeshProps) => {
  const [bindGroup, layout] = storage.bindGroups.create({
    label: name + " bind group",
    entries: [transform.getBindingEntry(storage.buffers)],
  });

  const [pipeline] = storage.pipelines.create({
    label: name + " pipeline",

    shader: material,
    vertexBufferLayouts: [geometry.layout],
    depthStencil: settings?.depthStencil || "depth24plus|less|true",

    layout: {
      bindGroups: [layout],
    },

    settings,
    multisample: settings?.multisample,
  });

  return (pass: GPURenderPassEncoder) => {
    pass.setPipeline(pipeline);

    pass.setVertexBuffer(0, geometry.buffer);
    pass.setBindGroup(1, bindGroup);

    if (geometry.indexBuffer && geometry.indexCount) {
      pass.setIndexBuffer(geometry.indexBuffer, "uint16");
      pass.drawIndexed(geometry.indexCount);
    } else {
      pass.draw(geometry.vertexCount);
    }
  };
};

/*****  TRANSLUCENT BLENDING ******* */

// {
//   format: "bgra8unorm", // Choose the appropriate color format
//   blend: {
//     color: {
//       srcFactor: "src-alpha",
//       dstFactor: "one-minus-src-alpha",
//       operation: "add",
//     },
//     alpha: {
//       srcFactor: "one",
//       dstFactor: "one-minus-src-alpha",
//       operation: "add",
//     },
//   },
//   writeMask: GPUColorWrite.ALL,
// },
