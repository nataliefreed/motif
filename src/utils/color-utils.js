export function RGBToHSL(rgb) {
	// const [r, g, b] = rgbStr.slice(4, -1).split(',').map(Number);
	const [r, g, b] = Object.values(rgb);
	const max = Math.max(r, g, b)
	const min = Math.min(r, g, b)
	const l = Math.floor((max + min) / ((0xff * 2) / 100))
  
	if (max === min) return [0, 0, l / 100]
	const d = max - min
	const s = Math.floor((d / (l > 50 ? 0xff * 2 - max - min : max + min)) * 100)
  
	if (max === r) return [Math.floor(((g - b) / d + (g < b && 6)) * 60), s / 100, l / 100]
	return max === g
	  ? [Math.floor(((b - r) / d + 2) * 60), s / 100, l / 100]
	  : [Math.floor(((r - g) / d + 4) * 60), s / 100, l / 100]
}

/* https://gist.github.com/mjackson/5311256 by kigiri*/
export function RGBStrToHSL(rgbStr) {
	const [r, g, b] = rgbStr.slice(4, -1).split(',').map(Number)
	const max = Math.max(r, g, b)
	const min = Math.min(r, g, b)
	const l = Math.floor((max + min) / ((0xff * 2) / 100))
	
	if (max === min) return [0, 0, l]
	const d = max - min
	const s = Math.floor((d / (l > 50 ? 0xff * 2 - max - min : max + min)) * 100)
	
	if (max === r) return [Math.floor(((g - b) / d + (g < b && 6)) * 60), s, l]
	return max === g
		? [Math.floor(((b - r) / d + 2) * 60), s, l]
		: [Math.floor(((r - g) / d + 4) * 60), s, l]
}

/* https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb */
export function hexToRGB(hex) {
	// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function(m, r, g, b) {
		return r + r + g + g + b + b;
	});
	
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

export function _hexToRGB(hex) { // does this do the same thing as previous function?
	let bigint = parseInt(hex.substring(1), 16);
	let r = (bigint >> 16) & 255;
	let g = (bigint >> 8) & 255;
	let b = bigint & 255;
	return [r, g, b];
}

export function HSVToRGBString(h,s,v) { //duplicate from Joy.js
  if(arguments.length===1) {
        s=h[1], v=h[2], h=h[0]; // cast to different vars
    }
  var rgb = HSVtoRGB(h,s,v);
  return "rgb("+rgb[0]+","+rgb[1]+","+rgb[2]+")";
}

export function RGBtoString(rgb) {
	return "rgb("+rgb[0]+","+rgb[1]+","+rgb[2]+")";
}

export function HSVtoRGB(h,s,v) { //duplicate from Joy.js
	var r, g, b, i, f, p, q, t;
	if (arguments.length === 1) {
			s = h.s, v = h.v, h = h.h;
	}
	h /= 360; // convert, yo.
	i = Math.floor(h * 6);
	f = h * 6 - i;
	p = v * (1 - s);
	q = v * (1 - f * s);
	t = v * (1 - (1 - f) * s);
	switch (i % 6) {
			case 0: r = v, g = t, b = p; break;
			case 1: r = q, g = v, b = p; break;
			case 2: r = p, g = v, b = t; break;
			case 3: r = p, g = q, b = v; break;
			case 4: r = t, g = p, b = v; break;
			case 5: r = v, g = p, b = q; break;
	}
	return [Math.round(r*255), Math.round(g*255), Math.round(b*255)];
}

export function RGBtoHSV(r, g, b) {
	r /= 255, g /= 255, b /= 255;

	let max = Math.max(r, g, b), min = Math.min(r, g, b);
	let h, s, v = max;

	let d = max - min;
	s = max === 0 ? 0 : d / max;

	if (max === min) {
			h = 0; // achromatic
	} else {
			switch (max) {
					case r: h = (g - b) / d + (g < b ? 6 : 0); break;
					case g: h = (b - r) / d + 2; break;
					case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
	}

	return [h * 360, s * 100, v * 100];
}

export function randomHexColor() {
	const h = Math.random() * 360;
	const s = randomBetween(60, 100);
	const l = randomBetween(40, 60);
	return HSLToHex(h, s, l);
}

export function randomRGBColor() {
	const h = Math.random() * 360;
	const s = randomBetween(60, 100);
	const l = randomBetween(40, 60);
	return HSLtoRGB(h, s, l);
}

function HSLtoRGB(h, s, l) {
	s /= 100;
	l /= 100;

	const a = s * Math.min(l, 1 - l);
	const f = (n, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);

	const r = Math.round(f(0) * 255);
	const g = Math.round(f(8) * 255);
	const b = Math.round(f(4) * 255);

	return [r, g, b];
}

function randomBetween(min, max) {
	return min + Math.random() * (max - min);
}

function HSLToHex(h, s, l) {
	s /= 100;
	l /= 100;
	const a = s * Math.min(l, 1 - l);
	const f = n => {
			const k = (n + h / 30) % 12;
			const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
			return Math.round(255 * color).toString(16).padStart(2, '0');
	};
	return `#${f(0)}${f(8)}${f(4)}`;
}

