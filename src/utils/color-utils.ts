import tinycolor from 'tinycolor2';
import spectral from 'spectral.js';

export function curatedRandomHexColor() {
	const h = Math.random() * 360;
	const s = randomBetween(80, 100);
	const l = randomBetween(50, 70);
	const alpha = randomBetween(0.7, 0.9);
	let color = tinycolor({h: h, s: s, l: l, a: alpha});
	return color.toHex8String();
}

// export function randomRGBColor(alpha=1) {
// 	const h = Math.random() * 360;
// 	const s = randomBetween(60, 100);
// 	const l = 30;
// 	return tinycolor({h: h, s: s, l: l, a:alpha}).toRgbString();
// }

function randomBetween(min: number, max: number) {
	return min + Math.random() * (max - min);
}

export function getReadableColor(backgroundColor: string) {
	const colorObj = tinycolor(backgroundColor);
	return colorObj.isLight() ? 'black' : 'white';
}

export function mixPaintColors(colors) {
	let { red, yellow, blue, white, black } = colors;
	// Convert color ratios to a color string
	// let color = spectral.mix('[0, 33, 133]', '[215, 153, 0]', 0.5, spectral.HEXA);
	// return color;

  function adjustColor(color, increment) {
    if (colors[color] + increment >= 0) {
      colors[color] += increment;
    }
    updateMixedColor();
  }

  let mixedColor = '#ffffff'; // Initial color

  function updateMixedColor() {
    let colorList = ['red', 'yellow', 'blue', 'white', 'black']; // Order of mixing
    let baseColor = '#ff0000'; // Start with red
    let totalParts = Object.values(colors).reduce((total, num) => total + num, 0);

    if (totalParts > 0) {
      baseColor = '#ffffff'; // Start mixing from white if there are actual colors to mix
      for (let color of colorList) {
        if (colors[color] > 0) {
          let mixColor = getColor(color);
          let mixFactor = colors[color] / totalParts;
          baseColor = spectral.mix(baseColor, mixColor, mixFactor, spectral.HEX);
        }
      }
    }

    mixedColor = baseColor;
  }

  function getColor(colorName) {
    switch (colorName) {
      case 'red': return '#ff0000';
      case 'yellow': return '#ffff00';
      case 'blue': return '#0000ff';
      case 'white': return '#ffffff';
      case 'black': return '#000000';
      default: return '#ffffff';
    }
  }
}

// The colors that stand out in an image, from its RGBA pixels (as from getImageData).
// 1. Pixels are grouped by shade (16 levels per channel), so a photo's thousands of slightly different
//    pixels count together. Transparent pixels are skipped.
// 2. Groups join a color they look nearly the same as: always when they are almost equal (a shade can fall
//    on either side of a group boundary), and also when the group is small, so the lit and shaded pixels
//    of one fabric add up to one color. Large areas of their own color are never joined to another.
// 3. Colors covering less than `minShare` of the picture are dropped as specks and edges.
// 4. Starting with the most common color, each next color is the one most different from all the colors
//    already chosen, as people see difference (distance in CIE Lab), until none differs enough to count
//    as a new color. So one big background can't fill the palette with its shades, and a small bright
//    detail still gets a place.
// The chosen colors are listed most common first, keeping their reading order (left to right, top to
// bottom) when they are equally common, so a palette picture of equal tiles opens with the same letters.
// How far apart (in CIE Lab) two colors must be to count as different colors in a palette.
// The closest two colors in a built-in palette are denim's, about 8 apart.
const newColorDifference = 6;

export function distinctColors(pixels: Uint8ClampedArray, count: number, minShare = 0.005): string[] {
	type Color = { pixels: number; r: number; g: number; b: number; lab: number[] };
	const sameColorRGB = 12;   // RGB distance: closer than any two colors in the built-in palettes
	const sameShadeLab = 15;   // Lab distance within which a small group counts as a shade of a color
	const byPixels = (a: Color, b: Color) => b.pixels - a.pixels;
	const rgb = (c: Color) => [c.r / c.pixels, c.g / c.pixels, c.b / c.pixels];
	const labDistance = (a: Color, b: Color) => Math.hypot(...a.lab.map((v, i) => v - b.lab[i]));

	const groups = new Map<number, Color>();
	let visible = 0;
	for (let i = 0; i < pixels.length; i += 4) {
		if (pixels[i + 3] < 128) continue;
		visible++;
		const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
		const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
		const group = groups.get(key) ?? { pixels: 0, r: 0, g: 0, b: 0, lab: [] };
		group.pixels++;
		group.r += r;
		group.g += g;
		group.b += b;
		groups.set(key, group);
	}
	const minPixels = minShare * visible;

	const colors: Color[] = [];
	for (const group of [...groups.values()].sort(byPixels)) {
		group.lab = lab(rgb(group));
		const [r, g, b] = rgb(group);
		const nearest = colors.reduce<Color | null>((best, c) => (!best || labDistance(group, c) < labDistance(group, best) ? c : best), null);
		const almostEqual = nearest && Math.hypot(...rgb(nearest).map((v, i) => v - [r, g, b][i])) < sameColorRGB;
		const shadeOfIt = nearest && group.pixels < minPixels && labDistance(group, nearest) < sameShadeLab;
		if (nearest && (almostEqual || shadeOfIt)) {
			nearest.pixels += group.pixels;
			nearest.r += group.r;
			nearest.g += group.g;
			nearest.b += group.b;
			nearest.lab = lab(rgb(nearest));
		} else {
			colors.push({ ...group });
		}
	}

	const candidates = colors.filter(c => c.pixels >= minPixels).sort(byPixels);
	const chosen = candidates.slice(0, 1);
	const distanceToChosen = (c: Color) => Math.min(...chosen.map(other => labDistance(c, other)));
	while (chosen.length < count) {
		const remaining = candidates.filter(c => !chosen.includes(c));
		const mostDifferent = remaining.reduce<Color | null>((best, c) => (!best || distanceToChosen(c) > distanceToChosen(best) ? c : best), null);
		if (!mostDifferent || distanceToChosen(mostDifferent) < newColorDifference) break;
		chosen.push(mostDifferent);
	}

	return chosen
		.sort((a, b) => b.pixels - a.pixels || candidates.indexOf(a) - candidates.indexOf(b))
		.map(c => {
			const [r, g, b] = rgb(c);
			return tinycolor({ r, g, b }).toHexString();
		});
}

// Fills out a palette that has fewer than `count` colors with lighter and darker versions of its colors,
// most common color first, in bigger steps as needed. A shade that would look the same as a color already
// in the palette is skipped, so near white gets no lighter version and near black no darker one.
export function withShades(colors: string[], count: number): string[] {
	const palette = [...colors];
	const looksNew = (shade: string) => palette.every(color => colorDifference(shade, color) >= newColorDifference);
	for (const step of [20, 35, 50]) {
		for (const color of colors) {
			for (const shade of [tinycolor(color).lighten(step).toHexString(), tinycolor(color).darken(step).toHexString()]) {
				if (palette.length >= count) return palette;
				if (looksNew(shade)) palette.push(shade);
			}
		}
	}
	return palette;
}

// How different two colors look to people: their distance in CIE Lab.
export function colorDifference(a: string, b: string): number {
	return Math.hypot(...lab(hexRGB(a)).map((v, i) => v - lab(hexRGB(b))[i]));
}

function hexRGB(color: string): number[] {
	const { r, g, b } = tinycolor(color).toRgb();
	return [r, g, b];
}

// A color's place in CIE Lab, where distance matches how different colors look (sRGB, D65 white).
function lab([r, g, b]: number[]): number[] {
	const linear = (v: number) => (v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
	const [lr, lg, lb] = [linear(r), linear(g), linear(b)];
	const x = (0.4124 * lr + 0.3576 * lg + 0.1805 * lb) / 0.95047;
	const y = 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
	const z = (0.0193 * lr + 0.1192 * lg + 0.9505 * lb) / 1.08883;
	const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
	return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}
