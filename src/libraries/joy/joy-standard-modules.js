import { Joy } from "./joy.js";
import { ChooserModal, ColorPicker } from "./components/modals.js";
import { JoyButton, ChooserButton, JoyTextBox, NumberScrubber, JoyString } from "./components/ui-widgets.js";
import { _HSVToRGBString, _clone, TAU, _removeFromArray, _numberToAlphabet, _numberToRoman } from "./joy-utils.js";

/////////////////////////////////////////
// FUNDAMENTAL USER INTERACE ACTORS /////
/////////////////////////////////////////

// TODO: Angle widget

/****************

Raw number widget: JUST the scrubber, no chooser

Widget Options:
{id:'steps', type:'number', placeholder:10, min:0, max:180, step:1}

****************/
Joy.add({
  type: "number",
  tags: ["ui"],
  initWidget: function(){

    // Scrubber IS the DOM
    let o = this.options;
    let scrubber = new NumberScrubber({
      min: o.min,
      max: o.max,
      step: o.step,
      value: this.getData("value"),
      onstart: () => {
        this.top.activePreview = this;
      },
      onstop: () => {
        this.top.activePreview = null;
      },
      onchange: (value) => {
        this.setData("value", value);
      }
    });
    this.dom = scrubber.dom;

    // PREVIEW ON HOVER. WIGGLE IT JUST ONCE.
    
    let _ticker = null;
    let _fps = 30;
    this.dom.onmouseenter = () => {

      if(!this.top.canPreview("numbers")) return;
      
      // Create Preview Data
      this.previewData = _clone(this.data);

      // Wiggle by 5%... as long as that's not less than 0.5, not more than 2.
      let _amplitude = Math.abs(this.data.value*0.05);
      //if(_amplitude<0.5) _amplitude=0.5; // TODO: WITH SIGFIG
      //if(_amplitude>3) _amplitude=3;
      if(_amplitude==0) _amplitude=1; // If it's EXACTLY zero, wiggle with 1, whatever.
      let _timer = 0;
      _ticker = setInterval(() => {

        if(!this.top.canPreview("numbers")) return _stopPreview(); // don't even

        _timer += (TAU/_fps)/0.25; // 0.25 seconds
        this.previewData.value = this.data.value + Math.sin(_timer)*_amplitude;
        this.update();

        if(_timer>TAU) _stopPreview(); // yer done, son.

      },1000/_fps);

    };
    let _stopPreview = () => {
      if(_ticker) clearInterval(_ticker);
      this.previewData = null;
      this.update();
    };
    this.dom.onmouseleave = _stopPreview;
    

  },
  onget: function(my) {
    return my.data.value;
  },
  placeholder: {
    value: 3
  }
});


/****************

A color widget! (for now, same as choose except paints DOM, too)

Widget Options:
{id:'direction', type:'choose', options:['left','right'], placeholder:'left'}

****************/

Joy.add({
  type: "color",
  tags: ["ui"],
  initWidget: function() {

    // Color Button IS the DOM
    let colorButton = new JoyButton({
      label: "&nbsp;",
      onclick: () => {

        let colorPicker = new ColorPicker({ // TODO: precision for those floats, y'know
          source: this.dom,
          value: this.getData("value"),
          onchange: (value) => {
            this.setData("value", value);
            _changeLabelColor();
          },
          onopen: () => {
            this.top.activePreview = this;
          },
          onclose: () => {
            this.top.activePreview = null;
          }
        }).show();

      },
      styles:["joy-color"]
    });
    this.dom = colorButton.dom;

    // Change button color!
    let _changeLabelColor = () => {
      let hsl = this.getData("value");
      colorButton.dom.style.background = _HSVToRGBString(hsl);
    };
    _changeLabelColor();

    // PREVIEW ON HOVER
    // BOUNCE the HSL Value up & down!
    let _ticker = null;
    let _fps = 30;
    let _initialV, _vel, _timer;
    this.dom.onmouseenter = () => {

      if(!this.top.canPreview("numbers")) return; // yeah let's pretend it's a number
      
      // Create Preview Data
      _initialV = this.data.value[2];
      this.previewData = _clone(this.data);

      // Bounce up & down for HALF a second
      _timer = 0;
      _vel = 2*(2/_fps);
      _ticker = setInterval(() =>{

        if(!this.top.canPreview("numbers")) return _stopPreview(); // don't

        // Bounce up & down
        let hsl = this.previewData.value;
        hsl[2] += _vel;
        if(hsl[2] > 1){
          hsl[2] = 1;
          _vel *= -1;
        }
        if(hsl[2] < 0){
          hsl[2] = 0;
          _vel *= -1;
        }
        this.update();

        // Done!
        _timer += 2/_fps;
        if(_timer>=1) _stopPreview();

      },1000/_fps);
    };
    let _stopPreview = () => {
      if(_ticker) clearInterval(_ticker);
      this.previewData = null;
      this.update();
    };
    this.dom.onmouseleave = _stopPreview;

  },
  onget: function(my){
    return _HSVToRGBString(my.data.value);
  },
  placeholder: function(){
    let hue = Math.floor(Math.random()*360); // Random color!
    return [hue, 0.8, 1.0];
  }
});


/****************

A choose-y thing

Widget Options:
{name:'direction', type:'choose', options:['left','right'], placeholder:'left'}
// TODO... "options" gets overrided soooo UHHHHH.

****************/
Joy.add({
  type: "choose",
  tags: ["ui"],
  initWidget: function(){

    let data = this.data;

    // Options
    let options = this.options;
    for(let i=0; i<options.length; i++){

      // convert to label/value if not already
      let o = options[i];
      if(!(o.label!==undefined && o.value!==undefined)){
        options[i] = {
          label: o.toString(),
          value: o
        };
      }

    }

    // ChooserButton *IS* DOM
    let chooserButton = new ChooserButton({
      value: data.value,
      options: options,
      onchange: (value) => {
        data.value = value;
        this.update(); // you oughta know!
      },
      styles: this.styles
    });
    this.dom = chooserButton.dom;

  },
  onget: function(my){
    return my.data.value;
  }
});


/****************

A widget to type in strings!

Widget Options:
{name:'name', type:'string', prefix:'&ldquo;', suffix:'&rdquo;', color:"whatever"}

****************/
Joy.add({
  type: "string",
  tags: ["ui"],
  initWidget: function(){

    // String *IS* DOM
    let o = this.options;
    this.stringUI = new JoyString({
      prefix: o.prefix,
      suffix: o.suffix,
      color: o.color, 
      value: this.getData("value"),
      onchange: (value) => {
        this.setData("value", value);
      }
    });
    this.dom = this.stringUI.dom;

    // When data's changed, externally
    this.onDataChange = () => {
      let value = this.getData("value");
      this.stringUI.setString(value);
    };

  },
  onget: function(my){
    return my.data.value;
  },
  placeholder: "???"
});

/****************

A widget to save data as hash!

Widget Options:
{type:'save'} // NO "id"! It just saves the top-most data.

****************/

Joy.add({
  type: "save",
  tags: ["ui"],
  initWidget: function(){

    // DOM
    this.dom = document.createElement("div");
    this.dom.className = "joy-save";
    
    // Save Button
    this.saveButton = new JoyButton({
      label: "save:",
      onclick: () => {
        
        let url = Joy.saveToURL(this.top.data);
        this.url.setValue(url);
        this.url.select();

        // info
        let chars = url.length;
        this.info.innerHTML = "P.S: you can shorten your link with <a href='http://tinyurl.com/' target='_blank'>TinyURL</a>!"

      }
    });
    this.dom.appendChild(this.saveButton.dom);

    // URL TextBox
    this.url = new JoyTextBox({
      readonly: true
    });
    this.dom.appendChild(this.url.dom);

    // Details: chars & tinyurl link
    this.info = document.createElement("div");
    this.info.id = "joy-save-info";
    this.dom.appendChild(this.info);    

  }
});
////////////////////////////////////////////////////////
// THE BIG ACTOR: A "PROGRAMMABLE" LIST OF ACTIONS <3 //
////////////////////////////////////////////////////////

/****************

A nice list of actions.

WidgetConfig:
{type:'actions', name:'actions', resetVariables:false}

****************/
// Joy.add({
//   type: "actions",
//   tags: ["ui"],
//   init: function(){

//     if(this.resetVariables!==undefined) this.data.resetVariables=this.resetVariables;

//     // TODO: ACTUALLY REFACTOR
//     // TODO: Separate out Actor code from Widget code
//     // so that this can run EVEN WITHOUT WIDGETS.
//     // Using messages, probably.

//   },
//   initWidget: function(){

//     let data = this.data;
//     let actions = data.actions;

//     // DOM
//     this.dom = document.createElement("div");
//     this.dom.className = "joy-actions";

//     // List
//     let list = document.createElement("list");
//     list.classList.add('joy-list');
//     list.id = this.id + "-joy-list";
//     this.dom.appendChild(list);

//     // Preview Variables?
//     /*let letPreview;
//     if(this.top.canPreview("variables")){
//       letPreview = document.createElement("div");
//       letPreview.id = "joy-variables-preview";
//       letPreview.innerHTML = "AHHHH";
//       dom.appendChild(letPreview);
//     }*/

//     //////////////////////////////////////////
//     // Create Bullet /////////////////////////
//     //////////////////////////////////////////

//     let bulletOptions = [
//       {label:"Add action above", value:"action_above"},
//       {label:"Add action below", value:"action_below"},
//       {label:"Delete", value:"delete"}
//     ];
//     let _onBulletChoice = (entry, choice) => {

//       // ACTION ABOVE or BELOW
//       let newActionWhere = 0;
//       if(choice=="action_above") newActionWhere=-1; // above
//       if(choice=="action_below") newActionWhere=1; // below
//       if(newActionWhere!=0){ // not NOT new action
        
//         let newEntryIndex = this.entries.indexOf(entry);
//         if(newActionWhere>0) newEntryIndex+=1;

//         // Chooser Modal!
//         let chooser = new ChooserModal({
//           position: "left",
//           source: entry.bullet.dom,
//           options: actionOptions,
//           onchange: (value) => {
//             _addAction(value, newEntryIndex);
//             this.update(); // You oughta know!
//             _updateBullets(); // update the UI, re-number it.
//           }
//         });
//       }

//       // DELETE
//       if(choice=="delete"){
//         _removeFromArray(this.entries, entry); // Delete entry from Entries[]
//         _removeFromArray(actions, entry.actionData); // Delete action from Data's Actions[]
//         this.removeChild(entry.actor); // Delete actor from Children[]
//         list.removeChild(entry.dom); // Delete entry from DOM
//         this.update(); // You oughta know!
//         _updateBullets(); // update the UI, re-number it.
//       }

//     };
//     let _createBullet = (entry) => {
    
//       let bullet = new ChooserButton({
//         position: "left",
//         staticLabel: _getBulletLabel(entry),
//         options: bulletOptions,
//         onchange: (choice) => {
//           _onBulletChoice(entry, choice);
//         },
//         styles: ["joy-bullet"]
//       });
//       bullet.dom.id = "joy-bullet"; //TODO: make this unique

//       return bullet;

//     };

//     // Get the digit (or letter, or roman) for this bullet...
//     let _getBulletLabel = (entry) => {

//       // What index am I?
//       let index = this.entries.indexOf(entry)+1;

//       // How many levels deep in "actions" am I?
//       let levelsDeep = 0;
//       let parent = this.parent;
//       while(parent){
//         if(parent.type=="actions") levelsDeep++;
//         parent = parent.parent;
//       }

//       // Digit, Letter, or Roman? (Cycle around)
//       let label;
//       switch(levelsDeep%3){
//         case 0: label=index; break; // digits
//         case 1: label=_numberToAlphabet(index); break; // letter
//         case 2: label=_numberToRoman(index); break; // roman
//       }

//       return label;

//     };

//     // Re-number ALL these bad boys
//     let _updateBullets = () => {
//       for(let i=0; i<this.entries.length; i++){
//         let entry = this.entries[i];
//         let bullet = entry.bullet;
//         let label = _getBulletLabel(entry);
//         bullet.setLabel(label);
//       }
//     };

//     ////////////////////////////////////////////////////////////////////
//     // Add Entry: Entries have a Bullet (the number) & actual widget! //
//     ////////////////////////////////////////////////////////////////////

//     this.entries = [];
    
//     let _addEntry = (actionData, atIndex) => {

//       // New entry
//       let entry = {};
//       let entryDOM = document.createElement("div");
//       entryDOM.classList.add('joy-list-item');
//       if(atIndex===undefined) atIndex = this.entries.length;

//       // If entries selected, insert after last selected entry
//       // if (this.entries.some(function(entry) { return entry.selected; })) {
//       //   // Find the index of the last selected entry
//       //   let lastSelectedIndex = this.entries.reduce(function(index, entry, currentIndex) {
//       //     return entry.selected ? currentIndex : index;
//       //   }, -1);
    
//       //   atIndex = lastSelectedIndex + 1;

//       //   console.log("selected index to add entry", atIndex);
//       // }
//       this.entries.splice(atIndex, 0, entry);
//       list.insertBefore(entryDOM, list.children[atIndex]);

//       // The Bullet is a Chooser!
//       let bullet = _createBullet(entry);
//       let bulletContainer = document.createElement("div");
//       bulletContainer.classList.add("joy-bullet-container");
//       entryDOM.appendChild(bulletContainer);
//       bulletContainer.appendChild(bullet.dom);

//       // New Actor!
//       let newActor = this.addChild({type:actionData.type}, actionData);

//       // The Widget
//       let newWidget = newActor.createWidget();
//       newWidget.classList.add("joy-widget");
//       entryDOM.appendChild(newWidget);

//       // (Remember all this)
//       entry.dom = entryDOM;
//       entry.bullet = bullet;
//       entry.actor = newActor;
//       entry.widget = newWidget;
//       entry.actionData = actionData;
//       entry.selected = false;

//       // PREVIEW ON HOVER
//       // Also tell the action "_PREVIEW": how far in the action to go?
//       let _calculatePreviewParam = (event) => {
//         let param = event.offsetY / bullet.dom.getBoundingClientRect().height;
//         if(param<0) param=0;
//         if(param>1) param=1;
//         _previewAction._PREVIEW = param;
//         this.update();
//       };
//       let _previewAction;
//       let _previewStyle;
//       bulletContainer.onmouseenter = (event) => {

//         if(!this.top.canPreview("actions")) return;

//         this.top.activePreview = this;
        
//         // Create Preview Data
//         this.previewData = _clone(this.data);
//         let actionIndex = this.entries.indexOf(entry);
//         _previewAction = this.previewData.actions[actionIndex];

//         // STOP after that action!
//         this.previewData.actions.splice(actionIndex+1, 0, {STOP:true});

//         // How far to go along action?
//         _calculatePreviewParam(event);

//         // Add in a style
//         _previewStyle = document.createElement("style");
//         document.head.appendChild(_previewStyle);
//         _previewStyle.sheet.insertRule('.joy-actions.joy-previewing > #joy-list > div:nth-child(n+'+(actionIndex+2)+') { opacity:0.1; }');
//         _previewStyle.sheet.insertRule('.joy-actions.joy-previewing > div.joy-bullet { opacity:0.1; }');
//         this.dom.classList.add("joy-previewing");

//       };
//       bulletContainer.onmousemove = (event) => {
//         if(this.previewData) _calculatePreviewParam(event);
//       };
//       bulletContainer.onmouseleave = () => {
//         if(this.previewData){
//           this.previewData = null;
//           this.top.activePreview = null;
//           this.update();
//           document.head.removeChild(_previewStyle);
//           this.dom.classList.remove("joy-previewing");
//         }
//       };

//       // select or deselect when clicked
//       // entryDOM.addEventListener('click', function() {
//       //   entry.selected = !entry.selected;
//       //   entryDOM.classList.toggle('selected');
//       // });

//       return entry;

//     };
//     // add all INITIAL actions as widgets
//     for(let i=0;i<actions.length;i++) _addEntry(actions[i]);

//     // ///////////////////////////////////////
//     // // Reorder Entries - NF added /////////
//     // ///////////////////////////////////////
//     let _moveEntry = (oldIndex, newIndex) => {
//       let item = this.entries.splice(oldIndex, 1)[0];
//       this.entries.splice(newIndex, 0, item);
//       this.update();
//       _updateBullets();
//     };
//     this.moveAction = _moveEntry;

//     ///////////////////////////////////////
//     // Add Action /////////////////////////
//     ///////////////////////////////////////

//     // Manually add New Action To Actions + Widgets + DOM
//     let _addAction = (actorType, atIndex, data={}) => { //FG added data
//       // Create that new entry & everything
//       let newAction = {type:actorType, ...data};
//       if(atIndex===undefined){
//         actions.push(newAction);
//       }else{
//         actions.splice(atIndex, 0, newAction);
//       }
//       let entry = _addEntry(newAction, atIndex);

//       // Focus on that entry's widget!
//       // entry.widget.focus();
//     };
//     this.addAction = _addAction; //available to other modules - [QUESTION] should I just have one addAction function?

//     // Actions you can add:
//     // TODO: INCLUDE ALIASED ACTIONS
//     let actionOptions = [];

//     //TODO: refactor into functions

//     if(this.onlyActions){ //get a specific list of types
//       for(let i=0;i<this.onlyActions.length;i++){
//         let actionType = this.onlyActions[i];
//         let actorTemplate = Joy.getTemplateByType(actionType);
//         let notActionTag = actorTemplate.tags.filter((tag) => {
//           return tag!="action"; // first tag that's NOT "action" (so that actions categorized in the chooser menu based on their secondary tag)
//         })[0];
//         actionOptions.push({
//           label: actorTemplate.name,
//           value: actionType,
//           category: notActionTag
//         });
//       }
//     }else{ //find anything tagged action
//       let actionActors = Joy.getTemplatesByTag("action");
//       for(let i=0;i<actionActors.length;i++){
//         let actionActor = actionActors[i];
//         let notActionTag = actionActor.tags.filter((tag) => {
//           return tag!="action";
//         })[0];
//         actionOptions.push({
//           label: actionActor.name,
//           value: actionActor.type,
//           category: notActionTag
//         });
//       }
//     }

//     // NF: Add only actions in specified modules to chooser menu
//     // TODO: merge with previous filter code
//     let modules = this.modules || [];
//     let moduleOptions = [];
//     modules.forEach((module) => {
//       let moduleActors = Joy.getTemplatesByTag(module);
//       moduleActors.forEach((moduleActor) => {
//         let notActionTag = moduleActor.tags.filter((tag) => {
//           return tag!="action";
//         })[0];
//         moduleOptions.push({
//           label: moduleActor.name,
//           value: moduleActor.type,
//           category: notActionTag
//         });
//       });
//     });

//     // "+" Button: When clicked, prompt what actions to add!
//     let addButton = new ChooserButton({
//       staticLabel: "+",
//       options: actionOptions,
//       onchange: (value) => {
//         _addAction(value);
//         this.update(); // You oughta know!
//       },
//       styles: ["joy-bullet", "joy-add-bullet"]
//     });
//     this.dom.appendChild(addButton.dom);

//   },
//   onact: function(my){

//     // Create _lets, if not already there
//     if(!my.target._variables) my.target._variables={}; 

//     // Reset all of target's variables?
//     if(my.data.resetVariables) my.target._variables = {};

//     // Do those actions, baby!!!
//     for(let i=0; i<my.data.actions.length; i++){

//       // Stop?
//       let actionData = my.data.actions[i];
//       if(actionData.STOP) return "STOP";

//       // Run 
//       let actor = my.actor.entries[i].actor; // TODO: THIS IS A HACK AND SHOULD NOT RELY ON THAT
//       let actorMessage = actor.act(my.target, actionData); // use ol' actor, but GIVEN data.
//       if(actorMessage=="STOP") return actorMessage;

//     }

//   },
//   placeholder: {
//     actions: [],
//     resetVariables: true
//   }
// });

/////////////////////////////////////////
// LOGIC ACTORS /////////////////////////
/////////////////////////////////////////

Joy.module("instructions", function(){

  Joy.add({
    name: "Repeat the following...",
    type: "instructions/repeat",
    tags: ["instructions", "action"],
    init: "Repeat the following {id:'count', type:'number', min:1, placeholder:3} times: "+
        "{id:'actions', type:'actions', resetVariables:false}",
    onact: function(my){
      
      // Previewing? How much to preview?
      let param = 1;
      if(my.data._PREVIEW!==undefined) param=my.data._PREVIEW;

      // Loop through it... (as far as preview shows, anyway)
      let loops = Math.floor(my.data.count*param);
      for(let i=0; i<loops; i++){
        let message = my.actor.actions.act(my.target);
        if(message=="STOP") return message; // STOP
      }

    }
  });

  /*Joy.add({
    name: "If... then...",
    type: "instructions/if",
    tags: ["instructions", "action"],
    init: "If AHHH, then: "+
        "{id:'actions', type:'actions', resetVariables:false}",
    onact: function(my){
      let message = my.actor.actions.act(my.target);
      if(message=="STOP") return message; // STOP
    }
  });*/

  Joy.add({
    name: "// Write a note",
    type: "instructions/comment",
    tags: ["instructions", "action"],
    initWidget: function(){

      // DOM
      this.dom = document.createElement("div");

      // Comment Box
      this.box = new JoyTextBox({
        multiline: true,
        placeholder: "// your notes here",
        value: this.getData("value"),
        onchange: (value) => {
          this.setData("value", value);
        },
        styles: ["box"]
      });
      this.dom.appendChild(this.box.dom);

    }
  });

});
// VARIABLE NAME: you're just a synchronized string, yo.
Joy.add({
  type: "variableName",
  tags: ["ui"],
  init: function(){

    let variableType = this.variableType;

    // Unique Variable Name
    let _uniqueVariableName = () => {
      let varnames = Joy.getReferencesByTag(this, variableType).map((ref) => {
        return ref.data.value;
      });
      let highestCount=0;
      varnames.forEach((varname) => {
        let num;
        if(varname=="thing") num=1; // at least 1
        let match = varname.match(/thing\s(\d+)/);
        if(match) num = parseInt(match[1]); // or more
        if(highestCount<num) highestCount=num;
      });
      if(highestCount==0) return "thing";
      else return "thing "+(highestCount+1);
    };

    // Create Reference method
    this._createNewReference = () => {
      let refData = {
        value: _uniqueVariableName(),
        color: _randomHSV()
      };
      let ref = Joy.createReference(this, variableType, refData);
      this.setData("refID", ref.id, true); // Remember Ref ID. And DON'T update.
      Joy.connectReference(this, ref.id); // connect new ref
    };

    // Do I already have a reference? Create one if no.
    let refID = this.getData("refID");
    if(refID){
      Joy.connectReference(this, refID); // connect this ref
    }else{

      // Well, first try seeing if there are any lets.
      // If so, connect to most recently created one
      let letReferences = Joy.getReferencesByTag(this, variableType);
      // CONFIG: this.startWithExisting!
      if(this.startWithExisting && letReferences.length>0){
        let latestReference = letReferences[letReferences.length-1];
        refID = latestReference.id;
        this.setData("refID", refID, true); // set data
        Joy.connectReference(this, refID); // connect this ref
      }else{
        // Otherwise, make a new one!
        this._createNewReference();
      }
      
    }

    // Switch reference 
    this._switchReference = (newRefID) => {
      let refID = this.getData("refID");
      Joy.disconnectReference(this, refID); // disconnect old ref
      this.setData("refID", newRefID); // DO update this!
      Joy.connectReference(this, newRefID); // connect new ref
    };

  },
  initWidget: function(){

    this.dom = document.createElement("span");
    
    // The String edits my REFERENCE'S data.
    let refID = this.getData("refID");
    let refData = Joy.getReferenceById(this, refID).data;
    let stringActor = this.addChild({
      type: "string",
      prefix:"[", suffix:"]",
      color: refData.color
    }, refData);
    let stringWidget = stringActor.createWidget();
    this.dom.appendChild(stringWidget);

    // This String Actor also updates its color
    let _old_stringActor_onDataChange = stringActor.onDataChange;
    stringActor.onDataChange = () => {
      _old_stringActor_onDataChange();
      let color = stringActor.getData("color");
      stringActor.stringUI.setColor(color);
    };

    // Chooser? Can choose to switch to other variables (or make new one)
    let variableType = this.variableType;
    let _showChooser = () => {

      let options = [];

      // Get all references that are of this type
      let refs = Joy.getReferencesByTag(this, variableType);
      let myRefID = this.getData("refID");
      refs.forEach((ref) => {
        if(ref.id==myRefID) return; // don't show SELF
        let color = ref.data.color;
        color = _HSVToRGBString(color[0], color[1], color[2]);
        options.push({
          label: "["+ref.data.value+"]",
          value: ref.id,
          color: color
        });
      });

      // Meta Options:
      options.push({
        category: "meta",
        label: "(+new)",
        value: "NEW"
      });
      options.push({
        category: "meta",
        label: "(change color)",
        value: "CHANGE_COLOR"
      });

      // Show all possible variables!
      Joy.modal.Chooser({
        source: this.dom,
        options: options,
        onchange: (newRefID) => {

          if(newRefID=="CHANGE_COLOR"){

            // Just change color, ha.
            Joy.modal.Color({
              source: this.dom,
              value: stringActor.getData("color"),
              onchange: (newColor) => {
                stringActor.setData("color", newColor);
                stringActor.stringUI.setColor(newColor); // do this again coz edit lock
              }
            });

          }else{

            // Make a new reference? Either way, set refID
            if(newRefID=="NEW"){
              let oldRefID = this.getData("refID");
              Joy.disconnectReference(this, oldRefID); // disconnect old ref
              this._createNewReference();
              this.update(); // update, yo
            }else{
              this._switchReference(newRefID);
            }

            // Make String Widget edit that instead
            let refID = this.getData("refID");
            let ref = Joy.getReferenceById(this, refID);
            stringActor.switchData(ref.data);

          }

        }
      });

    };

    // Show ON CLICK!
    if(!this.noChooser){
      this.dom.onclick = _showChooser;
    }
    
  },
  onget: function(my){
    let refID = my.data.refID;
    let ref = Joy.getReferenceById(my.actor, refID);
    return ref.data.value; // returns the variable name
  },
  onkill: function(){
    
    // Disconnect any references I may have
    let refID = this.getData("refID");
    Joy.disconnectReference(this, refID); // disconnect old ref

  }
});/////////////////////////////////////////
// MATH ACTORS //////////////////////////
/////////////////////////////////////////

Joy.module("math", function(){

  /*********************

  Alright. This is gonna be a big one.
  It needs to be able to chain math elements,
  and each element needs to be able to switch between
  scrubbers, variables, and other number-getter actors.

  Data:
  {
    type: "number",
    chain:[
      {type:"number_raw", value:3},
      {type:"choose", value:"*"},
      {type:"variableName", refID:whatever},
      {type:"choose", value:"+"},
      {type:"turtle/getAngle"}
    ]
  }

  *********************/
  Joy.modify("number", "number_raw", function(_old){
    return {
      init: function(){

        // no variables?
        if(this.noVariables) return;

        // Force data to a chain...
        let originalValue = this.getData("value");
        if(typeof originalValue==="number"){
          this.setData("value",undefined,true); // delete "value", no update
          this.setData("chain",[
            {type:"number_raw", value:originalValue}
          ],true); // create "chain", no update
        }

        // MAKE A NEW CHAIN ACTOR *AND DATA(?)*
        this._makeNewChainActor = (chainItem, atIndex) => {

          // Make it
          let chainActor;
          let type = chainItem.type;
          let options = {};
          let isFirst = (atIndex === undefined) ? (this.chainActors.length == 0) : (atIndex == 0); 
          if (isFirst && this.options !== undefined) {
            options.min = this.options.min;
            options.max = this.options.max;
          }
          switch(type){

            // Elements
            case "number_raw":
              chainActor = this.addChild({type:type, ...options}, chainItem);
              break;
            case "variableName":
              chainActor = this.addChild({
                type: type,
                variableType: 'number',
                noChooser: true
              }, chainItem);
              break;

            // Operand
            case "choose":
              chainActor = this.addChild({
                type:type, 
                options:[
                  { label:"+", value:"+" },
                  { label:"-", value:"-" }, 
                  { label:"&times;", value:"*" },
                  { label:"&divide;", value:"/" }
                ],
                styles: ["joy-math"]
              }, chainItem);
              break;

          }

          // Add or splice to Chain Actors array! *AND THE DATA*
          let chain = this.getData("chain");
          if(atIndex!==undefined){
            this.chainActors.splice(atIndex, 0, chainActor);
            chain.splice(atIndex, 0, chainItem);
          }else{
            this.chainActors.push(chainActor);
            chain.push(chainItem);
          }

          // Return
          return chainActor;

        }

        // Create an actor for each element in the chain
        this.chainActors = []; // keep a chain parallel to children. this one's in ORDER.
        let realChain = this.getData("chain");
        let chain = _clone(realChain);
        realChain.splice(0, realChain.length); // empty out realChain
        for(let i=0; i<chain.length; i++){
          this._makeNewChainActor(chain[i]);
        }

        // REPLACE A CHAIN ACTOR *AND DATA*
        this._replaceChainActor = (oldChainActor, newItem) => {

          // Delete old actor, and add new actor where it was
          let oldIndex = this._deleteChainActor(oldChainActor);
          let newChainActor = this._makeNewChainActor(newItem, oldIndex);

          // update manually!
          this.update();

          // Return
          return newChainActor;

        };

        // DELETE A CHAIN ACTOR *AND DATA*
        this._deleteChainActor = (chainActor) => {

          // Delete actor
          let oldIndex = this.chainActors.indexOf(chainActor);
          _removeFromArray(this.chainActors, chainActor);
          this.removeChild(chainActor);

          // and data!
          let chain = this.getData("chain");
          chain.splice(oldIndex, 1);

           // so can re-use index
          return oldIndex;

        };

      },
      initWidget: function(){

        // no variables?
        if(this.noVariables){
          _old.initWidget(this);
          return;
        }

        // Container!
        this.dom = document.createElement("span");
        this.dom.className = "joy-number";

        // Show Chooser!
        let _showChooser = (chainActor) => {

          let options = [];

          // Show placeholder number (unless i'm a number_raw, or there isn't one)
          if(chainActor.type!="number_raw"){
            let placeholderNumber = this.placeholder.value;
            if(typeof placeholderNumber==="number"){
              options.push({
                label: placeholderNumber,
                value: {
                  type: "number_raw",
                  value: placeholderNumber
                }
              });
            }
          }

          // Show possible variables (except the current variable)
          let refs = Joy.getReferencesByTag(this, "number");
          let myRefID;
          if(chainActor.type=="variableName") myRefID=chainActor.getData("refID");
          refs.forEach((ref) => {
            if(ref.id==myRefID) return; // don't show SELF
            let color = ref.data.color;
            color = _HSVToRGBString(color[0], color[1], color[2]);
            options.push({
              label: "["+ref.data.value+"]",
              value: {
                type: "variableName",
                refID: ref.id
              },
              color: color
            });
          });

          // Show all these dang options!
          if(options.length>0){
            Joy.modal.Chooser({
              source: chainActor.dom,
              options: options,
              onchange: (newItem) => {
                // REPLACE CHAIN ACTOR & ENTRY
                let newChainActor = this._replaceChainActor(chainActor, newItem);
                this._replaceChainEntry(chainActor, newChainActor);
              }
            });
          }

        };

        // THE WAY TO ORGANIZE THIS: ENTRIES that have DOM *and* ACTOR
        this._chainEntries = [];

        // MAKE CHAIN ENTRY
        this._makeChainEntry = (chainActor, atIndex) => {

          // Widget
          let widget = document.createElement("span");
          chainActor.createWidget();
          widget.appendChild(chainActor.dom);

          // Widget chooser, if NOT an operand
          if(chainActor.type!="choose"){
            let entry;
            let moreButton = new JoyButton({
              onclick: () => {
                _showChainOptions(entry);
              },
              styles: ["joy-more"]
            });
            widget.appendChild(moreButton.dom);
          }

          // Place in widget
          if(atIndex!==undefined){
            if(atIndex < this.dom.childNodes.length){
              // replacing NOT at last child...
              let beforeThisWidget = this.dom.childNodes[atIndex];
              this.dom.insertBefore(widget, beforeThisWidget);
            }else{
              // Otherwise just append
              this.dom.appendChild(widget);
            }
          }else{
            this.dom.appendChild(widget);
          }

          // If it's NOT an operand, clicking it reveals options
          if(chainActor.type!="choose"){
            ((ca) => {
              // HACK: click, NOT scrub. detect w/ time frame
              let _mouseDownTime;
              ca.dom.addEventListener("mousedown", function(){
                _mouseDownTime = +(new Date());
              });
              ca.dom.addEventListener("mouseup", function(){
                let _time = +(new Date());
                if(_time-_mouseDownTime < 500){
                  _showChooser(ca); // if clicked in less than a half second
                }
              });
            })(chainActor);
          }

          // Entry
          entry = {
            widget: widget,
            actor: chainActor
          };
          if(atIndex!==undefined){
            this._chainEntries.splice(atIndex, 0, entry);
          }else{
            this._chainEntries.push(entry);
          }

        };

        // DELETE CHAIN ENTRY
        this._deleteChainEntry = (chainActor) => {

          // Get index (so can return later)
          let entry = this._chainEntries.find((entry) => {
            return entry.actor == chainActor;
          });
          let index = this._chainEntries.indexOf(entry);

          // Delete widget & entry (actor's already been deleted)
          let widget = entry.widget;
          this.dom.removeChild(widget);
          _removeFromArray(this._chainEntries, entry);

          // Index?
          return index;

        };

        // REPLACE CHAIN ENTRY
        this._replaceChainEntry = (oldChainActor, newChainActor) => {
          let oldIndex = this._deleteChainEntry(oldChainActor);          
          this._makeChainEntry(newChainActor, oldIndex);
        };

        // SHOW CHAIN OPTIONS
        let _showChainOptions = (entry) => {

          // Possible operands
          let currentLabel = entry.widget.innerText;
          let options = [
            {label:currentLabel+" + 2", value:"+"},
            {label:currentLabel+" - 2", value:"-"},
            {label:currentLabel+" &times; 2", value:"*"},
            {label:currentLabel+" &divide; 2", value:"/"}
          ];

          // To delete... which operand?
          let elementIndex = this._chainEntries.indexOf(entry);
          if(this._chainEntries.length>1){ // can't delete if just one
            
            // The operand...
            let operandIndex;
            if(elementIndex==0) operandIndex=elementIndex+1; // first
            else operandIndex=elementIndex-1; // not

            // Label
            let label;
            let operandLabel = this._chainEntries[operandIndex].widget.innerText;
            if(elementIndex==0) label = currentLabel+" "+operandLabel; // first
            else label = operandLabel+" "+currentLabel; // not

            // Indices to delete
            let indicesToDelete = [elementIndex, operandIndex].sort(); // increasing order

            // Push option!
            options.push({
              category: "meta",
              label: '(delete “'+label+'”)',
              value: indicesToDelete
            });

          }

          // Choose options!
          Joy.modal.Chooser({
            source: entry.widget,
            options: options,
            onchange: (operand) => {

              // It's an operand...
              if(typeof operand==="string"){

                // Get index of the actor...
                let index = this._chainEntries.indexOf(entry);

                // Make the OPERAND actor(+data) & entry
                index++;
                let operandActor = this._makeNewChainActor({type:"choose", value:operand}, index);
                this._makeChainEntry(operandActor, index);

                // Make the NUMBER actor(+data) & entry (just the number 2, why hot)
                index++;
                let numberActor = this._makeNewChainActor({type:"number_raw", value:2}, index);
                this._makeChainEntry(numberActor, index);

              }else{

                // Otherwise, DELETE ACTOR & ENTRY!
                let indices = operand;
                for(let i=indices.length-1; i>=0; i--){ // flip around coz DELETING
                  let indexToDelete = indices[i];
                  let actorToDelete = this._chainEntries[indexToDelete].actor;
                  this._deleteChainActor(actorToDelete);
                  this._deleteChainEntry(actorToDelete);
                }

              }

              // Update!
              this.update();

            }
          });

        };

        // For each chain actor, put in that entry
        for(let i=0; i<this.chainActors.length; i++){
          let chainActor = this.chainActors[i];
          this._makeChainEntry(chainActor);
        }

      },
      onget: function(my){

        // no variables?
        if(my.actor.noVariables){
          return _old.onget(my);
        }

        ////////////////

        let nums_and_ops = []; // just gets chain of nums & ops

        // EVALUATE EACH ELEMENT FIRST
        for(let i=0; i<my.data.chain.length; i+=2){

          // Synched indices!
          let chainActor = my.actor.chainActors[i]; 

          // Evaluate element
          let num;
          switch(chainActor.type){
            case "number_raw":
              num = chainActor.get(my.target);
              break;
            case "variableName":
              let _variables = my.target._variables;
              let varname = chainActor.get(my.target); // it's just a synchronized string
              num = _variables[varname];
              break; 
          }

          // Any operator before it?
          if(i>0){
            let operandActor = my.actor.chainActors[i-1];
            let op = operandActor.get();
            nums_and_ops.push(op);
          }

          // Push num
          nums_and_ops.push(num);

        }

        // MULTIPLICATION AND DIVISION FIRST. LEFT-ASSOCIATIVE
        for(let i=1; i<nums_and_ops.length; i+=2){

          let op = nums_and_ops[i];
          if(op=="*" || op=="/"){

            // Do math to the two numbers
            let num1 = nums_and_ops[i-1];
            let num2 = nums_and_ops[i+1];
            let res;
            if(op=="*") res = num1*num2;
            else res = num1/num2;

            // Modify array, and set index back
            // remove 3 items: num1, op, num2
            // replace with 1 item: result
            nums_and_ops.splice(i-1, 3, res);
            i-=2;

          }else{
            continue;
          }

        }

        // NOW DO ADDITION AND SUBTRACTION
        for(let i=1; i<nums_and_ops.length; i+=2){

          let op = nums_and_ops[i];
          if(op=="+" || op=="-"){

            // Do math to the two numbers
            let num1 = nums_and_ops[i-1];
            let num2 = nums_and_ops[i+1];
            let res;
            if(op=="+") res = num1+num2;
            else res = num1-num2;

            // Modify array, and set index back
            // remove 3 items: num1, op, num2
            // replace with 1 item: result
            nums_and_ops.splice(i-1, 3, res);
            i-=2;

          }else{
            continue;
          }

        }

        return nums_and_ops[0];

      }
    };
  });

  /****************

  Set a variable to some number.

  ****************/
  Joy.add({
    name: "Set [number]",
    type: "math/set",
    tags: ["math", "action"],
    init: "Set {id:'varname', type:'variableName', variableType:'number'} to {id:'value', type:'number'}",
    onact: function(my){
      let _variables = my.target._variables;
      let varname = my.data.varname; // it's just a synchronized string
      _variables[varname] = my.data.value; // Set the variable
    }
  });

  /****************

  Do math on some variable

  ****************/
  Joy.add({
  
    name: "Do math to [number]",
    type: "math/operation",
    tags: ["math", "action"],

    init: JSON.stringify({
      id:'operation', type:'choose',
      placeholder: "+",
      options:[
        { label:"+ Increase", value:"+" },
        { label:"- Decrease", value:"-" },
        { label:"&times; Multiply", value:"*" },
        { label:"&divide; Divide", value:"/" }
      ]
    })+" {id:'varname', type:'variableName', variableType:'number', startWithExisting:true}"
    +" by {id:'value', type:'number'}",

    onact: function(my){

      let lets = my.target._variables;
      let varname = my.data.varname;
      if(lets[varname]===undefined) lets[varname]=0; // Set to 0, if nothing's there.

      switch(my.data.operation){
        case "+": lets[varname] += my.data.value; break;
        case "-": lets[varname] -= my.data.value; break;
        case "*": lets[varname] *= my.data.value; break;
        case "/": lets[varname] /= my.data.value; break;
      }

    }

  });

  /****************

  If then... for math

  ****************/
  Joy.add({
    name: "If [math] then...",
    type: "math/if",
    tags: ["math", "action"],
    init: "If {id:'value1', type:'number'} "+
        "{id:'test', type:'choose', options:['<','≤','=','≥','>'], placeholder:'='} "+
        "{id:'value2', type:'number'}, then: "+
        "{id:'actions', type:'actions', resetVariables:false}",
    onact: function(my){

      let value1 = my.data.value1;
      let value2 = my.data.value2;

      let result;
      switch(my.data.test){
        case '<': 
          result = value1<value2;
          break;
        case '≤': 
          result = value1<=value2;
          break;
        case '=': 
          result = value1==value2;
          break;
        case '≥': 
          result = value1>=value2;
          break;
        case '>':
          result = value1>value2;
          break;
      }

      if(result){
        let message = my.actor.actions.act(my.target);
        if(message=="STOP") return message; // STOP
      }

    }
  });

});
Joy.module("random", function(){

  Joy.add({
    name: "With a X% chance...",
    type: "random/if",
    tags: ["random", "action"],
    init: "With a {id:'chance', type:'number', min:0, max:100, placeholder:50}% chance, do:"+
        "{id:'actions', type:'actions', resetVariables:false}",
    onact: function(my){
      
      let probability = my.data.chance/100;
      if(Math.random() < probability){
        let message = my.actor.actions.act(my.target);
        if(message=="STOP") return message; // STOP
      }

    }
  });

  /****************

  Set a variable to some number.

  ****************/
  Joy.add({
    name: "Set random [number]",
    type: "random/set",
    tags: ["random", "action"],
    init: "Set {id:'varname', type:'variableName', variableType:'number'} to a random "+
        "{id:'numtype', type:'choose', options:['number','integer'], placeholder:'number'} between "+
        "{id:'min', type:'number', placeholder:1} and {id:'max', type:'number', placeholder:100}",
    onact: function(my){

      let _variables = my.target._variables;
      let varname = my.data.varname; // it's just a synchronized string

      let _min = my.data.min;
      let _max = my.data.max;
      let min = Math.min(_min,_max); // just in case
      let max = Math.max(_min,_max); // just in case

      let randomValue;
      if(my.data.numtype=="integer"){
        randomValue = min + Math.floor( Math.random()*((max-min)+1) );
      }else{
        randomValue = min + (Math.random()*(max-min));
      }
      _variables[varname] = randomValue; // Set the variable

    }
  });
});