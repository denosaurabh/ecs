import { Schedule, World } from "src/core-old/ecs";
import { renderer_data } from "src/core-old/3d/resources";
import {
  OrthographicCameraSystemInit,
  Prepare,
  Render,
  Renderer,
  WriteCameraBuffer,
  UpdateTime,
} from "src/core-old/3d/systems";
import { animate } from "./utils";
import { Transform } from "src/core-old/utils";
import {
  OrthographicCameraComponent,
  RenderPassComponent,
} from "src/core-old/3d/components";
import { GEOMETRY } from "src/core-old/3d/geometry";
import { MATERIAL } from "src/core-old/3d/materials";

/* *************************  WORLD  ************************************* */

const world = new World();

/* *************************  COMPONENTS  ************************************* */

const BoxTransform = new Transform().translate(0, 0, 0).scale(2, 2, 2);

const boxBindGroup = world.storage.bindGroups.add({
  label: "box bind group",
  entries: [BoxTransform.getBindingEntry(world.storage.buffers)],
});

const { geometryRef, vertexCount } = GEOMETRY.CUBE(world.storage);
const { materialRef } = MATERIAL.SOLID_COLOR(world.storage);

const BoxRenderPass = RenderPassComponent({
  label: "BOX",

  outputAttachments: [],

  pipelines: [
    {
      label: "box render",

      bindGroups: [generalBindGroup, boxBindGroup],
      shader: materialRef,

      vertexBufferLayouts: [geometryRef],

      draw: [
        {
          vertexBuffers: [geometryRef],
          vertexCount: vertexCount,
        },
      ],
    },
  ],
});

const OrthographicCamera = OrthographicCameraComponent({
  eye: [10, 10, 10],
  target: [0, 0, 0],

  frustumSize: 15,
});

/* *************************  WORLD  ************************************* */

world.spawn(BoxRenderPass, OrthographicCamera);

/* *************************  RESOURCES  *********************************** */

// world.insert_resource(delta);
world.insert_resource(renderer_data);

/* *************************  SETUP  *********************************** */

const setup = new Schedule(world);

setup.add_system(Renderer);
setup.add_system(Prepare);
setup.add_system(OrthographicCameraSystemInit);
setup.add_system(WriteCameraBuffer);

await setup.run_promise();

/* *************************  RENDER  *********************************** */

const render = new Schedule(world);
render.add_system(UpdateTime);
render.add_system(Render);

const loop = () => {
  render.run();

  animate(loop);
};

loop();

/* *************************  SYSTEMS  *********************************** */

// vertexes
// storage.vertexBuffers.write(BoxVertexBuffer, cubeVerticies, device);

// transforms
// BoxTransform.rotateY(updatedTime).writeBuffer(storage.buffers, device);
