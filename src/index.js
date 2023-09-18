import { BrushstrokeManager, Brushstroke } from './models/brushstrokes.js';
import { Sortable, MultiDrag } from 'sortablejs';
import { effectList } from './config/effectList.js';
import { EffectManager } from './models/effects.js';
import { Effect, PathEffect, PointEffect } from './models/effects.js';
import { P5Renderer } from './renderers/p5renderer.js';
import { UIManager } from './ui/ui-manager.js';
import * as utilities from './utils/color-utils.js'; 
import { JoyManager } from './models/joy-manager.js';

let currentLineWeight = 6;

window.addEventListener('load', e => {
	const app = new MotifApp(effectList);
});

class MotifApp {
	constructor(effectList) {
		this.eventBus = new EventTarget();

		this.effects = new EffectManager(effectList);
		this.brushstrokes = new BrushstrokeManager();

		this.sketch = new P5Renderer();
		this.joyManager = new JoyManager(this.effects.getEffects(), this.brushstrokes, this.sketch, this.eventBus);
		
		this.ui = new UIManager(this.effects.getEffects(), this.eventBus);
		this.ui.generateEffectToolbarUI(); //categories and brush/effect buttons

		this._initUI();

		this.activeBrushstroke = null;
		
		// const slider = document.getElementById('numberSlider');
		// 	const input = document.getElementById('numberInput');

		// 	slider.addEventListener('input', () => {
		// 		input.value = slider.value;
		// 	});

		// 	input.addEventListener('input', () => {
		// 		if (input.value < parseInt(input.min) || input.value > parseInt(input.max)) {
		// 				alert('Value must be between ' + input.min + ' and ' + input.max);
		// 				input.value = slider.value;
		// 		} else {
		// 				slider.value = input.value;
		// 		}
		//   });
	}
	
	_initUI() {
		
		//List sorting
    // Sortable.mount(new MultiDrag());
		let sortablelist = document.getElementById('paintingActionList-joy-list');
    new Sortable(sortablelist, {
	    animation: 150,
	    ghostClass: 'sortable-ghost',
			// multiDrag: true,
			// selectedClass: 'selected',
			onUpdate: (e) => {
				this.joyManager.moveAction('motif', e.oldIndex, e.newIndex);
			}
    });

		//Mouse event listeners
		let dragging = false;
		let mouseDownOverCanvas = false; //TODO: doesn't work if you leave canvas with mouse down

		document.getElementById('drawing-canvas').addEventListener('mousedown', e => {
			dragging = false;
			mouseDownOverCanvas = true;

			let activeEffect = this.effects.getEffectByName(this.ui.getSelectedEffect());

			if(activeEffect) {
				let point = { x: this.sketch.mouseX, y: this.sketch.mouseY };

					if(!this.activeBrushstroke) {
						this.activeBrushstroke = new Brushstroke(
							activeEffect,
							point,
							[0, 0, 0],
							this.sketch);
						this.brushstrokes.addBrushstroke(this.activeBrushstroke);
						let mouseActionType = activeEffect.getValue('mouseActionType');

						if(mouseActionType === 'single-click') {
						  // this.joyManager.addEvent(...this.activeBrushstroke.makeJoyEvent());
							this.joyManager.addCurrentAction(this.activeBrushstroke.getPathAndPoint());

							//update preview action
						}
						else if(mouseActionType === 'drag') {
							this.joyManager.updatePreviewData(this.activeBrushstroke.getPathAndPoint());
								this.sketch.loop(); //render preview of brushstroke
						}
					}
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

				/*
					When mouse is down over canvas and mouse is moving,
					- add more points to the current path, making sure the Joy event gets the updates
					- render current preview of brushstroke to "preview" canvas

				*/

				if(this.activeBrushstroke) {
					this.activeBrushstroke.addPoint({x: this.sketch.mouseX, y: this.sketch.mouseY});
					if(this.activeBrushstroke.getMouseActionType() === 'drag') {
						this.joyManager.updatePreviewData(this.activeBrushstroke.getPathAndPoint());
					  // this.activeBrushstroke.renderPreview({}); //current canvas settings go here
					}
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
				this.activeBrushstroke.addPoint({x: this.sketch.mouseX, y: this.sketch.mouseY});
				if(this.activeBrushstroke.getMouseActionType() === 'drag') {
					let pathAndPoint = this.activeBrushstroke.getPathAndPoint();
					this.joyManager.addCurrentAction(pathAndPoint);
				}
				this.activeBrushstroke = null;
				this.sketch.noLoop();
			}
		});

    document.getElementById('clear-all-button').addEventListener("click", (e) => {
				console.log("clear all");
		});
		
		document.getElementById('download-button').addEventListener("click", (e) => {
			this.sketch.save('my drawing.jpg');
		});
		
		document.getElementById('shuffle-button').addEventListener("click", (e) => {
				console.log("shuffle all");
		});

		document.getElementById('shuffle-button').addEventListener("click", (e) => {
			console.log("remix all");
	  });
	}
}

