// The parts of gifenc (github.com/mattdesl/gifenc) MOTIF uses; the package has no types of its own.
declare module 'gifenc' {
  type Palette = number[][];
  type Format = 'rgb565' | 'rgb444' | 'rgba4444';
  export function GIFEncoder(options?: { auto?: boolean; initialCapacity?: number }): {
    writeFrame(index: Uint8Array, width: number, height: number, options?: {
      palette?: Palette; delay?: number; transparent?: boolean; transparentIndex?: number;
      repeat?: number; colorDepth?: number; dispose?: number; first?: boolean;
    }): void;
    finish(): void;
    bytes(): Uint8Array;
  };
  export function quantize(rgba: Uint8Array | Uint8ClampedArray, maxColors: number, options?: { format?: Format }): Palette;
  export function applyPalette(rgba: Uint8Array | Uint8ClampedArray, palette: Palette, format?: Format): Uint8Array;
}
