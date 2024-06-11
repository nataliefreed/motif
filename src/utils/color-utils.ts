import tinycolor from 'tinycolor2';
import spectral from 'spectral.js';

export function curatedRandomHexColor() {
	const h = Math.random() * 360;
	const s = randomBetween(80, 100);
	const l = randomBetween(50, 70);
	const alpha = randomBetween(0.6, 1);
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
