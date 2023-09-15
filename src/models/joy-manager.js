import { Joy } from '../libraries/joy/joy.js';
import '../libraries/joy/joy-standard-modules.js'; //add the modules, ie. import for side effects
import '../libraries/joy/joy-custom-modules.js';
import { _configure } from '../libraries/joy/joy-utils.js'

export class JoyManager {
  constructor(effects, brushstrokes, sketch, eventBus) {
		this.eventBus = eventBus;

    let data = Joy.loadFromURL();

		console.log("this is the url loaded", data);

    this.loadEffects(effects);
		this.sketch = sketch;
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
			onupdate: function(my) {
        sketch.clear();
        my.paintingActionList.act(sketch);
        my.stencilActionList.act(sketch);
				// draw the preview canvas
        sketch.render();
			}
		});

		// preview current action in menu bar
		this.joyPreview = new Joy({
			container: "#joy-preview",
			id:'joy-preview',
			init: "{id:'action', type:'singleAction'}",
			modules: ['motif', 'sequences', 'stencils'],
			onupdate: function(my) {
				console.log("preview updated");
				//set the current values
			}
		});
		this.previewActionList = this.joyPreview.rootActor.action;

		// this.addEvent('action-preview', fillAction.type, fillAction);

		this.eventBus.addEventListener('effectSelected', (e) => {
			this.effectType = e.detail.effectType;
			this._updatePreview(this.effectType);

			// this._addEvent('action-preview', this.effectType); //add current one to preview panel
		});
  }

  loadEffects(effects) {
		console.log("effects passed to joy", effects);
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

	_updatePreview(type, data) {
		this.previewActionList.setAction(type, data);
	}

	addCurrentAction(data) {
		let actionData = this.previewActionList.getActionData();
		let type = this.previewActionList.getActionType();
		console.log("preview data", actionData);
		console.log('data from user', data);
		let combinedData = {...actionData, ...data};
		this._addEvent('motif', type, combinedData);
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
}