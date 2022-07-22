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
			init: "Fill with {id:'color', type:'color', placeholder:[50, 0.8, 1.0]}",
			cursor: './assets/cursors/fill-drip-solid.svg',
			onact: (my) => {
				my.target.addFill(my.data.color);
			}
		},
		{
			name: 'circle',
			dropdownName: 'Circle',
			category: 'Shapes',
			init: `Draw polka dot of radius {id:'radius', type:'number', placeholder:20} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
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
			init: `Draw square of radius {id:'radius', type:'number', placeholder:20} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
			at ({id:'x', type:'number', placeholder:200}, {id:'y', type:'number', placeholder:200})`,
			cursor: './assets/cursors/star-solid.svg',
			onact: (my) => {
				my.target.addCircle(my.data.color, my.data.x, my.data.y, my.data.radius);
			}
		},
		{
			name: 'polygon',
			dropdownName: 'Polygon',
			category: 'Shapes',
			init: `Draw polygon with {id:'nsides', type:'number', placeholder:6} sides and radius {id:'radius', type:'number', placeholder:20} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
			at ({id:'x', type:'number', placeholder:200}, {id:'y', type:'number', placeholder:200})`,
			cursor: './assets/cursors/star-solid.svg',
			onact: (my) => {
				my.target.polygon(my.data.color, my.data.x, my.data.y, my.data.radius, my.data.nsides);
			}
		},
		{
			name: 'sparkle',
			dropdownName: 'Sparkle',
			category: 'Effects',
			init: `Add sparkle of radius {id:'radius', type:'number', placeholder:20} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
			at ({id:'x', type:'number', placeholder:200}, {id:'y', type:'number', placeholder:200})`,
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

		document.getElementById('drawing-canvas').addEventListener('mousedown', e => {
			dragging = false;
		});

		document.getElementById('drawing-canvas').addEventListener('mousemove', e => {
			dragging = true;
		});

		document.getElementById('drawing-canvas').addEventListener('mouseup', e => {
			// console.log(drag ? 'drag' : 'click');
			let activeEffect = this.getSelectedEffect();
			console.log(activeEffect);
			if(activeEffect) {
				this.addEvent(activeEffect, {
				x: this.sketch.mouseX,
				y: this.sketch.mouseY
				});
			}
		});
	}

	addEvent(effectName, settings) {
		let effect = this.effects[effectName];

		let hexColor = document.getElementById('color-picker').value;
		let hslColor = _rgbToHsl(_hexToRgb(hexColor));
		console.log(hslColor);

		//TODO: make this match effect params
		let params = {
			// color: { type:'color', value:[50, 0.5, 1.0]},
			color: { type:'color', value:[hslColor[0], hslColor[1], hslColor[2]]},
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
				s.circle(x, y, r*2);
			}
		
			s.addFill = (color) => {
				if(!s.setupFinished) return;
				s.fill(color);
				s.noStroke();
				s.rect(0, 0, s.width, s.height);
			}
			s.polygon = (color, x, y, r, nsides) => {
				if(!s.setupFinished) return;
				nsides = Math.abs(nsides);
				s.fill(color);
				let angle = s.TWO_PI / nsides;
				s.beginShape();
				for (let a = 0; a < s.TWO_PI; a += angle) {
				  let sx = x + s.cos(a) * r;
				  let sy = y + s.sin(a) * r;
				  s.vertex(sx, sy);
				}
				s.endShape(s.CLOSE);
			}
		  }, 'drawing-canvas');
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