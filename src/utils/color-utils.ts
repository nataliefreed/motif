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

// The most common colors in an image, most common first, from its RGBA pixels (as from getImageData).
// Pixels are grouped by shade (16 levels per channel) so a photo's thousands of slightly different pixels
// count together, then groups whose average colors are nearly the same are joined, since a shade can fall
// on either side of a group boundary. Transparent pixels are skipped. Colors that are equally common keep
// the order they first appear in, reading left to right.
export function mostCommonColors(pixels: Uint8ClampedArray, count: number): string[] {
	type Group = { pixels: number; r: number; g: number; b: number };
	const sameColorDistance = 12; // closer than any two colors in the built-in palettes
	const byPixels = (a: Group, b: Group) => b.pixels - a.pixels;
	const average = (group: Group) => [group.r / group.pixels, group.g / group.pixels, group.b / group.pixels];

	const groups = new Map<number, Group>();
	for (let i = 0; i < pixels.length; i += 4) {
		if (pixels[i + 3] < 128) continue;
		const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
		const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
		const group = groups.get(key) ?? { pixels: 0, r: 0, g: 0, b: 0 };
		group.pixels++;
		group.r += r;
		group.g += g;
		group.b += b;
		groups.set(key, group);
	}

	const colors: Group[] = [];
	for (const group of [...groups.values()].sort(byPixels)) {
		const [r, g, b] = average(group);
		const same = colors.find(color => {
			const [cr, cg, cb] = average(color);
			return Math.hypot(r - cr, g - cg, b - cb) < sameColorDistance;
		});
		if (same) {
			same.pixels += group.pixels;
			same.r += group.r;
			same.g += group.g;
			same.b += group.b;
		} else {
			colors.push({ ...group });
		}
	}

	return colors
		.sort(byPixels)
		.slice(0, count)
		.map(color => {
			const [r, g, b] = average(color);
			return tinycolor({ r, g, b }).toHexString();
		});
}
