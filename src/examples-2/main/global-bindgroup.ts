import { mat4, vec3 } from "wgpu-matrix";
import { World } from ".";
import { BindGroupEntryType, StorageManager } from "../core";

export type GlobalBindGroup = {
  time: {
    data: number;
    buffer: GPUBuffer;
  };
  projectionView: {
    buffer: GPUBuffer;
  };

  bindGroup: GPUBindGroup;
  layout: GPUBindGroupLayout;
};

export const createGlobalBindGroup = (
  storage: StorageManager
): GlobalBindGroup => {
  const timeBuffer = storage.buffers.createUniform(
    new Float32Array([0]),
    "time"
  );
  const projectionViewBuffer = storage.buffers.createUniform(
    new Float32Array(16),
    "projectionView"
  );

  const [timeProjectionViewBindGroup, timeProjectionViewBindGroupLayout] =
    storage.bindGroups.create({
      label: "time-projection-view",
      entries: [
        {
          type: BindGroupEntryType.buffer({
            type: "uniform",
            minBindingSize: 4,
          }),
          resource: storage.buffers.getBindingResource(timeBuffer),
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        },
        {
          type: BindGroupEntryType.buffer({}),
          resource: storage.buffers.getBindingResource(projectionViewBuffer),
          visibility: GPUShaderStage.VERTEX,
        },
      ],
    });

  return {
    time: {
      data: 0,
      buffer: timeBuffer,
    },
    projectionView: {
      buffer: projectionViewBuffer,
    },

    bindGroup: timeProjectionViewBindGroup,
    layout: timeProjectionViewBindGroupLayout,
  };
};

// SYSTEMS
const updatedTimeFloat32 = new Float32Array([0]);

export const UpdateTime = ({
  storage,
  globals: {
    globalBindGroup: { time },
  },
}: World) => {
  const updatedTime = performance.now() / 1000.0;
  updatedTimeFloat32[0] = updatedTime;

  time.data = updatedTime;

  storage.buffers.write(time.buffer, updatedTimeFloat32);
};

/**
 * ORTHOGRAPHIC CAMERA
 */

export type OrthographicCamera = {
  eye: [number, number, number];
  target: [number, number, number];
  up: [number, number, number];

  near: number;
  far: number;

  frustumSize: number;

  projection: Float32Array;
  view: Float32Array;

  angle: number;
};

const isometricView: Pick<OrthographicCamera, "eye" | "target" | "up"> = {
  eye: [10, 10, 10],
  target: [0, 0, 0],
  up: [0, 1, 0],
};

const topView: Pick<OrthographicCamera, "eye" | "target" | "up"> = {
  eye: [0, 10, 0],
  target: [0, 0, 0],
  up: [0, 0, -1],
};

export const defaultOrthographicCamera: OrthographicCamera = {
  ...isometricView,

  near: 0.001,
  far: 100,

  frustumSize: 30,

  projection: new Float32Array(16),
  view: new Float32Array(16),

  angle: 0.55, // 45deg
};

export const OrthoCameraUpdateMatrices = ({
  renderer: { width, height },
  globals: { camera },
}: World) => {
  const { frustumSize, projection, view, eye, target, up, near, far } = camera;

  let aspectRatio = width / height;

  const left = (-frustumSize * aspectRatio) / 2;
  const right = (frustumSize * aspectRatio) / 2;
  const bottom = -frustumSize / 2;
  const top = frustumSize / 2;

  mat4.ortho(left, right, bottom, top, near, far, projection);
  mat4.lookAt(eye, target, up, view);

  return camera;
};

const cameraRadiusFromCharacter = 50;
const cameraHeightFromCharacter = 50;

export const CameraControl = ({ globals: { camera } }: World) => {
  let moving = false;

  // console.log(e.deltaY);
  window.addEventListener("contextmenu", (e): void => {
    e.preventDefault();
  });

  window.addEventListener("wheel", (e) => {
    camera.frustumSize += e.deltaY * 0.01;
  });

  window.addEventListener("mousedown", (e) => {
    e.preventDefault();

    if (e.button === 0) {
      // LEFT MOUSE BUTTON
      moving = true;
    }
  });

  window.addEventListener("mouseup", () => {
    moving = false;
  });

  const MAX_ANGLE = 2;

  window.addEventListener("mousemove", (e) => {
    if (!moving) return;

    const dx = e.movementX;

    const angle = Number((dx / window.innerWidth).toFixed(3)) * MAX_ANGLE;

    camera.angle += angle;

    camera.eye = rotateVectorAroundPoint(
      camera.target,
      cameraRadiusFromCharacter,
      camera.angle
    );
  });
};

export const WriteCameraBuffer = ({
  storage,
  globals: {
    camera,
    globalBindGroup: { projectionView },
  },
}: World) => {
  const viewProjection = mat4.multiply(
    camera.projection,
    camera.view
  ) as Float32Array;

  storage.buffers.write(projectionView.buffer, viewProjection);
};

const rotateVectorAroundPoint = (
  point: [number, number, number],
  radius: number,
  angle: number
): [number, number, number] => {
  const x = Math.cos(angle * 2) * radius;
  const z = Math.sin(angle * 2) * radius;

  const newVector: [number, number, number] = [
    x + point[0],
    cameraHeightFromCharacter + point[1],
    z + point[2],
  ];

  return newVector;
};

// character

// const characterPos: [number, number, number] = [0, 0, 0];

const trackKeys = ["KeyW", "KeyA", "KeyS", "KeyD"] as const;

type TrackKeysValaues = (typeof trackKeys)[number];

type ActiveKeys = { [key in TrackKeysValaues]: boolean };

const activeKeys = trackKeys.reduce((acc, key) => {
  acc[key] = false;
  return acc;
}, {} as ActiveKeys);

export const CharacterControl = ({ globals: { camera } }: World) => {
  const characterPos = camera.target;

  window.addEventListener("keydown", (e) => {
    if (trackKeys.includes(e.code as TrackKeysValaues)) {
      activeKeys[e.code as TrackKeysValaues] = true;
    }
  });

  window.addEventListener("keyup", (e) => {
    if (trackKeys.includes(e.code as TrackKeysValaues)) {
      activeKeys[e.code as TrackKeysValaues] = false;
    }
  });

  const speed = 0.1;

  return () => {
    const copiedEye: [number, number, number] = [...camera.eye];
    copiedEye[1] = 0;
    const copiedTarget: [number, number, number] = [...camera.target];
    copiedTarget[1] = 0;

    const dirVec = vec3.sub(copiedTarget, copiedEye);
    vec3.normalize(dirVec, dirVec);

    console.log(dirVec[0], dirVec[1], dirVec[2]);

    if (activeKeys["KeyW"]) {
      const forward = vec3.scale(dirVec, speed);
      vec3.add(copiedTarget, vec3.negate(forward), camera.target);
    }

    if (activeKeys["KeyS"]) {
      const forward = vec3.scale(dirVec, speed);
      vec3.add(copiedTarget, forward, camera.target);
    }
  };
};
