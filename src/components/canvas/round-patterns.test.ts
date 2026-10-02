import { describe, expect, it } from 'vitest';
import { honeycombCopies, rosetteCopies } from './Renderer.js';

type Copy = { x: number; y: number; size: number; angle: number; shape: string };
const size = 500, center = { x: 250, y: 250 };
const distance = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);
// how far apart two round copies' edges are: 0 when they touch, below 0 when they overlap
const gap = (a: Copy, b: Copy) => distance(a, b) - (a.size + b.size) / 2;
const reachesCorner = (copies: Copy[]) =>
  Math.max(...copies.filter(c => c.x > center.x && c.y > center.y).map(c => distance(c, center) + c.size / 2)) >= distance({ x: size, y: size }, center) - 1;

describe('honeycombCopies', () => {
  const copies = honeycombCopies(3, size);
  const spacing = Math.min(...copies.slice(1).map(c => distance(c, copies[0])));
  // whether a point is in the hexagon `across` wide (flat side to flat side, standing on a corner) around a copy
  const inHexagon = (point: { x: number; y: number }, copy: Copy, across: number) =>
    [0, 60, 120].every(degrees => {
      const a = degrees * Math.PI / 180;
      return Math.abs((point.x - copy.x) * Math.cos(a) + (point.y - copy.y) * Math.sin(a)) <= across / 2 + 1e-9;
    });

  it('puts one hexagon in the middle, then rings of 6, 12 and 18, all the same size', () => {
    expect(copies[0]).toMatchObject({ x: center.x, y: center.y, angle: 0, shape: 'hexagon' });
    expect(copies).toHaveLength(1 + 6 + 12 + 18);
    expect(new Set(copies.map(c => c.size)).size).toBe(1);
  });

  it('fits the hexagons together, each touching its neighbors flat side to flat side', () => {
    for (const copy of copies) {
      const neighbors = copies.filter(c => c !== copy && distance(c, copy) < spacing * 1.01);
      expect(neighbors.length).toBeGreaterThanOrEqual(3);
      expect(neighbors.length).toBeLessThanOrEqual(6);
      for (const neighbor of neighbors) expect(distance(neighbor, copy)).toBeCloseTo(spacing);
    }
    expect(copies[0].size).toBeCloseTo(spacing);
  });

  it('covers the whole canvas', () => {
    for (let x = 0; x <= size; x += 5) {
      for (let y = 0; y <= size; y += 5) {
        const point = { x, y };
        const nearest = copies.reduce((a, b) => (distance(a, point) < distance(b, point) ? a : b));
        expect(inHexagon(point, nearest, nearest.size)).toBe(true);
      }
    }
  });
});

describe('rosetteCopies', () => {
  const copies = rosetteCopies(3, size);
  const rings = [copies.slice(1, 7), copies.slice(7, 16), copies.slice(16, 28)];
  const nearestGap = (copy: Copy, others: Copy[]) => Math.min(...others.filter(c => c !== copy).map(c => gap(copy, c)));

  it('puts one copy in the middle, then rings of 6, 9 and 12', () => {
    expect(copies[0]).toMatchObject({ x: center.x, y: center.y, angle: 0, shape: 'circle' });
    expect(copies).toHaveLength(1 + 6 + 9 + 12);
    for (const ring of rings) expect(new Set(ring.map(c => Math.round(distance(c, center)))).size).toBe(1);
  });

  it('makes the middle copy the same size as the six around it, and grows the rings gently outward', () => {
    const sizes = [copies[0].size, ...rings.map(ring => ring[0].size)];
    expect(sizes[1]).toBeCloseTo(sizes[0]);
    for (let i = 2; i < sizes.length; i++) {
      expect(sizes[i]).toBeGreaterThan(sizes[i - 1]);
      expect(sizes[i] / sizes[i - 1]).toBeLessThan(1.6);
    }
    expect(reachesCorner(copies)).toBe(true);
  });

  it('spaces the copies evenly: touching in their ring, and close to the ring inside all the way around', () => {
    for (const ring of rings) for (const copy of ring) expect(nearestGap(copy, ring)).toBeCloseTo(0);
    for (const copy of rings[0]) expect(gap(copy, copies[0])).toBeCloseTo(0);
    for (let k = 1; k < rings.length; k++) {
      const gaps = rings[k].map(copy => nearestGap(copy, rings[k - 1]));
      expect(Math.min(...gaps)).toBeCloseTo(0); // the ring rests on the one inside
      for (const [i, copy] of rings[k].entries()) expect(gaps[i]).toBeLessThan(0.1 * copy.size);
    }
  });

  it('never lets copies cover each other, however many rings', () => {
    for (let count = 1; count <= 12; count++) {
      const all = rosetteCopies(count, size);
      for (const copy of all) expect(nearestGap(copy, all)).toBeGreaterThan(-1e-6);
      expect(reachesCorner(all)).toBe(true);
    }
  });
});
