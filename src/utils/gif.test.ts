import { describe, expect, it } from 'vitest';
import { GifFrames, addDesignToGif, designFromGif, isGif } from './gif';

const size = 8;
// a picture `size` square in one color, with an optional square of another color at its top left
function picture(color: number[], spot?: { color: number[]; size: number }) {
  const rgba = new Uint8ClampedArray(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const inSpot = spot && x < spot.size && y < spot.size;
    rgba.set([...(inSpot ? spot.color : color), 255], (y * size + x) * 4);
  }
  return rgba;
}

// Walks a GIF's blocks: its frames (delay in milliseconds, whether see-through) and whether it ends properly
function readGif(bytes: Uint8Array) {
  const packed = bytes[10];
  let at = 13 + (packed & 0x80 ? 3 * (1 << ((packed & 7) + 1)) : 0);
  const frames: { delay: number; seeThrough: boolean }[] = [];
  let control = { delay: 0, seeThrough: false };
  const skipSubBlocks = () => { while (bytes[at] !== 0) at += 1 + bytes[at]; at++; };
  while (at < bytes.length) {
    if (bytes[at] === 0x21) {
      if (bytes[at + 1] === 0xf9) control = { delay: (bytes[at + 4] | (bytes[at + 5] << 8)) * 10, seeThrough: (bytes[at + 3] & 1) === 1 };
      at += 2;
      skipSubBlocks();
    } else if (bytes[at] === 0x2c) {
      const p = bytes[at + 9];
      at += 10 + (p & 0x80 ? 3 * (1 << ((p & 7) + 1)) : 0) + 1;
      skipSubBlocks();
      frames.push(control);
    } else {
      return { frames, ends: bytes[at] === 0x3b && at === bytes.length - 1 };
    }
  }
  return { frames, ends: false };
}

describe('GifFrames', () => {
  it('makes a looping GIF, merging pictures that look the same into one longer frame', () => {
    const gif = new GifFrames(size, size);
    gif.add(picture([255, 255, 255]), 100);
    gif.add(picture([255, 255, 255], { color: [200, 0, 0], size: 3 }), 100);
    gif.add(picture([255, 255, 255], { color: [200, 0, 0], size: 3 }), 100); // no change: the frame before lasts longer
    gif.add(picture([255, 255, 255], { color: [0, 0, 200], size: 5 }), 2000);
    const bytes = gif.finish();
    expect(isGif(bytes)).toBe(true);
    const { frames, ends } = readGif(bytes);
    expect(ends).toBe(true);
    expect(frames.map(f => f.delay)).toEqual([100, 200, 2000]);
    expect(frames.map(f => f.seeThrough)).toEqual([false, true, true]); // later frames keep only what changed
  });

  it('keeps time: each frame lasts whole hundredths of a second, without the rounding adding up', () => {
    const gif = new GifFrames(size, size);
    for (let i = 0; i < 30; i++) gif.add(picture([i * 8, 0, 0]), 1000 / 15);
    const delays = readGif(gif.finish()).frames.map(f => f.delay);
    expect(delays).toHaveLength(30);
    expect(delays.reduce((a, b) => a + b)).toBe(2000);
    for (const delay of delays) expect([60, 70]).toContain(delay);
  });
});

describe('the design saved in a GIF', () => {
  const gif = (() => { const g = new GifFrames(size, size); g.add(picture([10, 20, 30]), 100); g.add(picture([10, 20, 30], { color: [1, 2, 3], size: 2 }), 100); return g.finish(); })();
  const design = JSON.stringify({ store: { title: 'La recette de mon dessin — ñ, é, 🎨' }, colors: Array.from({ length: 200 }, (_, i) => `#${i}`) });

  it('comes back exactly, and the GIF still has all its frames', () => {
    expect(design.length).toBeGreaterThan(255); // more than one sub-block
    const withDesign = addDesignToGif(gif, design);
    expect(designFromGif(withDesign)).toBe(design);
    expect(readGif(withDesign)).toEqual(readGif(gif));
    expect(String.fromCharCode(...withDesign.subarray(0, 6))).toBe('GIF89a');
  });

  it('is missing from other GIFs and other files', () => {
    expect(designFromGif(gif)).toBeNull();
    expect(designFromGif(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 13, 10, 26, 10, 0, 0, 0, 0, 0, 0, 0, 0]))).toBeNull();
  });
});
