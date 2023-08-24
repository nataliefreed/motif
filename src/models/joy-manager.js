import Joy from '../../libraries/joy.js';

export class JoyManager {
  constructor(effects, brushstrokes, sketch) {
    let data = Joy.loadFromURL();
    this.loadEffects(effects);
		this.sketch = sketch;
    this.joy = new Joy({
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
			onupdate: function(my) {
        sketch.clear();
        my.actions.act(sketch);
        my.stencils.act(sketch);
        sketch.render();
			}
		});
  }

  loadEffects(effects) {
		console.log("effects passed to joy manager", effects);
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
				console.log("actor settings " + template);
				Joy.add(template);	
			});
    });
  }

  addEvent(tag, effectName, settings) {
		console.log("adding event to joy", tag, effectName, settings);    
    if(tag == 'motif') {
      this.joy.actions.addAction(tag+'/'+effectName, undefined, settings);
    } else if(tag == 'stencils') {
      this.joy.stencils.addAction(tag+'/'+effectName, undefined, settings);
    }
    this.joy.actions.update();
  }
}
