type BindGroup = {
  label?: string;
  layout?: GPUBindGroupLayout;
  entries: BindGroupEntry[];
};

type CreateBindGroupLayout = {
  label?: string;
  entries: Array<Omit<BindGroupEntry, "resource">>;
};

export type BindGroupEntry = {
  /**
   *  typeof {@link GPUShaderStage}
   */
  visibility: number;

  resource: GPUBindingResource;

  type: BindGroupEntryTypeT<unknown>; // Add type argument here

  // offset?: number;
  // size?: number;
};

export class BindGroupManager {
  constructor(private device: GPUDevice) {}

  create(data: BindGroup): [GPUBindGroup, GPUBindGroupLayout] {
    const bindGroupLayout = data.layout || this.createLayout(data);

    // bindgroup
    const bindGroup = this.device.createBindGroup({
      label: data.label,
      layout: bindGroupLayout,
      entries: data.entries.map((entry, i) => {
        return <GPUBindGroupEntry>{
          binding: i,
          resource: entry.resource,
        };
      }),
    });

    return [bindGroup, bindGroupLayout];
  }

  createLayout(data: CreateBindGroupLayout): GPUBindGroupLayout {
    const layoutDescriptor = {
      label: data.label,

      entries: data.entries.map((entry, i) => {
        const { __TYPE, ...typeProps } = entry.type;

        return {
          binding: i,
          visibility: entry.visibility,
          [__TYPE]: { ...typeProps },
        };
      }),
    };

    const bindGroupLayout = this.device.createBindGroupLayout(layoutDescriptor);

    return bindGroupLayout;
  }
}

/* ************************************  ENTRY TYPE  ********************************************** */

type BindGroupEntryTypeT<T> = T & { __TYPE: string };

class BindGroupEntryTypeKlass {
  buffer(
    props: GPUBufferBindingLayout
  ): BindGroupEntryTypeT<GPUBufferBindingLayout> {
    return { __TYPE: "buffer", ...props };
  }

  externalTexture(
    props: GPUExternalTextureBindingLayout
  ): BindGroupEntryTypeT<GPUExternalTextureBindingLayout> {
    return { __TYPE: "externalTexture", ...props };
  }

  sampler(
    props: GPUSamplerBindingLayout
  ): BindGroupEntryTypeT<GPUSamplerBindingLayout> {
    return { __TYPE: "sampler", ...props };
  }

  storageTexture(
    props: GPUStorageTextureBindingLayout
  ): BindGroupEntryTypeT<GPUStorageTextureBindingLayout> {
    return { __TYPE: "storageTexture", ...props };
  }

  texture(
    props: GPUTextureBindingLayout
  ): BindGroupEntryTypeT<GPUTextureBindingLayout> {
    return { __TYPE: "texture", ...props };
  }
}

export const BindGroupEntryType = new BindGroupEntryTypeKlass();
