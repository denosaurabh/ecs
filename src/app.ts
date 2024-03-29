import { ECS, Mesh } from "./ecs_core";
import { GEOMETRY } from "./ecs_core/resources/geometry";

const app = new ECS();

const mesh = new Mesh();

mesh.add(GEOMETRY.BOX());

app.spawn(mesh);
