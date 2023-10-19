import { BrushstrokeManager, Brushstroke } from './models/brushstrokes.js';
import { Sortable, MultiDrag } from 'sortablejs';
import { effectList } from './config/effectList.js';
import { EffectManager } from './models/effects.js';
import { Effect, PathEffect, PointEffect } from './models/effects.js';
import { P5Renderer } from './renderers/p5renderer.js';
import { UIManager } from './ui/ui-manager.js';
import * as utilities from './utils/color-utils.js'; 
import { JoyManager } from './models/joy-manager.js';
import { setTooltips } from './tooltips.js';

let currentLineWeight = 6;

window.addEventListener('load', e => {
	const app = new MotifApp(effectList);
});

class MotifApp {
	constructor(effectList) {
		this.eventBus = new EventTarget();

		this.effects = new EffectManager(effectList);
		this.brushstrokes = new BrushstrokeManager();

		let rootStyles = getComputedStyle(document.documentElement);
		let w = parseInt(rootStyles.getPropertyValue('--canvas-width').trim(), 10);
		let h = parseInt(rootStyles.getPropertyValue('--canvas-height').trim(), 10);
		console.log("width and height", w, h);
		this.sketch = new P5Renderer(w, h);
		this.joyManager = new JoyManager(this.effects.getEffects(), this.brushstrokes, this.sketch, this.eventBus);
		
		this.ui = new UIManager(this.effects.getEffects(), this.eventBus);
		this.ui.generateEffectToolbarUI(); //categories and brush/effect buttons
		let numRings = parseInt(rootStyles.getPropertyValue('--num-rings').trim(), 10);
		this.ui.addNotebookRings(numRings);

		this._setupDraggables();
		this._setupEventListeners();
		this.adjustAlignment();
		setTooltips();

		this.activeBrushstroke = null;
	}
	
	_setupDraggables() {
		
		//List sorting
    // Sortable.mount(new MultiDrag());

		let droppedInTrash = false;

		let paintingActions = document.getElementById('paintingActionList-joy-list');
    new Sortable(paintingActions, {
			revertOnSpill: true,
			group: {
				name: 'trash'
			},
	    animation: 150,
	    ghostClass: 'sortable-ghost',
			chosenClass: "sortable-chosen",
			dragClass: "sortable-drag",
			handle: '.joy-bullet-container',
			filter: '.joy-add-item',
			scroll: true,
			// multiDrag: true,
			// selectedClass: 'selected',
			onUpdate: (e) => {
				this.joyManager.moveAction('motif', e.oldIndex, e.newIndex);
				// console.log("moved", e.item, e.oldIndex, e.newIndex);
			},
			onMove: (e) => {
				// Check if the element is the trash
				// if (e.to && e.to.id === 'trash') {
				// 		trash.classList.add('hovered'); // Make the trash turn light red
				// } else {
				// 		trash.classList.remove('hovered'); // Remove the light red color when not hovering over the trash
				// }

				if(e.related.classList.contains('joy-add-item')) { //keep + at end of list
					return false; 
				} 
			},
			onEnd: (e) => {
				trash.classList.remove('hovered');
			},
    });

		// let stencilActions = document.getElementById('stencilActionList-joy-list');
		// new Sortable(stencilActions, {
	  //   animation: 150,
	  //   ghostClass: 'sortable-ghost',
		// 	onUpdate: (e) => {
		// 		this.joyManager.moveAction('stencils', e.oldIndex, e.newIndex);
		// 	}
    // });

		let trash = document.getElementById('trash');
		trash.addEventListener('dragenter', (e) => {
			trash.classList.add('hovered');
			debugger;
		});
		trash.addEventListener('dragover', (e) => {
			trash.classList.add('hovered');
			console.log(e);
			e.preventDefault(); // Required to allow dropping
			// if(document.querySelector('.sortable-chosen')) {
				
			// }
			// else {
			// 	trash.classList.remove('hovered');
			// }
		});

		trash.addEventListener('drop', (e) => {
			// Use the class to find the dragged item
			const draggedItem = document.querySelector('.sortable-chosen');
			
			if (draggedItem) {
				console.log("deleting", draggedItem);
				// Handle deletion
				// draggedItem.parentNode.removeChild(draggedItem);
				// If your manager has a method to handle deletion, call it
				// Assuming it uses the id of the parent and the index of the item
				// this.joyManager.deleteAction(draggedItem.parentNode.id, Array.from(draggedItem.parentNode.children).indexOf(draggedItem));
			}
	  });
	}
		// Sortable.create(trash, {
    // group: {
		// 	name:'trash',
		// },
    // ghostClass: 'sortable-ghost-delete',
    // chosenClass: 'sortable-chosen-delete',
		// swapThreshold: 1,
		// invertSwap: true,
    // onAdd: (e) => {
    //     var el = e.item;
    //     el.parentNode.removeChild(el);
    //     this.joyManager.deleteAction(e.from.id, e.oldIndex);
    // }

		// let trash = document.getElementById('trash');
		// Sortable.create(trash, {
		// 	group: 'shared',
		// 	ghostClass: 'sortable-ghost-delete',
		// 	chosenClass: 'sortable-chosen-delete',
		// 	onAdd: (e) => {
		// 		var el = e.item;
		// 		el.parentNode.removeChild(el);
		// 		// console.log(e.oldIndex, 'dropped from', e.from.id);
		// 		this.joyManager.deleteAction(e.from.id, e.oldIndex);
		// 	}
		// });

  adjustAlignment() {
    const outerContainer = document.querySelector('.outer-container');
    if (window.innerWidth > 1482) {
        outerContainer.style.alignItems = 'center';
    } else {
        outerContainer.style.alignItems = 'flex-start';
    }
  }

	_setupEventListeners() {

		//Mouse event listeners
		let dragging = false;
		let mouseDownOverCanvas = false; //TODO: doesn't work if you leave canvas with mouse down

		document.getElementById('drawing-canvas').addEventListener('mousedown', e => {
			dragging = false;
			mouseDownOverCanvas = true;

			let activeEffect = this.effects.getEffectByName(this.ui.getSelectedEffect());

			if(activeEffect) {
				let point = { x: this.sketch.mouseX, y: this.sketch.flippedMouseY() };

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
							this.joyManager.previewActionEnabled = true;
							this.sketch.loop(); //render preview of brushstroke
						}
						else if(mouseActionType === 'drag-path') {
							this.joyManager.updatePreviewData(this.activeBrushstroke.getPath());
							this.joyManager.previewActionEnabled = true;
							this.sketch.loop(); //render preview of brushstroke
						}
					}
			}

		});

		document.getElementById('drawing-canvas').addEventListener('mousemove', e => {
			/*
					When mouse is down over canvas and mouse is moving,
					- add more points to the current path, making sure the Joy event gets the updates
					- render current preview of brushstroke to "preview" canvas
			*/
			if(mouseDownOverCanvas) {
				dragging = true;

				if(this.activeBrushstroke) {
					this.activeBrushstroke.addPoint({x: this.sketch.mouseX, y: this.sketch.flippedMouseY()});
					if(this.activeBrushstroke.getMouseActionType() === 'drag') {
						this.joyManager.updatePreviewData(this.activeBrushstroke.getPathAndPoint());
					  // this.activeBrushstroke.renderPreview({}); //current canvas settings go here
					}
					else if(this.activeBrushstroke.getMouseActionType() === 'drag-path') {
						this.joyManager.updatePreviewData(this.activeBrushstroke.getPath());
					  // this.activeBrushstroke.renderPreview({}); //current canvas settings go here
					}

				}
				else {
					console.log("No active brushstroke found");
				}
			}
			else {
				// // preview follows mouse pointer
				// if(this.effects.getEffectByName(this.ui.getSelectedEffect()).getValue('mouseActionType') === 'single-click') {
				//   this.sketch.loop();
				// 	this.joyManager.updatePreviewData({position: [this.sketch.mouseX, this.sketch.mouseY]});
				// 	this.joyManager.previewActionEnabled = true;
				// }
			}
		});

		document.getElementById('drawing-canvas').addEventListener('mouseup', e => {
			mouseDownOverCanvas = false;

			if(this.activeBrushstroke) {	
				this.activeBrushstroke.addPoint({x: this.sketch.mouseX, y: this.sketch.flippedMouseY()});
				if(this.activeBrushstroke.getMouseActionType() === 'drag') {
					let pathAndPoint = this.activeBrushstroke.getPathAndPoint();
					this.joyManager.addCurrentAction(pathAndPoint);
				}
				else if(this.activeBrushstroke.getMouseActionType() === 'drag-path') {
					let path = this.activeBrushstroke.getPath();
					this.joyManager.addCurrentAction(path);
				}
				this.activeBrushstroke = null;
				this.joyManager.previewActionEnabled = false;
				this.sketch.noLoop();
			}
		});

	document.getElementById('replay-button').addEventListener("click", (e) => {
		this.joyManager.runWithDelay(200);
	});

    // document.getElementById('clear-all-button').addEventListener("click", (e) => {
		// 		console.log("clear all");
		// });
		
		document.getElementById('download-button').addEventListener("click", (e) => {
			this.sketch.save('my drawing.jpg');
		});
		
		// document.getElementById('shuffle-button').addEventListener("click", (e) => {
		// 		console.log("shuffle all");
		// });

		document.getElementById('save-button').addEventListener("click", (e) => {
			this.joyManager.saveURLToClipboard();
	  });

		window.addEventListener('resize', this.adjustAlignment);
	}
}

