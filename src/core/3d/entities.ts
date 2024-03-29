export {};

// import { component, entity } from "@ecs";
// import {
//   Geometry,
//   Material,
//   Name,
//   Rotation,
//   Scale,
//   Translation,
// } from "./components";

// // CAMERA
// // const CameraType = component<"ORTHOGRAPHIC" | "PERSPECTIVE">();
// // const CameraNear = component<number>();
// // const CameraFar = component<number>();
// // const CameraFrustum = component<number>();

// type CameraProps = {
//   type: typeof CameraType;

//   translation: typeof Translation;
//   target: typeof Translation;

//   near?: typeof CameraNear;
//   far?: typeof CameraFar;
//   frustum?: typeof CameraFrustum;
// };

// export const Camera = entity<CameraProps>((props) => ({
//   type: Camera3D(props.type),

//   translation: Translation(props.translation),
//   target: Translation(props.target),

//   near: CameraNear(props.near || 0.001),
//   far: CameraFar(props.far || 1000),
//   frustum: CameraFrustum(props.frustum || 15),
// }));

// // MESH
// type MeshProps = {
//   geometry: typeof Geometry;
//   material: typeof Material;

//   translation?: typeof Translation;
//   rotation?: typeof Rotation;
//   scale?: typeof Scale;

//   name?: typeof Name;
// };

// export const Mesh = entity<MeshProps>((props) => ({
//   geometry: Geometry(props.geometry),
//   material: Material(props.material),

//   translation: Translation(props.translation || [0, 0, 0]),
//   rotation: Rotation(props.rotation || [0, 0, 0, 1]),
//   scale: Scale(props.scale || [1, 1, 1]),

//   name: Name(props.name || ""),
// }));
