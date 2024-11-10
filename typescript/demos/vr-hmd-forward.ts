import { ArrowHelper, Camera, ConeGeometry, DoubleSide, Group, Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera, PlaneGeometry, Renderer } from "three";
// @ts-expect-error
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// @ts-expect-error
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { getById } from "../dom-utils.js";
import { DemoProcessState, ThreeDemo, vec3 } from "../three-utils.js";

class Demo extends ThreeDemo {

  hmd: Object3D;
  player: ArrowHelper;

  constructor() {
    super();
    this.addDefaultGrid();

    const hmd_wire = new Mesh(
      new ConeGeometry(0.2, 0.2, 4),
      new MeshBasicMaterial({ color: "black", wireframe: true })
    );
    hmd_wire.translateZ(-0.1);
    hmd_wire.rotateY(Math.PI / 4);
    hmd_wire.rotateOnWorldAxis(vec3(1, 0, 0), Math.PI / 2);

    const hmd_forward = new ArrowHelper(
      vec3(0, 0, -1).normalize(),
      vec3(0, 0, 0),
      0.5,
      "blue"
    );

    const hmd_yz = new Mesh(
      new PlaneGeometry(1, 1),
      new MeshBasicMaterial({
        side: DoubleSide,
        transparent: true,
        color: "magenta",
        opacity: 0.15,
      })
    );
    hmd_yz.rotateY(Math.PI / 2);

    this.add(this.hmd = new Group().add(
      hmd_wire, hmd_forward, hmd_yz
    ));
    this.hmd.position.set(0, 0.5, 0);

    this.add(this.player = new ArrowHelper(
      vec3(0, 0, -1),
      vec3(0, 0, 0), 0.5, 'red'));
  }

  createCamera(height: number, width: number): Camera {
    const camera = new PerspectiveCamera(45, width / height, 0.1, 10);
    camera.position.set(-1.5, 1, -1.5);
    camera.lookAt(0, 1, 0);
    return camera;
  }

  protected init(renderer: Renderer, camera: Camera): void {
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.update();

    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.addEventListener(
      "dragging-changed",
      (event: any) => (orbitControls.enabled = !event.value)
    );
    // transformControls.addEventListener("objectChange", () => update());
    transformControls.space = "world";
    transformControls.mode = "rotate";
    transformControls.attach(this.hmd);

    this.add(transformControls.getHelper());
  }

  protected process(state: DemoProcessState): void {
    const projection = this.hmd
      .getWorldDirection(vec3())
      .negate()
      .projectOnPlane(vec3(0, 1, 0));
    const direction = vec3().copy(projection).normalize();
    this.player.setDirection(direction);
  }
}

const root = getById("vr-hmd-forward-root");
new Demo().run(root, root.clientWidth, 400);
