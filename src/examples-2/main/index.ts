import { GEOMETRY_FACTORY, MATERIAL_FACTORY, StorageManager } from "../core";
import {
  bindTimeAndProjView,
  BindTimeAndProjView,
} from "./defaults/global-bindgroup";

import { Init, RendererData } from "./systems/init";

import { Cubes } from "./systems/cubes";
import { Wind } from "./systems/wind";
import { OrbitControl } from "./defaults/orbitcontrol";
import { DisplayDepth } from "./systems/depth";
import { Grass } from "./systems/grass";
import { mat4 } from "wgpu-matrix";
import { Particles } from "./systems/particles";

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

storage.pipelines.ADD_DEFAULT_BINDGROUPLAYOUT(
  world.bindings.timeProjectionView.layout
);

/**
 *
 * ON LOAD SYSTEMS
 *
 */

const depthTexture = storage.textures.create({
  size: [width, height],
  format: "depth24plus",

  depthOrArrayLayers: 1,

  usage:
    GPUTextureUsage.COPY_DST |
    GPUTextureUsage.COPY_SRC |
    GPUTextureUsage.TEXTURE_BINDING |
    GPUTextureUsage.RENDER_ATTACHMENT,
});

const orbitControl = new OrbitControl(world.player, world.camera);

// const triangles = Triangle(world);
const renderCubes = Cubes(world);
const wind = Wind(world);
const grass = Grass(world);
const particles = Particles(world);

const renderDepth = DisplayDepth(world, depthTexture);

/**
 *
 * RENDER
 *
 */

const camEyeFloat32 = new Float32Array(3);

const loop = () => {
  world.time.tick();
  world.camera.tick();
  world.sun.tick();

  orbitControl.tick();

  world.storage.buffers.write(
    world.buffers.activeProjectionView,
    world.camera.projectionView
  );
  world.storage.buffers.write(
    world.buffers.activeInvProjectionView,
    mat4.inverse(world.camera.projectionView) as Float32Array
  );

  camEyeFloat32[0] = world.camera.eye[0];
  camEyeFloat32[1] = world.camera.eye[1];
  camEyeFloat32[2] = world.camera.eye[2];
  world.storage.buffers.write(world.buffers.cameraEye, camEyeFloat32);

  /**
   * COMMAND ENCODER
   */
  const mainCamEncoder = device.createCommandEncoder();

  const pass = mainCamEncoder.beginRenderPass({
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

  pass.setBindGroup(0, world.bindings.timeProjectionView.bindGroup);

  renderCubes(pass);
  wind(pass);
  grass(pass);

  pass.end();

  // compute & render particles
  particles(mainCamEncoder);

  // NEW
  const pass2 = mainCamEncoder.beginRenderPass({
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        loadOp: "load",
        storeOp: "store",
      },
    ],
  });
  pass2.setBindGroup(0, world.bindings.timeProjectionView.bindGroup);

  // triangles(pass2);
  renderDepth(pass2);
  pass2.end();

  device.queue.submit([mainCamEncoder.finish()]);

  requestAnimationFrame(loop);
};

// loop
loop();
