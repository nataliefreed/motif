// Patterns for "random pattern": where to repeat a step, as a path of points on the canvas. Every pattern
// starts where the step is, so the step stays where it was and the copies spread out from it.
import type { Point } from './transform';

export const patternKinds = ['sprinkles', 'grid', 'bricks', 'ring', 'spiral', 'wave'] as const;
export type PatternKind = typeof patternKinds[number];
type Size = { width: number; height: number };
type Random = () => number; // like Math.random

// A random pattern of any kind but `not`, which is the one it replaces
export function randomPattern(start: Point, size: Size, not?: PatternKind, random: Random = Math.random) {
  const kinds = patternKinds.filter(kind => kind !== not);
  const kind = kinds[Math.floor(random() * kinds.length)];
  return { kind, path: patternPath(kind, start, size, random) };
}

export function patternPath(kind: PatternKind, start: Point, size: Size, random: Random = Math.random): [number, number][] {
  const between = (low: number, high: number) => low + random() * (high - low);
  const count = (low: number, high: number) => Math.floor(between(low, high + 1));
  const points: Point[] = [start, ...otherPoints()];
  return points
    .map(({ x, y }) => [Math.round(x), Math.round(y)] as [number, number])
    .filter(([x, y], i) => i === 0 || (x >= 0 && x <= size.width && y >= 0 && y <= size.height));

  // the points after the start
  function otherPoints(): Point[] {
    const { width, height } = size;
    switch (kind) {
      case 'sprinkles': // scattered anywhere on the canvas
        return Array.from({ length: count(8, 30) }, () => ({ x: between(20, width - 20), y: between(20, height - 20) }));
      case 'grid': // a grid across the whole canvas, lined up so the start is one of its points
        return gridPoints(between(35, 150), between(35, 150), 0);
      case 'bricks': { // a grid with every other row shifted half a column, like bricks in a wall
        const across = between(40, 150);
        return gridPoints(across, between(30, 120), across / 2);
      }
      case 'ring': {
        // around a circle centered on the canvas, through the start if that circle fits on the canvas; around
        // the start if it's in the middle; otherwise around the middle, leaving the start where it is
        const middle = { x: width / 2, y: height / 2 };
        const fromMiddle = Math.hypot(start.x - middle.x, start.y - middle.y);
        const throughStart = fromMiddle >= 40 && fromMiddle <= Math.min(width, height) / 2 - 30;
        const center = fromMiddle < 40 ? start : middle;
        const radius = throughStart ? fromMiddle : between(60, Math.min(width, height) / 2 - 50);
        const startAngle = throughStart ? Math.atan2(start.y - middle.y, start.x - middle.x) : random() * 2 * Math.PI;
        const around = count(5, 16);
        return Array.from({ length: throughStart ? around - 1 : around }, (_, i) => {
          const angle = startAngle + (i + (throughStart ? 1 : 0)) * 2 * Math.PI / around;
          return { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) };
        });
      }
      case 'spiral': { // a sunflower spiral growing out from the start: each point turns the golden angle from the last
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        const spacing = between(18, 40);
        return Array.from({ length: count(15, 50) }, (_, i) => {
          const radius = spacing * Math.sqrt(i + 1), angle = (i + 1) * goldenAngle;
          return { x: start.x + radius * Math.cos(angle), y: start.y + radius * Math.sin(angle) };
        });
      }
      case 'wave': { // along a wavy line across the canvas, through the start
        const step = between(25, 60), waveHeight = between(20, 90), wavelength = between(150, 400);
        const xs = [];
        for (let x = start.x - step; x >= 0; x -= step) xs.push(x);
        for (let x = start.x + step; x <= width; x += step) xs.push(x);
        return xs.sort((a, b) => a - b).map(x => ({ x, y: start.y + waveHeight * Math.sin(2 * Math.PI * (x - start.x) / wavelength) }));
      }
    }
  }

  // the points of a grid of cells `across` by `down` covering the canvas, with the start as one of them and
  // every other row shifted by `shift`
  function gridPoints(across: number, down: number, shift: number): Point[] {
    const points: Point[] = [];
    for (let row = Math.ceil(-start.y / down); start.y + row * down <= size.height; row++) {
      const rowStart = start.x + (row % 2 === 0 ? 0 : shift);
      for (let column = Math.ceil(-rowStart / across); rowStart + column * across <= size.width; column++) {
        if (row !== 0 || column !== 0) points.push({ x: rowStart + column * across, y: start.y + row * down });
      }
    }
    return points;
  }
}
