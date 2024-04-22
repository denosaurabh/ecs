import { RendererData } from "@core";
import { MeshManager } from "./mesh";
import { GlobalData } from "./setup";

export type World = GlobalData & {
  mesh: MeshManager;
  rendererData: RendererData;
};

export enum RenderMode {
  MAIN = "MAIN",
  SHADOW = "SHADOW",
}
