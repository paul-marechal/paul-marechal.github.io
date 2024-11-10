import * as three from 'three';
// @ts-expect-error
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// @ts-expect-error
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { basis, defaultGrid, vec3 } from '../three-utils.js';

import type { ThreeModule } from '../web-components/three-demo.js';

export default function (): ThreeModule {
  const grid = defaultGrid();

  const hmd_wire = new three.Mesh(
    new three.ConeGeometry(0.2, 0.2, 4),
    new three.MeshBasicMaterial({ color: 'black', wireframe: true }),
  );
  hmd_wire.translateZ(-0.1);
  hmd_wire.rotateY(Math.PI / 4);
  hmd_wire.rotateOnWorldAxis(vec3(1, 0, 0), Math.PI / 2);

  const hmd_yz = new three.Mesh(
    new three.PlaneGeometry(1, 1),
    new three.MeshBasicMaterial({
      side: three.DoubleSide,
      transparent: true,
      color: 'magenta',
      opacity: 0.15,
    }),
  );
  hmd_yz.rotateY(Math.PI / 2);

  const hmd = new three.Group().add(hmd_wire, hmd_yz);
  hmd.position.set(0, 0.5, 0);

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

  const hmd_forward = new three.ArrowHelper(
    vec3(0, 0, -1).normalize(),
    vec3(0, 0, 0),
    0.5,
    'blue',
  );
  hmd_forward.position.copy(hmd.position);

  const player = new three.ArrowHelper(
    vec3(0, 0, -1),
    vec3(0, 0, 0),
    0.5,
    'red',
  );

  return {
    createCamera(width, height) {
      return new three.PerspectiveCamera(45, width / height, 0.1, 10);
    },
    ready(state) {
      state.camera.position.set(-1.5, 1, -1.5);

      const orbit = new OrbitControls(state.camera, state.renderer.domElement);
      orbit.target.copy(hmd.position).divideScalar(2);
      orbit.update();

      const transform = new TransformControls(
        state.camera,
        state.renderer.domElement,
      );
      transform.space = 'world';
      transform.mode = 'rotate';

      state.scene.add(
        grid,
        world_xz,
        hmd,
        hmd_forward,
        player,
        transform.getHelper(),
      );

      transform.attach(hmd);

      orbit.addEventListener('change', () => state.render());
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
        state.render();
      });
    },
  };
}
