import Joy from '../libraries/joy/joy.js';

export class JoyManager {
  constructor(effects, brushstrokes, sketch) {
    let data = Joy.loadFromURL();
    this.loadEffects(effects);
		this.addModulesAndWidgets();
		this.sketch = sketch;
    this.joy = new Joy({
			// Where the Joy editor goes:
			container: "#joy",
		
			// The words and widgets inside the editor:
			init: "To create my design: "+
				  "{id:'actions', type:'actions', modules:['motif', 'sequences']} "+ // a list of actions
				//   "Fill with {id:'color', type:'color', placeholder:[0.3, 0.8, 1.0]}" +
				"With stencils: "+
				"{id: 'stencils', type:'actions', modules:['stencils']} "+  
				"<hr> {type:'save'}", // a save button!
			
			// Load data from URL, otherwise blank:
			data: data,
		
			// Actions to include:
			modules: ['motif', 'sequences', 'stencils'], //TODO: 'math' module removes min and max settings on Scrubber - see line 1032 and 2813
		
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

		// preview current action in menu bar
		// this.joyPreview = new Joy({
		// 	container: "#joy-preview",
		// 	init: " hello " + {id:'currentAction', type:'action', placeholder:'motif/fill'},
		// 	modules: ['motif', 'sequences', 'stencils'],
		// 	onupdate: function(my) {
		// 		//set the current values
		// 	}
		// });
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

	addModulesAndWidgets() {
		//sequences (along path and group with name)
		Joy.module("sequences", function() {
			Joy.add({
				name: "Along path",
				type: "sequences/alongpath",
				tags: ["alongpath", "action"],
				init: "Along path {id:'path', type:'path', min:1, placeholder:'20,50,200,250'} "+
						"{id:'actions', type:'actions', resetVariables:false}",
				onact: function(my){
					
					// Previewing? How much to preview?
					var param = 1;
					if(my.data._PREVIEW!==undefined) param=my.data._PREVIEW;
		
					// Loop through it... (as far as preview shows, anyway)
					var loops = Math.floor(my.data.count*param);
					for(var i=0; i<loops; i++){
						var message = my.actor.actions.act(my.target);
						if(message=="STOP") return message; // STOP
					}
				}
			});
			Joy.add({
				name: "Group",
				type: "sequences/group",
				tags: ["group", "action"],
				init: "{id:'groupname', type:'group', placeholder:'brush name'}"+
						"{id:'actions', type:'actions', resetVariables:false}",
				onact: function(my){
					
					// Previewing? How much to preview?
					var param = 1;
					if(my.data._PREVIEW!==undefined) param=my.data._PREVIEW;
		
					// Loop through it... (as far as preview shows, anyway)
					var loops = Math.floor(my.data.count*param);
					for(var i=0; i<loops; i++){
						var message = my.actor.actions.act(my.target);
						if(message=="STOP") return message; // STOP
					}
				}
			});
		});

		//new widget
		Joy.add({
			type: "group",
			tags: ["ui"],
			initWidget: function(self){

				// String *IS* DOM
				var o = self.options;
				self.groupUI = new GroupUI({
					prefix: o.prefix,
					suffix: o.suffix,
					color: o.color, 
					value: self.getData("value"),
					onchange: function(value){
						self.setData("value", value);
					}
				});
				self.dom = self.groupUI.dom;

				// When data's changed, externally
				self.onDataChange = function(){
					var value = self.getData("value");
					console.log("value: ", value);
					console.log("self ", self);
					self.pathUI.setPath(value);
				};
			},
			onget: function(my){
				return my.data.value;
			},
			placeholder: "group name"
		});

		// TODO: add a single action "preview" panel with customizeable parameters
		// TODO: make Joy widgets and actors their own classes - Q: what are the differences between widgets and actors?
		Joy.add({
			type: "previewAction",
			tags: ["ui"],
			initWidget: function(self) {

			}
		})
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


class GroupUI {
  constructor(config) {

    this.dom = document.createElement("div");
    this.dom.className = "joy-named-group";

		const arrow = document.createElement("span");
		arrow.contentEditable = false;
		arrow.innerText = "^ ";
		this.dom.appendChild(arrow);
  
    const input = document.createElement("span");
    input.contentEditable = true;
    input.spellcheck = false;
  
    this.dom.appendChild(input);
  
    input.addEventListener("input", (event) => {
      _fixStringInput(input);
      const value = input.innerText; //todo - might be issue, expecting a string
      config.onchange(value);
    });
  
    input.addEventListener("focus", () => {
      _selectAll(input);
    });
  
    input.addEventListener("blur", () => {
      _unselectAll();
    });
		_preventWeirdCopyPaste(input);
  
    input.addEventListener("keypress", (e) => {
  	if (e.which === 13) {
  	  input.blur();
  	  return false;
      }
      return true;
    });
  
   // Set name
    this.setName = function(value){
    input.innerText = value;
    _fixStringInput(input);
    };
  
    this.setColor = function (color) {
	  color = this._forceToRGB(color);
  	  this.dom.style.color = color;
  	  this.dom.style.borderColor = color;
    };
  
    if (config.color) {
      this.setColor(config.color);
    }
  
    this.styles = config.styles || [];
    this.styles.forEach((style) => {
  	this.dom.classList.add(style);
    });
  
    this.setName(config.value);
  }
}
