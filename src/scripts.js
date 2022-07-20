window.addEventListener('load', (event) => {
	let effects = [
		{
			name: 'Fill',
			category: 'fill',
			params: {

			},
			applyEffect: (sketch, points, settings) {
			}
		},
		{
			name: 'Circle',
			category: 'shape',
			params: {

			},
			applyEffect: (sketch, points, settings) {

			}
		},	
	]
	app = new MotifApp(effects);
  });

class MotifApp {
	constructor(effectsObj) {
		this.effects = new EffectSet(effectsObj);
	}

	init() {
		this.loadEffects();
		this.initUI();

		this.sketch = this.initP5();
		this.joy = this.initJoy();
		
	}

	initP5() {
		return new p5(s => {
			s.setup = () => {
				s.createCanvas(600, 600);
				s.background(255);
				s.setupFinished = true;
			}
			s.draw = () => { };
			s.clear = () => {
				if(!s.setupFinished) return;
				s.background(255);
			}
		}, 'drawingCanvas');
	}

	initJoy() {
		let data = Joy.loadFromURL();
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
				p5sketch.clear();
				my.actions.act(this.sketch);
			}
		});

		Joy.module("motif", () => {
			let actors = this.effects.getJoyActors();
			actors.forEach(actor => {
				Joy.add(actor);
			});
		});

		return joy;
	}

}

let p5sketch = new p5(s => {
	let x = 100;
	let y = 100;
  
	s.setup = () => {
	  s.createCanvas(600, 600);
	  s.background(255);
	  s.setupFinished = true;
	//   s.noLoop();
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

Joy.module("motif", function() {
	Joy.add({
		name: "Fill",
		type: "motif/fill",
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
			color = my.data.color;
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



// JOY
var rootJoy = Joy({
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
	onupdate: function(my){
		// console.log(my.data.color);
		// color = my.data.color;
		// turtle.start();
		p5sketch.clear();
		my.actions.act(p5sketch);
		// my.actions.act(target);
		// motif.draw();
	}
});

window.joy = rootJoy;
window.actionsRoot = rootJoy.actions;
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

let effects = {
	'fill-button': 0,
	'dot-button': 1
}

function applyEffect(effectNum, settings) {
	// let items = document.getElementsByClassName('joy-bullet');
	// let lastItem = items[items.length-1];
	// lastItem.click();
	// let chooser = document.getElementsByClassName('joy-modal-chooser')[0];
	// chooser.firstChild.firstChild.children[effectNum].click();
	switch(effectNum) {
		case 0:
			joy.actions.addAction('motif/fill',undefined, {color:{ type:'color', value:[50, 0.5, 1.0]}});
			joy.actions.update();
			break;
		case 1:
			let params = {
				color: { type:'color', value:[50, 0.5, 1.0]},
				x: { type:'number', value: Math.round(settings.x)},
				y: {type:'number', value: Math.round(settings.y)}
			}
			// params = JSON.stringify(params);
			joy.actions.addAction('motif/dot',undefined, params);
			joy.actions.update();
			break;
		default: break;
	}
	//TODO: this is where to add to joy data / list of commands
}

//TODO create these buttons automatically based on effects
let fillButton = document.getElementById('fill-button');
fillButton.addEventListener('click', (event) => {
	markSelectedById('drawing-tool-button', 'fill-button');
	// let items = document.getElementsByClassName('joy-bullet');
	// let lastItem = items[items.length-1];
	// lastItem.click();
	// let chooser = document.getElementsByClassName('joy-modal-chooser')[0];
	// chooser.firstChild.firstChild.children[0].click();
});

let dotButton = document.getElementById('dot-button');
dotButton.addEventListener('click', (event) => {
	markSelectedById('drawing-tool-button', 'dot-button');
	// let items = document.getElementsByClassName('joy-bullet');
	// let lastItem = items[items.length-1];
	// lastItem.click();
	// let chooser = document.getElementsByClassName('joy-modal-chooser')[0];
	// chooser.firstChild.firstChild.children[1].click();
});

function markSelectedById(className, id) {
	document.getElementsByClassName(className).forEach(element => {
	  element.classList.remove('selected');
	});
	document.getElementById(id).classList.add('selected');
  }

// let dotButton = document.getElementById('dot-button');
// dotButton.addEventListener('click', (event) => {
// 	let items = document.getElementsByClassName('joy-bullet');
// 	let lastItem = items[items.length-1];
// 	lastItem.click();
// 	let chooser = document.getElementsByClassName('joy-modal-chooser')[0];
// 	chooser.firstChild.firstChild.children[1].click();
// });

let drag = false;

document.getElementById('drawing-canvas').addEventListener('mousedown', e => {
	drag = false;
});

document.getElementById('drawing-canvas').addEventListener('mousemove', e => {
	drag = true;
});

document.getElementById('drawing-canvas').addEventListener('mouseup', e => {
	// console.log(drag ? 'drag' : 'click');
	// console.log('mouse up');
	applyEffect(effects[getActiveEffect()], {
		x: p5sketch.mouseX,
		y: p5sketch.mouseY
	});
});

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
	  x: evt.clientX - rect.left,
	  y: evt.clientY - rect.top
	};
  }

function getActiveEffect() {
    let selectedEffects = document.getElementsByClassName("drawing-tool-button selected");
    if(selectedEffects.length > 0) {
      let selectedEffect = selectedEffects[0];
      return selectedEffect.id;
    } else return "";
  }