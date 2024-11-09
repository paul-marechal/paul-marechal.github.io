"use-strict";

import * as three from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";

import { createRenderer, vec3 } from "/assets/js/three-utils.js";

const root = document.getElementById("vr-hmd-forward-root");

const width = root.clientWidth;
const height = 400;

const renderer = createRenderer(width, height);

root.appendChild(renderer.domElement);

const camera = new three.PerspectiveCamera(45, width / height, 0.1, 10);
camera.position.set(-1.5, 1, -1.5);
camera.lookAt(0, 1, 0);

const scene = new three.Scene();

const axes = new three.AxesHelper(5);
const grid = new three.GridHelper(2, 10);
scene.add(axes);
scene.add(grid);

const hmd = new three.Group();

const hmd_wire = new three.Mesh(
  new three.ConeGeometry(0.2, 0.2, 4),
  new three.MeshBasicMaterial({ color: "black", wireframe: true })
);
hmd_wire.translateZ(-0.1);
hmd_wire.rotateY(Math.PI / 4);
hmd_wire.rotateOnWorldAxis(vec3(1, 0, 0), Math.PI / 2);

const hmd_forward = new three.ArrowHelper(
  vec3(0, 0, -1).normalize(),
  vec3(0, 0, 0),
  0.5,
  "blue"
);

const hmd_yz = new three.Mesh(
  new three.PlaneGeometry(1, 1),
  new three.MeshBasicMaterial({
    side: three.DoubleSide,
    transparent: true,
    color: "magenta",
    opacity: 0.15,
  })
);
hmd_yz.rotateY(Math.PI / 2);

hmd.add(hmd_wire, hmd_forward, hmd_yz);
hmd.position.set(0, 0.5, 0);

scene.add(hmd);

const player = new three.ArrowHelper(vec3(0, 0, -1), vec3(0, 0, 0), 0.5, "red");

update();
scene.add(player);

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
  const projection = hmd
    .getWorldDirection(vec3())
    .negate()
    .projectOnPlane(vec3(0, 1, 0));
  const direction = vec3().copy(projection).normalize();
  player.setDirection(direction);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
