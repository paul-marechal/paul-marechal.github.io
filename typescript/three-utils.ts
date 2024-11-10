import * as three from 'three';

export function vec3(x = 0, y = 0, z = 0): three.Vector3 {
  return new three.Vector3(x, y, z);
}

export function basis(
  x: three.Vector3,
  y: three.Vector3,
  z: three.Vector3,
): three.Matrix3 {
  return new three.Matrix3().set(x.x, y.x, z.x, x.y, y.y, y.z, x.z, y.z, z.z);
}

export interface InitState {
  readonly camera: three.Camera;
  readonly renderer: three.Renderer;
}

export interface ProcessState extends InitState {
  readonly delta: number;
}

export abstract class ThreeDemo {
  #lastAnimationFrame = -1;

  readonly scene: three.Scene;

  constructor() {
    this.scene = new three.Scene();
  }

  abstract createCamera(height: number, width: number): three.Camera;

  protected createRenderer(width: number, height: number): three.Renderer {
    const renderer = new three.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    return renderer;
  }

  protected addDefaultGrid(): this {
    return this.add(new three.AxesHelper(5), new three.GridHelper(2, 10));
  }

  protected add(...objects: three.Object3D[]): this {
    this.scene.add(...objects);
    return this;
  }

  protected init(state: InitState): void {}
  protected process(state: ProcessState): void {}

  async run(root: HTMLElement, width: number, height: number): Promise<void> {
    const renderer = this.createRenderer(width, height);
    const camera = this.createCamera(width, height);
    const state = { delta: 0, camera, renderer } satisfies ProcessState;
    root.appendChild(renderer.domElement);
    this.init(state);
    while (true) {
      const time = await new Promise(requestAnimationFrame);
      if (this.#lastAnimationFrame != -1) {
        state.delta = time - this.#lastAnimationFrame;
        this.process(state);
      }
      this.#lastAnimationFrame = time;
      renderer.render(this.scene, camera);
    }
  }
}
