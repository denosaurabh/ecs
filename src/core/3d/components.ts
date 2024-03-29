import { component } from "@ecs";

// export const Name = component<string>();

// export const Translation = component<[number, number, number]>();
// export const Rotation = component<[number, number, number, number]>();
// export const Scale = component<[number, number, number]>();

type Translate = [number, number, number];
type Rotate = [number, number, number, number];
type Scale = [number, number, number];

type Camera3DProps = {
  type: "ORTHOGRAPHIC" | "PERSPECTIVE";

  translation: Translate;
  target: Translate;

  near?: number;
  far?: number;
  frustum?: number;

  name?: string;
};

export const Camera3D = component<Camera3DProps>("Camera3D", {
  type: "ORTHOGRAPHIC",

  near: 0.001,
  far: 1000,
  frustum: 15,
});

// mesh
type GeometryProps = {
  verticies: Float32Array;
  vertexCount: number;

  usage?: GPUBufferUsage | number;

  attributes: Array<{
    type: "POSITION" | "NORMAL" | "CUSTOM";
    length: number;
  }>;
};

type MaterialProps = {
  vertex: string;
  fragment: string;
};

export const Mesh = component<{
  geometry: GeometryProps;
  material: MaterialProps;

  translate?: Translate;
  rotate?: Rotate;
  scale?: Scale;
}>("Mesh", {
  translate: [0, 0, 0],
  rotate: [0, 0, 0, 1],
  scale: [1, 1, 1],
});

// export const Material = component<MaterialProps>();
// export const Geometry = component<GeometryProps>();
