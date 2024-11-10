import {
  AxesHelper,
  Camera,
  GridHelper,
  Matrix3,
  Object3D,
  Renderer,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';

export function vec3(x = 0, y = 0, z = 0): Vector3 {
  return new Vector3(x, y, z);
}

export function basis(x: Vector3, y: Vector3, z: Vector3): Matrix3 {
  return new Matrix3().set(x.x, y.x, z.x, x.y, y.y, y.z, x.z, y.z, z.z);
}

export interface DemoProcessState {
  readonly delta: number;
  readonly camera: Camera;
  readonly renderer: Renderer;
}

export abstract class ThreeDemo {
  #lastAnimationFrame = -1;

  readonly scene: Scene;

  constructor() {
    this.scene = new Scene();
  }

  abstract createCamera(height: number, width: number): Camera;

  protected createRenderer(width: number, height: number): Renderer {
    const renderer = new WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    return renderer;
  }

  protected addDefaultGrid(): this {
    return this.add(new AxesHelper(5), new GridHelper(2, 10));
  }

  protected add(...objects: Object3D[]): this {
    this.scene.add(...objects);
    return this;
  }

  protected init(renderer: Renderer, camera: Camera): void {}
  protected process(state: DemoProcessState): void {}

  async run(root: HTMLElement, width: number, height: number): Promise<void> {
    const renderer = this.createRenderer(width, height);
    const camera = this.createCamera(width, height);
    const state = { delta: 0, camera, renderer } satisfies DemoProcessState;
    root.appendChild(renderer.domElement);
    const render = (time: number) => {
      if (this.#lastAnimationFrame != -1) {
        state.delta = time - this.#lastAnimationFrame;
        this.process(state);
      }
      this.#lastAnimationFrame = time;
      renderer.render(this.scene, camera);
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
    // while (true) {
    //   const time = await new Promise(requestAnimationFrame);
    //   if (this.#lastAnimationFrame != -1) {
    //     state.delta = time - this.#lastAnimationFrame;
    //     this.process(state);
    //   }
    //   this.#lastAnimationFrame = time;
    //   renderer.render(this.scene, camera);
    // }
  }
}
