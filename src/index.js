import Joy from '../libraries/joy.js';
import { BrushstrokeManager, Brushstroke, Path } from './models/brushstrokes.js';
import { Sortable, MultiDrag } from 'sortablejs';
import { effectList } from './config/effectList.js';
import { EffectManager } from './models/effects.js';
import { Effect, PathEffect, PointEffect } from './models/effects.js';
import { P5Renderer } from './renderers/p5renderer.js';
import { UIManager } from './ui/ui-manager.js';
import * as utilities from './utils/color-utils.js'; 
import { JoyManager } from './models/joy-manager.js';

let currentColorRGB, currentColorHSV;
let currentLineWeight = 6;

window.addEventListener('load', e => {
	randomizeCurrentColor();
	const app = new MotifApp(effectList);
});

class MotifApp {
	constructor(effectList) {
		this.effects = new EffectManager(effectList);
		this.brushstrokes = new BrushstrokeManager();
		
		this.ui = new UIManager(this.effects.getEffects());
		this.ui.generateEffectToolbarUI();

		this.canvasRenderer = new P5Renderer();
		this.joyManager = new JoyManager(this.effects.getEffects(), this.brushstrokes, this.canvasRenderer);
		this.initUI(); //categories and brush/effect buttons
		// this.joy.actions.update();

		this.activeBrushstroke = null;
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

		
		//Mouse event listeners
		let dragging = false;
		let mouseDownOverCanvas = false; //TODO: doesn't work if you leave canvas with mouse down

		document.getElementById('drawing-canvas').addEventListener('mousedown', e => {
			dragging = false;
			mouseDownOverCanvas = true;

			let activeEffect = this.effects.getEffectByName(this.ui.getSelectedEffect());
			console.log("activeEffect", activeEffect);
			console.log(activeEffect instanceof Effect);
			console.log(activeEffect.mouseActionType);
			console.log(activeEffect.getValue('mouseActionType'));

			if(activeEffect) {
				// if(activeEffect.getValue('mouseActionType') == 'drag') {

				let userSettings = { x: this.canvasRenderer.mouseX, y: this.canvasRenderer.mouseY };


					if(!this.activeBrushstroke) {
						this.activeBrushstroke = new Brushstroke(
							activeEffect,
							userSettings,
							currentColorHSV,
							this.canvasRenderer);
						this.brushstrokes.addBrushstroke(this.activeBrushstroke);
						this.joyManager.addEvent(...this.activeBrushstroke.makeJoyEvent('motif', userSettings));
						this.canvasRenderer.loop(); //render preview of brushstroke
					}
				// }
				// else if(activeEffect.getValue('mouseActionType') == 'single-click2') {
				// 	let brushtap = new Brushstroke(
				// 		activeEffect,
				// 		{ x: this.canvasRenderer.mouseX, y: this.canvasRenderer.mouseY },
				// 		currentColorHSV,
				// if(activeEffect.getValue('mouseActionType') != 'drag') {
				// 	this.activeBrushstroke = null;
				// 	this.noLoop();
				// }

				// 	)
				// }
					// this.addEvent('motif', activeEffect.getValue('name'), {
					// 	pointsList: { type:'path', value: this.brushstroke.getPoints()},
					// 	)
					// this.addEvent('motif', activeEffect, { 
					// 	pointsList: { type:'path', value: this.brushstroke.getPoints()},
					// 	lineWeight: {type:'path', value: currentLineWeight},
					// 	minSize: {type:'number', value: currentLineWeight},
					// 	maxSize: {type:'number', value: currentLineWeight*2},
					// 	id: this.brushstroke.getID()
					// });
				// else if(activeEffect.category == "Stencils") {
				// 	this.addEvent('stencils', activeEffect, {
				// 		x: { type:'number', value: Math.round(this.sketch.mouseX)},
				// 		y: { type:'number', value: Math.round(this.sketch.mouseY)}
				// 	});
				// }
				// else {
				// 	//if action type is not "drag", event added on mousedown
				// 	this.addEvent('motif', activeEffect, {
				// 			x: { type:'number', value: Math.round(this.sketch.mouseX)},
				// 			y: { type:'number', value: Math.round(this.sketch.mouseY)}
				// 		});
				// }

			}
		});

		document.getElementById('drawing-canvas').addEventListener('mousemove', e => {
			if(mouseDownOverCanvas) {
				dragging = true;
				if(this.activeBrushstroke) {
					this.activeBrushstroke.addPoint({x: this.canvasRenderer.mouseX, y: this.canvasRenderer.mouseY});
					this.activeBrushstroke.renderPreview({}); //current canvas settings go here
				}
				else {
					console.log("No active brushstroke found");
				}
			}
		});

		document.getElementById('drawing-canvas').addEventListener('mouseup', e => {
			console.log("mouse up!");
			mouseDownOverCanvas = false;

			if(this.activeBrushstroke) {
				if(this.activeBrushstroke.getType() === 'drag') {
					this.activeBrushstroke.addPoint({x: this.canvasRenderer.mouseX, y: this.canvasRenderer.mouseY});

					// if(activeEffect == 'straight line') {
					// 	this.joyManager.addEvent('motif', activeEffect, {
					// 		x1: { type:'number', value: Math.round(this.mousePath.getPoint(0).x) },
					// 		y1: { type:'number', value: Math.round(this.mousePath.getPoint(0).y) },
					// 		x2: { type:'number', value: Math.round(this.mousePath.getLastPoint().x) },
					// 		y2: { type:'number', value: Math.round(this.mousePath.getLastPoint().y) },
					// 		lineWeight: {type:'number', value: currentLineWeight},
					// 	});
					// }
					// "new brushes"
					// else if(this.effects[activeEffect].category == "NewBrushes") {
					// 	// console.log("adding event: " + activeEffect);
					// 	// console.log("star brush: ", brushes.starBrush);

					// 	if(this.brushstroke) {
					// 		this.addEvent('motif', activeEffect, { 
					// 			pointsList: { type:'path', value: this.brushstroke.getPoints()},
					// 			lineWeight: {type:'path', value: currentLineWeight},
					// 			minSize: {type:'number', value: currentLineWeight},
					// 			maxSize: {type:'number', value: currentLineWeight*2},
					// 			id: this.brushstroke.getID()
					// 		});
					// 	}
					// }
					//NOT "new brushes"
					// else { //TODO: make this more general
					// 	this.addEvent('motif', activeEffect, { 
					// 		pointsList: { type:'number', value: this.brushstroke.getPoints()},
					// 		lineWeight: {type:'number', value: currentLineWeight},
					// 	  minSize: {type:'number', value: currentLineWeight},
					// 	  maxSize: {type:'number', value: currentLineWeight*2}
					// 	});
					// }
					this.activeBrushstroke.finalizePath();
					
					
				}
				this.activeBrushstroke = null;
				this.canvasRenderer.noLoop();
				console.log("no longer rendering brushstroke preview");
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

		// document.getElementById('undo-button').addEventListener("click", (e) => {
		// 	console.log("undo");
	  // });

		// document.getElementById('redo-button').addEventListener("click", (e) => {
		// 		console.log("redo");
		// });
		
		document.getElementById('clear-all-button').addEventListener("click", (e) => {
				console.log("clear all");
		});
		
		document.getElementById('download-button').addEventListener("click", (e) => {
			this.canvasRenderer.save('my drawing.jpg');
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
		
		// document.getElementById('remix-button').addEventListener("click", (e) => {
		// 		console.log("remix");
		// });
		
		document.getElementById('shuffle-button').addEventListener("click", (e) => {
				console.log("shuffle");
		});
		
		// document.getElementById('group-button').addEventListener("click", (e) => {
		// 		console.log("group");
		// });
		
		document.getElementById('delete-button').addEventListener("click", (e) => {
				console.log("delete");
		});
	
	}
}

let randomizeCurrentColor = () => {
	currentColorHSV = [Math.random()*360, 0.8, 0.8];
	currentColorRGB = utilities.HSVToRGBString(currentColorHSV);
}