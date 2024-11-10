import * as three from 'three';
// @ts-expect-error
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// @ts-expect-error
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { basis, defaultGrid, vec2, vec3 } from '../three-utils.js';
import { as } from '../type-utils.js';
import type { ThreeDemo } from '../web-components/three-demo.js';

export default as<ThreeDemo>((scene, renderer, render) => {
  scene.add(defaultGrid());

  const hmd = new three.Group();
  {
    const wire = new three.Mesh(
      new three.ConeGeometry(0.2, 0.2, 4),
      new three.MeshBasicMaterial({ color: 'black', wireframe: true }),
    );
    wire.translateZ(-0.1);
    wire.rotateY(Math.PI / 4);
    wire.rotateOnWorldAxis(vec3(1, 0, 0), Math.PI / 2);

    const plane_yz = new three.Mesh(
      new three.PlaneGeometry(1, 1),
      new three.MeshBasicMaterial({
        side: three.DoubleSide,
        transparent: true,
        color: 'magenta',
        opacity: 0.15,
      }),
    );
    plane_yz.rotateY(Math.PI / 2);
    hmd.add(wire, plane_yz);
  }
  hmd.position.set(0, 0.5, 0);
  scene.add(hmd);

  {
    const world_xz = new three.Mesh(
      new three.PlaneGeometry(1, 1),
      new three.MeshBasicMaterial({
        side: three.DoubleSide,
        transparent: true,
        color: 'cyan',
        opacity: 0.15,
      }),
    );
    world_xz.rotateX(Math.PI / 2);
    world_xz.position.copy(hmd.position);
    scene.add(world_xz);
  }

  const hmd_forward = new three.ArrowHelper(
    vec3(0, 0, -1).normalize(),
    vec3(0, 0, 0),
    0.5,
    'blue',
  );
  hmd_forward.position.copy(hmd.position);
  scene.add(hmd_forward);

  const player = new three.ArrowHelper(
    vec3(0, 0, -1),
    vec3(0, 0, 0),
    0.5,
    'red',
  );
  scene.add(player);

  const size = renderer.getSize(vec2());
  const camera = new three.PerspectiveCamera(45, size.x / size.y, 0.1, 10);
  camera.position.set(-1.5, 1, -1.5);

  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.target.copy(hmd.position).divideScalar(2);
  orbit.update();

  const transform = new TransformControls(camera, renderer.domElement);
  transform.space = 'world';
  transform.mode = 'rotate';
  transform.attach(hmd);

  scene.add(transform.getHelper());

  orbit.addEventListener('change', () => render());
  transform.addEventListener(
    'dragging-changed',
    (event: any) => (orbit.enabled = !event.value),
  );
  transform.addEventListener('objectChange', () => {
    const y = vec3(0, 1, 0);
    const z = hmd
      .localToWorld(vec3(1, 0, 0))
      .cross(vec3(0, 1, 0))
      .normalize();
    const x = vec3(0, 1, 0).cross(z).normalize();
    const mat3 = basis(x, y, z);
    const direction = vec3(0, 0, -1).applyMatrix3(mat3);
    hmd_forward.setDirection(direction);
    player.setDirection(direction);
    render();
  });

  return camera;
});
