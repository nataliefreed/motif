import { describe, expect, it } from 'vitest';
import tinycolor from 'tinycolor2';
import { distinctColors, withShades } from '../utils/color-utils';
import { get } from 'svelte/store';
import { palettePresets, fillPalette, customPalette, replaceActivePalette, updateColorInPalette, activePalette } from '../stores/colorStore';

// RGBA pixels for a palette picture laid out like exportPalette: equal tiles, 6 to a row, in letter order
function palettePicture(colors: string[], tile = 60, columns = 6): Uint8ClampedArray {
  const width = columns * tile, height = Math.ceil(colors.length / columns) * tile;
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const { r, g, b } = tinycolor(colors[Math.floor(y / tile) * columns + Math.floor(x / tile)]).toRgb();
      pixels.set([r, g, b, 255], (y * width + x) * 4);
    }
  }
  return pixels;
}

function pixelsOf(...runs: [rgba: number[], times: number][]): Uint8ClampedArray {
  return Uint8ClampedArray.from(runs.flatMap(([rgba, times]) => Array.from({ length: times }, () => rgba).flat()));
}

describe('built-in palettes', () => {
  it('have a valid color for each of the 12 palette letters', () => {
    for (const [name, colors] of Object.entries(palettePresets)) {
      expect(colors, name).toHaveLength(12);
      for (const color of colors) expect(tinycolor(color).isValid(), `${name}: ${color}`).toBe(true);
    }
  });
});

describe('distinctColors', () => {
  it('gives back a saved palette picture\'s colors, each on the same letter', () => {
    for (const [name, colors] of Object.entries(palettePresets)) {
      const expected = colors.map(color => tinycolor(color).toHexString());
      expect(distinctColors(palettePicture(colors), 12), name).toEqual(expected);
    }
  });

  it('counts similar shades together, most common first', () => {
    const pixels = pixelsOf(
      [[30, 60, 200, 255], 300], [[32, 62, 203, 255], 100], // blue, in two close shades
      [[200, 20, 20, 255], 600],                             // red
      [[0, 255, 0, 0], 900],                                 // transparent green
    );
    expect(distinctColors(pixels, 12)).toEqual(['#c81414', '#1f3dc9']);
  });

  it('chooses colors that differ over more shades of a common one', () => {
    const pixels = pixelsOf(
      [[230, 220, 200, 255], 300], [[200, 190, 170, 255], 250], [[170, 160, 140, 255], 200], // three beiges
      [[200, 20, 20, 255], 80],                                                              // red
      [[30, 60, 200, 255], 60],                                                              // blue
    );
    expect(distinctColors(pixels, 3)).toEqual(['#e6dcc8', '#c81414', '#1e3cc8']);
  });

  it('leaves out colors too small to be more than specks', () => {
    const pixels = pixelsOf([[255, 255, 255, 255], 999], [[255, 0, 0, 255], 1]);
    expect(distinctColors(pixels, 12)).toEqual(['#ffffff']);
  });

  it('gives fewer colors when the picture has fewer', () => {
    expect(distinctColors(pixelsOf([[255, 255, 255, 255], 10]), 12)).toEqual(['#ffffff']);
    expect(distinctColors(pixelsOf([[0, 0, 0, 0], 10]), 12)).toEqual([]);
  });
});

describe('withShades', () => {
  it('fills out the palette with lighter and darker versions, most common color first', () => {
    const found = ['#c81414', '#1e3cc8', '#e6dcc8'];
    const palette = withShades(found, 12);
    expect(palette).toHaveLength(12);
    expect(palette.slice(0, 3)).toEqual(found);
    expect(palette[3]).toBe(tinycolor('#c81414').lighten(20).toHexString());
    expect(palette[4]).toBe(tinycolor('#c81414').darken(20).toHexString());
    expect(new Set(palette).size).toBe(12);
  });

  it('gives white only darker versions, since a lighter white looks the same', () => {
    const palette = withShades(['#ffffff'], 4);
    expect(palette).toEqual(['#ffffff', '#cccccc', '#a6a6a6', '#808080']);
  });

  it('leaves a full palette as it is', () => {
    expect(withShades(palettePresets.denim, 12)).toEqual(palettePresets.denim);
  });
});

describe('fillPalette', () => {
  it('keeps the current color for letters the new colors do not reach', () => {
    expect(fillPalette(['#111111', '#222222'], ['#aaaaaa', '#bbbbbb', '#cccccc'])).toEqual(['#111111', '#222222', '#cccccc']);
  });
});

describe('customPalette', () => {
  it('remembers the latest colors that are not a built-in palette, even after choosing one', () => {
    expect(get(customPalette)).toBeNull(); // the starting colors are built in

    updateColorInPalette(0, '#123456');
    const edited = get(activePalette);
    expect(get(customPalette)).toEqual(edited);

    replaceActivePalette(palettePresets.denim);
    expect(get(customPalette)).toEqual(edited);

    replaceActivePalette(['#000000', ...palettePresets.denim.slice(1)]);
    expect(get(customPalette)?.[0]).toBe('#000000');
  });
});
