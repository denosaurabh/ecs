import { Component, CompParam, System, World } from "@ecs";
import { Mesh } from "../components";
import { render, renderer_data } from "../resources";

class PrepareMeshesKlass implements System {
  query(world: World) {
    return {
      meshes: world.query.have(Mesh),
      renderer: world.get_resource(renderer_data.name),
    };
  }

  execute(args: ReturnType<this["query"]>) {
    const { meshes, renderer } = args;
    const { device, context, format, width, height } = (
      renderer as typeof renderer_data
    ).get()!;

    if (!device || !context || !format) {
      throw new Error("no device or context");
    }

    meshes.forEach((m: Map<string, Component<CompParam<typeof Mesh>>>) => {
      const mesh = m.get(Mesh.factoryId);
      const meshData = mesh?.get()!;

      const verticesBuffer = device.createBuffer({
        size: meshData.geometry.verticies.byteLength,
        usage: meshData.geometry.usage,
        mappedAtCreation: true,
      });
      new Float32Array(verticesBuffer.getMappedRange()).set(
        meshData.geometry.verticies
      );
      verticesBuffer.unmap();

      // MATERIAL
      const pipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: {
          module: device.createShaderModule({
            code: meshData.material.vertex,
          }),
          entryPoint: meshData.material.vertexEntryPoint,
          buffers: [
            {
              arrayStride: meshData.geometry.lengthPerVertex,
              attributes: meshData.geometry.attributes.map((a, i) => ({
                shaderLocation: i,
                offset: a.offset,
                format: a.format,
              })),
            },
          ],
        },
        fragment: {
          module: device.createShaderModule({
            code: meshData.material.fragment,
          }),
          entryPoint: meshData.material.fragmentEntryPoint,
          targets: [
            {
              format,
            },
          ],
        },
        primitive: {
          topology: "triangle-list",
          cullMode: "back",
        },

        depthStencil: {
          depthWriteEnabled: true,
          depthCompare: "less",
          format: "depth24plus",
        },
      });

      const depthTexture = device.createTexture({
        size: [width, height],
        format: "depth24plus",
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
      });

      const uniformBufferSize = 4 * 16; // 4x4 matrix
      const uniformBuffer = device.createBuffer({
        size: uniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });

      const uniformBindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          {
            binding: 0,
            resource: {
              buffer: uniformBuffer,
            },
          },
        ],
      });

      const renderPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments: [
          {
            view: undefined as unknown as GPUTextureView, // ASSIGNED LATER

            clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
            loadOp: "clear",
            storeOp: "store",
          },
        ],
        depthStencilAttachment: {
          view: depthTexture.createView(),

          depthClearValue: 1.0,
          depthLoadOp: "clear",
          depthStoreOp: "store",
        },
      };

      render.set({
        renderPassDescriptor,
        uniformBindGroup,
        uniformBuffer,
        pipeline,
        verticesBuffer,
        vertexCount: meshData.geometry.verticiesCount,
      });
    });
  }
}

export const PrepareMeshes = new PrepareMeshesKlass() as unknown as System;
