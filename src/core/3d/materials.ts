import { Mesh } from "./components";

type Material = Parameters<typeof Mesh>[0]["material"];

type RGB = { r: number; g: number; b: number };

export abstract class MATERIAL {
  public static SOLID_COLOR(_rgb: RGB): Material {
    return {
      fragment: "",
      vertex: "",
    };
  }
}
