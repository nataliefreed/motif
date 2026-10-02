// Animated GIFs of a design: building their frames, and keeping the design's recipe inside them.
import { GIFEncoder, quantize, applyPalette } from 'gifenc';

// Builds an animated GIF from pictures of the same size, added in order, each shown for some milliseconds.
// A picture that looks the same as the one before only makes it last longer. After the first, a frame
// stores only the pixels that changed and leaves the rest see-through, so the frame before shows through.
export class GifFrames {
  #gif = GIFEncoder();
  #shown: Uint8ClampedArray | null = null; // the picture so far
  #pending: { index: Uint8Array; palette: number[][]; seeThrough: number; first: boolean } | null = null;
  #pendingStart = 0; // when the pending frame starts, in milliseconds
  #time = 0; // the total time so far, in milliseconds

  constructor(readonly width: number, readonly height: number) {}

  add(rgba: Uint8ClampedArray, milliseconds: number) {
    const changed: number[] = []; // pixel numbers
    for (let pixel = 0; pixel < this.width * this.height; pixel++) {
      const i = pixel * 4;
      if (!this.#shown || rgba[i] !== this.#shown[i] || rgba[i + 1] !== this.#shown[i + 1] || rgba[i + 2] !== this.#shown[i + 2] || rgba[i + 3] !== this.#shown[i + 3]) {
        changed.push(pixel);
      }
    }
    if (changed.length === 0 && this.#pending) {
      this.#time += milliseconds;
      return;
    }
    this.#writePending();

    // a palette for just the pixels that changed, plus one more color for the see-through ones
    const changedColors = new Uint8ClampedArray(changed.length * 4);
    changed.forEach((pixel, j) => changedColors.set(rgba.subarray(pixel * 4, pixel * 4 + 4), j * 4));
    const palette = quantize(changedColors, 255);
    const changedIndex = applyPalette(changedColors, palette);
    const seeThrough = palette.length;
    palette.push([0, 0, 0]);
    const index = new Uint8Array(this.width * this.height).fill(seeThrough);
    changed.forEach((pixel, j) => (index[pixel] = changedIndex[j]));

    this.#pending = { index, palette, seeThrough, first: !this.#shown };
    this.#pendingStart = this.#time;
    this.#time += milliseconds;
    this.#shown = this.#shown ?? new Uint8ClampedArray(rgba.length);
    for (const pixel of changed) this.#shown.set(rgba.subarray(pixel * 4, pixel * 4 + 4), pixel * 4);
  }

  // The finished GIF, which loops forever.
  finish(): Uint8Array {
    this.#writePending();
    this.#gif.finish();
    return this.#gif.bytes();
  }

  #writePending() {
    if (!this.#pending) return;
    const { index, palette, seeThrough, first } = this.#pending;
    // frames last whole hundredths of a second: round when each starts and ends, so rounding doesn't add up
    const delay = Math.round(this.#time / 10) * 10 - Math.round(this.#pendingStart / 10) * 10;
    // dispose 1 leaves each frame in place under the next, which shows through its see-through pixels
    this.#gif.writeFrame(index, this.width, this.height, { palette, delay, transparent: !first, transparentIndex: seeThrough, dispose: 1 });
    this.#pending = null;
  }
}

// A design saved as a GIF keeps its recipe in an application extension block, which GIF viewers skip:
// 0x21 0xFF, an 11-byte name, then the data in sub-blocks of up to 255 bytes, ended by an empty one.
const designBlockName = 'MOTIFDSN1.0';

// Where a GIF's blocks start: after its 6-byte header, 7-byte screen descriptor and global color table, if any.
function firstBlock(gif: Uint8Array) {
  const packed = gif[10];
  return 13 + (packed & 0x80 ? 3 * (1 << ((packed & 7) + 1)) : 0);
}

export function isGif(bytes: Uint8Array) {
  return bytes.length > 13 && String.fromCharCode(...bytes.subarray(0, 4)) === 'GIF8';
}

// The GIF with the design's recipe (text) added in a block before its frames.
export function addDesignToGif(gif: Uint8Array, design: string): Uint8Array<ArrayBuffer> {
  const data = new TextEncoder().encode(design);
  const subBlocks = Math.ceil(data.length / 255);
  const block = new Uint8Array(3 + designBlockName.length + subBlocks + data.length + 1);
  block.set([0x21, 0xff, designBlockName.length]);
  block.set(new TextEncoder().encode(designBlockName), 3);
  let at = 3 + designBlockName.length;
  for (let i = 0; i < data.length; i += 255) {
    const chunk = data.subarray(i, i + 255);
    block[at] = chunk.length;
    block.set(chunk, at + 1);
    at += 1 + chunk.length;
  }
  block[at] = 0;

  const start = firstBlock(gif);
  const withDesign = new Uint8Array(gif.length + block.length);
  withDesign.set(gif.subarray(0, start));
  withDesign.set(block, start);
  withDesign.set(gif.subarray(start), start + block.length);
  return withDesign;
}

// The design's recipe saved in a GIF by addDesignToGif, or null if it has none.
export function designFromGif(bytes: Uint8Array): string | null {
  if (!isGif(bytes)) return null;
  let at = firstBlock(bytes);
  // the sub-blocks starting at `at`, and where they end
  const readSubBlocks = () => {
    const blocks: Uint8Array[] = [];
    while (at < bytes.length && bytes[at] !== 0) {
      blocks.push(bytes.subarray(at + 1, at + 1 + bytes[at]));
      at += 1 + bytes[at];
    }
    at++;
    return blocks;
  };
  while (at < bytes.length) {
    const kind = bytes[at];
    if (kind === 0x21) { // an extension: its label, then sub-blocks
      const label = bytes[at + 1];
      at += 2;
      const [name, ...data] = readSubBlocks();
      if (label === 0xff && name && new TextDecoder().decode(name) === designBlockName) {
        const joined = new Uint8Array(data.reduce((n, b) => n + b.length, 0));
        let offset = 0;
        for (const b of data) { joined.set(b, offset); offset += b.length; }
        return new TextDecoder().decode(joined);
      }
    } else if (kind === 0x2c) { // a frame: its descriptor, maybe a color table, then its pixels
      const packed = bytes[at + 9];
      at += 10 + (packed & 0x80 ? 3 * (1 << ((packed & 7) + 1)) : 0) + 1; // the 1 is the code size
      readSubBlocks();
    } else {
      return null; // the end (0x3b), or not a GIF we can read
    }
  }
  return null;
}

