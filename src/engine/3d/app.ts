import { Schedule, World, resource } from "@ecs";
import { render, renderer } from "./systems";

export class App {
  world: World;

  constructor() {
    this.world = new World();
  }

  run() {
    // resources
    const time = resource({ delta: 0 });
    this.world.insert_resource(time);

    // schedule
    const initSchedule = new Schedule();
    initSchedule.add_system(renderer);
    initSchedule.run(this.world);

    // loop
    const loopSchedule = new Schedule();
    initSchedule.add_system(render);

    const loop = () => {
      loopSchedule.run(this.world);

      requestAnimationFrame(() => loop());
    };
  }
}
