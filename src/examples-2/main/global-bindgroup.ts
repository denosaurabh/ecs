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
  // ...topView,
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
  globals: {
    camera,
    globalBindGroup: { time },
  },
}: World) => {
  const { frustumSize, projection, view, eye, target, up, near, far, angle } =
    camera;

  let aspectRatio = width / height;

  const left = (-frustumSize * aspectRatio) / 2;
  const right = (frustumSize * aspectRatio) / 2;
  const bottom = -frustumSize / 2;
  const top = frustumSize / 2;

  // rotate the camera around the target
  mat4.ortho(left, right, bottom, top, near, far, projection);
  mat4.lookAt(eye, target, up, view);

  // mat4.rotateY(view, angle, view);

  return camera;
};

const cameraRadiusFromCharacter = 50;
const cameraHeightFromCharacter = 50;

export const CameraControl = ({
  globals: { camera },
  renderer: { width, height },
}: World) => {
  let rotating = false;

  let moving = false;
  let movingStartingPoint: [number, number] = [0, 0];

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

      if (e.shiftKey) {
        moving = true;
        movingStartingPoint = [e.clientX, e.clientY];
      } else {
        rotating = true;
      }
    }
  });

  window.addEventListener("mouseup", (e) => {
    if (e.button === 0) {
      // LEFT MOUSE BUTTON

      if (e.shiftKey) {
        moving = false;
      } else {
        rotating = false;
      }
    }
  });

  const MAX_ANGLE = 2;
  window.addEventListener("mousemove", (e) => {
    // rotating
    if (rotating) {
      const dx = e.movementX;
      const angle = Number((dx / width).toFixed(3)) * MAX_ANGLE;
      camera.angle += angle;

      vec3.rotateY(camera.eye, camera.target, -angle, camera.eye);
    }

    // moving
    if (moving) {
      console.log("moving");

      // const screenCenter: [number, number] = [width / 2, height / 2];
      const screenCenter: [number, number] = movingStartingPoint;

      // angle b/w screen center and mouse
      const dx = e.clientX - screenCenter[0];
      const dy = e.clientY - screenCenter[1];

      const screenSpaceAngle = Math.atan2(dy, dx);

      // derive world normalised vector from angle
      const x = Math.cos(screenSpaceAngle);
      const z = Math.sin(screenSpaceAngle);

      const directionVector: [number, number, number] = [0, 0, 0];
      directionVector[0] = 0.1;
      directionVector[1] = 0;
      directionVector[2] = 0.1;

      // move the camera

      vec3.add(camera.eye, directionVector, camera.eye);
      vec3.add(camera.target, directionVector, camera.target);
    }
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

// const rotateVectorAroundPoint = (
//   point: [number, number, number],
//   radius: number,
//   angle: number
// ): [number, number, number] => {
//   const x = Math.cos(angle * 2) * radius;
//   const z = Math.sin(angle * 2) * radius;

//   const newVector: [number, number, number] = [
//     x + point[0],
//     cameraHeightFromCharacter + point[1],
//     z + point[2],
//   ];

//   return newVector;
// };

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
    const eye: [number, number, number] = [...camera.eye];
    const target: [number, number, number] = [...camera.target];

    const dirVec = vec3.sub(target, eye);
    vec3.normalize(dirVec, dirVec);

    console.log(dirVec[0], dirVec[1], dirVec[2]);

    if (activeKeys["KeyW"]) {
      const forward = vec3.scale(dirVec, speed);
      const forwardW = [0.1, 0, 0];
      // vec3.add(target, vec3.negate(forward), camera.target);
      // vec3.add(eye, vec3.negate(forward), camera.eye);
      vec3.add(target, forwardW, camera.target);
      vec3.add(eye, forwardW, camera.eye);
    }

    if (activeKeys["KeyS"]) {
      const backW = [-0.1, 0, 0];
      vec3.add(target, backW, camera.target);
      vec3.add(eye, backW, camera.eye);
    }
  };
};
