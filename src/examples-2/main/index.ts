import { GEOMETRY_FACTORY, MATERIAL_FACTORY, StorageManager } from "../core";
import {
  bindTimeAndProjView,
  BindTimeAndProjView,
} from "./defaults/global-bindgroup";

import { Init, RendererData } from "./systems/init";

import { Cubes } from "./systems/cube";
import { Wind } from "./systems/wind";

const renderer = await Init();
const { device, context, width, height } = renderer;

const storage = new StorageManager(device);

const geometry = new GEOMETRY_FACTORY(storage);
const materials = new MATERIAL_FACTORY(storage);

/**
 * WORLD
 */

export type World = BindTimeAndProjView & {
  renderer: RendererData;
  storage: StorageManager;

  geometry: GEOMETRY_FACTORY;
  materials: MATERIAL_FACTORY;
};

let world: World = {
  renderer,
  storage,

  geometry,
  materials,

  ...bindTimeAndProjView(storage, { width, height }),
};

/**
 *
 * ON LOAD SYSTEMS
 *
 *
 */

const renderCubes = Cubes(world);
const wind = Wind(world);

/**
 *
 *
 * RENDER
 *
 *
 *
 */
const depthTexture = storage.textures.create({
  size: [width, height],
  format: "depth24plus",

  depthOrArrayLayers: 1,

  usage:
    GPUTextureUsage.COPY_DST |
    GPUTextureUsage.TEXTURE_BINDING |
    GPUTextureUsage.RENDER_ATTACHMENT,
});

const loop = () => {
  world.time.tick();
  world.camera.tick();
  world.player.tick(world.camera);

  /**
   * COMMAND ENCODER
   */
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
    depthStencilAttachment: {
      view: depthTexture.createView(),
      depthLoadOp: "clear",
      depthStoreOp: "store",
      depthClearValue: 1.0,
    },
  });

  // renderTriangles(pass);
  renderCubes(pass);
  wind(pass);

  pass.end();

  device.queue.submit([encoder.finish()]);

  requestAnimationFrame(loop);
};

// loop
loop();
