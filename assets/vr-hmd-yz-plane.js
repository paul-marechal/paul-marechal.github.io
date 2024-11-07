"use-strict";

import * as three from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";

const width = 480;
const height = 360;

const renderer = new three.WebGLRenderer({ alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);

document
  .getElementById("vr-hmd-yz-plane-root")
  .appendChild(renderer.domElement);

const camera = new three.PerspectiveCamera(45, width / height, 0.1, 10);
camera.position.set(-2, 2, -2);
camera.lookAt(0, 1, 0);

const scene = new three.Scene();

const axes = new three.AxesHelper(5);
const grid = new three.GridHelper(2, 10);
scene.add(axes);
scene.add(grid);

const hmd = new three.Group();

const hmd_wireframe = new three.Mesh(
  new three.ConeGeometry(0.2, 0.2, 4),
  new three.MeshBasicMaterial({ color: "black", wireframe: true })
);
hmd_wireframe.rotateY(Math.PI / 4);
hmd_wireframe.rotateOnWorldAxis(new three.Vector3(1, 0, 0), Math.PI / 2);

const hmd_yz = new three.Mesh(
  new three.PlaneGeometry(1, 1),
  new three.MeshBasicMaterial({
    side: three.DoubleSide,
    transparent: true,
    color: 'magenta',
    opacity: 0.15,
  })
);
hmd_yz.rotateY(Math.PI / 2);

hmd.add(hmd_wireframe, hmd_yz);

hmd.position.set(0, 1, 0);

scene.add(hmd);

const world_xz = new three.Mesh(
  new three.PlaneGeometry(1, 1),
  new three.MeshBasicMaterial({
    side: three.DoubleSide,
    transparent: true,
    color: 'cyan',
    opacity: 0.15,
  })
);
world_xz.rotateX(Math.PI / 2);
world_xz.position.copy(hmd.position);
scene.add(world_xz);

const hmd_forward = new three.ArrowHelper(
  new three.Vector3(0, 0, -1).normalize(),
  new three.Vector3(0, 0, 0),
  0.5,
  "blue"
);
hmd_forward.position.copy(hmd.position);

const player = new three.ArrowHelper(
  new three.Vector3(0, 0, -1),
  new three.Vector3(0, 0, 0),
  0.5,
  "red"
);

update();
scene.add(hmd_forward, player);

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.update();

const transformControls = new TransformControls(camera, renderer.domElement);
transformControls.addEventListener(
  "dragging-changed",
  (event) => (orbitControls.enabled = !event.value)
);
transformControls.addEventListener("objectChange", () => update());
transformControls.space = "world";
transformControls.mode = "rotate";
transformControls.attach(hmd);

scene.add(transformControls.getHelper());

function update() {
  const y = new three.Vector3(0, 1, 0);
  const z = hmd.localToWorld(new three.Vector3(1, 0, 0)).cross(new three.Vector3(0, 1, 0)).normalize();
  const x = new three.Vector3(0, 1, 0).cross(z).normalize();
  const basis = new three.Matrix3().set(
    x.x, y.x, z.x,
    x.y, y.y, y.z,
    x.z, y.z, z.z
  );
  const direction = new three.Vector3(0, 0, -1).applyMatrix3(basis);
  hmd_forward.setDirection(direction);
  player.setDirection(direction);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
