import {
  BindGroupEntryType,
  WGPUFactory,
  GEOMETRY_FACTORY,
  TransformManager,
  RendererData,
} from "@core";

import { IsometricCamera } from "../components/isometric-camera";
import { OrbitControl } from "../components/orbitcontrol";
import { Player } from "../components/player";
import { SunControl } from "../components/sun";
import { Time } from "../components/time";

export type GlobalData = {
  factory: WGPUFactory;
  geometry: GEOMETRY_FACTORY;
  transform: TransformManager;

  time: Time;

  camera: IsometricCamera;
  sun: IsometricCamera;

  player: Player;

  bindGroups: {
    main: GPUBindGroup;
    shadow: GPUBindGroup;
    layout: GPUBindGroupLayout;
  };

  textures: {
    multisample: { view: GPUTextureView };
    depth: { texture: GPUTexture; view: GPUTextureView };
  };

  settings: Settings;
};

type Settings = {
  multisample: GPUMultisampleState;
};

export class GlobalSetup {
  // intial
  private readonly factory: WGPUFactory;
  private readonly geometry: GEOMETRY_FACTORY;
  private readonly transform: TransformManager;

  // entities
  private readonly time: Time;
  private readonly camera: IsometricCamera;
  private readonly sun: IsometricCamera;
  private readonly player: Player;

  // bindgroups
  private readonly mainBindGroup: GPUBindGroup;
  private readonly shadowBindGroup: GPUBindGroup;

  private readonly globalBindGroupLayout: GPUBindGroupLayout;

  // controls
  private readonly orbitControl: OrbitControl;
  private readonly sunControl: SunControl;

  // buffers
  private readonly cameraEye: GPUBuffer;
  private readonly sunPosition: GPUBuffer;

  private readonly cameraEyeFloat32: Float32Array;
  private readonly sunEyeFloat32: Float32Array;

  // textures
  private multiSampleTextureView: GPUTextureView;
  private depthTexture: GPUTexture;

  private readonly settings: Settings = {
    multisample: {
      count: 4,
    },
  };

  constructor({ device, format, size }: RendererData) {
    ////////////////////////////////////////////////////////////////
    ///////////////////////      INIT      /////////////////////////
    ////////////////////////////////////////////////////////////////

    const factory = new WGPUFactory(device);
    this.factory = factory;

    this.geometry = new GEOMETRY_FACTORY(factory);
    this.transform = new TransformManager(factory);

    ////////////////////////////////////////////////////////////////
    ////////////////      CREATE ENTITIES     //////////////////////
    ////////////////////////////////////////////////////////////////

    this.time = new Time(factory);

    this.camera = new IsometricCamera(factory, size);
    this.sun = new IsometricCamera(factory, size);

    this.player = new Player(factory);

    this.orbitControl = new OrbitControl(this.player, this.camera);
    this.sunControl = new SunControl(this.sun);

    this.cameraEyeFloat32 = new Float32Array(3);
    this.sunEyeFloat32 = new Float32Array(3);

    ////////////////////////////////////////////////////////////////
    ////////////////      CREATE BUFFERS      //////////////////////
    ////////////////////////////////////////////////////////////////

    const sizeBuffer = factory.buffers.createUniform(
      new Float32Array([size.width, size.height]),
      "size"
    );

    const cameraEye = factory.buffers.createUniform(
      new Float32Array([0, 0, 0]),
      "camera-pos"
    );

    const sunPosition = factory.buffers.createUniform(
      new Float32Array([10, 0, 0]),
      "sun-position"
    );

    this.cameraEye = cameraEye;
    this.sunPosition = sunPosition;

    ////////////////////////////////////////////////////////////////
    ////////////////   CREATE BIND GROUP ENTRY    //////////////////
    ////////////////////////////////////////////////////////////////

    const timeEntry = {
      type: BindGroupEntryType.buffer({
        type: "uniform",
        minBindingSize: 4,
      }),
      resource: factory.buffers.getBindingResource(this.time.buffer),
      visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
    };

    const playerPositionEntry = {
      type: BindGroupEntryType.buffer({}),
      resource: factory.buffers.getBindingResource(this.player.positionBuffer),
      visibility: GPUShaderStage.VERTEX,
    };

    const sizeEntry = {
      type: BindGroupEntryType.buffer({
        type: "uniform",
        minBindingSize: 8,
      }),
      resource: factory.buffers.getBindingResource(sizeBuffer),
      visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
    };

    const sunPositionEntry = {
      type: BindGroupEntryType.buffer({
        type: "uniform",
      }),
      resource: factory.buffers.getBindingResource(sunPosition),
      visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
    };

    const cameraEyeEntry = {
      type: BindGroupEntryType.buffer({}),
      resource: factory.buffers.getBindingResource(cameraEye),
      visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
    };

    ////////////////////////////////////////////////////////////////
    ////////////////    CREATE BIND GROUPS     /////////////////////
    ////////////////////////////////////////////////////////////////

    [this.mainBindGroup, this.globalBindGroupLayout] =
      factory.bindGroups.create({
        label: "main bind group",
        entries: [
          {
            type: BindGroupEntryType.buffer({}),
            resource: factory.buffers.getBindingResource(
              this.camera.projViewAndInvProjViewBuffer
            ),
            visibility: GPUShaderStage.VERTEX,
          },
          timeEntry,
          playerPositionEntry,
          sunPositionEntry,
          sizeEntry,
          cameraEyeEntry,
        ],
      });

    [this.shadowBindGroup] = factory.bindGroups.create({
      label: "shadow bind group",
      entries: [
        {
          type: BindGroupEntryType.buffer({}),
          resource: factory.buffers.getBindingResource(
            this.sun.projViewAndInvProjViewBuffer
          ),
          visibility: GPUShaderStage.VERTEX,
        },
        timeEntry,
        playerPositionEntry,
        sunPositionEntry,
        sizeEntry,
        cameraEyeEntry,
      ],
    });

    ////////////////////////////////////////////////////////////////
    ///////////////////////    TEXTURES     ////////////////////////
    ////////////////////////////////////////////////////////////////

    const multiSampleTexture = factory.textures.createTexture({
      size,
      format,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
      sampleCount: this.settings.multisample.count,
    });
    this.multiSampleTextureView = multiSampleTexture.createView();

    this.depthTexture = factory.textures.createTexture({
      size,
      format: "depth24plus",

      depthOrArrayLayers: 1,
      sampleCount: this.settings.multisample.count,

      usage:
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.COPY_SRC |
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });
  }

  public tick() {
    this.cameraEyeFloat32[0] = this.camera.eye[0];
    this.cameraEyeFloat32[1] = this.camera.eye[1];
    this.cameraEyeFloat32[2] = this.camera.eye[2];

    this.sunEyeFloat32[0] = this.sun.eye[0];
    this.sunEyeFloat32[1] = this.sun.eye[1];
    this.sunEyeFloat32[2] = this.sun.eye[2];

    this.factory.buffers.write(this.cameraEye, this.cameraEyeFloat32);
    this.factory.buffers.write(this.sunPosition, this.sunEyeFloat32);

    this.time.tick();
    this.camera.tick();
    this.sun.tick();

    this.orbitControl.tick();
    this.sunControl.tick();
  }

  get data(): GlobalData {
    return {
      factory: this.factory,
      geometry: this.geometry,
      transform: this.transform,

      time: this.time,

      camera: this.camera,
      sun: this.sun,

      player: this.player,

      bindGroups: {
        main: this.mainBindGroup,
        shadow: this.shadowBindGroup,
        layout: this.globalBindGroupLayout,
      },

      textures: {
        multisample: { view: this.multiSampleTextureView },
        depth: {
          texture: this.depthTexture,
          view: this.depthTexture.createView(),
        },
      },

      settings: this.settings,
    };
  }
}
