// // JOY
// var joy = Joy({
// 	// Where the Joy editor goes:
// 	container: "#joy",

// 	// The words and widgets inside the editor:
// 	init: "To create my design: "+
// 		  "{id:'actions', type:'actions'} "+ // a list of actions
// 		//   "Fill with {id:'color', type:'color', placeholder:[0.3, 0.8, 1.0]}" +
// 		  "<hr> {type:'save'}", // a save button!
    
//     // Load data from URL, otherwise blank:
// 	data: data,

// 	// Actions to include:
// 	modules: ["motif", "instructions", "math"],

// 	previewActions: true,
//     previewNumbers: true,

// 	// What to do when the user makes a change:
// 	onupdate: function(my){
// 		// console.log(my.data.color);
// 		// color = my.data.color;
// 		// turtle.start();
// 		p5sketch.clear();
// 		my.actions.act(p5sketch);
// 		// my.actions.act(target);
// 		// motif.draw();
// 	}
// });

window.addEventListener('load', e => {
	const effectList = [
		{
			name: 'solid fill',
			category: 'Fill',
			cursor: './assets/cursors/fill-drip-solid.svg',
			params: {

			},
			applyEffect: (sketch, points, settings) => {
			}
		},
		{
			name: 'gradient fill',
			category: 'Fill',
			cursor: './assets/cursors/fill-drip-solid.svg',
			params: {

			},
			applyEffect: (sketch, points, settings) => {
			}
		},
		{
			name: 'dot',
			category: 'Shape',
			cursor: './assets/cursors/star-solid.svg',
			params: {

			},
			applyEffect: (sketch, points, settings) => {

			}
		},
		{
			name: 'square',
			category: 'Shape',
			cursor: './assets/cursors/star-solid.svg',
			params: {

			},
			applyEffect: (sketch, points, settings) => {

			}
		},	
		{
			name: 'polygon',
			category: 'Shape',
			cursor: './assets/cursors/star-solid.svg',
			params: {

			},
			applyEffect: (sketch, points, settings) => {

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

		//TODO: make this match effect params
		let params = {
			// color: { type:'color', value:[50, 0.5, 1.0]},
			color: { type:'color', value:[hslColor[0], hslColor[1], 1 - hslColor[2]]},
			x: { type:'number', value: Math.round(settings.x)},
			y: {type:'number', value: Math.round(settings.y)}
		}
		this.joy.actions.addAction('motif/'+effectName, undefined, params);
		this.joy.actions.update();
		// switch(effectName) {
		// 	case "solid fill":
		// 		this.joy.actions.addAction('motif/fill', undefined, {color:{ type:'color', value:[50, 0.5, 1.0]}});
		// 		this.joy.actions.update();
		// 		break;
		// 	case "dot":
		// 		let params = {
		// 			color: { type:'color', value:[50, 0.5, 1.0]},
		// 			x: { type:'number', value: Math.round(settings.x)},
		// 			y: {type:'number', value: Math.round(settings.y)}
		// 		}
		// 		this.joy.actions.addAction('motif/dot',undefined, params);
		// 		this.joy.actions.update();
		// 		break;
		// 	default: break;
		// }
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
		// return new p5(s => {
		// 	s.setup = () => {
		// 		s.createCanvas(600, 600);
		// 		s.background(255);
		// 		s.setupFinished = true;
		// 	}
		// 	s.draw = () => { };
		// 	s.clear = () => {
		// 		if(!s.setupFinished) return;
		// 		s.background(255);
		// 	}
		// }, 'drawingCanvas');
		return new p5(s => {
			let x = 100;
			let y = 100;
		  
			s.setup = () => {
			  s.createCanvas(600, 600);
			  s.background(255);
			  s.setupFinished = true;
			  s.noLoop();
			};
		  
			s.draw = () => {
				if(!s.setupFinished) return;
				// s.background(255);
			//   s.background(0);
			//   s.fill(255);
			//   s.rect(x,y,50,50);
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
		  }, 'drawing-canvas');
	}

	initJoy() {
		let data = Joy.loadFromURL();

		Joy.module("motif", function() {
			Joy.add({
				name: "Fill",
				type: "motif/solid fill",
				tags: ["motif", "action"],
			
				init: "Fill with {id:'color', type:'color', placeholder:[50, 0.8, 1.0]}",
			
				// Callback
				onact: function(my){
					my.target.addFill(my.data.color); // "my.target" will be the p5 canvas
				}
			});
			Joy.add({
				name: "Add polka dot",
				type: "motif/dot",
				tags: ["motif", "action"],
			
				init: `Add polka dot of radius {id:'radius', type:'number', placeholder:20} in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
				at ({id:'x', type:'number', placeholder:200}, {id:'y', type:'number', placeholder:200})`,
			
				// Callback
				onact: function(my){
					// my.target.background(my.data.color);
					// color = my.data.color;
					my.target.addCircle(my.data.color, my.data.x, my.data.y, my.data.radius);
					// my.target.fill(my.data.color); // "my.target" will be the p5 canvas
				},
			});
		
			Joy.add({
				name: "Brush",
				type: "motif/brush",
				tags: ["motif", "action"],
			
				init: "Brush {id:'choose', type:'choose', options:['a','b','c'], placeholder:'a'} in color {id:'color', type:'color', placeholder:[150, 0.8, 1.0]}",
			
				// Callback
				onact: function(my){
					// my.target.background(my.data.color);
					color = my.data.color;
					my.target.addCircle(my.data.color, my.data.x, my.data.y, my.data.radius);
					// my.target.fill(my.data.color); // "my.target" will be the p5 canvas
					//TODO: this is going to need a list of points
				},
			});
		});

		let sketch = this.sketch;
		let foo = this.foo;

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

// class Effect {
// 	constructor(name, applyEffect, settings, category) {
// 		this.name = name;
// 		this.applyEffect = applyEffect;
// 		this.category = category;
// 		this.settings = settings;
// 	  }
	
// 	  getButtonHTML() {
// 		let b = document.createElement("input");
// 		b.setAttribute("type", "button");
// 		b.classList.add('effect-button');
// 		b.setAttribute("value", this.name);
// 		b.setAttribute("id", this.name);
// 		return b;
// 	  }
	
// 	  getName() {
// 		return this.name;
// 	  }
	
// 	  cloneSettings() {
// 		let copy = { };
// 		for(const name in this.settings) {
// 		  copy[name] = this.settings[name].clone();
// 		}
// 		return copy;
// 	  }
	
// 	  clone() {
// 		return new Effect(this.name, this.applyEffect, this.cloneSettings(), this.category);
// 	  }
	
// 	  createEvent(startPosition, time) {
// 		return new DrawingEvent(this.clone(), startPosition, time);
// 	  }
// }



// // TURTLE
// window.turtle = new Turtle({
// 	width:400, height:400,
// 	data: data
// });
// // document.querySelector("#turtle").appendChild(turtle.canvas);

// // JOY ACTIONS
// Joy.add({
// 	name: "Move",
// 	type: "turtle/forward",
// 	tags: ["turtle", "action"],

// 	// What the action does is EMBEDDED IN A PLAIN-LANGUAGE SENTENCE
// 	init: "Move forward {id:'steps', type:'number', placeholder:50} steps",

// 	// Callback
// 	onact: function(my){
// 		my.target.forward(my.data.steps); // "my.target" will be the turtle
// 	}
// });

// Joy.add({
// 	name: "Turn",
// 	type: "turtle/turn",
// 	tags: ["turtle", "action"],
// 	init: "Turn {id:'angle', type:'number', placeholder:10} degrees",
// 	onact: function(my){
// 		my.target.turn(my.data.angle);
// 	}
// });

// Joy.add({
// 	name: "Change color",
// 	type: "turtle/color",
// 	tags: ["turtle", "action"],
// 	init: "Change color to {id:'color', type:'color'}",
// 	onact: function(my){
// 		my.target.setColor(my.data.color);
// 	}
// });

// // JOY
// window.joy = Joy({
// 	// Where the Joy editor goes:
// 	container: "#joy",

// 	// The words &amp; widgets inside the editor:
// 	init: "To create my design: "+
// 		  "{id:'turtleInstructions', type:'actions'} "+ // a list of actions
// 		  "<hr> {type:'save'}", // a save button!
    
//     // Load data from URL, otherwise blank:
// 	data: data,

// 	// Other actions to include, beyond turtle actions:
// 	modules: ["instructions", "math"],

// 	// What to do when the user makes a change:
// 	onupdate: function(my){
// 		turtle.start();
// 		my.turtleInstructions.act(turtle);
// 		turtle.draw();
// 	}
// });

// P.S: Dragging the turtle around...
// turtle.ondrag = function(){
// 	joy.update();
// };

// window.addEventListener('load', (event) =>{
//     var joy = Joy({
//         // Where the Joy editor goes:
//         container: "#joy",

//         // The words & actors inside the editor:
//         init: "Make the box "+
//             // Define actors with JSON/object-literal notation:
//             "{id:'width', type:'number', placeholder:50}px wide, "+
//             "{id:'height', type:'number', placeholder:50}px tall, "+
//             "and colored {id:'color', type:'color'}",

//         // What to do when the user makes a change:
//         onupdate: function(my){
//             var box = document.getElementById("box");
//             box.style.width = my.data.width;
//             box.style.height = my.data.height;
//             box.style.background = my.data.color;
//             console.log(my.data.width, my.data.height);
//         }
//     });
// });

// window.joy = Joy({
// 	init: "Make the box {id:'width', type:'number', placeholder:50}px wide, "+
// 		  "{id:'height', type:'number', placeholder:50}px tall, "+
// 		  "and colored {id:'color', type:'color'}",
// 	container: "#joy",
// 	onupdate: function(my){
// 		var box = document.getElementById("box");
//         box.style.width = my.data.width + "px";
//         box.style.height = my.data.height + "px";
//         box.style.background = my.data.color;
// 	}
// });

// let effects = {
// 	'fill-button': 0,
// 	'dot-button': 1
// }

// function applyEffect(effectNum, settings) {
// 	// let items = document.getElementsByClassName('joy-bullet');
// 	// let lastItem = items[items.length-1];
// 	// lastItem.click();
// 	// let chooser = document.getElementsByClassName('joy-modal-chooser')[0];
// 	// chooser.firstChild.firstChild.children[effectNum].click();
// 	switch(effectNum) {
// 		case 0:
// 			joy.actions.addAction('motif/fill',undefined, {color:{ type:'color', value:[50, 0.5, 1.0]}});
// 			joy.actions.update();
// 			break;
// 		case 1:
// 			let params = {
// 				color: { type:'color', value:[50, 0.5, 1.0]},
// 				x: { type:'number', value: Math.round(settings.x)},
// 				y: {type:'number', value: Math.round(settings.y)}
// 			}
// 			// params = JSON.stringify(params);
// 			joy.actions.addAction('motif/dot',undefined, params);
// 			joy.actions.update();
// 			break;
// 		default: break;
// 	}
// 	//TODO: this is where to add to joy data / list of commands
// }


// let p5sketch = new p5(s => {
// 	let x = 100;
// 	let y = 100;
  
// 	s.setup = () => {
// 	  s.createCanvas(600, 600);
// 	  s.background(255);
// 	  s.setupFinished = true;
// 	  s.noLoop();
// 	};
  
// 	s.draw = () => {
// 		if(!s.setupFinished) return;
// 	    // s.background(255);
// 	//   s.background(0);
// 	//   s.fill(255);
// 	//   s.rect(x,y,50,50);
// 	};

// 	s.clear = () => {
// 		if(!s.setupFinished) return;
// 	    s.background(255);
// 	}

// 	s.addCircle = (color, x, y, r) => {
// 		if(!s.setupFinished) return;
// 	    s.fill(color);
// 		s.circle(x, y, r*2);
// 	}

// 	s.addFill = (color) => {
// 		if(!s.setupFinished) return;
// 	    s.fill(color);
// 		s.noStroke();
// 		s.rect(0, 0, s.width, s.height);
// 	}
//   }, 'drawing-canvas');