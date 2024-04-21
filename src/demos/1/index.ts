import { GEOMETRY_FACTORY, Init, TransformManager, WGPUFactory } from "@core";

type World = {
  rendererData: ReturnType<typeof Init>;

  factory: WGPUFactory;
  transform: TransformManager;
  geometry: GEOMETRY_FACTORY;

  settings: {
    multisample: GPUMultisampleState;
  };
};

export const RunTriangle = async () => {
  const rendererData = await Init();
  const { device } = rendererData;

  const factory = new WGPUFactory(device);
  const transform = new TransformManager(factory.buffers);

  const geometry = new GEOMETRY_FACTORY(factory);

  const world = {
    rendererData,
    factory,
    transform,
    geometry,

    settings: {
      multisample: {
        count: 4,
      },
    },
  };

  console.log(world);

  let animateId = 0;
  const loop = () => {
    device.queue.submit([]);
    animateId = requestAnimationFrame(loop);
  };

  return () => {
    cancelAnimationFrame(animateId);
  };
};
