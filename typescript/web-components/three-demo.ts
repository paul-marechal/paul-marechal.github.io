import * as three from 'three';
import type { MaybePromise } from '../type-utils';

export type Render = () => void;

export type ThreeDemo = (
  scene: three.Scene,
  renderer: three.WebGLRenderer,
  render: Render,
) => MaybePromise<three.Camera>;

export class HTMLThreeDemoElement extends HTMLElement {
  #abort?: AbortController;

  constructor() {
    super();
    this.style.display = 'block';
  }

  getSrc(): string | null | undefined {
    return this.getAttribute('src');
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
    this.init(this.#abort.signal);
  }

  disconnectCallback(): void {
    this.#abort?.abort();
    this.#abort = undefined;
  }

  #createRenderer(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
  ): three.WebGLRenderer {
    const renderer = new three.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    return renderer;
  }

  async init(abort: AbortSignal): Promise<void> {
    const src = this.getSrc();
    if (!src) {
      throw new Error("missing 'module' attribute!");
    }
    const nodeFactory = (await import(src)).default as ThreeDemo;
    if (abort.aborted || !nodeFactory) {
      return;
    }
    const shadow = this.attachShadow({ mode: 'closed' });
    shadow.innerHTML = '<slot></slot>';
    const canvas = document.createElement('canvas');
    shadow.appendChild(canvas);
    this.start(nodeFactory, canvas);
  }

  async start(
    nodeFactory: ThreeDemo,
    canvas: HTMLCanvasElement,
  ): Promise<void> {
    const width = this.getWidth();
    const height = this.getHeight();
    const renderer = this.#createRenderer(canvas, width, height);

    const scene = new three.Scene();
    const camera = await nodeFactory(scene, renderer, render);

    let pendingRender: Promise<number> | undefined;
    async function scheduleRender(): Promise<number> {
      const time = await new Promise(requestAnimationFrame);
      pendingRender = undefined;
      renderer.render(scene, camera);
      return time;
    }
    function render(): void {
      pendingRender ??= scheduleRender();
    }

    canvas.addEventListener('mousemove', () => render());
    render();
  }
}
