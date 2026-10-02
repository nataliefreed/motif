import { describe, expect, it } from 'vitest';
import { honeycombCopies, rosetteCopies } from './Renderer.js';

type Copy = { x: number; y: number; size: number; angle: number };
const size = 500, center = { x: 250, y: 250 };
const distance = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);
// how far apart two round copies' edges are: 0 when they touch, below 0 when they overlap
const gap = (a: Copy, b: Copy) => distance(a, b) - (a.size + b.size) / 2;
const reachesCorner = (copies: Copy[]) =>
  Math.max(...copies.filter(c => c.x > center.x && c.y > center.y).map(c => distance(c, center) + c.size / 2)) >= distance({ x: size, y: size }, center) - 1;

describe('honeycombCopies', () => {
  const copies = honeycombCopies(3, size);

  it('puts one copy in the middle, then rings of 6, 12 and 18, all the same size', () => {
    expect(copies[0]).toMatchObject({ x: center.x, y: center.y, angle: 0 });
    expect(copies).toHaveLength(1 + 6 + 12 + 18);
    expect(new Set(copies.map(c => c.size)).size).toBe(1);
  });

  it('makes every copy touch its nearest neighbors, and reaches the corners', () => {
    for (const copy of copies) expect(Math.min(...copies.filter(c => c !== copy).map(c => gap(copy, c)))).toBeCloseTo(0);
    expect(reachesCorner(copies)).toBe(true);
  });
});

describe('rosetteCopies', () => {
  const copies = rosetteCopies(3, size);
  const rings = [copies.slice(1, 9), copies.slice(9, 21), copies.slice(21, 37)];

  it('puts one copy in the middle, then rings of 8, 12 and 16', () => {
    expect(copies[0]).toMatchObject({ x: center.x, y: center.y, angle: 0 });
    expect(copies).toHaveLength(1 + 8 + 12 + 16);
    for (const ring of rings) expect(new Set(ring.map(c => Math.round(distance(c, center)))).size).toBe(1);
  });

  it('makes every copy touch its neighbors, in its ring and the rings beside it, without overlapping', () => {
    for (const copy of copies) expect(Math.min(...copies.filter(c => c !== copy).map(c => gap(copy, c)))).toBeCloseTo(0);
    expect(gap(copies[0], rings[0][0])).toBeCloseTo(0);
    expect(Math.min(...rings[0].flatMap(a => rings[1].map(b => gap(a, b))))).toBeGreaterThan(-0.001);
    expect(Math.min(...rings[1].flatMap(a => rings[2].map(b => gap(a, b))))).toBeGreaterThan(-0.001);
  });

  it('grows the copies gently outward and reaches the corners', () => {
    const sizes = rings.map(ring => ring[0].size);
    expect(sizes[0]).toBeLessThan(sizes[1]);
    expect(sizes[1]).toBeLessThan(sizes[2]);
    expect(sizes[2] / sizes[1]).toBeLessThan(1.5);
    expect(reachesCorner(copies)).toBe(true);
  });
});
