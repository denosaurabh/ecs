import { Geometry } from "./geometry";
import { Material } from "./materials";
import { StorageManager } from "./storage";
import { CreatePipelineProps } from "./storage/pipeline";
import { Transform } from "./transform";

type MeshProps = {
  name?: string;

  geometry: Geometry;
  material: Material;

  transform: Transform;

  storage: StorageManager;

  settings?: {
    depthStencil?: CreatePipelineProps["depthStencil"];
    cullMode?: GPUCullMode;
    topology?: GPUPrimitiveTopology;
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
  });

  return (pass: GPURenderPassEncoder) => {
    pass.setPipeline(pipeline);

    pass.setVertexBuffer(0, geometry.buffer);
    pass.setBindGroup(1, bindGroup);

    pass.draw(geometry.vertexCount);
  };
};
