import Mat4, * as mat4 from "./mat4-impl";
import Vec3, * as vec3 from "./vec3-impl";
import * as utils from "./utils";

/**
 * Sets the type this library creates for all types
 *
 * example:
 *
 * ```
 * setDefaultType(Float64Array);
 * ```
 *
 * @param ctor - the constructor for the type. Either `Float32Array`, `Float64Array`, or `Array`
 */
export function setDefaultType(
  ctor: new (n: number) => Float32Array | Float64Array | number[]
) {
  mat4.setDefaultType(ctor);
  vec3.setDefaultType(ctor);
}

export { mat4, vec3, utils };
export type { Mat4, Vec3 };
