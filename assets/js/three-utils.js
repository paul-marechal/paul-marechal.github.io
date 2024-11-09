"use-strict";

import * as three from "three";

export function createRenderer(width, height) {
  const renderer = new three.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  return renderer;
}

export function vec3(x = 0, y = 0, z = 0) {
  return new three.Vector3(x, y, z);
}

export function basis(x, y, z) {
  return new three.Matrix3().set(x.x, y.x, z.x, x.y, y.y, y.z, x.z, y.z, z.z);
}
