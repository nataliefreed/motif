// colorStore.ts
import { writable, get, derived } from 'svelte/store';

interface Palette {
  [name: string]: string[];
}

const samplePalettes: Palette = {
  rainbow: ['#EE1B25','#F5661F','#FCF500','#7CC475','#428DCC','#2C3094',
  '#1C1463','#652B92','#300049','#790046', '#F26D89','#C49C6C',
  '#A47952','#8D6239','#FD9325','#FD7920','#FEFEFE','#D7D7D7','#B7B7B7','#636363','#363636','#070707',],
  default: ['#FF0000','#FF5800','#FF7500','#FF9A00','#FFCC00','#AFD700','#00A645','#9DEAFF','#009ADD','#8D9FFF','#3A57F3','#A975E1','#773BB7','#52227D','#BD44A0','#FF78B8'],
  gray: ['#b7b7b7','#b7b7b7','#b7b7b7','#b7b7b7','#b7b7b7','#b7b7b7','#b7b7b7','#b7b7b7','#b7b7b7','#b7b7b7','#b7b7b7','#b7b7b7','#b7b7b7','#b7b7b7','#b7b7b7','#b7b7b7']
};

export const palettes = writable<Palette>(samplePalettes);
export const originalPalettes = writable<Palette>(JSON.parse(JSON.stringify(samplePalettes)));
export const activePaletteName = writable('default');

export const activePalette = derived(
  [palettes, activePaletteName],
  ([$palettes, $activePaletteName]) => $palettes[$activePaletteName]
);

export const pickerPalette = samplePalettes.rainbow;

export const randomizeColorSetting = writable('yes');

export function resetPaletteByName(paletteName: string) {
  palettes.update(allPalettes => {
    const originals = get(originalPalettes);
    if (originals[paletteName]) {
      allPalettes[paletteName] = [...originals[paletteName]];
    }
    return allPalettes;
  });
}

export let showSavedColors = writable(false);

interface PaintColor {
  red: number;
  yellow: number;
  blue: number;
  white: number;
  black: number;
}

type ColorStore = Record<string, PaintColor>;

export const paintColors = writable({});

export function updatePaintStore(hex: string, paintColor: PaintColor): void {
  paintColors.update((store: ColorStore) => {
      if (!store[hex]) {
          store[hex] = paintColor; // Add new color mix to the store
      }
      return store;
  });
}