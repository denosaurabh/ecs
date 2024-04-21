import { GlobalData } from "./setup";

export const createPipeline = (globalData: GlobalData, {}) => {
  const { factory, geometry, bindGroups } = globalData;

  // objects
  const geo = geometry.TRIANGLE();

  const shader = factory.shaders.create({
    code: SimpleShader,
  });

  const [pipeline] = factory.pipelines.create({
    label: "triangle",

    layout: {
      bindGroups: [bindGroups.layout],
    },

    shader,
    vertexBufferLayouts: [geo.layout],
  });

  return pipeline;
};
