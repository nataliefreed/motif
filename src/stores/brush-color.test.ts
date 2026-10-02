import { beforeEach, describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import { activePalette, currentColor, currentIndexedColor, randomColorFromPalette, randomizeCurrentColor, setCurrentColor, setUsePaletteColors, usePaletteColors } from './colorStore';

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

  it('surprise colors never picks the letter the brush already has', () => {
    setCurrentColor(get(activePalette)[3], 3);
    for (let i = 0; i < 50; i++) {
      const before = get(currentIndexedColor).index;
      randomizeCurrentColor();
      expect(get(currentIndexedColor).index).not.toBe(before);
    }
  });

  it('random palette letters come up evenly, like cards dealt from a shuffled deck', () => {
    const letters = get(activePalette).length;
    const dealt = Array.from({ length: letters * 10 }, () => randomColorFromPalette().lockedIndex);
    dealt.slice(1).forEach((letter, i) => expect(letter).not.toBe(dealt[i])); // never twice in a row
    for (let letter = 0; letter < letters; letter++) {
      // ten decks' worth: each letter ten times, give or take the deck already started before this test
      const times = dealt.filter(l => l === letter).length;
      expect(times).toBeGreaterThanOrEqual(9);
      expect(times).toBeLessThanOrEqual(11);
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
