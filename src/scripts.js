import Joy from '../libraries/joy.js';
import * as brushes from './brushes.js'; 
import * as utilities from './utilities.js'; 
import { Sortable, MultiDrag } from 'sortablejs';

let currentColorRGB, currentColorHSV;
let currentLineWeight = 6;

const brushstrokeManager = new brushes.BrushstrokeManager();

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
			name: 'star brush',
			dropdownName: 'Star Brush',
			category: 'NewBrushes',
			init: `Star brush in {id:'color', type:'color', placeholder:[20, 0.8, 1.0]} 
			with scale {id: 'scale', type: 'number', min:1, max:600, placeholder: 20}% 
			along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'drag',
			onact: (my) => {
				// console.log(my.data.brushstroke);
				// // console.log(my.data.brushstroke instanceof brushes.Brushstroke);
				// try {
				// 	brushstrokes[0].renderFinal();
				// 	// my.data.brushstroke.renderFinal();
				// } catch (error) {
				// 	console.log('Error calling renderFinal: ', error);
				// 	console.log('myObject is: ', my.data.brushstroke);
				// }
				
				console.log("rendered");
				my.target.metaBrush({
					scale: my.data.scale,
					pointsList: my.data.pointsList, 
					shapes:
					[
						(x, y, size, c) => {
							c.star({color: my.data.color, x: x, y: y, r1: size, r2: size/2, npoints: 5});
						},
					],
					sizes: [10, 20, 30, 40, 50, 40, 30, 20],
					colors:
					[
						[255, 165,   0], // Orange
						[255, 215,   0], // Gold
					],
					alpha: 0.75,
				}, my.target.s);
			}
		},
		{
			name: 'mosaic brush',
			dropdownName: 'Mosaic Brush',
			category: 'NewBrushes',
			init: `Mosaic brush with scale {id: 'scale', type: 'number', min:25, max:600, placeholder: 100} 
			% along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'drag',
			onact: (my) => {
				// my.data.stroke.render
				my.target.metaBrush({
					scale: my.data.scale,
					pointsList: my.data.pointsList, 
				  shapes:
					[
						(x, y, size, pg) => {
							pg.ellipse(x, y, size, size);
						},
						(x, y, size, pg) => {
							pg.rect(x, y, size, size);
						},
						(x, y, size, pg) => {
							pg.triangle(
								x + size / 2,
								y + size / 2,
								x - size / 2,
								y + size / 2,
								x,
								y - size / 2
							);
						},
					],
				  sizes: [10, 20, 15, 8],
          colors:
					[
						[255,   0,   0], // Red
						[255, 165,   0], // Orange
						[255, 215,   0], // Gold
						[128, 128,   0], // Olive
						[  0, 128,   0], // Green
						[ 38, 162, 224], // Light blue
						[  0,   0, 255], // Blue
						[ 75,   0, 130], // Indigo
						[128,   0, 128], // Purple
						[238, 130, 238], // Violet
						[255, 192, 203], // Pink
					],
					alpha: 0.75,
				});
			}
		},
		{
			name: 'stripe brush',
			dropdownName: 'Stripe Brush',
			category: 'NewBrushes',
			init: `Stripe brush with scale {id: 'scale', type: 'number', min:25, max:600, placeholder: 100} 
			% along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'drag',
			onact: (my) => {
				// my.data.stroke.render
				my.target.metaBrush({
					scale: my.data.scale,
					pointsList: my.data.pointsList, 
				  shapes:
					[
						(x, y, size, pg) => {
							pg.noStroke();
							pg.rect(x, y, Math.abs(size), size*5);
						}
					],
				  sizes: [10, -20, 15, -8, 4, -20, 15, -10, 9, -12, 8, -15, 20],
          colors:
					[
						[255,   0,   0], // Red
						[255, 165,   0], // Orange
						[128,   0, 128], // Purple
						[238, 130, 238], // Violet
						[255, 192, 203], // Pink
					],
					alpha: 0.75,
				});
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
			name: 'porcupine brush',
			dropdownName: 'Porcupine Brush',
			category: 'Brushes',
			init: `Porcupine brush in {id:'color', type:'color', placeholder:[20, 0.8, 1.0]} 
			with width {id: 'lineWeight', type: 'number', min:1, max:600, placeholder: 8} 
			along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'drag',
			onact: (my) => {
				my.target.porcupineBrush({ color: my.data.color, lineWeight: my.data.lineWeight, pointsList: my.data.pointsList });
			}
		},
		{
			name: 'lines brush',
			dropdownName: 'Lines Brush',
			category: 'Brushes',
			init: `Lines brush in {id:'color', type:'color', placeholder:[20, 0.8, 1.0]} 
			with width {id: 'lineWeight', type: 'number', min:1, max:600, placeholder: 8} 
			along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'drag',
			onact: (my) => {
				my.target.linesBrush({ color: my.data.color, lineWeight: my.data.lineWeight, pointsList: my.data.pointsList });
			}
		},
		{
			name: 'tile',
			dropdownName: 'Tile',
			category: 'Patterns',
			init: `{id:'tiling', type:'choose', options:['straight grid', 'brick', 'half drop', 'checkerboard'], placeholder:'straight grid'} 
			with width {id:'width', type:'number', min:1, max:600, placeholder:100} 
			and height {id:'height', type:'number', min:1, max:600, placeholder:100}
			at ({id:'x', type:'number', min:0, max:600, placeholder:200}, 
			{id:'y', type:'number', min:0, max:600, placeholder:200})`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'single-click',
			onact: (my) => {
				my.target.tile({ width: my.data.width, height: my.data.height, tiling: my.data.tiling, x: my.data.x, y: my.data.y });
			}
		},
		{
			name: 'shift',
			dropdownName: 'Shift',
			category: 'Patterns',
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
				my.target.box({ length: my.data.length, width: my.data.width, height: my.data.height });
			}
		},
		{
			name: 'paper doll',
			dropdownName: 'Doll',
			category: 'Stencils',
			init: `Paper doll with skin tone 
			{id:'skinTone', type:'color', placeholder:[25, 0.75, 0.4]}, 
			hairstyle {id:'hairstyle', type:'choose', options:['1'], placeholder:'1'},
			outfit set {id:'outfit', type:'choose', options:['1'], placeholder:'1'}`,
			cursor: './assets/cursors/star-solid.svg',
			mouseActionType: 'single-click',
			onact: (my) => {
				my.target.paperdoll({ skinTone: my.data.skinTone, hairstyle: my.data.hairstyle, outfit: my.data.outfit});
			}
		},
	];

	const app = new MotifApp(effectList);
});

class MotifApp {
	constructor(effectList) {
		this.effects = this.reindex(effectList, 'name');
		this.sketch = this.initP5();
		this.sketch.loadStencils();
		this.sketch.addFill({color:'#aaaaaa'});
		this.sketch.clear('#aaaaaa');
		this.joy = this.initJoy();
		this.initUI(); //categories and brush/effect buttons

		// this.joy.actions.addAction('stencils/paperdoll', undefined, {});
		this.joy.actions.update();

		//TODO: add global effect settings such as line weight, color, etc to pass into current events that have a "preview"
	}

	initP5() {
		return new p5(p => {
			
			let points = null;
			let activeEffectName = "";
			let strokeColor = 0;
			let strokeWeight = 5;
			let s, t; //p is main sketch, s is static canvas, t is temporary for animations

			let paperdolls = { // paper doll stencils
				outfits: [],
				hairstyles: [],
				dollFill: null
			};

			p.getPreviewCanvas = () => {
				return t;
			}

			p.getStaticCanvas = () => {
				return s;
			}

			p.setup = () => {
			  p.createCanvas(600, 600);
				s = p.createGraphics(p.width, p.height);
				t = p.createGraphics(p.width, p.height);
				console.log("s, t", s, t);
			  p.background(255);
			  p.setupFinished = true;
			  p.noLoop();		
			};
		  
			p.draw = () => { //show a preview of brush strokes while actively dragging mouse
				if(points) {
					switch(activeEffectName) {
						case 'rainbow brush':
						  p.addRainbowBrush({ minSize: currentLineWeight, maxSize: currentLineWeight*2, pointsList: points.toString() });
						  break;
						case 'brush':
							p.addBrushStroke({ color:currentColorRGB, lineWeight: currentLineWeight, pointsList: points.toString() });
							break;
						case 'straight line':
							t.clear();
							p.addPreviewLine({ color:currentColorRGB, lineWeight: currentLineWeight, x1: p.getPoint(0).x, y1: p.getPoint(0).y, x2: p.getLastPoint().x, y2: p.getLastPoint().y }, t); 
							break;
						case 'porcupine brush':
							t.clear();
							p.porcupineBrush({ color:currentColorRGB, lineWeight: currentLineWeight, pointsList: points.toString() }, t);
							break;
						case 'lines brush':
							t.clear();
							p.linesBrush({ color:currentColorRGB, lineWeight: currentLineWeight, pointsList: points.toString() }, t);
						// case 'star brush':
						// 	p.metaBrush({
						// 		scale: 100,
						// 		pointsList: points.toString(), 
						// 		shapes:
						// 		[
						// 			(x, y, size, c) => {
						// 				c.star({color: my.data.color, x: x, y: y, r1: size, r2: size/2, npoints: 5});
						// 			},
						// 		],
						// 		sizes: [10, 20, 30, 40, 50, 40, 30, 20],
						// 		colors:
						// 		[
						// 			[255, 165,   0], // Orange
						// 			[255, 215,   0], // Gold
						// 		],
						// 		alpha: 0.75,
						// 	}, t);
							break;
						default: break;
					}
				}
				p.image(s, 0, 0);
				p.image(t, 0, 0);
			};

			p.render = () => {
				p.image(s, 0, 0);
			}
		
			p.clear = () => {
				if(!p.setupFinished) return;
				p.background(255);
				s.background(255);
				t.clear();
			}
		
			p.addCircle = (params) => {
				if(!p.setupFinished) return;
				s.fill(params.color);
				s.noStroke();
				s.circle(params.x, params.y, params.r*2);
			}

			p.addSquare = (params) => {
				s.push();
				s.rectMode(s.CENTER);
				s.fill(params.color);
				s.noStroke();
				s.rect(params.x, params.y, params.size, params.size);
				s.pop();
			}
		
			p.addFill = (params) => {
				if(!p.setupFinished) return;
				s.fill(params.color);
				s.noStroke();
				s.rect(0, 0, p.width, p.height);
			}
	
			p5.prototype.star = function(params) {
				if(!p.setupFinished) return;
				this.push(); // Save current drawing style
				let x = params.x;
				let y = params.y;
				let r1 = params.r1;
				let r2 = params.r2;
				let angle = this.TWO_PI / params.npoints;
				let halfAngle = angle / 2.0;
				this.fill(params.color);
				this.noStroke();
				this.beginShape();
				for (let a = 0; a < s.TWO_PI; a += angle) {
				  let sx = x + this.cos(a) * r2;
				  let sy = y + this.sin(a) * r2;
				  this.vertex(sx, sy);
				  sx = x + this.cos(a + halfAngle) * r1;
				  sy = y + this.sin(a + halfAngle) * r1;
				  this.vertex(sx, sy);
				}
				this.endShape(this.CLOSE);
				this.pop(); // Restore original drawing style
			}

			p.polygon = (params) => {
				if(!p.setupFinished) return;
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

			p.gradient = (params) => {
				if(!p.setupFinished) return;
				let pcolor1 = s.color(params.color1);
				let pcolor2 = s.color(params.color2);
				s.noFill();
				s.strokeWeight(1);
				for(let i=0;i<p.height;i++) {
					s.stroke(s.lerpColor(pcolor1, pcolor2, i/p.height));
					s.line(0, i, p.width, i);
				}
			}

			p.stripes = (params) => {
				if(!p.setupFinished) return;
				let stripeWidth = params.stripeWidth;
				s.push();
				s.translate(0, stripeWidth/2); //so that top stripe is fully shown
				let pcolor1 = s.color(params.color1);
				let pcolor2 = s.color(params.color2);
				s.noFill();
				s.strokeWeight(stripeWidth);
				for(let i=0;i<p.height;i+=stripeWidth) {
					let c = s.lerpColor(pcolor1, pcolor2, i/(p.height-stripeWidth));
					s.stroke(c);
					s.line(0, i, p.width, i);
				}
				s.pop();
			}

			p.shift = (params) => {
				let lineHeight = params.height;
				let offset = params.offset;
				if(params.orientation == "horizontal") {
					for(let i=0;i<p.height/lineHeight;i++) {
						if(i%2 == 0) {
							s.image(s, offset, i*lineHeight, p.width, lineHeight, 0, i*lineHeight, p.width, lineHeight);
							s.image(s, 0, i*lineHeight, offset, lineHeight, p.width - offset, i*lineHeight, offset, lineHeight); //wrap
						}
					}
				}
				else if(params.orientation == "vertical") {
					for(let i=0;i<p.height/lineHeight;i++) {
						if(i%2 == 0) {
							s.image(s, i*lineHeight, offset, lineHeight, p.height, i*lineHeight, 0, lineHeight, p.height);
							s.image(s, i*lineHeight, 0, lineHeight, offset, i*lineHeight, p.width - offset, lineHeight, offset); //wrap
						}
					}
				}
			}

			p._convertToVectors = (pointString) => {
				let points = pointString.split(',');
				let vectors = [];
				// Iterate over the point list with a step of 2
				for (let i = 0; i < points.length; i += 2) {
					let x = parseInt(points[i]);
					let y = parseInt(points[i + 1]);
					vectors.push(p.createVector(x, y));
				}
				return vectors;
			}

			p.metaBrush = (params, c) => {
				s.noStroke();
				let points = p._convertToVectors(params.pointsList);
				for (let i = 0; i < params.colors.length; i++) {
					params.colors[i] = p.color(params.colors[i]);
					params.colors[i].setAlpha(p.map(params.alpha, 0, 1, 0, 255));
				}
					let shapeCount = 0; // Count of shapes drawn

					for (let i = 1; i < points.length; i++) {
						let point = points[i];

						let x = point.x;
						let y = point.y;

						s.fill(params.colors[i % params.colors.length]);
						let size = parseFloat(params.scale) / 100.0 * parseFloat(params.sizes[i % params.sizes.length]);
						params.shapes[i % params.shapes.length].apply(null, [x, y, size, s]);

						shapeCount++;
				}
			}

			p.tile = (params) => {
				let w = params.width;
				let h = params.height;
				let tiling = params.tiling;
				let x = params.x;
				let y = params.y;
			
				let sx = x - w / 2;
				let sy = y - h / 2;

				s.noFill();
				s.stroke(100);

				let snapshot = p.createGraphics(w, h); // for captured rectangle
				snapshot.image(s, 0, 0, w, h, sx, sy, w, h); // w * h rectangle centered at x, y 

				s.stroke(0);
				s.noFill();
			
				switch (tiling) {
					case 'straight grid': // take a and repeat it in a straight grid pattern across the full width and height of the canvas
						for (let dx = 0; dx < s.width; dx += w) {
							for (let dy = 0; dy < s.height; dy += h) {
								s.image(snapshot, dx, dy, w, h, 0, 0, w, h);
								// s.rect(dx, dy, w-5, h-5);
							}
						}
						break;
					case 'brick':
						// every other row should be shifted over by half the width of each unit
						let shiftRow = false;
						for (let dy = 0; dy < p.height; dy += h) {
							let startX = shiftRow ? - w / 2 : 0;
							for (let dx = startX; dx < p.width; dx += w) {
								s.image(snapshot, dx, dy, w, h, 0, 0, w, h);
							}
							shiftRow = !shiftRow;
						}
						break;
					case 'half drop':
						// every other column should be shifted down by half the height of each unit
						let halfColumnHeight = h / 2;
						let shiftColumn = false;
						for (let dx = 0; dx < p.width; dx += w) {
							let startY = shiftColumn ? -halfColumnHeight : 0;
							for (let dy = startY; dy < p.height; dy += h) {
								s.image(snapshot, dx, dy, w, h, 0, 0, w, h);
							}
							shiftColumn = !shiftColumn;
						}
						break;
					case 'checkerboard':
						// only tile every other unit, shift over for the next row like a checkerboard
						for (let dy = 0; dy < p.height; dy += h) {
							let isEvenRow = dy / h % 2 === 0;
							for (let dx = 0; dx < p.width; dx += w) {
								let isEvenColumn = dx / w % 2 === 0;
								if (isEvenRow !== isEvenColumn) {
									s.image(snapshot, dx, dy, w, h, 0, 0, w, h);
								}
							}
						}
						break;
					default:
						break;
				}
			}

			//heart by Mithru: https://editor.p5js.org/Mithru/sketches/Hk1N1mMQg
			p.heart = (params) => {
				if(!p.setupFinished) return;
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

			p.applyFilter = (params) => {
				s.filter(s[params.filter.toUpperCase()]);
			}

			p.box = (params) => {
				s.push();
				let l = params.length;
				let w = params.width;
				let h = params.height;
				s.translate(p.width/4-w/2, p.height/4-l/2);
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

			p.loadStencils = () => {
				let outfitNames = ['01'];
				let hairstyleNames = ['01'];
			
				// Load doll fill
				paperdolls.dollFill = p.loadImage(`src/assets/stencils/paper-dolls/outfits/doll-fill.png`);
			
				// Load all outfit and hairstyle files
				for (let name of outfitNames) {
					let outfit = {
						number: parseInt(name),
						outline: p.loadImage(`src/assets/stencils/paper-dolls/outfits/outlines/${name}.png`),
						fill: p.loadImage(`src/assets/stencils/paper-dolls/outfits/fills/${name}.png`)
					};
					paperdolls.outfits.push(outfit);
				}
			
				for (let name of hairstyleNames) {
					let hairstyle = {
						number: parseInt(name),
						outline: p.loadImage(`src/assets/stencils/paper-dolls/hairstyles/outlines/${name}.png`),
						fill: p.loadImage(`src/assets/stencils/paper-dolls/hairstyles/fills/${name}.png`)
					};
					paperdolls.hairstyles.push(hairstyle);
				}

				console.log("loaded images");
			}

			// p.paperdoll = (params) => {
			// 	s.image(paperdolls.dollFill, 0, 0, p.width, p.height);
			// }

			p.paperdoll = (params) => {
				// Get the color value from params.
				let c = s.color(params.skinTone);
				
				// Parse the outfit and hairstyle numbers from params
				let outfitNumber = parseInt(params.outfit);
				let hairstyleNumber = parseInt(params.hairstyle);
			
				// Find the corresponding outfit and hairstyle objects in paperdolls
				let outfit = paperdolls.outfits.find(o => o.number === outfitNumber);
				let hairstyle = paperdolls.hairstyles.find(h => h.number === hairstyleNumber);
			
				if (!outfit || !hairstyle) {
					console.error('Could not find outfit and/or hairstyle:', outfitNumber, hairstyleNumber);
					return;
				}
			
				// Create a new graphics object to draw the paper doll and its outfit and hairstyle fills
				let dollCanvas = p.createGraphics(p.width, p.height);
				let outfitCanvas = p.createGraphics(p.width, p.height);
				let hairstyleCanvas = p.createGraphics(p.width, p.height);
			
				//Tint and then draw the doll fill
				dollCanvas.tint(c); // Apply the tint for the doll's fill image
				dollCanvas.image(paperdolls.dollFill, 0, 0, p.width, p.height); // Draw the doll's fill image
				dollCanvas.noTint(); // Remove the tint before drawing the other images

				// Prepare the outfit fill as a mask
        outfitCanvas.image(outfit.fill, 0, 0, p.width, p.height);
        outfitCanvas.drawingContext.globalCompositeOperation = 'source-in';
        outfitCanvas.image(s, 0, 0, p.width, p.height);
      
        // Prepare the hairstyle fill as a mask
        hairstyleCanvas.image(hairstyle.fill, 0, 0, p.width, p.height);
        hairstyleCanvas.drawingContext.globalCompositeOperation = 'source-in';
        hairstyleCanvas.image(s, 0, 0, p.width, p.height);
      
        // Lighten the original painting
        s.noStroke();
        s.fill(255, 220);
        s.rect(0, 0, p.width, p.height);

				// Draw the doll fill
        s.image(dollCanvas, 0, 0);

				// Draw the outfit fill
        s.image(outfitCanvas, 0, 0);

        // Draw the outfit outline
        if(outfit.outline){
          s.image(outfit.outline, 0, 0, s.width, s.height);
        }

				// Draw the hair fill
        s.image(hairstyleCanvas, 0, 0);
      
				// Draw the hair outline
        if(hairstyle.outline){
          s.image(hairstyle.outline, 0, 0, s.width, s.height);
        }

				// // s.image(g, 0, 0);
				
				// // Apply the outfit fill as a mask
				// outfitCanvas.image(outfit.fill, 0, 0, p.width, p.height);
        // outfitCanvas.drawingContext.globalCompositeOperation = 'source-in';
        // outfitCanvas.image(s, 0, 0, p.width, p.height);
				
				// // Lighten everything that is not within the mask, then draw the masked image
				// s.noStroke();
				// s.fill(255, 220);
				// s.rect(0, 0, p.width, p.height);
				// s.image(dollCanvas, 0, 0);
				// s.image(outfitCanvas, 0, 0);
      
        // // Draw the outfit's outline image
        // if(outfit.outline){
        //   s.image(outfit.outline, 0, 0, s.width, s.height);
        // }
}

			
			// p.paperdoll = (params) => {
			// 	let c = s.color(params.color);
				
			// 	// Parse the outfit and hairstyle numbers from params
			// 	let outfitNumber = parseInt(params.outfit);
			// 	let hairstyleNumber = parseInt(params.hairstyle);
			
			// 	// Find the corresponding outfit and hairstyle objects in paperdolls
			// 	let outfit = paperdolls.outfits.find(o => o.number === outfitNumber);
			// 	let hairstyle = paperdolls.hairstyles.find(h => h.number === hairstyleNumber);
			
			// 	if (!outfit || !hairstyle) {
			// 		console.error('Could not find outfit and/or hairstyle:', outfitNumber, hairstyleNumber);
			// 		return;
			// 	}
			
			// 	// Draw the images in the correct order
			// 	s.tint(c); // Apply the tint for the doll's fill image
			// 	s.image(paperdolls.dollFill, 0, 0, p.width, p.height); // Draw the doll's fill image
			// 	s.noTint(); // Remove the tint before drawing the other images
				
			// 	if(outfit.fill){
			// 		s.image(outfit.fill, 0, 0, s.width, s.height); // Draw the outfit's fill image
			// 	}
			
			// 	if(outfit.outline){
			// 		s.image(outfit.outline, 0, 0, s.width, s.height); // Draw the outfit's outline image
			// 	}
				
			// 	if(hairstyle.fill){
			// 		s.tint(255); // Apply white tint to prevent color from previous tint interfering
			// 		s.image(hairstyle.fill, 0, 0, s.width, s.height); // Draw the hairstyle's fill image
			// 		s.noTint(); // Remove the tint before drawing the other images
			// 	}
			
			// 	if(hairstyle.outline){
			// 		s.image(hairstyle.outline, 0, 0, s.width, s.height); // Draw the hairstyle's outline image
			// 	}
			// }
			

			p.addLine = (params) => {
				if(!p.setupFinished) return;
				s.strokeWeight(params.lineWeight);
				s.noFill();
				s.stroke(params.color);
				s.line(params.x1, params.y1, params.x2, params.y2);
			}

			p.addPreviewLine = (params, c) => { //TODO: integrate choosing canvas into all drawing functions
				if(!p.setupFinished) return;
				c.strokeWeight(params.lineWeight);
				c.noFill();
				c.stroke(params.color);
				c.line(params.x1, params.y1, params.x2, params.y2);
			}

			p.addBrushStroke = (params) => {
				if(!p.setupFinished) return;
				s.push();
				s.noFill();
				s.strokeWeight(params.lineWeight);
				s.stroke(params.color);
				s.strokeJoin(s.ROUND);
				
				let points = params.pointsList.split(',');
				s.beginShape();
				for(let i=0;i<points.length-1;i+=2) {
					s.vertex(points[i], points[i+1]);
				}
				s.endShape();
				s.pop();
			}

			p.addRainbowBrush = (params) => {
				if(!p.setupFinished) return;
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

			p.porcupineBrush = (params, c) => {
				if(!p.setupFinished) return;
				if(!c) c = s; //if no canvas specified
				c.strokeWeight(params.lineWeight);
				c.strokeWeight(4);
				c.noFill();
				c.stroke(params.color);

				let points = params.pointsList.split(',');
				for(let i=0;i<points.length-2;i+=2) {
					c.line(points[0], points[1], points[i+2], points[i+3]);
				}
			}

			p.linesBrush = (params, c) => {
				if(!p.setupFinished) return;
				if(!c) c = s; //if no canvas specified
				c.strokeWeight(params.lineWeight);
				c.noFill();
				let strokeColor = c.color(params.color);

				let points = params.pointsList.split(',');
				let n = 100;
				for(let i=0;i<points.length-1;i+=2) {
					strokeColor.setAlpha(c.map(c.noise(n), 0, 1, 10, 200));
					c.stroke(strokeColor);
					c.line(points[i], 0, points[i+1], p.height);
				}
			}

			p.startPoints = (x, y, activeEffect) => {
				points = new DrawnLine(x, y);
				activeEffectName = activeEffect;
				p.loop();
			}

			p.addPoint = (x, y) => {
				points.addPoint(x, y);
			}

			p.endPoints = () => {
				points = null;
				p.noLoop();
			}

			p.getPoint = (index) => {
				return points.points[index];
			}

			p.getLastPoint = () => {
				return points.points[points.points.length-1];
			}

			p.pointsAsString = () => {
				return points.toString();
			}

			p.mouseDragged = () => {
				if(points) {
					p.addPoint(p.mouseX, p.mouseY);
				}
			}

		}, 'drawing-canvas');
	}
	
	initUI() {
		//List sorting
    Sortable.mount(new MultiDrag());
		let sortablelist = document.getElementById('actions-joy-list');
    new Sortable(sortablelist, {
	    animation: 150,
	    ghostClass: 'sortable-ghost',
			multiDrag: true,
			selectedClass: 'selected',
			onUpdate: (evt) => {
				this.joy.actions.moveEntry(evt.oldIndex, evt.newIndex);
			}
    });

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
					else if(this.effects[activeEffect].category == "NewBrushes") {
						console.log("adding event: " + activeEffect);
						console.log("star brush: ", brushes.starBrush);
						// let brushstroke = new brushes.Brushstroke(
						// 	brushes.starBrush,
						// 	this.sketch.pointsAsString(),
						// 	currentColorHSV,
						// 	this.sketch);
						// brushstrokes.push(brushstroke);
						this.addEvent('motif', activeEffect, { 
							pointsList: { type:'number', value: this.sketch.pointsAsString()},
							lineWeight: {type:'number', value: currentLineWeight},
						  minSize: {type:'number', value: currentLineWeight},
						  maxSize: {type:'number', value: currentLineWeight*2},
							test: "this is test data",
							// brushstroke: brushstroke
						});
					}
					else { //TODO: make this more general
						console.log(activeEffect);
						console.log("line weight: " + currentLineWeight);
						this.addEvent('motif', activeEffect, { 
							pointsList: { type:'number', value: this.sketch.pointsAsString()},
							lineWeight: {type:'number', value: currentLineWeight},
						  minSize: {type:'number', value: currentLineWeight},
						  maxSize: {type:'number', value: currentLineWeight*2}
						});
					}
					
					this.sketch.endPoints();
					console.log("end points");
				}
			}
			randomizeCurrentColor();
		});

		/* bookmark - add code button handlers here

function moveSelectedCodeLineUp() {
  let lineNum = getSelectedLineNumber();
  if(lineNum < history.length) {
    if(lineNum > 0) {
      let line = history[lineNum];
      history.splice(lineNum, 1);
      history.splice(lineNum-1, 0, line);
      updateCode();
      let newLineNum = lineNum - 1;
      markSelected("code-line", "code-line-" + newLineNum);
    }
  }
}

function deleteSelectedCodeLine() {
  let lineNum = getSelectedLineNumber();
  if(lineNum < history.length) {
    //add to undo/redo here
    history.splice(lineNum, 1);
    updateCode();
    if(history.length > 0) {
      if(lineNum > 0 && lineNum < history.length) {
        markSelected("code-line", "code-line-" + lineNum);
      }
      else if(lineNum == 0) {
        markSelected("code-line", "code-line-0");
      }
    }
  }
}
		*/

		document.getElementById('undo-button').addEventListener("click", (e) => {
			console.log("undo");
	  });

		document.getElementById('redo-button').addEventListener("click", (e) => {
				console.log("redo");
		});
		
		document.getElementById('clear-all-button').addEventListener("click", (e) => {
				console.log("clear all");
		});
		
		document.getElementById('download-button').addEventListener("click", (e) => {
			this.sketch.save('my drawing.jpg');
		});
		
		document.getElementById('move-up-button').addEventListener("click", (e) => {
				console.log("move up");
		});
		
		document.getElementById('move-down-button').addEventListener("click", (e) => {
				console.log("move down");
		});
		
		document.getElementById('add-above-button').addEventListener("click", (e) => {
				console.log("add above");
		});
		
		document.getElementById('add-below-button').addEventListener("click", (e) => {
				console.log("add below");
		});
		
		document.getElementById('remix-button').addEventListener("click", (e) => {
				console.log("remix");
		});
		
		document.getElementById('shuffle-button').addEventListener("click", (e) => {
				console.log("shuffle");
		});
		
		document.getElementById('group-button').addEventListener("click", (e) => {
				console.log("group");
		});
		
		document.getElementById('delete-button').addEventListener("click", (e) => {
				console.log("delete");
		});
	
	
	}

	addEvent(category, effectName, settings) {
		let effect = this.effects[effectName];
		
		//TODO: make this match effect params
		// let params = ...settings;
		settings.color = { type:'color', value:currentColorHSV};
		
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
			//Add from effects list, but filter out stencils
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

		//Add stencils to their own list
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
			modules: ['motif', 'stencils', 'instructions'], //TODO: 'math' module removes min and max settings on Scrubber - see line 1032 and 2813
		
			previewActions: true,
			previewNumbers: true,
		
			// What to do when the user makes a change:
			// bookmark - work on skip if not done rendering
			onupdate: function(my) {
				if(Date.now() > targetTime && !isRendering) {
					isRendering = true;
					render(sketch, my);
				}
			}
		});

		return joy;
	}
}

let renderStartTime;
let targetTime = 0;
let isRendering = false;

let render = (sketch, my) => {
	renderStartTime = Date.now();
	
	sketch.clear();
	my.actions.act(sketch); //this is where sketch is passed in as target
	my.stencils.act(sketch);
	sketch.render();
	
	let renderTime = Date.now() - renderStartTime;
	targetTime = Date.now() + 2*renderTime;
	isRendering = false;
}

let randomizeCurrentColor = () => {
	currentColorHSV = [Math.random()*360, 0.8, 0.8];
	currentColorRGB = utilities.HSVToRGBString(currentColorHSV);
	
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