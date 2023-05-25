import Joy from '../libraries/joy.js';
// import p5 from '../libraries/p5.js'
let currentColorRGB, currentColorHSV;
let currentLineWeight = 6;

window.addEventListener('load', e => {
	randomizeCurrentColor();
	const effectList = [
		{
			name: 'solid fill',
			dropdownName: 'Solid Fill',
			category: 'Backgrounds',
			init: "Fill with {id:'color', type:'color', placeholder:[50, 0.8, 1.0]}",
			cursor: './assets/cursors/fill-drip-solid.svg',
			mouseActionType: 'single-click',
			onact: (my) => {
				my.target.addFill({color: my.data.color});
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
				my.target.gradient({ color1: my.data.color1, color2: my.data.color2 });
			}
		},
		{
			name: 'stripes',
			dropdownName: 'Stripes',
			category: 'Backgrounds',
			init: `Stripes of width {id:'stripeWidth', type:'number', min:1, max:300, placeholder:50}
				from {id:'color1', type:'color', placeholder:[0, 0.7, 0.8]} 
				to {id:'color2', type:'color', placeholder:[200, 0.7, 0.9]}`,
			cursor: './assets/cursors/fill-drip-solid.svg',
			mouseActionType: 'single-click',
			onact: (my) => {
				my.target.stripes({ stripeWidth: my.data.stripeWidth, color1: my.data.color1, color2: my.data.color2 });
			}
		},
		{
			//TODO: variable for screen size in min/max
			name: 'circle',
			dropdownName: 'Circle',
			category: 'Shapes',
			init: `Circle of radius {id:'radius', type:'number', min:1, max:600, placeholder:20}
			in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
			at ({id:'x', type:'number', min:0, max:600, placeholder:200},
			{id:'y', type:'number', min:0, max:600, placeholder:200})`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'single-click',
			onact: (my) => {
				my.target.addCircle({ color: my.data.color, x: my.data.x, y: my.data.y, r: my.data.radius });
			}
		},
		{
			name: 'square',
			dropdownName: 'Square',
			category: 'Shapes',
			init: `Square of size {id:'size', type:'number', min:1, max:600, placeholder:40}
			in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
			at ({id:'x', type:'number', min:0, max:600, placeholder:200},
			{id:'y', type:'number', min:0, max:600, placeholder:200})`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'single-click',
			onact: (my) => {
				my.target.addSquare({ color: my.data.color, x: my.data.x, y: my.data.y, size: my.data.size });
			}
		},
		{
			name: 'polygon',
			dropdownName: 'Polygon',
			category: 'Shapes',
			init: `Polygon with {id:'nsides', type:'number', min:3, max:50, placeholder:6} sides 
			and radius {id:'radius', type:'number', min:1, max:600, placeholder:20} 
			in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
			at ({id:'x', type:'number', min:0, max:600, placeholder:200},
			{id:'y', type:'number', min:0, max:600, placeholder:200})`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'single-click',
			onact: (my) => {
				my.target.polygon({ color: my.data.color, x: my.data.x, y: my.data.y, r: my.data.radius, nsides: my.data.nsides });
			}
		},
		{
			name: 'star',
			dropdownName: 'Star',
			category: 'Shapes',
			init: `Star with {id:'npoints', type:'number', min:3, max:200, placeholder:7} points, 
			outer {id:'r1', type:'number', min:1, max:600, placeholder:20}, 
			inner {id:'r2', type:'number', min:1, max:600, placeholder:10} 
			in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
			at ({id:'x', type:'number', min:0, max:600, placeholder:200}, 
			{id:'y', type:'number', min:0, max:600, placeholder:200})`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'single-click',
			onact: (my) => {
				my.target.star({color: my.data.color, x: my.data.x, y: my.data.y, r1: my.data.r1, r2: my.data.r2, npoints: my.data.npoints});
			}
		},
		{
			name: 'heart',
			dropdownName: 'Heart',
			category: 'Shapes',
			init: `Heart of size {id:'size', type:'number', min:-600, max:600, placeholder:40} 
			in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
			at ({id:'x', type:'number', min:0, max:600, placeholder:200}, 
			{id:'y', type:'number', min:0, max:600, placeholder:200})`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'single-click',
			onact: (my) => {
				my.target.heart({ color: my.data.color, x: my.data.x, y: my.data.y, size: my.data.size });
			}
		},
		{
			name: 'straight line',
			dropdownName: 'straight line',
			category: 'Brushes',
			init: `Straight line from ({id:'x1', type:'number', min:0, max:600, placeholder:100}, 
			{id:'y1', type:'number', min:0, max:600, placeholder:100})
			to ({id:'x2', type:'number', min:0, max:600, placeholder:200}, 
			{id:'y2', type:'number', min:0, max:600, placeholder:200})
			in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}
			with width {id: 'lineWeight', type: 'number', min:1, max:600, placeholder: 5}`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'drag',
			onact: (my) => {
				my.target.addLine({ color: my.data.color, lineWeight: my.data.lineWeight, x1: my.data.x1, y1: my.data.y1, x2: my.data.x2, y2: my.data.y2});
			}
		},
		{
			name: 'brush',
			dropdownName: 'Brush',
			category: 'Brushes',
			init: `Brush in {id:'color', type:'color', placeholder:[20, 0.8, 1.0]} 
			with width {id: 'lineWeight', type: 'number', min:1, max:600, placeholder: 8} 
			along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'drag',
			onact: (my) => {
				my.target.addBrushStroke({ color: my.data.color, lineWeight: my.data.lineWeight, pointsList: my.data.pointsList });
			}
		},
		{
			name: 'rainbow brush',
			dropdownName: 'Rainbow Brush',
			category: 'Brushes',
			init: `Rainbow brush in size {id: 'minSize', type: 'number', min:1, max:600, placeholder: 4} 
			to {id: 'maxSize', type: 'number', min:1, max:600, placeholder: 10} 
			along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'drag',
			onact: (my) => {
				my.target.addRainbowBrush({ minSize: my.data.minSize, maxSize: my.data.maxSize, pointsList: my.data.pointsList });
			}
		},
		{
			name: 'shift',
			dropdownName: 'Shift',
			category: 'Effects',
			init: `{id:'orientation', type:'choose', options:['vertical','horizontal'], placeholder:'vertical'} shift 
			with height {id:'height', type:'number', min:1, max:600, placeholder:50} 
			and offset {id:'offset', type:'number', min:1, max:600, placeholder:20}`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'single-click',
			onact: (my) => {
				my.target.shift({ height: my.data.height, offset: my.data.offset, orientation: my.data.orientation });
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
				my.target.applyFilter({ filter: my.data.filter });
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
				my.target.applyFilter({ filter: my.data.filter });
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
				my.target.applyFilter({ filter: my.data.filter });
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
				// my.target.addCircle({ color: my.data.color, x: my.data.x, y: my.data.y, r: my.data.radius });
			}
		},
		{
			name: 'box',
			dropdownName: 'Box',
			category: 'Stencils',
			init: `Box with length 
			{id:'length', type:'number', placeholder:120, min:20}, 
			width {id:'width', type:'number', placeholder:120, min:20}, 
			height {id:'height', type:'number', placeholder:120, min:20}`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'single-click',
			onact: (my) => {
				// my.target.addStencil();
				my.target.box({ length: my.data.length, width: my.data.width, height: my.data.height });
			}
		},
		{
			name: 'paper doll',
			dropdownName: 'Doll',
			category: 'Stencils',
			init: `Paper doll with length 
			{id:'length', type:'number', placeholder:120, min:10}, 
			width {id:'width', type:'number', placeholder:120, min:10}, 
			height {id:'height', type:'number', placeholder:120, min:10}`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'single-click',
			onact: (my) => {
				my.target.box({ length: my.data.length, width: my.data.width, height: my.data.height });
			}
		},
	];

	const app = new MotifApp(effectList);
});

class MotifApp {
	constructor(effectList) {
		this.effects = this.reindex(effectList, 'name');
		this.sketch = this.initP5();
		this.sketch.addFill({color:'#aaaaaa'});
		this.sketch.clear('#aaaaaa');
		this.joy = this.initJoy();
		this.initUI(); //categories and brush/effect buttons

		// this.joy.actions.addAction('stencils/paperdoll', undefined, {});
		this.joy.actions.update();

		//TODO: add global effect settings such as line weight, color, etc to pass into current events that have a "preview"
	}

	initP5() {
		return new p5(s => {
			
			let points = null;
			let activeEffectName = "";
			let strokeColor = 0;
			let strokeWeight = 5;

			s.setup = () => {
			  s.createCanvas(600, 600);
			  s.background(255);
			  s.setupFinished = true;
			  s.noLoop();
			};
		  
			s.draw = () => { //show a preview of brush strokes while actively dragging mouse
				if(points) {
					switch(activeEffectName) {
						case 'rainbow brush':
						  s.addRainbowBrush({ minSize: currentLineWeight, maxSize: currentLineWeight*2, pointsList: points.toString() });
						  break;
						case 'brush':
							s.addBrushStroke({color:currentColorRGB, lineWeight: currentLineWeight, pointsList: points.toString() });
							break;
						case 'straight line brush':
							s.addLine({ color:currentColorRGB, lineWeight: currentLineWeight, x1: s.getPoint(0).x, y1: s.getPoint(0).y, x2: s.getLastPoint().x, y2: s.getLastPoint().y}); 
							break;
						default: break;
					}
					// points.renderLine(s, strokeColor, strokeWeight); //TODO: rethink this way of passing in preview line settings
				// 	console.log(currentEffect);
				}
			};
		
			s.clear = () => {
				if(!s.setupFinished) return;
				s.background(255);
			}
		
			s.addCircle = (params) => {
				if(!s.setupFinished) return;
				s.fill(params.color);
				s.noStroke();
				s.circle(params.x, params.y, params.r*2);
			}

			s.addSquare = (params) => {
				s.push();
				s.rectMode(s.CENTER);
				s.fill(params.color);
				s.noStroke();
				s.rect(params.x, params.y, params.size, params.size);
				s.pop();
			}
		
			s.addFill = (params) => {
				if(!s.setupFinished) return;
				s.fill(params.color);
				s.noStroke();
				s.rect(0, 0, s.width, s.height);
			}
	
			s.star = (params) => {
				if(!s.setupFinished) return;
				let x = params.x;
				let y = params.y;
				let r1 = params.r1;
				let r2 = params.r2;
				let angle = s.TWO_PI / params.npoints;
				let halfAngle = angle / 2.0;
				s.fill(params.color);
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

			s.polygon = (params) => {
				if(!s.setupFinished) return;
				let nsides = Math.abs(params.nsides);
				s.fill(params.color);
				s.noStroke();
				let angle = s.TWO_PI / nsides;
				s.beginShape();
				for (let a = 0; a < s.TWO_PI; a += angle) {
				  let sx = params.x + s.cos(a) * params.r;
				  let sy = params.y + s.sin(a) * params.r;
				  s.vertex(sx, sy);
				}
				s.endShape(s.CLOSE);
			}

			s.gradient = (params) => {
				if(!s.setupFinished) return;
				let pcolor1 = s.color(params.color1);
				let pcolor2 = s.color(params.color2);
				s.noFill();
				s.strokeWeight(1);
				for(let i=0;i<s.height;i++) {
					s.stroke(s.lerpColor(pcolor1, pcolor2, i/s.height));
					s.line(0, i, s.width, i);
				}
			}

			s.stripes = (params) => {
				if(!s.setupFinished) return;
				let stripeWidth = params.stripeWidth;
				s.push();
				s.translate(0, stripeWidth/2); //so that top stripe is fully shown
				let pcolor1 = s.color(params.color1);
				let pcolor2 = s.color(params.color2);
				s.noFill();
				s.strokeWeight(stripeWidth);
				for(let i=0;i<s.height;i+=stripeWidth) {
					let c = s.lerpColor(pcolor1, pcolor2, i/(s.height-stripeWidth));
					s.stroke(c);
					s.line(0, i, s.width, i);
				}
				s.pop();
			}

			s.shift = (params) => {
				let lineHeight = params.height;
				let offset = params.offset;
				if(params.orientation == "horizontal") {
					for(let i=0;i<s.height/lineHeight;i++) {
						if(i%2 == 0) {
							s.image(s, offset, i*lineHeight, s.width, lineHeight, 0, i*lineHeight, s.width, lineHeight);
							s.image(s, 0, i*lineHeight, offset, lineHeight, s.width - offset, i*lineHeight, offset, lineHeight); //wrap
						}
					}
				}
				else if(params.orientation == "vertical") {
					for(let i=0;i<s.height/lineHeight;i++) {
						if(i%2 == 0) {
							s.image(s, i*lineHeight, offset, lineHeight, s.height, i*lineHeight, 0, lineHeight, s.height);
							s.image(s, i*lineHeight, 0, lineHeight, offset, i*lineHeight, s.width - offset, lineHeight, offset); //wrap
						}
					}
				}
			}

			//heart by Mithru: https://editor.p5js.org/Mithru/sketches/Hk1N1mMQg
			s.heart = (params) => {
				if(!s.setupFinished) return;
				let x = params.x;
				let y = params.y;
				let size = params.size;
				s.push();
				s.translate(0, -size/2);
				s.fill(params.color);
				s.noStroke();
				s.beginShape();
				s.vertex(x, y);
				s.bezierVertex(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
				s.bezierVertex(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
				s.endShape(s.CLOSE);
				s.pop();
			}

			s.applyFilter = (params) => {
				s.filter(s[params.filter.toUpperCase()]);
			}

			// s.setStrokeColor = (color) => {
			// 	strokeColor = color;
			// }

			// s.setStrokeWeight = (weight) => {
			// 	strokeWeight = weight;
			// }

			s.box = (params) => {
				s.push();
				let l = params.length;
				let w = params.width;
				let h = params.height;
				s.translate(s.width/4-w/2, s.height/4-l/2);
				s.noFill();
				s.stroke(0);
				s.strokeWeight(2);
				const dc = [l, w, l, w];
				const dr = [l, h, l];
				const r = [10];
				const c = [10];
				for(const d of dr) { r.push(r[r.length - 1] + d); }
				for(const d of dc) { c.push(c[c.length - 1] + d); }
				const cut = (r0, c0, r1, c1) => {
					s.stroke(0);
					s.line(r[r0], c[c0], r[r1], c[c1]);
				}
				const fold = (r0, c0, r1, c1) => {
					s.stroke(128);
					s.line(r[r0], c[c0], r[r1], c[c1]);
				}
				const tab = (r0, c0, r1, c1) => {
					s.stroke(0);
					const u = [r[r1] - r[r0], c[c1] - c[c0]];
					const v = [-u[1], u[0]];
					var prev = [0,0]; 
					for(const [du, dv] of [
						[0.1, 0.2],
						[0.9, 0.2],
						[1.0, 0.0]]) {
						s.line(r[r0] + u[0] * prev[0] + v[0] * prev[1],
							   c[c0] + u[1] * prev[0] + v[1] * prev[1],
							   r[r0] + u[0] * du + v[0] * dv,
							   c[c0] + u[1] * du + v[1] * dv);
						prev = [du, dv];						
					}
					fold(r0, c0, r1, c1);
				}
				tab(1,0,1,1);
				cut(1,1,0,1);
				cut(0,1,0,2);
				cut(0,2,1,2);
				tab(1,2,1,3);
				tab(1,3,1,4);
				cut(1,4,2,4);
				tab(2,4,2,3);
				tab(2,3,2,2);
				cut(2,2,3,2);
				cut(3,2,3,1);
				cut(3,1,2,1);
				tab(2,1,2,0);
				tab(2,0,1,0);
				// extra folds that aren't for tabs
				fold(1,1,1,2);
				fold(1,2,2,2);
				fold(2,2,2,1);
				fold(2,1,1,1);
				fold(1,3,2,3);
				s.pop();
			}

			s.addLine = (params) => {
				if(!s.setupFinished) return;
				s.strokeWeight(params.lineWeight);
				s.noFill();
				s.stroke(params.color);
				s.line(params.x1, params.y1, params.x2, params.y2);
			}

			s.addBrushStroke = (params) => {
				if(!s.setupFinished) return;
				s.push();
				s.noFill();
				s.strokeWeight(params.lineWeight);
				s.stroke(params.color);
				s.strokeJoin(s.ROUND);

				console.log(params.color);
				
				let points = params.pointsList.split(',');
				s.beginShape();
				for(let i=0;i<points.length-1;i+=2) {
					s.vertex(points[i], points[i+1]);
				}
				s.endShape();
				s.pop();
			}

			s.addRainbowBrush = (params) => {
				if(!s.setupFinished) return;
				s.push();
				s.noStroke();
				s.strokeWeight(params.minSize);
				s.colorMode(s.HSB);
				s.strokeJoin(s.ROUND);

				let hue = 0;
				let size = params.minSize;
				let hueIncrement = 10;
				let sizeIncrement = 1;
				
				let points = params.pointsList.split(','); //structure of this string is x1,y1,x2,y2,...
				for(let i=0;i<points.length-1;i+=2) {
					s.fill(hue, 150, 100);
					s.circle(points[i], points[i+1], size);
					hue += hueIncrement;
					size += sizeIncrement;
					if(hue > 255 || hue < 0) {
						hueIncrement *= -1;
					}
					if(size > params.maxSize || size < params.minSize) {
						sizeIncrement *= -1;
					}
				}
				s.pop();
			}

			s.startPoints = (x, y, activeEffect) => {
				points = new DrawnLine(x, y);
				activeEffectName = activeEffect;
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

		}, 'drawing-canvas');
	}
	
	initUI() {
		this.categories = [...new Set(Object.values(this.effects).map(a => a.category))]; //get unique categories from effect list
		let categoryToolbar = document.getElementsByClassName('category-toolbar')[0];
		let drawingToolbar = document.getElementsByClassName('drawing-toolbar')[0];
		this.categories.forEach((c) => {
			// Create a button for the category (tab) and add it to the toolbar
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
			document.getElementsByClassName('category-button')[0].click(); //Is this bad practice?
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
					this.sketch.startPoints(this.sketch.mouseX, this.sketch.mouseY, activeEffect);
				} else if(this.effects[activeEffect].category == "Stencils") {
					this.addEvent('stencils', activeEffect, {
						x: { type:'number', value: Math.round(this.sketch.mouseX)},
						y: { type:'number', value: Math.round(this.sketch.mouseY)}
					});
				}
				else {
					//if action type is not "drag", event added on mousedown
					this.addEvent('motif', activeEffect, {
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
						this.addEvent('motif', activeEffect, {
							x1: { type:'number', value: Math.round(this.sketch.getPoint(0).x) },
							y1: { type:'number', value: Math.round(this.sketch.getPoint(0).y) },
							x2: { type:'number', value: Math.round(this.sketch.getLastPoint().x) },
							y2: { type:'number', value: Math.round(this.sketch.getLastPoint().y) },
							lineWeight: {type:'number', value: currentLineWeight},
						});
					}
					else if(activeEffect == 'brush' || activeEffect == "rainbow brush") { //TODO: make this more general
						this.addEvent('motif', activeEffect, { 
							pointsList: { type:'number', value: this.sketch.pointsAsString()},
							lineWeight: {type:'number', value: currentLineWeight},
						  minSize: {type:'number', value: currentLineWeight},
						  maxSize: {type:'number', value: currentLineWeight*2}
						});
					}
					
					this.sketch.endPoints();
				}
			}
			randomizeCurrentColor();
		});
	}

	addEvent(category, effectName, settings) {
		let effect = this.effects[effectName];

		settings.color = { type:'color', value:currentColorHSV};
		
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
		//why does the category get added to the name here?
		if(category == "motif") {
			this.joy.actions.addAction(category+'/'+effectName, undefined, settings);
		} else if(category == "stencils") {
			this.joy.stencils.addAction(category+'/'+effectName, undefined, settings);
		}
		
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
			let motifEffects = Object.values(effects).filter((e) => {
				return e.category != "Stencils";
			})
			motifEffects.forEach(effect => {
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
			//Add from effects list
			let motifEffects = Object.values(effects).filter((e) => {
				return e.category == "Stencils";
			})
			motifEffects.forEach(effect => {
				Joy.add({
					name: effect.dropdownName,
					type: "stencils/" + effect.name,
					tags: ["stencils", "action"],
					init: effect.init,
					onact: effect.onact
				});
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

		//what does this do?
		// Joy.add({
		// 	type: "list",
		// 	tags: ["ui"],
		// 	initWidget: function(self){
		// 		self.dom = document.createElement("input");
		// 		self.dom.setAttribute("type", "button");
		// 		self.dom.value = "list";
		// 	},
		// 	onget: function(my){
		// 		return 3;
		// 	},
		// });

		let joy = Joy({
			// Where the Joy editor goes:
			container: "#joy",
		
			// The words and widgets inside the editor:
			init: "To create my design: "+
				  "{id:'actions', type:'actions', modules:['motif', 'math']} "+ // a list of actions
				//   "Fill with {id:'color', type:'color', placeholder:[0.3, 0.8, 1.0]}" +
				"With stencils: "+
				"{id: 'stencils', type:'actions', modules:['stencils', 'instructions']} "+  
				"<hr> {type:'save'}", // a save button!
			
			// Load data from URL, otherwise blank:
			data: data,
		
			// Actions to include:
			modules: ['motif', 'stencils', 'instructions', 'math'], //TODO: 'math' module removes min and max settings on Scrubber - see line 1032 and 2813
		
			previewActions: true,
			previewNumbers: true,
		
			// What to do when the user makes a change:
			onupdate: function(my) {
				sketch.clear();
				my.actions.act(sketch);
				my.stencils.act(sketch);
				// add end actions here
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

function _HSVToRGBString(h,s,v){ //duplicate from Joy.js
  if(arguments.length===1) {
        s=h[1], v=h[2], h=h[0]; // cast to different vars
    }
  var rgb = _HSVtoRGB(h,s,v);
  return "rgb("+rgb[0]+","+rgb[1]+","+rgb[2]+")";
}

function _HSVtoRGB(h, s, v) { //duplicate from Joy.js
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

let randomizeCurrentColor = ()=> {
	currentColorHSV = [Math.random()*360, 0.8, 0.8];
	currentColorRGB = _HSVToRGBString(currentColorHSV);
	
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