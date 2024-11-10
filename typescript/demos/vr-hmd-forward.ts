import * as three from 'three';
// @ts-expect-error
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// @ts-expect-error
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { getById } from '../dom-utils.js';
import { ProcessState, InitState, ThreeDemo, vec3 } from '../three-utils.js';

class Demo extends ThreeDemo {
  hmd: three.Object3D;
  player: three.ArrowHelper;

  constructor() {
    super();
    this.addDefaultGrid();

    const hmd_wire = new three.Mesh(
      new three.ConeGeometry(0.2, 0.2, 4),
      new three.MeshBasicMaterial({ color: 'black', wireframe: true }),
    );
    hmd_wire.translateZ(-0.1);
    hmd_wire.rotateY(Math.PI / 4);
    hmd_wire.rotateOnWorldAxis(vec3(1, 0, 0), Math.PI / 2);

    const hmd_forward = new three.ArrowHelper(
      vec3(0, 0, -1).normalize(),
      vec3(0, 0, 0),
      0.5,
      'blue',
    );

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

    this.hmd = new three.Group().add(hmd_wire, hmd_forward, hmd_yz);
    this.hmd.position.set(0, 0.5, 0);
    this.add(this.hmd);

    this.player = new three.ArrowHelper(
      vec3(0, 0, -1),
      vec3(0, 0, 0),
      0.5,
      'red',
    );
    this.add(this.player);
  }

  createCamera(width: number, height: number): three.Camera {
    const camera = new three.PerspectiveCamera(45, width / height, 0.1, 10);
    camera.position.set(-1.5, 1, -1.5);
    camera.lookAt(0, 1, 0);
    return camera;
  }

  protected init({ renderer, camera }: InitState): void {
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.update();

    const transform = new TransformControls(camera, renderer.domElement);
    transform.addEventListener(
      'dragging-changed',
      (event: any) => (orbit.enabled = !event.value),
    );
    transform.addEventListener('objectChange', () => {});
    transform.space = 'world';
    transform.mode = 'rotate';
    transform.attach(this.hmd);

    this.add(transform.getHelper());
  }

  protected process(state: ProcessState): void {
    const projection = this.hmd
      .getWorldDirection(vec3())
      .negate()
      .projectOnPlane(vec3(0, 1, 0));
    const direction = vec3().copy(projection).normalize();
    this.player.setDirection(direction);
  }
}

const root = getById('vr-hmd-forward-root');
new Demo().run(root, root.clientWidth, 400);
