import { describe, expect, it } from 'vitest';
import { radialCopies } from './Renderer.js';

describe('radialCopies', () => {
  const size = 500, center = size / 2;
  const copies = radialCopies(8, 3, size);
  const rings = [copies.slice(16, 24), copies.slice(8, 16), copies.slice(0, 8)]; // listed outermost first
  const radius = (c: { x: number; y: number }) => Math.hypot(c.x - center, c.y - center);

  it('puts one copy in the middle, drawn last, and the given number around each ring', () => {
    expect(copies).toHaveLength(1 + 8 * 3);
    expect(copies.at(-1)).toMatchObject({ x: center, y: center, angle: 0 });
    for (const ring of rings) expect(new Set(ring.map(c => Math.round(radius(c)))).size).toBe(1);
  });

  it('makes each ring touch the next, and the middle copy touch the first ring', () => {
    const middle = copies.at(-1)!;
    expect(middle.size / 2).toBeCloseTo(radius(rings[0][0]) - rings[0][0].size / 2);
    for (let i = 0; i + 1 < rings.length; i++) {
      expect(radius(rings[i + 1][0]) - rings[i + 1][0].size / 2).toBeCloseTo(radius(rings[i][0]) + rings[i][0].size / 2);
    }
  });

  it('grows the copies outward until the outermost ring reaches the corners', () => {
    expect(rings[0][0].size).toBeLessThan(rings[1][0].size);
    expect(rings[1][0].size).toBeLessThan(rings[2][0].size);
    expect(radius(rings[2][0]) + rings[2][0].size / 2).toBeCloseTo(center * Math.SQRT2);
  });
});
