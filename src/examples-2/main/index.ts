import { GEOMETRY_FACTORY, MATERIAL_FACTORY, StorageManager } from "../core";
import {
  createGlobalBindGroup,
  defaultOrthographicCamera,
  GlobalBindGroup,
  OrthoCameraUpdateMatrices,
  OrthographicCamera,
  UpdateTime,
  WriteCameraBuffer,
} from "./global-bindgroup";

import { Init, RendererData } from "./systems/init";

import { SetupTriangle, DrawTriangle } from "./systems/triangle";
import { SetupCube, DrawCube } from "./systems/cube";

const renderer = await Init();
const { device, context } = renderer;

const storage = new StorageManager(device);

const GEOMETRY = new GEOMETRY_FACTORY(storage);
const MATERIAL = new MATERIAL_FACTORY(storage);

/**
 * WORLD
 */

export type World = {
  renderer: RendererData;
  storage: StorageManager;

  geometry: GEOMETRY_FACTORY;
  material: MATERIAL_FACTORY;

  globals: {
    globalBindGroup: GlobalBindGroup;
    camera: OrthographicCamera;
  };
};

const world: World = {
  renderer: renderer,
  storage,

  geometry: GEOMETRY,
  material: MATERIAL,

  globals: {
    globalBindGroup: createGlobalBindGroup(storage),
    camera: defaultOrthographicCamera,
  },
};

// systems
SetupTriangle(world);
SetupCube(world);

// loop
const loop = () => {
  UpdateTime(world);

  const updatedOrthoCam = OrthoCameraUpdateMatrices(world);
  world.globals.camera = updatedOrthoCam;
  WriteCameraBuffer(world);

  const encoder = device.createCommandEncoder();

  const pass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        loadOp: "clear",
        storeOp: "store",
        clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
      },
    ],
  });

  DrawTriangle(pass);
  DrawCube(pass, world);

  pass.end();

  device.queue.submit([encoder.finish()]);

  requestAnimationFrame(loop);
};

loop();
