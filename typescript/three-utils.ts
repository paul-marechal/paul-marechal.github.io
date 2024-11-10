import * as three from 'three';

export function vec2(x?: number, y?: number): three.Vector2 {
  return new three.Vector2(x, y);
}

export function vec3(x?: number, y?: number, z?: number): three.Vector3 {
  return new three.Vector3(x, y, z);
}

export function basis(
  x: three.Vector3,
  y: three.Vector3,
  z: three.Vector3,
): three.Matrix3 {
  return new three.Matrix3().set(x.x, y.x, z.x, x.y, y.y, y.z, x.z, y.z, z.z);
}

export function defaultGrid(): three.Group {
  return new three.Group().add(
    new three.AxesHelper(5),
    new three.GridHelper(2, 10),
  );
}
