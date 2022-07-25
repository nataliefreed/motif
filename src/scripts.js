window.addEventListener('load', e => {
	const effectList = [
		{
			name: 'solid fill',
			dropdownName: 'Solid Fill',
			category: 'Backgrounds',
			init: "Fill with {id:'color', type:'color', placeholder:[50, 0.8, 1.0]}",
			cursor: './assets/cursors/fill-drip-solid.svg',
			onact: (my) => {
				my.target.addFill(my.data.color);
			}
		},
		{
			name: 'gradient',
			dropdownName: 'Gradient',
			category: 'Backgrounds',
			init: "Gradient from {id:'color1', type:'color', placeholder:[50, 0.8, 1.0]} to {id:'color2', type:'color', placeholder:[100, 0.8, 1.0]}",
			cursor: './assets/cursors/fill-drip-solid.svg',
			onact: (my) => {
				my.target.gradient(my.data.color1, my.data.color2);
			}
		},
		{
			name: 'paper doll',
			dropdownName: 'Paper doll',
			category: 'Stencils',
			init: `Paper doll with radius {id:'radius', type:'number', placeholder:20} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
			at ({id:'x', type:'number', placeholder:200}, {id:'y', type:'number', placeholder:200})`,
			cursor: './assets/cursors/star-solid.svg',
			onact: (my) => {
				my.target.addCircle(my.data.color, my.data.x, my.data.y, my.data.radius);
			}
		},
		{
			name: 'box',
			dropdownName: 'Box',
			category: 'Stencils',
			init: `Box with radius {id:'radius', type:'number', placeholder:20} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
			at ({id:'x', type:'number', placeholder:200}, {id:'y', type:'number', placeholder:200})`,
			cursor: './assets/cursors/star-solid.svg',
			onact: (my) => {
				my.target.addCircle(my.data.color, my.data.x, my.data.y, my.data.radius);
			}
		},
		{
			name: 'circle',
			dropdownName: 'Circle',
			category: 'Shapes',
			init: `Circle of radius {id:'radius', type:'number', placeholder:20} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
			at ({id:'x', type:'number', placeholder:200}, {id:'y', type:'number', placeholder:200})`,
			cursor: './assets/cursors/star-solid.svg',
			onact: (my) => {
				my.target.addCircle(my.data.color, my.data.x, my.data.y, my.data.radius);
			}
		},
		{
			name: 'square',
			dropdownName: 'Square',
			category: 'Shapes',
			init: `Square of size {id:'size', type:'number', placeholder:40} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
			at ({id:'x', type:'number', placeholder:200}, {id:'y', type:'number', placeholder:200})`,
			cursor: './assets/cursors/star-solid.svg',
			onact: (my) => {
				my.target.addSquare(my.data.color, my.data.x, my.data.y, my.data.size);
			}
		},
		{
			name: 'polygon',
			dropdownName: 'Polygon',
			category: 'Shapes',
			init: `Polygon with {id:'nsides', type:'number', placeholder:6} sides and radius {id:'radius', type:'number', placeholder:20} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
			at ({id:'x', type:'number', placeholder:200}, {id:'y', type:'number', placeholder:200})`,
			cursor: './assets/cursors/star-solid.svg',
			onact: (my) => {
				my.target.polygon(my.data.color, my.data.x, my.data.y, my.data.radius, my.data.nsides);
			}
		},
		{
			name: 'star',
			dropdownName: 'Star',
			category: 'Shapes',
			init: `Star with {id:'npoints', type:'number', placeholder:7} points, outer {id:'r1', type:'number', placeholder:20}, inner {id:'r2', type:'number', placeholder:10} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
			at ({id:'x', type:'number', placeholder:200}, {id:'y', type:'number', placeholder:200})`,
			cursor: './assets/cursors/star-solid.svg',
			onact: (my) => {
				my.target.star(my.data.color, my.data.x, my.data.y, my.data.r1, my.data.r2, my.data.npoints);
			}
		},
		{
			name: 'heart',
			dropdownName: 'Heart',
			category: 'Shapes',
			init: `Heart of size {id:'size', type:'number', placeholder:40} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
			at ({id:'x', type:'number', placeholder:200}, {id:'y', type:'number', placeholder:200})`,
			cursor: './assets/cursors/star-solid.svg',
			onact: (my) => {
				my.target.heart(my.data.color, my.data.x, my.data.y, my.data.size);
			}
		},
		{
			name: 'marker',
			dropdownName: 'Marker',
			category: 'Brushes',
			init: `Marker with radius {id:'radius', type:'number', placeholder:20} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
			at ({id:'x', type:'number', placeholder:200}, {id:'y', type:'number', placeholder:200})`,
			cursor: './assets/cursors/star-solid.svg',
			onact: (my) => {
				my.target.addCircle(my.data.color, my.data.x, my.data.y, my.data.radius);
			}
		},
		{
			name: 'rainbow brush',
			dropdownName: 'Rainbow Brush',
			category: 'Brushes',
			init: `Rainbow brush with radius {id:'radius', type:'number', placeholder:20} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
			at ({id:'x', type:'number', placeholder:200}, {id:'y', type:'number', placeholder:200})`,
			cursor: './assets/cursors/star-solid.svg',
			onact: (my) => {
				my.target.addCircle(my.data.color, my.data.x, my.data.y, my.data.radius);
			}
		},
		{
			name: 'swirl',
			dropdownName: 'Swirl',
			category: 'Effects',
			init: `Add swirl of radius {id:'radius', type:'number', placeholder:20} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
			at ({id:'x', type:'number', placeholder:200}, {id:'y', type:'number', placeholder:200})`,
			cursor: './assets/cursors/star-solid.svg',
			onact: (my) => {
				my.target.addCircle(my.data.color, my.data.x, my.data.y, my.data.radius);
			}
		},
		{
			name: 'filter',
			dropdownName: 'Filter',
			category: 'Effects',
			init: `Color shift of type {id:'filter', type:'choose', options:['gray','threshold','opaque', 'invert', 'posterize', 'dilate', 'blur', 'erode'], placeholder:'invert'}`,
			cursor: './assets/cursors/star-solid.svg',
			onact: (my) => {
				my.target.applyFilter(my.data.filter);
			}
		},
		{
			name: 'tidy',
			dropdownName: 'Tidy',
			category: 'Effects',
			init: `Tidy`,
			cursor: './assets/cursors/star-solid.svg',
			onact: (my) => {
				my.target.addCircle(my.data.color, my.data.x, my.data.y, my.data.radius);
			}
		},
	]

	const app = new MotifApp(effectList);
});

class MotifApp {
	constructor(effectList) {
		this.effects = this.reindex(effectList, 'name');
		this.sketch = this.initP5();
		this.sketch.addFill('#aaaaaa');
		this.sketch.clear('#aaaaaa');
		this.joy = this.initJoy();
		this.initUI();
	}

	initP5() {
		return new p5(s => {
			s.setup = () => {
			  s.createCanvas(600, 600);
			  s.background(255);
			  s.setupFinished = true;
			  s.noLoop();
			};
		  
			s.draw = () => {
			};
		
			s.clear = () => {
				if(!s.setupFinished) return;
				s.background(255);
			}
		
			s.addCircle = (color, x, y, r) => {
				if(!s.setupFinished) return;
				s.fill(color);
				s.noStroke();
				s.circle(x, y, r*2);
			}

			s.addSquare = (color, x, y, size) => {
				s.push();
				s.rectMode(s.CENTER);
				s.fill(color);
				s.noStroke();
				s.rect(x, y, size, size);
				s.pop();
			}
		
			s.addFill = (color) => {
				if(!s.setupFinished) return;
				s.fill(color);
				s.noStroke();
				s.rect(0, 0, s.width, s.height);
			}
			s.star = (color, x, y, r1, r2, npoints) => {
				if(!s.setupFinished) return;
				let angle = s.TWO_PI / npoints;
				let halfAngle = angle / 2.0;
				s.fill(color);
				s.noStroke();
				s.beginShape();
				for (let a = 0; a < s.TWO_PI; a += angle) {
				  let sx = x + s.cos(a) * r2;
				  let sy = y + s.sin(a) * r2;
				  s.vertex(sx, sy);
				  sx = x + s.cos(a + halfAngle) * r1;
				  sy = y + s.sin(a + halfAngle) * r1;
				  s.vertex(sx, sy);
				}
				s.endShape(s.CLOSE);
			}

			s.polygon = (color, x, y, r, nsides) => {
				if(!s.setupFinished) return;
				nsides = Math.abs(nsides);
				s.fill(color);
				s.noStroke();
				let angle = s.TWO_PI / nsides;
				s.beginShape();
				for (let a = 0; a < s.TWO_PI; a += angle) {
				  let sx = x + s.cos(a) * r;
				  let sy = y + s.sin(a) * r;
				  s.vertex(sx, sy);
				}
				s.endShape(s.CLOSE);
			}

			s.gradient = (color1, color2) => {
				if(!s.setupFinished) return;
				let pcolor1 = s.color(color1);
				let pcolor2 = s.color(color2);
				s.noFill();
				s.strokeWeight(1);
				for(let i=0;i<s.height;i++) {
					s.stroke(s.lerpColor(pcolor1, pcolor2, i/s.height));
					s.line(0, i, s.width, i);
				}
			}

			s.heart = (color, x, y, size) => {
				if(!s.setupFinished) return;
				s.push();
				s.translate(0, -size/2);
				s.fill(color);
				s.noStroke();
				s.beginShape();
				s.vertex(x, y);
				s.bezierVertex(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
				s.bezierVertex(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
				s.endShape(s.CLOSE);
				s.pop();
			}

			s.applyFilter = (filter) => {
				s.filter(s[filter.toUpperCase()]);
			}

		  }, 'drawing-canvas');
	}

	initUI() {
		this.categories = [...new Set(Object.values(this.effects).map(a => a.category))]; //get unique categories from effect list
		let categoryToolbar = document.getElementsByClassName('category-toolbar')[0];
		let drawingToolbar = document.getElementsByClassName('drawing-toolbar')[0];
		this.categories.forEach((c) => {
			// Create a button for the category and add it to the toolbar
			let categoryButton = this.createButton(c, c, ['category-button']);
			categoryToolbar.appendChild(categoryButton);
			
			// Create a div to hold the buttons that belong to this category. Hide all to start
			let drawingTools = this.createDiv(c + '-buttons', [c + '-buttons', 'category-drawing-tools']);
			drawingToolbar.appendChild(drawingTools);
			drawingTools.classList.add('hidden');

			// Create effect buttons and add them to their category div
			let effectsInCategory = Object.values(this.effects).filter(effect => effect.category === c);
			let effectNames = effectsInCategory.map(a => a.name);
			effectNames.forEach(name => {
				let effectButton = this.createButton(name, name + '-button', ['effect-button']);
				drawingTools.appendChild(effectButton);
				effectButton.addEventListener('click', (event) => {
					this.markSelectedById('effect-button', name + '-button'); //TODO: get self ID?
					//this.updateCursor(this.effects[name].cursor); //TODO
				});
			});
			
			// When category button is clicked, mark it selected and show the div containing its effect buttons
			categoryButton.addEventListener("click", (e) => {
				this.markSelectedById("category-button", e.target.id);
				document.getElementsByClassName('category-drawing-tools').forEach(element => {
					element.classList.add('hidden');
				});
				drawingTools.classList.remove('hidden');
				this.markSelectedById("effect-button", drawingTools.firstChild.id);
			});
		});

		//Mouse event listeners

		let dragging = false;
		let mouseDownOverCanvas = false; //TODO: doesn't work if you leave canvas with mouse down

		document.getElementById('drawing-canvas').addEventListener('mousedown', e => {
			dragging = false;
			mouseDownOverCanvas = true;

			let activeEffect = this.getSelectedEffect();
			console.log(activeEffect);
			if(activeEffect) {
				this.addEvent(activeEffect, {
				x: this.sketch.mouseX,
				y: this.sketch.mouseY
				});
			}

		});

		document.getElementById('drawing-canvas').addEventListener('mousemove', e => {
			if(mouseDownOverCanvas) {
				dragging = true;
				// console.log("draggin");
			}
		});

		document.getElementById('drawing-canvas').addEventListener('mouseup', e => {
			// console.log(drag ? 'drag' : 'click');
			mouseDownOverCanvas = false;
		});

	}

	addEvent(effectName, settings) {
		let effect = this.effects[effectName];

		// let hexColor = document.getElementById('color-picker').value;
		// let hslColor = _rgbToHsl(_hexToRgb(hexColor));

		//TODO: make this match effect params
		let params = {
			// color: { type:'color', value:[50, 0.5, 1.0]},
			// color: { type:'color', value:[hslColor[0], hslColor[1], hslColor[2]]},
			color: { type:'color', value:[Math.random()*360, 0.8, 0.8]},
			x: { type:'number', value: Math.round(settings.x)},
			y: {type:'number', value: Math.round(settings.y)}
		}
		this.joy.actions.addAction('motif/'+effectName, undefined, params);
		this.joy.actions.update();
	}

	getSelectedEffect() {
		let selectedEffects = document.querySelectorAll('.effect-button.selected:not(.hidden)')
		if(selectedEffects.length > 0) {
		  let selectedEffect = selectedEffects[0];
		  return selectedEffect.value;
		} else return "";
	}

	markSelectedById(className, id) {
		document.getElementsByClassName(className).forEach(element => {
		  element.classList.remove('selected');
		});
		document.getElementById(id).classList.add('selected');
	}

	createButton(name, id, classNames) {
		let b = document.createElement("input");
		b.setAttribute("type", "button");
		classNames.forEach((className) => {
			b.classList.add(className);
		});
		b.setAttribute("value", name);
		b.setAttribute("id", id);
		return b;
	}

	createDiv(id, classNames) {
		let div = document.createElement("div");
		classNames.forEach((className) => {
			div.classList.add(className);
		});
		div.setAttribute("id", id);
		return div;
	}

	reindex(list, key) {
		let dict = { };
		list.forEach((item) => {
			dict[item[key]] = item;
		});
		return dict;
	}

	initJoy() {
		let data = Joy.loadFromURL();
		let sketch = this.sketch;
		let effects = this.effects;

		Joy.module("motif", function() {

			//Add from effects list
			Object.values(effects).forEach(effect => {
				console.log(effect);
				Joy.add({
					name: effect.dropdownName,
					type: "motif/" + effect.name,
					tags: ["motif", "action"],
					init: effect.init,
					onact: effect.onact
				});
			});
		});

		let joy = Joy({
			// Where the Joy editor goes:
			container: "#joy",
		
			// The words and widgets inside the editor:
			init: "To create my design: "+
				  "{id:'actions', type:'actions'} "+ // a list of actions
				//   "Fill with {id:'color', type:'color', placeholder:[0.3, 0.8, 1.0]}" +
				  "<hr> {type:'save'}", // a save button!
			
			// Load data from URL, otherwise blank:
			data: data,
		
			// Actions to include:
			modules: ["motif", "instructions", "math"],
		
			previewActions: true,
			previewNumbers: true,
		
			// What to do when the user makes a change:
			onupdate: function(my) {
				sketch.clear();
				my.actions.act(sketch);
			}
		});

		return joy;
	}
}

let _rgbToHsl = rgb => {
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
let _rgbStrToHsl = rgbStr => {
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
	let _hexToRgb = hex => {
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