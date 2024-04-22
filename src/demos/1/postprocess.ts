import { World } from "@utils";
import { EdgePostprocess } from "./edge";

type Props = {
  textures: {
    normal: GPUTexture;
    albedo: GPUTexture;
  };
};

export const Postprocess = (world: World, props: Props) => {
  const {
    rendererData: { size, format },
    factory,
    textures: gtextures,
  } = world;
  const { textures } = props;

  const postprocessMultiSampleTexture = factory.textures
    .createTexture({
      size,
      format,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
      sampleCount: 4,
      depthOrArrayLayers: 1,
    })
    .createView();

  // postprocesses
  const edge = EdgePostprocess(
    world,
    textures.normal,
    textures.albedo,
    gtextures.depth.texture
  );

  return (encoder: GPUCommandEncoder, resolveTarget: GPUTextureView) => {
    const postprocessPass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: postprocessMultiSampleTexture,
          resolveTarget,

          loadOp: "load",
          storeOp: "store",
        },
      ],
    });

    edge(postprocessPass);

    postprocessPass.end();
  };
};
