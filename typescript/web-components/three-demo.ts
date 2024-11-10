import * as three from 'three';

export interface ReadyState {
  readonly scene: three.Scene;
  readonly camera: three.Camera;
  readonly renderer: three.Renderer;
  render(): void;
}

export interface ProcessState extends ReadyState {
  readonly delta: number;
}

export interface ThreeModule {
  render?: 'auto' | 'manual';
  createCamera(width: number, height: number): three.Camera;
  ready?(state: ReadyState): void;
  process?(state: ProcessState): void;
}

export class HTMLThreeDemoElement extends HTMLElement {
  #lastAnimationFrame = -1;
  #abort?: AbortController;

  constructor() {
    super();
    this.style.display = 'block';
  }

  getModule(): string | null | undefined {
    return this.getAttribute('module');
  }

  getWidth(): number {
    return this.hasAttribute('width')
      ? Number.parseInt(this.getAttribute('width')!)
      : this.clientWidth;
  }

  getHeight(): number {
    return this.hasAttribute('height')
      ? Number.parseInt(this.getAttribute('height')!)
      : this.clientHeight;
  }

  connectedCallback(): void {
    this.#abort = new AbortController();
    this.#start(this.#abort.signal);
  }

  disconnectCallback(): void {
    this.#abort?.abort();
    this.#abort = undefined;
  }

  #createRenderer(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
  ): three.Renderer {
    const renderer = new three.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    return renderer;
  }

  async #start(abort: AbortSignal): Promise<void> {
    const src = this.getModule();
    if (!src) {
      throw new Error("missing 'module' attribute!");
    }
    const nodeFactory: () => ThreeModule = (await import(src)).default;
    if (abort.aborted || !nodeFactory) {
      return;
    }
    this.attachShadow({ mode: 'open' });
    const canvas = document.createElement('canvas');
    this.shadowRoot!.appendChild(canvas);
    this.#mainLoop(nodeFactory(), canvas, abort);
  }

  async #mainLoop(
    node: ThreeModule,
    canvas: HTMLCanvasElement,
    abort: AbortSignal,
  ): Promise<void> {
    const width = this.getWidth();
    const height = this.getHeight();
    const renderer = this.#createRenderer(canvas, width, height);
    const camera = node.createCamera(width, height);
    const scene = new three.Scene();
    const state = {
      delta: 0,
      scene,
      camera,
      renderer,
      render() {
        this.renderer.render(this.scene, this.camera);
      },
    } satisfies ReadyState | ProcessState;

    canvas.addEventListener('mousemove', () => {
      state.render();
    });
    node.ready?.(state);
    state.render();

    while (node.render == 'auto' && !abort.aborted) {
      const time = await new Promise(requestAnimationFrame);
      if (abort.aborted) return;
      if (this.#lastAnimationFrame != -1) {
        state.delta = time - this.#lastAnimationFrame;
        node.process?.(state);
      }
      this.#lastAnimationFrame = time;
      state.render();
    }
  }
}
