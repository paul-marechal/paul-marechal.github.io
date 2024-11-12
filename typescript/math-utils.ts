export function inverseLerp(from: number, to: number, weight: number): number {
  return (weight - from) / (to - from);
}

export function lerp(from: number, to: number, weight: number): number {
  return from + (to - from) * weight;
}

export function remap(
  value: number,
  astart: number,
  astop: number,
  ostart: number,
  ostop: number,
): number {
  return lerp(ostart, ostop, inverseLerp(astart, astop, value));
}
