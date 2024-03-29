import { System, World } from "@ecs";
import { Mesh } from "../components";

class PrepareMeshesKlass implements System {
  query(world: World) {
    return {
      meshes: world.query.have(Mesh),
    };
  }

  execute(args: ReturnType<this["query"]>) {
    const { meshes } = args;

    meshes.forEach((m) => {
      const mesh = m.get(Mesh.factoryId);

      console.log("mesh", mesh);
    });
  }
}

export const PrepareMeshes = new PrepareMeshesKlass() as unknown as System;
