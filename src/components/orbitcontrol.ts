import { Vec3, vec3 } from "@core";
import { IsometricCamera } from "./isometric-camera";
import { Player } from "./player";

export class OrbitControl {
  private angle = 0;

  constructor(private player: Player, private camera: IsometricCamera) {
    // wheel
    window.addEventListener("wheel", this.updateFrustumSizeOnScroll);

    // mouse
    window.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("contextmenu", (e): void => {
      e.preventDefault();
    });

    // keyboard
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  private setAngle(angle: number) {
    this.angle = angle;
  }

  // mouse
  private updateFrustumSizeOnScroll = (e: WheelEvent) => {
    const delta = e.deltaY * 0.01;
    this.camera.setFrustumSize(this.camera.frustumSize + delta);
  };

  private rotating = false;

  private onMouseDown = (e: MouseEvent) => {
    // e.preventDefault();

    if (e.button === 0) {
      // LEFT MOUSE BUTTON
      this.rotating = true;
    }
  };

  private onMouseUp = (e: MouseEvent) => {
    if (e.button === 0) {
      this.rotating = false;
    }
  };

  private readonly MAX_ANGLE = Math.PI * 1.5;

  // temp
  private newEyeMouseMove: Vec3 = [0, 0, 0];
  private deltaAngle = 0;

  private onMouseMove = (e: MouseEvent) => {
    if (this.rotating) {
      this.deltaAngle =
        Number((e.movementX / (e.view?.innerWidth || 0)).toFixed(3)) *
        this.MAX_ANGLE;

      this.setAngle(this.angle + this.deltaAngle);

      this.newEyeMouseMove = vec3.rotateY(
        this.camera.eye,
        this.camera.target,
        -this.deltaAngle
      );
      this.camera.setEye(
        this.newEyeMouseMove[0],
        this.newEyeMouseMove[1],
        this.newEyeMouseMove[2]
      );
    }
  };

  // keyboard
  private readonly trackKeys = ["KeyW", "Space"] as const;
  private activeKeys = this.trackKeys.reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {} as { [key in (typeof this.trackKeys)[number]]: boolean });

  private onKeyDown = (e: KeyboardEvent) => {
    type TrackKeysValues = (typeof this.trackKeys)[number];

    if (this.trackKeys.includes(e.code as TrackKeysValues)) {
      this.activeKeys[e.code as TrackKeysValues] = true;
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    type TrackKeysValues = (typeof this.trackKeys)[number];

    if (this.trackKeys.includes(e.code as TrackKeysValues)) {
      this.activeKeys[e.code as TrackKeysValues] = false;
    }
  };

  /**
   *
   * tick
   *
   */
  private readonly speed = 0.1;
  private readonly magicNumber = 3.24;

  // temp
  private newPos: Vec3 = [0, 0, 0];
  private newTarget: Vec3 = [0, 0, 0];
  private newEye: Vec3 = [0, 0, 0];

  tick() {
    const magicVector = vec3.rotateY(
      [1, 0, 1],
      [0, 0, 0],
      -this.angle + this.magicNumber
    );
    vec3.scale(magicVector, this.speed, magicVector);

    if (this.activeKeys["KeyW"] || this.activeKeys["Space"]) {
      this.newPos = vec3.add(this.player.position, magicVector);
      this.player.setPosition(this.newPos[0], this.newPos[1], this.newPos[2]);

      this.newTarget = vec3.add(this.camera.target, magicVector);
      this.camera.setTarget(
        this.newTarget[0],
        this.newTarget[1],
        this.newTarget[2]
      );

      this.newEye = vec3.add(this.camera.eye, magicVector);
      this.camera.setEye(this.newEye[0], this.newEye[1], this.newEye[2]);
    }
  }
}
