import Joy from '../libraries/joy.js';
// import p5 from '../libraries/p5.js'

window.addEventListener('load', e => {
	const effectList = [
		{
			name: 'solid fill',
			dropdownName: 'Solid Fill',
			category: 'Backgrounds',
			init: "Fill with {id:'color', type:'color', placeholder:[50, 0.8, 1.0]} and {id: 'whatever', type:'list'}",
			cursor: './assets/cursors/fill-drip-solid.svg',
			mouseActionType: 'single-click',
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
			mouseActionType: 'single-click',
			onact: (my) => {
				my.target.gradient(my.data.color1, my.data.color2);
			}
		},
		{
			name: 'stripes',
			dropdownName: 'Stripes',
			category: 'Backgrounds',
			init: `Stripes {id:'something', type:'motif/solid fill'} of width {id:'stripeWidth', type:'number', min:1, max:300, placeholder:50}
				from {id:'color1', type:'color', placeholder:[0, 0.7, 0.8]} 
				to {id:'color2', type:'color', placeholder:[200, 0.7, 0.9]}`,
			cursor: './assets/cursors/fill-drip-solid.svg',
			mouseActionType: 'single-click',
			onact: (my) => {
				my.target.stripes(my.data.stripeWidth, my.data.color1, my.data.color2);
			}
		},
		{
			name: 'circle',
			dropdownName: 'Circle',
			category: 'Shapes',
			init: `Circle of radius {id:'radius', type:'number', min:1, max:600, placeholder:20} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
			at ({id:'x', type:'number', placeholder:200}, {id:'y', type:'number', placeholder:200})`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'single-click',
			onact: (my) => {
				my.target.addCircle(my.data.color, my.data.x, my.data.y, my.data.radius);
			}
		},
		{
			name: 'square',
			dropdownName: 'Square',
			category: 'Shapes',
			init: `Square of size {id:'size', type:'number', min:1, max:600, placeholder:40} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
			at ({id:'x', type:'number', placeholder:200}, {id:'y', type:'number', placeholder:200})`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'single-click',
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
			mouseActionType: 'single-click',
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
			mouseActionType: 'single-click',
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
			mouseActionType: 'single-click',
			onact: (my) => {
				my.target.heart(my.data.color, my.data.x, my.data.y, my.data.size);
			}
		},
		{
			name: 'straight line',
			dropdownName: 'straight line',
			category: 'Brushes',
			init: `Straight line from ({id:'x1', type:'number', placeholder:100}, {id:'y1', type:'number', placeholder:100})
			to ({id:'x2', type:'number', placeholder:200}, {id:'y2', type:'number', placeholder:200})
			in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}
			with width {id: 'lineWidth', type: 'number', placeholder: 5}`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'drag',
			onact: (my) => {
				my.target.addLine(my.data.color, my.data.lineWidth, my.data.x1, my.data.y1, my.data.x2, my.data.y2, my.data.radius);
			}
		},
		{
			name: 'brush',
			dropdownName: 'Brush',
			category: 'Brushes',
			init: `Brush in {id:'color', type:'color', placeholder:[20, 0.8, 1.0]} with width {id: 'lineWidth', type: 'number', placeholder: 8} along path {id:'pointsList', type:'string', placeholder:'20,50,200,250'}`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'drag',
			onact: (my) => {
				my.target.addBrushStroke(my.data.color, my.data.lineWidth, my.data.pointsList);
			}
		},
		{
			name: 'rainbow brush',
			dropdownName: 'Rainbow Brush',
			category: 'Brushes',
			init: `Rainbow brush with points {id:'pointsList', type:'string', placeholder:'20,50,200,250'}`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'drag',
			onact: (my) => {
				my.target.addBrushStroke(my.data.pointsList);
			}
		},
		{
			name: 'swirl',
			dropdownName: 'Swirl',
			category: 'Effects',
			init: `Add swirl of radius {id:'radius', type:'number', placeholder:20} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
			at ({id:'x', type:'number', placeholder:200}, {id:'y', type:'number', placeholder:200})`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'single-click',
			onact: (my) => {
				my.target.addCircle(my.data.color, my.data.x, my.data.y, my.data.radius);
			}
		},
		{
			name: 'invert',
			dropdownName: 'Invert',
			category: 'Effects',
			init: `Color shift of type {id:'filter', type:'choose', options:['invert','threshold', 'gray', 'dilate', 'blur'], placeholder:'invert'}`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'single-click',
			onact: (my) => {
				my.target.applyFilter(my.data.filter);
			}
		},
		{
			name: 'grayscale',
			dropdownName: 'Grayscale',
			category: 'Effects',
			init: `Color shift of type {id:'filter', type:'choose', options:['invert','threshold', 'gray', 'dilate', 'blur'], placeholder:'gray'}`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'single-click',
			onact: (my) => {
				my.target.applyFilter(my.data.filter);
			}
		},
		{
			name: 'threshold',
			dropdownName: 'Threshold',
			category: 'Effects',
			init: `Color shift of type {id:'filter', type:'choose', options:['invert','threshold', 'gray', 'dilate', 'blur'], placeholder:'threshold'}`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'single-click',
			onact: (my) => {
				my.target.applyFilter(my.data.filter);
			}
		},
		{
			name: 'grid',
			dropdownName: 'grid',
			category: 'Patterns',
			init: `Repeat in grid with rows and columns`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'single-click',
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

		this.joy.actions.addAction('stencils/paperdoll', undefined, {});
		this.joy.actions.update();

		//TODO: add global effect settings such as line weight, color, etc to pass into current events that have a "preview"
	}

	initP5() {
		return new p5(s => {
			
			let points = null;
			let strokeColor = 0;
			let strokeWeight = 5;

			s.setup = () => {
			  s.createCanvas(600, 600);
			  s.background(255);
			  s.setupFinished = true;
			  s.noLoop();
			};
		  
			s.draw = () => {
				if(points) {
					points.renderLine(s, strokeColor, strokeWeight); //TODO: rethink this way of passing in preview line settings
				}
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

			s.stripes = (stripeWidth, color1, color2) => {
				if(!s.setupFinished) return;
				s.push();
				s.translate(0, stripeWidth/2); //so that top stripe is fully shown
				let pcolor1 = s.color(color1);
				let pcolor2 = s.color(color2);
				s.noFill();
				s.strokeWeight(stripeWidth);
				for(let i=0;i<s.height;i+=stripeWidth) {
					let c = s.lerpColor(pcolor1, pcolor2, i/(s.height-stripeWidth));
					console.log(c);
					s.stroke(c);
					s.line(0, i, s.width, i);
				}
				s.pop();
			}

			//by Mithru: https://editor.p5js.org/Mithru/sketches/Hk1N1mMQg
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

			s.stencil = (name, params) => {

			}

			// s.setStrokeColor = (color) => {
			// 	strokeColor = color;
			// }

			// s.setStrokeWeight = (weight) => {
			// 	strokeWeight = weight;
			// }

			s.startPoints = (x, y) => {
				points = new DrawnLine(x, y);
				console.log("inside start points function", points);
				s.loop();
			}

			s.addPoint = (x, y) => {
				points.addPoint(x, y);
			}

			s.endPoints = () => {
				points = null;
				s.noLoop();
			}

			s.getPoint = (index) => {
				return points.points[index];
			}

			s.getLastPoint = () => {
				return points.points[points.points.length-1];
			}

			s.pointsAsString = () => {
				return points.toString();
			}

			s.mouseDragged = () => {
				if(points) {
					s.addPoint(s.mouseX, s.mouseY);
				}
			}

			s.addLine = (color, lineWeight, x1, y1, x2, y2) => {
				if(!s.setupFinished) return;
				s.strokeWeight(lineWeight);
				s.noFill();
				s.stroke(color);
				s.line(x1, y1, x2, y2);
			}

			s.addBrushStroke = (color, lineWeight, pointsString) => {
				if(!s.setupFinished) return;
				s.push();
				s.noFill();
				s.strokeWeight(lineWeight);
				s.stroke(color);
				s.strokeJoin(s.ROUND);
				
				let points = pointsString.split(',');
				s.beginShape();
				for(let i=0;i<points.length-1;i+=2) {
					s.vertex(points[i], points[i+1]);
				}
				s.endShape();
				s.pop();
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
			if(activeEffect) {
				if(this.effects[activeEffect].mouseActionType == 'drag') {
					this.sketch.set
					this.sketch.startPoints(this.sketch.mouseX, this.sketch.mouseY);
				} else {
					this.addEvent(activeEffect, {
							x: { type:'number', value: Math.round(this.sketch.mouseX)},
							y: { type:'number', value: Math.round(this.sketch.mouseY)}
						});
				}
			}
		});

		document.getElementById('drawing-canvas').addEventListener('mousemove', e => {
			if(mouseDownOverCanvas) {
				dragging = true;
			}
		});

		document.getElementById('drawing-canvas').addEventListener('mouseup', e => {
			// console.log(drag ? 'drag' : 'click');
			mouseDownOverCanvas = false;

			let activeEffect = this.getSelectedEffect();
			if(activeEffect) {
				if(this.effects[activeEffect].mouseActionType == 'drag') {
					this.sketch.addPoint(this.sketch.mouseX, this.sketch.mouseY);
					if(activeEffect == 'straight line') {
						this.addEvent(activeEffect, {
							x1: { type:'number', value: Math.round(this.sketch.getPoint(0).x) },
							y1: { type:'number', value: Math.round(this.sketch.getPoint(0).y) },
							x2: { type:'number', value: Math.round(this.sketch.getLastPoint().x) },
							y2: { type:'number', value: Math.round(this.sketch.getLastPoint().y) },
						});
					}
					else if(activeEffect == 'brush') {
						this.addEvent(activeEffect, { pointsList: { type:'number', value: this.sketch.pointsAsString()} });
					}
					
					this.sketch.endPoints();
				}
			}
		});

	}

	addEvent(effectName, settings) {
		let effect = this.effects[effectName];

		settings.color = { type:'color', value:[Math.random()*360, 0.8, 0.8]};
		
		// let hexColor = document.getElementById('color-picker').value;
		// let hslColor = _rgbToHsl(_hexToRgb(hexColor));

		//TODO: make this match effect params
		// let params = ...settings;
		
		// {
		// 	// color: { type:'color', value:[50, 0.5, 1.0]},
		// 	// color: { type:'color', value:[hslColor[0], hslColor[1], hslColor[2]]},
		// 	color: { type:'color', value:[Math.random()*360, 0.8, 0.8]},
		// 	x: { type:'number', value: Math.round(settings.x)},
		// 	y: {type:'number', value: Math.round(settings.y)},
		// 	x1: { type:'number', value: Math.round(settings.x1)},
		// 	y1: {type:'number', value: Math.round(settings.y1)},
		// 	x2: { type:'number', value: Math.round(settings.x2)},
		// 	y2: {type:'number', value: Math.round(settings.y2)}
		// }
		this.joy.actions.addAction('motif/'+effectName, undefined, settings);
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

		Joy.module("stencils", function() {
			Joy.add({
				name: "Paper Doll",
				type: "stencils/paperdoll",
				tags: ["stencils", "action"],
			
				// What the action does is EMBEDDED IN A PLAIN-LANGUAGE SENTENCE
				init: "Use stencil paper doll with clothing {id:'outfit', type:'choose', options:['dress','pants','shirt'], placeholder:'dress'}",
			
				// Callback
				onact: function(my){
					my.target.stencil('paperdoll', my.data.outfit);
				}
			});
		});


		// {
		// 	name: 'paper doll',
		// 	dropdownName: 'Paper doll',
		// 	category: 'Stencils',
		// 	init: `Paper doll with radius {id:'radius', type:'number', placeholder:20} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
		// 	at ({id:'x', type:'number', placeholder:200}, {id:'y', type:'number', placeholder:200})`,
		// 	cursor: './assets/cursors/star-solid.svg',
		// 	onact: (my) => {
		// 		my.target.addCircle(my.data.color, my.data.x, my.data.y, my.data.radius);
		// 	}
		// },
		// {
		// 	name: 'box',
		// 	dropdownName: 'Box',
		// 	category: 'Stencils',
		// 	init: `Box with radius {id:'radius', type:'number', placeholder:20} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
		// 	at ({id:'x', type:'number', placeholder:200}, {id:'y', type:'number', placeholder:200})`,
		// 	cursor: './assets/cursors/star-solid.svg',
		// 	onact: (my) => {
		// 		my.target.addCircle(my.data.color, my.data.x, my.data.y, my.data.radius);
		// 	}
		// },

		Joy.add({
			type: "list",
			tags: ["ui"],
			initWidget: function(self){
				self.dom = document.createElement("input");
				self.dom.setAttribute("type", "button");
				self.dom.value = "list";
			},
			onget: function(my){
				return 3;
			},
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
			modules: ["motif", "instructions", "stencils", "math"], //TODO: 'math' module removes min and max settings on Scrubber - see line 1032 and 2813
		
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


class DrawnLine {
	constructor(x, y) {
		this.points = [];
		this.addPoint(x, y);
	}
	
	addPoint(x, y) {
		this.points.push({ x: x, y: y });
	}

	toString() {
		let a = [];
		this.points.forEach(p => {
			a.push(Math.round(p.x));
			a.push(Math.round(p.y));
		});
		return a.toString();
	}
	
	renderPoints(s) {
		s.push();
		s.strokeWeight(5);
		s.noFill();
		s.stroke(0);
		this.points.forEach(p => {
			s.point(p.x, p.y);
		});
		s.pop();
	}

	renderLine(s, strokeColor, strokeWeight) {
		s.push();
		s.strokeWeight(strokeWeight);
		s.stroke(strokeColor);
		s.noFill();
		s.beginShape();
		this.points.forEach(p => {
			s.vertex(p.x, p.y);
		});
		s.endShape();
		s.pop();
	}
}