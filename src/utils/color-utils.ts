import tinycolor from 'tinycolor2';

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
