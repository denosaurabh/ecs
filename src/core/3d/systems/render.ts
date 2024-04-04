import { System, World } from "@ecs";
import { Mesh } from "../components";
import { render, renderer_data } from "../resources";
import { mat4, vec3 } from "wgpu-matrix";

class RenderKlass implements System {
  query(world: World) {
    return {
      meshes: world.query.have(Mesh),
      renderer: world.get_resource(renderer_data.name),
    };
  }

  execute(args: ReturnType<this["query"]>) {
    const { renderer } = args;
    const { device, context, format, width, height } = (
      renderer as typeof renderer_data
    ).get()!;

    if (!device || !context || !format) {
      throw new Error("no device or context");
    }

    const {
      renderPassDescriptor,
      uniformBindGroup,
      uniformBuffer,
      pipeline,
      vertexCount,
      verticesBuffer,
    } = render.get()!;

    const aspect = width / height;
    const projectionMatrix = mat4.perspective(
      (2 * Math.PI) / 5,
      aspect,
      1,
      100.0
    );
    const modelViewProjectionMatrix = mat4.create();

    function getTransformationMatrix() {
      const viewMatrix = mat4.identity();
      mat4.translate(viewMatrix, vec3.fromValues(0, 0, -4), viewMatrix);
      const now = Date.now() / 1000;
      mat4.rotate(
        viewMatrix,
        vec3.fromValues(Math.sin(now), Math.cos(now), 0),
        1,
        viewMatrix
      );

      mat4.multiply(projectionMatrix, viewMatrix, modelViewProjectionMatrix);

      return modelViewProjectionMatrix as Float32Array;
    }

    const transformationMatrix = getTransformationMatrix();
    device.queue.writeBuffer(
      uniformBuffer,
      0,
      transformationMatrix.buffer,
      transformationMatrix.byteOffset,
      transformationMatrix.byteLength
    );

    //////////////////////// RENDER

    renderPassDescriptor.colorAttachments[0].view = context
      .getCurrentTexture()
      .createView();

    const commandEncoder = device.createCommandEncoder();
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, uniformBindGroup);
    passEncoder.setVertexBuffer(0, verticesBuffer);
    passEncoder.draw(vertexCount);

    passEncoder.end();
    device.queue.submit([commandEncoder.finish()]);
  }
}

export const Render = new RenderKlass() as unknown as System;
