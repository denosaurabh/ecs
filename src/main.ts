import "./style.css";

import { Schedule, World, resource } from "@ecs";
import { Camera3D, GEOMETRY, MATERIAL, Mesh, PrepareMeshes } from "@3d";

const world = new World();

world.spawn(
  [
    Camera3D({
      type: "ORTHOGRAPHIC",

      target: [0, 0, 0],
      translation: [50, 50, 50],
    }),
  ],
  Mesh({
    geometry: GEOMETRY.BOX,
    material: MATERIAL.SOLID_COLOR({ r: 1, g: 0, b: 0 }),
  })
);

// resources
const time = resource({ delta: 0 });
world.insert_resource(time);

// schedule
const initSchedule = new Schedule(world);

// all meshes
initSchedule.add_system(PrepareMeshes);

// initSchedule.add_system(renderer);
initSchedule.run();

// loop
// const loopSchedule = new Schedule();
// initSchedule.add_system(render);

// const loop = () => {
//   loopSchedule.run(world);

//   requestAnimationFrame(() => loop());
// };
