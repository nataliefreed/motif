import { beforeEach, describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import { activePalette, currentColor, currentIndexedColor, randomizeCurrentColor, setCurrentColor, setUsePaletteColors, usePaletteColors } from './colorStore';

describe('brush color switches', () => {
  beforeEach(() => setUsePaletteColors(true));

  it('palette colors on: surprise colors picks a new palette letter', () => {
    for (let i = 0; i < 10; i++) {
      randomizeCurrentColor();
      const { index } = get(currentIndexedColor);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(get(currentColor)).toBe(get(activePalette)[index]);
    }
  });

  it('palette colors off: surprise colors picks any color, not tied to a letter', () => {
    setUsePaletteColors(false);
    randomizeCurrentColor();
    expect(get(currentIndexedColor).index).toBe(-1);
  });

  it('turning palette colors off keeps the brush color but frees it from its letter', () => {
    setCurrentColor(get(activePalette)[2], 2);
    setUsePaletteColors(false);
    expect(get(currentIndexedColor)).toEqual({ color: get(activePalette)[2], index: -1 });
  });

  it('turning palette colors on moves the brush to the closest-looking palette letter', () => {
    setUsePaletteColors(false);
    setCurrentColor('#fefefe'); // nearly white
    setUsePaletteColors(true);
    expect(get(usePaletteColors)).toBe(true);
    expect(get(currentColor)).toBe('#ffffff'); // the starting palette's white
  });
});
