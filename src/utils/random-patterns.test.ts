import { describe, expect, it } from 'vitest';
import { patternKinds, patternPath, randomPattern } from './random-patterns';

const size = { width: 500, height: 500 };
// the same "random" numbers every time
function seeded(seed: number) {
  return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
}
const starts = [{ x: 250, y: 250 }, { x: 100, y: 380 }, { x: 0, y: 0 }, { x: 470, y: 60 }];

describe('random patterns', () => {
  for (const kind of patternKinds) {
    it(`${kind}: starts where the step is, and stays on the canvas`, () => {
      for (const [i, start] of starts.entries()) for (let seed = 1; seed < 20; seed++) {
        const path = patternPath(kind, start, size, seeded(seed * 31 + i));
        expect(path[0]).toEqual([start.x, start.y]);
        expect(path.length).toBeGreaterThanOrEqual(3);
        for (const [x, y] of path) {
          expect(Number.isInteger(x) && Number.isInteger(y)).toBe(true);
          expect(x >= 0 && x <= 500 && y >= 0 && y <= 500).toBe(true);
        }
      }
    });
  }

  it('grids line up with the start: every point is a whole number of cells from it', () => {
    const path = patternPath('grid', { x: 100, y: 380 }, size, seeded(7));
    const xs = [...new Set(path.map(([x]) => x))].sort((a, b) => a - b);
    const gaps = xs.slice(1).map((x, i) => x - xs[i]);
    expect(Math.max(...gaps) - Math.min(...gaps)).toBeLessThanOrEqual(1); // rounding to whole pixels
  });

  it('rings go around the canvas middle through the start, or around the start when it is in the middle', () => {
    const around = patternPath('ring', { x: 100, y: 250 }, size, seeded(3));
    for (const [x, y] of around) expect(Math.hypot(x - 250, y - 250)).toBeCloseTo(150, -0.5);
    const inMiddle = patternPath('ring', { x: 250, y: 250 }, size, seeded(3));
    const radii = inMiddle.slice(1).map(([x, y]) => Math.hypot(x - 250, y - 250));
    expect(Math.max(...radii) - Math.min(...radii)).toBeLessThan(2);
    const fromCorner = patternPath('ring', { x: 0, y: 0 }, size, seeded(3)); // too far out: around the middle
    const cornerRadii = fromCorner.slice(1).map(([x, y]) => Math.hypot(x - 250, y - 250));
    expect(Math.max(...cornerRadii) - Math.min(...cornerRadii)).toBeLessThan(2);
    expect(fromCorner.length).toBeGreaterThanOrEqual(6);
  });

  it('picks a different kind from the one it replaces, and over many tries, every kind', () => {
    const random = seeded(11);
    const kinds = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const { kind } = randomPattern({ x: 250, y: 250 }, size, 'grid', random);
      expect(kind).not.toBe('grid');
      kinds.add(kind);
    }
    expect([...kinds].sort()).toEqual(patternKinds.filter(k => k !== 'grid').sort());
  });
});
