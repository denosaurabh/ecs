import { component } from "@ecs";

type Translate = [number, number, number];
type Rotate = [number, number, number, number];
type Scale = [number, number, number];

type OrthographicCameraProps = {
  translation: Translate;
  target: Translate;

  near?: number;
  far?: number;

  left?: number;
  right?: number;
  top?: number;
  bottom?: number;

  name?: string;
};

export const OrthographicCamera = component<OrthographicCameraProps>(
  "OrthographicCamera",
  {
    near: 0.001,
    far: 1000,

    left: 0,
    right: 0,
    top: window.innerWidth,
    bottom: window.innerHeight,
  }
);

// mesh
type GeometryProps = {
  verticies: Float32Array;
  vertexCount: number;

  usage: number; // GPUBufferUsage

  lengthPerVertex: number;
  verticiesCount: number;

  attributes: Array<{
    type: "POSITION" | "NORMAL" | "UV" | "CUSTOM";
    offset: number;
    format: GPUVertexFormat;
  }>;
};

type MaterialProps = {
  shader: string;

  vertexEntryPoint: string;
  fragmentEntryPoint: string;
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
