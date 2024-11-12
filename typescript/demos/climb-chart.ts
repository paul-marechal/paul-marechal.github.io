import * as three from 'three';
// @ts-expect-error
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { vec2 } from '../three-utils.js';
import { as, value, Value } from '../type-utils.js';
import { ThreeDemo } from '../web-components/three-demo.js';
import { getById } from '../dom-utils.js';
import { remap } from '../math-utils.js';

const GRAVITY = 9.8;

export default as<ThreeDemo>((scene, renderer, render) => {
  const apex = value(0.5);
  const v0offset = value(0);
  const v0 = apex.map(computeV0);

  apex.listen(updateApex);
  v0offset.listen(updateVelocity);
  v0.listen(updateVelocity);

  function updateVelocity() {
    v0offsetLabel.innerText = v0offset.value.toFixed(2).padStart(5, '+');
    v0label.innerText = 'v0=' + (v0.value + v0offset.value).toFixed(2) + 'm/s';
    updateTrajectory();
  }

  function updateApex() {
    apexLabel.innerText = 'apex=' + apex.value.toFixed(2) + 'm';
    apexLabel.style.bottom = `${remap(apex.value + 0.1, 0, 1.2, 0, 100)}%`;
  }

  function updateTrajectory(): void {
    const v = v0.value + v0offset.value;
    const points = [];
    for (let t = 0; t < 1; t += 0.05) {
      points.push(0, y(t, v), t * 3);
    }
    trajectoryBuffer.setAttribute(
      'position',
      new three.Float32BufferAttribute(points, 3),
    );
    render();
  }

  const apexLabel = getById('chart-apex-label');
  const v0label = getById('chart-v0-label');
  const v0offsetInput = getById('chart-v0-offset-input', HTMLInputElement);
  const v0offsetLabel = getById('chart-v0-offset-label', HTMLLabelElement);
  v0offsetInput.addEventListener('input', event => {
    v0offset.value = parseFloat(v0offsetInput.value);
  });

  const size = renderer.getSize(vec2());
  const ratio = size.x / size.y;
  const height = 1.2;
  const width = height * ratio;
  const camera = new three.OrthographicCamera(
    -0.1 * ratio,
    width - 0.1 * ratio,
    height - 0.1,
    -0.1,
    0.1,
    2,
  );
  camera.position.setX(-1);
  camera.lookAt(0, 0, 0);

  {
    const grid = new three.GridHelper(50, 500);
    grid.rotateZ(Math.PI / 2);
    grid.position.x = 1;
    scene.add(grid);
  }

  const apexLine = new three.Line(
    new three.BufferGeometry().setAttribute(
      'position',
      new three.Float32BufferAttribute([0, 0, -10, 0, 0, 10], 3),
    ),
    new three.LineBasicMaterial({ color: 'red' }),
  );
  apexLine.position.y = apex.value;
  scene.add(apexLine);

  const trajectoryBuffer = new three.BufferGeometry();
  {
    trajectoryBuffer.setAttribute(
      'position',
      new three.Float32BufferAttribute([], 3),
    );
    const line = new three.Line(
      trajectoryBuffer,
      new three.LineBasicMaterial({ color: 'blue' }),
    );
    scene.add(line);
  }

  const transform = new TransformControls(camera, renderer.domElement);
  transform.space = 'world';
  transform.mode = 'translate';
  transform.showX = false;
  transform.showY = true;
  transform.showZ = false;
  transform.minY = 0.2;
  transform.maxY = 0.8;
  transform.attach(apexLine);

  scene.add(transform.getHelper());

  transform.addEventListener(
    'objectChange',
    () => (apex.value = apexLine.position.y),
  );

  setTimeout(updateApex);
  setTimeout(updateVelocity);

  return camera;
});

function computeV0(apex: number): number {
  return Math.sqrt(2 * GRAVITY * apex);
}

function y(t: number, v0: number): number {
  return v0 * t - 0.5 * GRAVITY * t * t;
}
