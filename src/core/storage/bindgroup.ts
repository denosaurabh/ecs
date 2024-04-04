import { nanoid } from "nanoid";
import { StorageRef } from "./types";

type BindGroup = { label?: string; entries: BindGroupEntry[] };
type BindGroupEntry = {
  visibility: /* typeof GPUShaderStage */ number;

  resource: StorageRef<string>;
  type: BindGroupEntryTypeT<any>;

  offset?: number;
  size?: number;
};

type BindGroupMapValue = {
  data: BindGroup;
  layout?: GPUBindGroupLayout;
  bindGroup?: GPUBindGroup;
};

export const BindgroupManager = "BINDGROUPS" as const;
type Ref = StorageRef<typeof BindgroupManager>;

export class BindGroupManager {
  private bindGroups: Map<string, BindGroupMapValue> = new Map();

  constructor() {}

  add(bindGroup: BindGroup): Ref {
    const id = nanoid(7);
    this.bindGroups.set(id, { data: bindGroup });

    return this.ref(id);
  }

  get(ref: Ref): BindGroupMapValue {
    const data = this.bindGroups.get(ref.id);

    if (!data) {
      throw new Error("no bind group exists");
    }

    return data;
  }

  createLayout(ref: Ref, device: GPUDevice) {
    const bindGroup = this.bindGroups.get(ref.id);
    if (!bindGroup) {
      throw new Error(`Bind group with ref ${ref.id} does not exist`);
    }

    const { data } = bindGroup;

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

    const bindGroupLayout = device.createBindGroupLayout(layoutDescriptor);

    this.bindGroups.set(ref.id, { ...bindGroup, layout: bindGroupLayout });

    return bindGroupLayout;
  }

  createBindGroup(
    ref: Ref,
    resources: GPUBindingResource[],
    device: GPUDevice
  ) {
    const bindGroup = this.bindGroups.get(ref.id);
    if (!bindGroup) {
      throw new Error(`Bind group with ref ${ref.id} does not exist`);
    }

    if (!bindGroup.layout) {
      throw new Error(`Bind group layout with ref ${ref.id} does not exist`);
    }

    const bindGroupInstance = device.createBindGroup({
      layout: bindGroup.layout,
      entries: resources.map((resource, i) => {
        return {
          binding: i,
          resource,
        };
      }),
    });

    this.bindGroups.set(ref.id, { ...bindGroup, bindGroup: bindGroupInstance });

    return bindGroupInstance;
  }

  // internal
  private ref(name: string): Ref {
    return { __manager: BindgroupManager, id: name };
  }
}

// export class BindGroupManagerWrite {
//   private bindGroups: Map<
//     string,
//     { data: BindGroup; layout?: GPUBindGroupLayout; bindGroup?: GPUBindGroup }
//   > = new Map();

//   constructor() {}

//   add(ref: Ref, entry: BindGroupEntry): StorageRef<typeof BindgroupManager> {
//     const bindGroup = this.bindGroups.get(ref.id);
//     if (!bindGroup) {
//       throw new Error(`Bind group with ref ${ref.id} does not exist`);
//     }

//     const { data } = bindGroup;

//     this.bindGroups.set(ref.id, {
//       ...bindGroup,
//       data: { ...data, entries: [...data.entries, entry] },
//     });

//     return this.ref(ref.id);
//   }

//   // internal
//   private ref(name: string): Ref {
//     return { __manager: BindgroupManager, id: name };
//   }
// }

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
