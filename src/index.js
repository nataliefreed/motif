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

window.addEventListener('load', e => {
	const app = new MotifApp(effectList);
});

class MotifApp {
	constructor(effectConfig) {
		this.effects = new EffectManager(effectConfig);
		this.eventBus = new EventTarget();
		this.ui = new UIManager(this.effects.getEffects(), this.eventBus);
		this.activeBrushstroke = null;

		this.sketch = new P5Renderer(540, 540); //TODO: make size responsive
		const joyManager = new JoyManager(this.effects, this.sketch, this.eventBus);
		this.actionList = joyManager.getMainList();
		this.stagedAction = joyManager.getStagedAction(); // single staged or "preview" action in Joy

		// this.undoQueue = new UndoQueue();

		this._attachCanvasEventListeners();
		this._attachKeyboardEventListeners();
		this._attachToolbarEventListeners();
		this._attachWindowEventListeners();
		this._attachButtonEventListeners();
		this._attachActionListEventListeners();
	}

	_attachCanvasEventListeners() {
		let canvas = document.getElementById('drawing-canvas');

		let dragging = false;
		let mouseDownOverCanvas = false;

		//mousemove (hover) -> update preview action with mouse coords, show hover preview if there is one for current effect
		//mousedown -> activate staged action (now current action), render it in preview mode. save previous staged action.
		//mousemove (drag) -> add points to current path, update other staged action data (color, size, etc.)
		//mouseup -> add final point to path, add current action to action list, add back saved staged action

		canvas.addEventListener('mousedown', e => {
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

		canvas.addEventListener('mousemove', e => {
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

		canvas.addEventListener('mouseup', e => {
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

		// capture mouse up even if off canvas
		document.addEventListener('mouseup', globalMouseUp);

    globalMouseUp = (e) => {
      mouseDownOverCanvas = false;
      // Once the mouse is released, remove global listener
      document.removeEventListener('mouseup', globalMouseUp);
    };
	}

	_attachKeyboardEventListeners() {
		
		// prevent defaults for space, arrows etc.
		// also make sure this doesn't fire when typing in text input

		// keydown -> switch statement for undo/redo, etc.
		// if it's just a letter -> get the effect with that letter as a shortcut
		// effects.getEffectByShortcut(e.key);
		// if there is one, set it as the active effect
		// (maybe) toolbar.setActiveEffectButton(effect.id); // make sure this switches to the right category tab too
		// randomize the effect's specific settings, including path and position
		// update the staged action with the new settings and activate it as current action, render preview

		// if you keep it held down maybe it can re-randomize and re-render new preview after a certain time has elapsed (e.repeat == true?)
		// or if you haven't lifted the key up yet
		// or maybe it just shifts the params around a bit so you can see what it added

		// keyup -> add current action to action list

		/* other key presses:
			undo,
			copy link to clipboard,
			delete,
			return to open parameters,
			spacebar to play/pause,
			esc to leave / close modals,
			r for random effect,
			...

		*/

		// document.addEventListener('keydown', e => {
		// 	if(e.key === 'z' && e.ctrlKey) {
		// 		this.undoQueue.undo();
		// 	}
		// 	else if(e.key === 'y' && e.ctrlKey) {
		// 		this.undoQueue.redo();
		// 	}
		// });

	}

	_attachToolbarEventListeners() {
		// click button to choose new effect
		// click tab to choose new category, which triggers selection of first effect in that category
		// save effect to my tools
		// open a specific effect
	}

	_attachWindowEventListeners() {
		window.addEventListener('resize', this.adjustAlignment);
	}

	_attachButtonEventListeners() {
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
	}

	_attachActionListEventListeners() {
		_setupDraggables();

	}

	_setupDraggables() {
    // Sortable.mount(new MultiDrag()); <--add this back in after sorting out what behavior should be for multi-select

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
				// this.joyManager.deleteAction(draggedItem.parentNode.id, Array.from(draggedItem.parentNode.children).indexOf(draggedItem));
			}
	  });
	}	
}

