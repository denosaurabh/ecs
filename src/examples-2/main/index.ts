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

import { Triangle } from "./systems/triangle";
import { Cubes } from "./systems/cube";

const renderer = await Init();
const { device, context, width, height } = renderer;

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

const depthTexture = storage.textures.create({
  size: [width, height],
  format: "depth24plus",

  depthOrArrayLayers: 1,

  usage:
    GPUTextureUsage.COPY_DST |
    GPUTextureUsage.TEXTURE_BINDING |
    GPUTextureUsage.RENDER_ATTACHMENT,
});

// systems
const renderTriangles = Triangle(world);
const renderCubes = Cubes(world);

// loop
const loop = () => {
  UpdateTime(world);

  const updatedOrthoCam = OrthoCameraUpdateMatrices(world);
  world.globals.camera = updatedOrthoCam;
  WriteCameraBuffer(world);

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

  pass.end();

  device.queue.submit([encoder.finish()]);

  requestAnimationFrame(loop);
};

loop();
