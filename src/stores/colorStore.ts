// colorStore.ts
import { writable, get, derived } from 'svelte/store';
import spectral from 'spectral.js';
import tinyColor from 'tinycolor2';
import { curatedRandomHexColor } from '../utils/color-utils';

interface Palette {
  [name: string]: string[];
}

const samplePalettes: Palette = {
  rainbow: ['#EE1B25','#F5661F','#FCF500','#7CC475','#428DCC','#2C3094',
  '#1C1463','#652B92','#300049','#790046', '#F26D89','#C49C6C',
  '#A47952','#8D6239','#FD9325','#FD7920','#FEFEFE','#D7D7D7','#B7B7B7','#636363','#363636','#070707',],
  default: ['#FF0000','#FF5800','#FF7500','#FF9A00','#FFCC00','#AFD700','#00A645','#9DEAFF','#009ADD','#8D9FFF','#3A57F3','#A975E1','#773BB7','#52227D','#BD44A0','#FF78B8'],
  gray: ['#b7b7b7','#b7b7b7','#b7b7b7','#b7b7b7','#b7b7b7','#b7b7b7','#b7b7b7','#b7b7b7','#b7b7b7','#b7b7b7','#b7b7b7','#b7b7b7','#b7b7b7','#b7b7b7','#b7b7b7','#b7b7b7'],
   myPalette: [
    mixPaintColor({ red: 1, yellow: 0, blue: 0, white: 0, black: 0 }), // Red
    mixPaintColor({ red: 1, yellow: 1, blue: 0, white: 0, black: 0 }), // Orange
    mixPaintColor({ red: 1, yellow: 2, blue: 0, white: 0, black: 0 }), // Yellow
    mixPaintColor({ red: 0, yellow: 2, blue: 0, white: 0, black: 0 }), // Light Yellow
    mixPaintColor({ red: 0, yellow: 2, blue: 1, white: 0, black: 0 }), // Yellow-Green
    mixPaintColor({ red: 0, yellow: 1, blue: 1, white: 0, black: 0 }), // Green
    mixPaintColor({ red: 0, yellow: 0, blue: 2, white: 1, black: 0 }), // Light Blue
    mixPaintColor({ red: 0, yellow: 0, blue: 1, white: 0, black: 0 }), // Blue
    mixPaintColor({ red: 1, yellow: 0, blue: 1, white: 0, black: 0 }), // Purple
    mixPaintColor({ red: 0, yellow: 0, blue: 0, white: 1, black: 1 }), // Gray
    mixPaintColor({ red: 0, yellow: 0, blue: 0, white: 1, black: 0 }), // White
    mixPaintColor({ red: 0, yellow: 0, blue: 0, white: 0, black: 1 }), // Black
  ],
  paint: [
    mixPaintColor({ red: 1, yellow: 0, blue: 0, white: 0, black: 0 }), // Red
    mixPaintColor({ red: 1, yellow: 1, blue: 0, white: 0, black: 0 }), // Orange
    mixPaintColor({ red: 1, yellow: 2, blue: 0, white: 0, black: 0 }), // Yellow
    mixPaintColor({ red: 0, yellow: 2, blue: 0, white: 0, black: 0 }), // Light Yellow
    mixPaintColor({ red: 0, yellow: 2, blue: 1, white: 0, black: 0 }), // Yellow-Green
    mixPaintColor({ red: 0, yellow: 1, blue: 1, white: 0, black: 0 }), // Green
    mixPaintColor({ red: 0, yellow: 0, blue: 2, white: 1, black: 0 }), // Light Blue
    mixPaintColor({ red: 0, yellow: 0, blue: 1, white: 0, black: 0 }), // Blue
    mixPaintColor({ red: 1, yellow: 0, blue: 1, white: 0, black: 0 }), // Purple
    mixPaintColor({ red: 0, yellow: 0, blue: 0, white: 1, black: 1 }), // Gray
    mixPaintColor({ red: 0, yellow: 0, blue: 0, white: 1, black: 0 }), // White
    mixPaintColor({ red: 0, yellow: 0, blue: 0, white: 0, black: 1 }), // Black
  ]
};

export const palettes = writable<Palette>(samplePalettes);
export const originalPalettes = writable<Palette>(JSON.parse(JSON.stringify(samplePalettes))); //save a copy of the original palettes
export const activePaletteName = writable('myPalette');

export const activePalette = derived(
  [palettes, activePaletteName],
  ([$palettes, $activePaletteName]) => $palettes[$activePaletteName]
);

export const pickerPalette = samplePalettes.paint;

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

export function addPalette(name: string, palette: string[]) {
  palettes.update(store => {
    store[name] = JSON.parse(JSON.stringify(palette));
    return store;
  });
}

export function updateColorInPalette(index: number, color: string, paletteName: string=get(activePaletteName)) {
  palettes.update(store => {
    // console.log('original color', store[paletteName][index]);
    // console.log('updateColorInPalette', index, color, paletteName);
    store[paletteName][index] = color;
    return store;
  });
}

export const currentIndexedColor = writable({color: '#000000', index: -1});
export const currentColor = derived(
  [activePalette, currentIndexedColor],
  ([$activePalette, $currentIndexedColor]) => {
    const { color, index } = $currentIndexedColor;

    // Check if the id is a valid index for activePalette
    if (index >= 0 && index < $activePalette.length) {
      return $activePalette[index];
    }

    // Otherwise, return the provided color
    return color;
  }
);

export function setCurrentColor(color:string, index:number=-1) {
  currentIndexedColor.set({color, index});
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

export function initPaintStore() {
  let colorCombos = generateColorCombos();
  for (let i in colorCombos) {
    let paintColor = colorCombos[i];
    let hex = mixPaintColor(paintColor);
    updatePaintStore(hex, paintColor);
  }
}

function generateColorCombos() {
  const colorValues = [0, 1, 2, 3];
  let colorCombos = [];

  for (let red of colorValues) {
      for (let yellow of colorValues) {
          for (let blue of colorValues) {
              for (let white of colorValues) {
                  for (let black of colorValues) {
                      let combo = { red, yellow, blue, white, black };
                      colorCombos.push(combo);
                  }
              }
          }
      }
  }

  return colorCombos;
}

function mixPaintColor(colors: PaintColor) {
  let colorList = ['red', 'yellow', 'blue', 'white', 'black']; // Order of mixing
  let totalParts = Object.values(colors).reduce((total, num) => total + num, 0);
  let newColor = '#ffffff';

  if (totalParts > 0) {
    newColor = '#ffffff'; // Start mixing from white
    for (let color of colorList) {
      if (colors[color] > 0) {
        let mixColor = getColor(color);
        let mixFactor = colors[color] / totalParts;
        newColor = spectral.mix(newColor, mixColor, mixFactor, spectral.HEX);
      }
    }
  }
  return newColor;
}

function getColor(colorName: string) {
  switch (colorName) {
    case 'red': return '#E30022';
    case 'yellow': return '#FFF600';
    case 'blue': return '#002185';
    case 'white': return '#ffffff';
    case 'black': return '#000000';
    default: return '#ffffff';
  }
}

export function randomColorFromPalette() {
  let randomIndex = Math.floor(Math.random() * get(activePalette).length);
  return { color: get(activePalette)[randomIndex], lockedIndex: randomIndex };
}

export function randomizeCurrentColor() {
  //a nice hex color with possible translucency
  // setCurrentColor(curatedRandomHexColor());

  //a random color from the active palette
  let randomIndex = Math.floor(Math.random() * get(activePalette).length);
  setCurrentColor(get(activePalette)[randomIndex], randomIndex); 
}