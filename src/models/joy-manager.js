import { Joy } from '../libraries/joy/joy.js';
import '../libraries/joy/joy-standard-modules.js'; //add the modules, ie. import for side effects
import '../libraries/joy/joy-custom-modules.js';
import { _configure } from '../libraries/joy/joy-utils.js'

export class JoyManager {
  constructor(effects, brushstrokes, sketch, eventBus) {
		this.eventBus = eventBus;

		this.currentColorHSV = [Math.random()*360, 0.8, 0.8];

    let data = Joy.loadFromURL();

    this.loadEffects(effects);
		this.sketch = sketch;
		this.previewCanvas = sketch.getPreviewCanvas();
    this.staticCanvas = sketch.getStaticCanvas();

		this.previewActionEnabled = false; //run the preview action?

		/**************************************/
	  /******* Main Joy List of Actions *****/
	  /**************************************/

    this.joy = new Joy({
			// Where the Joy editor goes:
			container: "#joy",
		
			// The words and widgets inside the editor:
			init: "To create my design: "+
				  "{id:'paintingActionList', type:'actions', modules:['motif', 'sequences']} "+ // a list of actions
				//   "Fill with {id:'color', type:'color', placeholder:[0.3, 0.8, 1.0]}" +
				"With stencils: "+
				"{id: 'stencilActionList', type:'actions', modules:['stencils']} "+  
				"<hr> {type:'save'}", // a save button!
			
			// Load data from URL, otherwise blank:
			data: data,
		
			// Actions to include:
			modules: ['motif', 'sequences', 'stencils', 'instructions'], //TODO: 'math' module removes min and max settings on Scrubber - see line 1032 and 2813
		
			previewActions: true,
			previewNumbers: true,
		
			// What to do when the user makes a change:
			onupdate: (my) => {
        sketch.clear();
				// TODO!: Change this to use the static canvas 
        my.paintingActionList.act(this.staticCanvas);
        my.stencilActionList.act(this.staticCanvas);
				// draw the preview canvas
        sketch.render();
			}
		});

	/**************************************/
	/*** Next & Current Action Preview ****/
	/**************************************/

		let previewCanvas = this.previewCanvas;
		// preview current action in menu bar
		this.joyPreview = new Joy({
			container: "#joy-preview",
			init: "{id:'action', type:'singleAction'}",
			modules: ['motif', 'sequences', 'stencils'],
			onupdate: (my) => {
				if(this.previewActionEnabled) {
				 my.action.act(previewCanvas);
				}
			}
		});
		this.previewActionList = this.joyPreview.rootActor.action;

		// this.addEvent('action-preview', fillAction.type, fillAction);

		this.eventBus.addEventListener('effectSelected', (e) => {
			this.effectType = e.detail.effectType;
			if(this.effectType != this.previousEffectType) {
				this._updatePreview();
				this.previousEffectType = this.effectType;
				this.previewActionEnabled = false;
			}
		});
  }

	// update preview value
	_updatePreview(saveCurrentSettings=false) 
	{
		let data = {};
		data.color = { type: 'color', value: this.currentColorHSV }; // add latest color
		data.color1 = { type: 'color', value: this.currentColorHSV }; // add latest color
		if(saveCurrentSettings) {
			data = {...this.previewActionList.getActionData(), ...data};
		}
		this.previewActionList.setAction(this.effectType, data);
	}

	updatePreviewData(newData) {
		this.previewActionList.setChildData(newData);
	}

	addCurrentAction(data) {
		let actionData = this.previewActionList.getActionData();
		let type = this.previewActionList.getActionType();
		let combinedData = {...actionData, ...data};
		this.previewActionEnabled = false;

		const category = type.split('/')[0];
		if(category === 'stencils') {
			this._addEvent('stencils', type, combinedData);
		}
		else {
			this._addEvent('motif', type, combinedData);
		}

		this.currentColorHSV = [Math.random()*360, 0.8, 0.8]; //re-randomize color
		this._updatePreview(true);
		// this.previewActionList.getAction();
		// console.log("preview actor", this.previewActionList.actor, "widget", this.previewActionList.widget, "data", this.previewActionList.getAction());
		// if(this.effectType) {
		// 	this._addEvent(listName, this.effectType, data);
		// }
	}

	_getParentList(listName) {
		if (listName == 'motif') {
			return this.joy.rootActor.paintingActionList;
		}
		else if (listName == 'stencils') {
			return this.joy.rootActor.stencilActionList;
		}
		else {
			throw new Error("No list found with name " + listName);
		}
	}

	_addEvent(listName, type, data) {
		const target = this._getParentList(listName);
		target.addAction(type, undefined, data);
		target.update();
	}

	moveAction(listName, oldIndex, newIndex) {
		const target = this._getParentList(listName);
		target.moveAction(oldIndex, newIndex);
		target.update();
	}

	loadEffects(effects) {
		Joy.module("motif", function() {
			//Add from effects list, but filter out stencils
			let motifEffects = Object.values(effects).filter((e) => {
				return e.category != "Stencils";
			});
			motifEffects.forEach(effect => {
				let template = {
					name: effect.dropdownName,
					type: "motif/" + effect.name,
					tags: ["motif", "action"],
					init: effect.init,
					onact: effect.onact
					// onact: (my) => { 
					// 	//find brushstroke by id, generate and call its onact function
					// 	let brushAction = my.target.getOnActByID(my.data.id);
					// 	//TODO: if undefined, make a new brushstroke!
					// 	brushAction(my.data);
					// }
				};
				Joy.add(template);
			});
		});

		//Add stencils to their own list
		Joy.module("stencils", function() {
			//Add from effects list
			let stencilEffects = Object.values(effects).filter((e) => {
				return e.category == "Stencils";
			});
			stencilEffects.forEach(effect => {
				let template = {
					name: effect.dropdownName,
					type: "stencils/" + effect.name,
					tags: ["stencils", "action"],
					init: effect.init,
					onact: effect.onact
				};
				Joy.add(template);	
			});
    });
	}
}