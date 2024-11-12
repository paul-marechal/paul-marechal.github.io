import * as three from 'three';
// @ts-expect-error
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// @ts-expect-error
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { vec2, vec3 } from '../three-utils.js';
import { as } from '../type-utils.js';
import { ThreeDemo } from '../web-components/three-demo.js';

const GRAVITY = 9.8;
const PLAYER_SPEED = 1.0; // m/s

export default as<ThreeDemo>((scene, renderer, render) => {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = three.PCFSoftShadowMap;

  const size = renderer.getSize(vec2());
  const camera = new three.PerspectiveCamera(45, size.x / size.y, 0.1, 10);
  camera.position.set(-1.5, 1.5, 0.2);

  scene.add(new three.AmbientLight('white', 0.5));

  {
    const sun = new three.DirectionalLight('white');
    sun.position.set(-1, 5, -1);
    sun.castShadow = true;
    sun.shadow.camera.top = 1;
    sun.shadow.camera.right = 1;
    sun.shadow.camera.bottom = -1;
    sun.shadow.camera.left = -1;
    sun.shadow.mapSize.width = 512;
    sun.shadow.mapSize.height = 512;
    sun.shadow.camera.near = 0.1;
    sun.shadow.camera.far = 10;
    scene.add(sun);
  }

  scene.add(new three.AxesHelper(5));

  {
    const geometry = new three.PlaneGeometry(1, 1);
    const material = new three.MeshPhongMaterial({
      color: 'white',
      side: three.DoubleSide,
    });

    const lowGround = new three.Mesh(geometry, material);
    lowGround.position.set(0, 0, 0.5);
    lowGround.rotateX(-Math.PI / 2);
    lowGround.receiveShadow = true;

    const highGround = new three.Mesh(geometry, material);
    highGround.position.set(0, 0.2, -0.5);
    highGround.rotateX(-Math.PI / 2);
    highGround.receiveShadow = true;

    const wall = new three.Mesh(new three.PlaneGeometry(1, 0.2), material);
    wall.position.set(0, 0.1, 0);

    scene.add(lowGround, highGround, wall);
  }

  const player = new PhysicsObject3D();
  {
    const material = new three.MeshPhongMaterial({ color: 'red' });
    const sphere = new three.Mesh(new three.SphereGeometry(0.1), material);
    sphere.position.y = 0.5;
    sphere.castShadow = true;

    const ray = new three.ArrowHelper(vec3.DOWN, vec3.ZERO, 0.5, 'cyan');
    ray.castShadow = true;
    sphere.add(ray);

    const torus = new three.Mesh(new three.TorusGeometry(0.08, 0.02), material);
    torus.rotateX(Math.PI / 2);
    torus.castShadow = true;

    player.add(sphere, torus);
  }
  player.position.set(0, 0, 0.5);
  scene.add(player);

  const target = new three.Object3D();
  target.position.copy(player.position).setY(0);
  scene.add(target);

  const targetMesh = new three.Mesh(
    new three.SphereGeometry(0.03),
    new three.MeshPhongMaterial({ color: 'cyan' }),
  );
  target.add(targetMesh);

  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.target.set(0, 0.2, 0);
  orbit.update();

  const transform = new TransformControls(camera, renderer.domElement);
  transform.space = 'world';
  transform.mode = 'translate';
  transform.showX = true;
  transform.showY = false;
  transform.showZ = true;
  transform.minX = -0.5;
  transform.maxX = 0.5;
  transform.minZ = -1;
  transform.maxZ = 1;
  transform.attach(target);

  scene.add(transform.getHelper());

  transform.addEventListener(
    'dragging-changed',
    (event: any) => (orbit.enabled = !event.value),
  );
  transform.addEventListener('objectChange', () => {
    targetMesh.position.y = target.position.z < 0.03 ? 0.2 : 0;
    render();
  });

  const delta = 1 / 60;
  setInterval(() => {
    const jump = v0(player.position.y, player.position.z < 0.1 ? 0.2 : 0);
    const diff = target.position.clone().sub(player.position).setY(0);
    const movement = diff.clampLength(0, PLAYER_SPEED * delta);
    player.velocity.z = movement.z / delta;
    player.velocity.x = movement.x / delta;
    if (jump) {
      player.velocity.y = jump;
    }
    player.velocity.y -= GRAVITY * delta;
    player.updatePhysics(delta);
    render();
  }, delta);

  return camera;
});

function v0(from: number, to: number): number {
  const d = Math.max(to - from, 0);
  return Math.sqrt(2 * GRAVITY * d);
}

class PhysicsObject3D extends three.Object3D {
  velocity = vec3.ZERO;

  updatePhysics(delta: number): void {
    this.position.add(this.velocity.clone().multiplyScalar(delta));
    this.position.y = Math.max(this.position.y, 0);
  }
}
