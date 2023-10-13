import { Joy } from "./joy.js";
import { BaseModal, ModalBackdrop, ChooserModal } from "./components/modals.js";
import { JoyWidget, JoyButton, JoyString, ChooserButton } from './components/ui-widgets.js';
import { _clone, _HSVtoRGB, _HSVToRGBString, _numberToAlphabet, _numberToRoman, _removeFromArray } from "./joy-utils.js";
import { _hexToRGB, RGBtoString } from "../../utils/color-utils.js";
import tinycolor from "tinycolor2";

/****************

A widget for paths!

Widget Options:
{name:'name', type:'path', color:"whatever"}

****************/
Joy.add({
  type: "path",
  tags: ["ui"],
  initWidget: function() { 
    this.pathWidget = new PathWidget({
      value: this.getData("value"),
      onchange: (value) => {
        this.setData("value", value);
      },
      originWidth: 540,
      originHeight: 540
    });
    this.dom = this.pathWidget.dom;

    // When data's changed, externally
    this.onDataChange = () => {
      var value = this.getData("value"); // value is a list of points
      this.pathWidget.setPoints(value);
    };
  },
  onget: function(my){
    return my.data.value;
  },
  placeholder: [[10, 10], [500, 600]]
});


/****** path (list of points) type *********/
class PathWidget {
  constructor(config) {
    this.points = [];
    this.dom = document.createElement("div");
    this.dom.className = "path-widget-container";
    this.originWidth = config.originWidth;
    this.originHeight = config.originHeight;
    this.setPoints(config.value);  // Calling this will update the path preview
  }
  
  updatePathPreview() {
    let oldPathPreview = this.pathPreview;
    this.pathPreview = this.getPathView(this.points, 30, 30, this.originWidth, this.originHeight);
    // add a click event to the path preview, eventually will open a modal
    this.pathPreview.classList.add("path-preview");
    if(oldPathPreview) {
      this.dom.replaceChild(this.pathPreview, oldPathPreview);
    }
    else {
      this.dom.appendChild(this.pathPreview);
    }
  }

  setPoints(pointsList) {
    // Basic validation: ensure it's an array
    if (Array.isArray(pointsList)) {
      this.points = pointsList;
      this.updatePathPreview();
    } else {
      console.error("Invalid points data provided.", this.points);
    }
  }

  getPathView(points, width, height, originWidth, originHeight) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    // svg.style.background = "white";
    svg.style.border = '1px solid #888';

    // Draw lines connecting the points
    const pathData = points.map((pt, index) => {
      const x = (pt[0] / originWidth) * width;
      const y = height - (pt[1] / originHeight) * height;

      return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
    }).join(' ');

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute('d', pathData);
    path.setAttribute('stroke', 'lightgray');
    path.setAttribute('fill', 'none');
    svg.appendChild(path);

    // Draw circles for each point
    points.forEach(pt => {
      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute('cx', (pt[0] / originWidth) * width);
      circle.setAttribute('cy', height - (pt[1] / originHeight) * height);
      circle.setAttribute('r', 0.5);
      circle.setAttribute('fill', 'black');
      svg.appendChild(circle);
    });

    return svg;
  }
}

/************

Number Sliders

************/

export class SliderModal extends BaseModal {
  constructor(config) {
    super(config);
    this.min = config.min || 0;
    this.max = config.max || 300;
    this.value = config.value || 0;

    let numberSlider = document.createElement("div");
    numberSlider.classList.add("number-slider");
    this.dom = numberSlider;

    let slider = document.createElement("input");
    slider.type = "range";
    slider.classList.add("slider-for-numberbox");
    slider.min = this.min;
    slider.max = this.max;
    slider.value = this.value;

    let number = document.createElement("input");
    number.type = "number";
    number.className = "numberbox-for-slider";
    number.min = this.min;
    number.max = this.max;
    number.value = this.value;

    numberSlider.appendChild(number);
    numberSlider.appendChild(slider);

    slider.addEventListener('input', e => {
      number.value = slider.value;
      this._updateSource(this._parseNumber(slider.value));
    });

    number.addEventListener('change', e => {
      if (number.value < parseInt(number.min) || number.value > parseInt(number.max)) {
        number.value = slider.value;
      } else {
        slider.value = number.value;
      }
      this._updateSource(this._parseNumber(number.value));
    });
  }

  _parseNumber(value) {
    let num = parseFloat(value);
    if(isNaN(num)) num=0;
    num = this._boundNumber(num);
    return num;
  };

  _boundNumber(newValue) {
    if(this.min!==undefined && newValue<this.min) newValue=this.min;
    if(this.max!==undefined && newValue>this.max) newValue=this.max;
    // console.log("min ", min, " max ", max);
    return newValue;
  };

  _updateSource(value) {
    this.config.onchange(value);
  }
}

Joy.module("sequences", function() {

  /**********Along Path ***********/
  Joy.add({
    name: "Along path",
    type: "sequences/alongpath",
    tags: ["sequences", "action"],
    init: function() {
      let listname = this.listname? this.listname : 'brush name';
      let pathData = this.pathData? this.pathData : '[[30,30],[10,10]]';
      let configString = `In this pattern {id:'path', type:'path', placeholder:${pathData}}
      {id:'actions', type:'actions', listName:"${listname}", resetVariables:false}`;
      let parseResult = this.parseActorMarkup(configString);

      let actionOption = parseResult.actorOptions.find(obj => obj.id === 'actions');
      if(actionOption && this.initActions) {
        actionOption.initActions = [...this.initActions];
      }
      delete this.initActions;
      
      // for(let option in actionOptions) {
      //   actionOption.initActions = this.initActions; //pass in the starter actions
      //   console.log("setting", actionOption.initActions, "to", this.initActions);
      // }

      // for(let opts of parseResult.actorOptions) {
      //   if(opts.id == 'actions') {
      //     opts.initActions = this.initActions;
      //   }
      // }
      this.initializeDOM(parseResult);
    },
      // console.log("alongpath actor structure", this);
      // console.log("initActions", this.parent.initActions, "in", this.parent);
      // console.log(Object.getOwnPropertyNames(this));
      // console.log(Object.getOwnPropertyNames(this.parent));
      // const descriptor = Object.getOwnPropertyDescriptor(this.parent, 'initActions');
      // console.log(descriptor);
      // console.log("proxy?", this.parent.initActions === Object.getPrototypeOf(this.parent).initActions);
      // console.log(this.parent.hasOwnProperty('initActions'));  // Check directly on the object
      // console.log(Object.getPrototypeOf(this.parent).hasOwnProperty('initActions')); // Check on its prototype
      // let proto = this.parent;
      // while (proto) {
      //   console.log(proto.hasOwnProperty('initActions'));
      //   proto = Object.getPrototypeOf(proto);
      // }
  
      // console.log('alongpath actions after init', this.actions);
      // then actions needs to be populated with the list of markup strings in startActions

    //   // console.log(this.actions);
    //   // // console.log(this.actions.addAction);
    //   // this.actions.addAction('motif/star', undefined);
    // },
    
    // "Along path {id:'path', type:'path', placeholder:[[30,30],[40,40],[100,40],[100,100],[600,250]]} " +
    //     "{id:'actions', type:'actions', listName:'brush name', resetVariables:false}", //if it gets a name, list of actions is collapsible
    onact: function(my){
      // console.log("on act for alongpath");
      // Previewing? How much to preview?
      // var param = 1;
      // if(my.data._PREVIEW!==undefined) param=my.data._PREVIEW;

      // Create overrides, if not already there
      // if(!my.target._overrides) my.target._overrides={}; 

      // Just directly grab actors out of our list of actions
      const nestedActors = my.actor.actions.entries;
      const nestedActorData = my.actor.actions.data.actions;
      
      // console.log("nestedActors", nestedActors);
      // console.log("nestedActorData", nestedActorData);

      if(nestedActors.length > 0) {
        let nextPointIndex = 0;
        let nextActionIndex = 0;
        
        let exitSentinal = {};
        
        const popPoint = () => {
          const currPointIndex = nextPointIndex;
          if(currPointIndex >= my.data.path.length) {
            // console.log("Throwing exitSentinal from popPoint due to currPointIndex", currPointIndex, my.data.path.length);

            throw exitSentinal; // Super-break all the way back
            return undefined;
          }
          nextPointIndex++;
          return my.data.path[currPointIndex];
        };
        const popActionIndex = () => {
          const currActionIndex = nextActionIndex;
          nextActionIndex = (nextActionIndex + 1) % nestedActors.length;
          return currActionIndex;
        };

        const oldOverrides = my.target._overrides;
        if(my.target._overrides === undefined) {
          my.target._overrides = {};
        }
        else {
          my.target._overrides = _clone(my.target._overrides);
        }
        my.target._overrides.coordinate = (childMy) => {
          // If you only want to override based on id
          // if(childMy.target.actor.dataID !== "position") return undefined;
          return popPoint();
          // Above code will throw exitSentinal when we run out of points
          // This should skip remaining actions and break out of action loop below
          // return my.data.path[my.data.path.length - 1];
        };

        try {
          while(true) {
            const actionIndex = popActionIndex();
            // Now iterate over actions in more or less the same way the actions actor would
            let actionData = nestedActorData[actionIndex];
            if(actionData.STOP) return "STOP";
            let actor = nestedActors[actionIndex].actor;
            let actorMessage = actor.act(my.target, actionData);
            if(actorMessage=="STOP") return actorMessage;
            
            // Check if we wrapped around to first action without using any points
            // If so, we're probably stuck in an infinite loop
            if(nextActionIndex==0 && nextPointIndex==0) {
              // Looped through all actions without using any points!
              // console.log("Throwing exitSentinal due to potential infinite loop.", nextActionIndex, nextPointIndex);
              throw exitSentinal;
              return undefined;
            }
          }
        }
        catch(e) {
          // console.error("Caught error:", e, e === exitSentinal);
          if(e !== exitSentinal) throw e;
        }
        finally {
          if(oldOverrides === undefined) {
            delete my.target._overrides.coordinate;
          }
          else {
            my.target._overrides = oldOverrides;
          }
        }
      }
    }
  });


  /******** Group  *********/
  // Joy.add({
  //   name: "Group",
  //   type: "sequences/group",
  //   tags: ["sequences", "action"],
  //   init: "{id:'groupname', type:'string', placeholder:'brush name'}"+
  //       "{id:'actions', type:'actions', resetVariables:false}",
  //   onact: function(my){
      
  //     // Previewing? How much to preview?
  //     var param = 1;
  //     if(my.data._PREVIEW!==undefined) param=my.data._PREVIEW;

  //     // Loop through it... (as far as preview shows, anyway)
  //     var loops = Math.floor(my.data.count*param);
  //     for(var i=0; i<loops; i++){
  //       var message = my.actor.actions.act(my.target);
  //       if(message=="STOP") return message; // STOP
  //     }
  //   }
  // });
});


// class ActionList {
//   constructor(listname, id) {
//     this.listname = listname;
//     this.id = id;
//     this.dom = this.createDOM();
//   }
//   addAction() {

//   }
//   removeAction() {

//   }
//   moveAction() {

//   }
//   createDOM() {
//     let dom = document.createElement("li");
//     dom.className = "joy-list-item";

//     // Details for Actions List
//     let detailsElement = document.createElement("details");
//     detailsElement.className = "joy-actions";
//     dom.appendChild(detailsElement);

//     // Summary
//     let summary = document.createElement("summary");
//     let arrowSpan = document.createElement("span");
//     arrowSpan.className = "toggle-arrow";
//     summary.appendChild(arrowSpan);

//     // Check if list name is defined
//     let listName = this.listName;
//     if (listName) {
//       // If list name is defined, make the list collapsible
//       let titleSpan = document.createElement("span");
//       titleSpan.className = "list-title";
//       titleSpan.textContent = listName;
//       summary.appendChild(titleSpan);
//     } else {
//       // If list name is not defined, make the list non-collapsible
//       detailsElement.removeAttribute("open");
//       detailsElement.setAttribute("open", "open");
//       arrowSpan.style.display = "none";  // Hide the arrow
//     }

//     detailsElement.appendChild(summary);

//     // List
//     let list = document.createElement("ul");
//     list.classList.add('joy-list');
//     list.id = this.id + "-joy-list";
//     detailsElement.appendChild(list);

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
//         }).show();
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
//       bullet.dom.classList.add("joy-bullet");

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
//   }
//   return dom;
// }

// class Action {
//   constructor() {

//   }
//   getDOM() {
//     if(!this.dom) {
//       //create it
//     }
//     return this.dom;
//   }
// }

/****************

A collapsible list of actions.

WidgetConfig:
{type:'actions', name:'actions', resetVariables:false, listName:'listName', onlyTags:['tag1']}
// if list name is defined, creates a collapsible list

****************/
Joy.add({
  type: "actions",
  tags: ["ui"],
  init: function() {
    if(this.resetVariables!==undefined) this.data.resetVariables=this.resetVariables;
  },
  initWidget: function(){

    let data = this.data;
    let actions = data.actions;

    if(this.data.actions.length <= 0 && this.initActions) { // saved actions could be from action preview widget or from data
      for(let action of this.initActions) {
        this.data.actions.push(action);
      }
    }

    // DOM
    this.dom = document.createElement("li");
    this.dom.className = "joy-list-item";

    // Details for Actions List
    let detailsElement = document.createElement("details");
    detailsElement.className = "joy-actions";
    this.dom.appendChild(detailsElement);

    // Summary
    let summary = document.createElement("summary");
    let arrowSpan = document.createElement("span");
    arrowSpan.className = "toggle-arrow";
    summary.appendChild(arrowSpan);

    // Check if list name is defined
    let listName = this.options.listName;
    if (listName) {
      // If list name is defined, make the list collapsible
      let titleSpan = document.createElement("span");
      titleSpan.className = "list-title";
      titleSpan.textContent = listName;
      summary.appendChild(titleSpan);
    } else {
      // If list name is not defined, make the list non-collapsible
      detailsElement.removeAttribute("open");
      detailsElement.setAttribute("open", "open");
      arrowSpan.style.display = "none";  // Hide the arrow
    }

    detailsElement.appendChild(summary);

    // List
    let list = document.createElement("ul");
    list.classList.add('joy-list');
    list.id = this.id + "-joy-list";
    detailsElement.appendChild(list);
    this.list = list;

    // Actions you can add:
    let actionOptions = [];
    // Determine base set of action templates based on criteria.
    let baseActionTemplates = [];
    if(this.onlyActions){ 
        this.onlyActions.forEach(actionType => {
            baseActionTemplates.push(Joy.getTemplateByType(actionType));
        });
    } else {
        baseActionTemplates = Joy.getTemplatesByTag("action");
    }
    // Further filter by modules if specified.
    let modules = this.modules || [];
    if (modules.length > 0) {
        baseActionTemplates = baseActionTemplates.filter(template => {
            return modules.some(module => {
                return template.tags.includes(module);
            });
        });
    }
    // Create the actionOptions based on the filtered list of templates.
    baseActionTemplates.forEach(actionTemplate => {
        let notActionTag = actionTemplate.tags.filter(tag => tag !== "action")[0];
        actionOptions.push({
            label: actionTemplate.name,
            value: actionTemplate.type,
            category: notActionTag
        });
    });
    // Remove duplicates if any
    // TODO: figure out why there are duplicates
    actionOptions = actionOptions.filter((option, index, self) => 
    index === self.findIndex((o) => (
        o.label === option.label && o.value === option.value && o.category === option.category
    )));

    //////////////////////////////////////////
    // Create Bullet /////////////////////////
    //////////////////////////////////////////

    let bulletOptions = [
      {label:"Add action above", value:"action_above"},
      {label:"Add action below", value:"action_below"},
      {label:"Delete", value:"delete"}
    ];
    let _onBulletChoice = (entry, choice) => {

      // ACTION ABOVE or BELOW
      let newActionWhere = 0;
      if(choice=="action_above") newActionWhere=-1; // above
      if(choice=="action_below") newActionWhere=1; // below
      if(newActionWhere!=0){ // not NOT new action
        
        let newEntryIndex = this.entries.indexOf(entry);
        if(newActionWhere>0) newEntryIndex+=1;

        // Chooser Modal!
        let chooser = new ChooserModal({
          position: "left",
          source: entry.bullet.dom,
          options: actionOptions,
          onchange: (value) => {
            _addAction(value, newEntryIndex);
            this.update(); // You oughta know!
            _updateBullets(); // update the UI, re-number it.
          }
        }).show();
      }

      // DELETE
      if(choice=="delete"){
        _removeFromArray(this.entries, entry); // Delete entry from Entries[]
        _removeFromArray(actions, entry.actionData); // Delete action from Data's Actions[]
        this.removeChild(entry.actor); // Delete actor from Children[]
        list.removeChild(entry.dom); // Delete entry from DOM
        this.update(); // You oughta know!
        _updateBullets(); // update the UI, re-number it.
      }

    };
    let _createBullet = (entry) => {
    
      let bullet = new ChooserButton({
        position: "left",
        staticLabel: _getBulletLabel(entry),
        options: bulletOptions,
        onchange: (choice) => {
          _onBulletChoice(entry, choice);
        },
        styles: ["joy-bullet"]
      });
      bullet.dom.classList.add("joy-bullet");

      return bullet;

    };

    // Get the digit (or letter, or roman) for this bullet...
    let _getBulletLabel = (entry) => {

      // What index am I?
      let index = this.entries.indexOf(entry)+1;

      // How many levels deep in "actions" am I?
      let levelsDeep = 0;
      let parent = this.parent;
      while(parent){
        if(parent.type=="actions") levelsDeep++;
        parent = parent.parent;
      }

      // Digit, Letter, or Roman? (Cycle around)
      let label;
      switch(levelsDeep%3){
        case 0: label=index; break; // digits
        case 1: label=_numberToAlphabet(index); break; // letter
        case 2: label=_numberToRoman(index); break; // roman
      }
      return label;
    };

    // Re-number ALL these bad boys
    let _updateBullets = () => {
      for(let i=0; i<this.entries.length; i++){
        let entry = this.entries[i];
        let bullet = entry.bullet;
        let label = _getBulletLabel(entry);
        bullet.setLabel(label);
      }
    };

    ////////////////////////////////////////////////////////////////////
    // Add Entry: Entries have a Bullet (the number) & actual widget! //
    ////////////////////////////////////////////////////////////////////

    this.entries = [];
    
    let _addEntry = (actionData, atIndex) => {

      // New entry
      let entry = {};
      let entryDOM = document.createElement("li");
      entryDOM.classList.add('joy-list-item');
      if(atIndex===undefined) atIndex = this.entries.length;
      
      this.entries.splice(atIndex, 0, entry);
      list.insertBefore(entryDOM, list.children[atIndex]);
  
      // The Bullet is a Chooser!
      let bullet = _createBullet(entry); 
      bullet.dom.classList.add("drag-handle");
      let bulletContainer = document.createElement("span");
      bulletContainer.className = "joy-bullet-container";
      bulletContainer.classList.add("drag-handle");
      entryDOM.appendChild(bulletContainer);
      bulletContainer.appendChild(bullet.dom);
      
      // drag handle for moving actions
      // let dragHandle = document.createElement("div");
      // dragHandle.classList.add("action-drag-handle");
      // dragHandle.innerHTML = '<i class="fa-solid fa-grip-lines"></i>';
      // bulletContainer.appendChild(dragHandle);
  
      // The Actor & Widget 
      let newActor = this.addChild({type:actionData.type}, actionData);
      let newWidget = newActor.createWidget();
      newWidget.className = "joy-action-widget";
      entryDOM.appendChild(newWidget);
  
      // Storing data
      entry.dom = entryDOM;
      entry.bullet = bullet;
      entry.actor = newActor;
      entry.widget = newWidget;
      entry.actionData = actionData;
      entry.selected = false;

      // PREVIEW ON HOVER
      // Also tell the action "_PREVIEW": how far in the action to go?
      
      
      // let _calculatePreviewParam = (event) => {
      //   let param = event.offsetY / bullet.dom.getBoundingClientRect().height;
      //   if(param<0) param=0;
      //   if(param>1) param=1;
      //   _previewAction._PREVIEW = param;
      //   this.update();
      // };
      // let _previewAction;
      // let _previewStyle;
      // bulletContainer.onmouseenter = (event) => {

      //   if(!this.top.canPreview("actions")) return;

      //   this.top.activePreview = this;
        
      //   // Create Preview Data
      //   this.previewData = _clone(this.data);
      //   let actionIndex = this.entries.indexOf(entry);
      //   _previewAction = this.previewData.actions[actionIndex];

      //   // STOP after that action!
      //   this.previewData.actions.splice(actionIndex+1, 0, {STOP:true});

      //   // How far to go along action?
      //   _calculatePreviewParam(event);

      //   // Add in a style
      //   _previewStyle = document.createElement("style");
      //   document.head.appendChild(_previewStyle);
      //   _previewStyle.sheet.insertRule('.joy-actions.joy-previewing > #joy-list > div:nth-child(n+'+(actionIndex+2)+') { opacity:0.1; }');
      //   _previewStyle.sheet.insertRule('.joy-actions.joy-previewing > div.joy-bullet { opacity:0.1; }');
      //   this.dom.classList.add("joy-previewing");

      // };
      // bulletContainer.onmousemove = (event) => {
      //   if(this.previewData) _calculatePreviewParam(event);
      // };
      // bulletContainer.onmouseleave = () => {
      //   if(this.previewData){
      //     this.previewData = null;
      //     this.top.activePreview = null;
      //     this.update();
      //     document.head.removeChild(_previewStyle);
      //     this.dom.classList.remove("joy-previewing");
      //   }
      // };

      // select or deselect when clicked
      // entryDOM.addEventListener('click', function() {
      //   entry.selected = !entry.selected;
      //   entryDOM.classList.toggle('selected');
      // });

      return entry;

    };
    // add all INITIAL actions as widgets
      for(let i=0;i<actions.length;i++) {
        // debugger;
        _addEntry(actions[i]);
      }

    /////////////////////////////////////////
    //// Reorder Entries /////////////////
    /////////////////////////////////////////
    let _moveEntry = (oldIndex, newIndex) => {
      let item = this.entries.splice(oldIndex, 1)[0];
      this.entries.splice(newIndex, 0, item);
      this.update();
      _updateBullets();
    };
    this.moveAction = _moveEntry;

    let _deleteEntry = (index) => {
      let entry = this.entries[index];
      _removeFromArray(this.entries, entry); // Delete entry from Entries[]
      _removeFromArray(actions, entry.actionData); // Delete action from Data's Actions[]
      this.removeChild(entry.actor); // Delete actor from Children[]
      // list.removeChild(entry.dom); // Delete entry from DOM
      if (entry.dom.parentNode) {
        entry.dom.parentNode.removeChild(entry.dom); // Delete entry from DOM
      }
      this.update(); // You oughta know!
      _updateBullets(); // update the UI, re-number it.
    };
    this.deleteAction = _deleteEntry;

    ///////////////////////////////////////
    // Add Action /////////////////////////
    ///////////////////////////////////////

    // Manually add New Action To Actions + Widgets + DOM
    let _addAction = (actorType, atIndex, data={}) => {
      // console.log("adding action at index", atIndex, "with data ", data);
      // Create that new entry & everything
      let newAction = {type:actorType, ...data};
      if(atIndex===undefined){
        actions.push(newAction);
      }else{
        actions.splice(atIndex, 0, newAction);
      }
      let entry = _addEntry(newAction, atIndex);

      // Focus on that entry's widget!
      // entry.widget.focus();
    };
    this.addAction = _addAction; //available to other modules


    // "+" Button: When clicked, prompt what actions to add!
    let addButton = new ChooserButton({
      staticLabel: "+",
      options: actionOptions,
      onchange: (value) => {
        _addAction(value);
        this.update(); // You oughta know!
      },
      styles: ["joy-bullet", "joy-add-bullet"]
    });
    let addButtonLi = document.createElement('li'); //make it the last element in the list
    addButtonLi.classList.add('joy-add-item');
    addButtonLi.appendChild(addButton.dom);
    this.list.appendChild(addButtonLi);
  },
  onact: function(my) {
    // Create _lets, if not already there
    if (!my.target._variables) my.target._variables = {};
  
    // Reset all of target's variables?
    if (my.data.resetVariables) my.target._variables = {};
  
    // Get the delay option (default to 0 if not provided)
    const delayBetweenActions = parseInt(my.options.delay) || 0;
    // console.log("delay is ", delayBetweenActions);
  
    // Do those actions, baby!!!
    const runActions = async () => {
      for (let i = 0; i < my.data.actions.length; i++) {
        // Stop?
        const actionData = my.data.actions[i];
        if (actionData.STOP) return "STOP";
  
        // Run
        const actor = my.actor.entries[i].actor; // TODO: THIS IS A HACK AND SHOULD NOT RELY ON THAT - note: preview "STOP" action messes with this!
        const actorMessage = actor.act(my.target, actionData); // use ol' actor, but GIVEN data.
        if (actorMessage == "STOP") return actorMessage;
  
        // Wait for the specified delay before the next action, but only if delay is greater than 0
        if (delayBetweenActions > 0) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenActions));
        }
      }
    };
  
    // If delayBetweenActions is 0 or less, execute the actions immediately
    if (delayBetweenActions <= 0) {
      runActions();
    } else {
      return runActions();
    }
  },
  
  // onact: function(my){

  //   // Create _lets, if not already there
  //   if(!my.target._variables) my.target._variables={}; 

  //   // Reset all of target's variables?
  //   if(my.data.resetVariables) my.target._variables = {};

  //   // console.log("actions", my.data.actions);
  //   // console.log("actions length", my.data.actions.length);

  //   // Do those actions, baby!!!
  //   for(let i=0; i<my.data.actions.length; i++){

  //     // Stop?
  //     let actionData = my.data.actions[i];
  //     if(actionData.STOP) return "STOP";

  //     // console.log("entry at ", i, my.actor.entries[i].actor.init);
  //     // Run 
  //     let actor = my.actor.entries[i].actor; // TODO: THIS IS A HACK AND SHOULD NOT RELY ON THAT - note: preview "STOP" action messes with this!
  //     let actorMessage = actor.act(my.target, actionData); // use ol' actor, but GIVEN data.
  //     if(actorMessage=="STOP") return actorMessage;
  //   }
  // },
  placeholder: {
    actions: [],
    resetVariables: true
  }
});

// group widget WIP
// Joy.add({
//   type: "group",
//   tags: ["ui"],
//   initWidget: function(self){

//     // String *IS* DOM
//     var o = this.options;
//     self.groupUI = new GroupUI({
//       prefix: o.prefix,
//       suffix: o.suffix,
//       color: o.color, 
//       value: this.getData("value"),
//       onchange: function(value){
//         this.setData("value", value);
//       }
//     });
//     this.dom = this.groupUI.dom;

//     // When data's changed, externally
//     self.onDataChange = function(){
//       var value = self.getData("value");
//       self.pathUI.setPath(value);
//     };
//   },
//   onget: function(my){
//     return my.data.value;
//   },
//   placeholder: "group name"
// });

Joy.add({
  type: "coordinate",
  tags: ["ui"],
  initWidget: function() {
    // DOM representation for the widget
    let dom = document.createElement("div");
    dom.classList.add("coordinate-widget");
    dom.classList.add("underline-editable");

    let x = this.getX(); // set initial value in the DOM
    let y = this.getY();

    this.setDisplayValue = (x, y) => {
      let displayX = x;
      let displayY = y;
      if(isNaN(x)) displayX = 'x';
      if(isNaN(y)) displayY = 'y';
      dom.innerHTML = `(${displayX}, ${displayY})`;
    };

    this.setDisplayValue(x, y);
    // dom.innerHTML = ` at <span class="underline-coordinates">(${x}, ${y})</span>`

    dom.onclick = () => {
      // Create and show the grid modal
      new GridModal({
        source: this.dom,
        onchange: (x, y) => {
          this.setDisplayValue(x, y);
          this.setData("value", [x, y]);
        },
        getX: () => {
          return this.getX();
        },
        getY: () => {
          return this.getY();
        }
      }).show();
    };
    this.dom = dom;
  },
  widgetPreview: {
    duration: 0.5, 
    amplitudeFunc: () => {
        return 5; // Represents the maximum wiggle amount from the original position
    },
    updateValueFunc: (initial, delta) => {
      const dx = delta;
      const dy = delta;

      return [initial[0] + dx, initial[1] + dy];
    }
  },
  onget: function(my) {
    if(my.target && my.target._overrides && my.target._overrides.hasOwnProperty("coordinate")) {
      const override = my.target._overrides.coordinate(my);
      if(override !== undefined) {
        return override;
      }
    }
    return [my.data.value[0], my.data.value[1]];
  },
  placeholder: function() {
    return [0, 0]; // placeholder if we never set the value originally, does this ever get used?
  },
  getX() {
    return parseInt(this.getData('value')[0]);
  },
  getY() {
    return parseInt(this.getData('value')[1]);
  }
});

class GridModal extends BaseModal {
  constructor(config) {
    super(config);

    this.cache = {}; //memoization experiment

    this.scaleFactor = 4.5; // 4.5 pixels in the grid corresponds to 1 pixel in the canvas
    this.min = 0;
    this.max = 550; //size of canvas

    let outerGridContainer = document.createElement("div");
    outerGridContainer.classList.add("outer-grid-container");
    this.dom = outerGridContainer;

    let innerContainer = document.createElement("div");
    innerContainer.classList.add("coordinate-and-grid-container");
    this.innerContainer = innerContainer;
    outerGridContainer.appendChild(innerContainer);
    this.outerGridContainer = outerGridContainer;

    let grid = document.createElement("div");
    grid.classList.add("grid");
    innerContainer.appendChild(grid);
    this.grid = grid;
    
    // Create coordinate display for x and y
    let coordinateContainer = document.createElement("div");
    coordinateContainer.classList.add("coordinate-container");

    // For the x-coordinate
    let xContainer = document.createElement("div");
    xContainer.classList.add("coordinate-pair");

    let xLabel = document.createElement("span");
    xLabel.innerHTML = "x = ";

    this.xBox = document.createElement("input");
    this.xBox.type = "number";
    this.xBox.className = "coordinate-numberbox";
    this.xBox.addEventListener('change', e => {
      let x = parseInt(e.target.value);
      let y = this.config.getY();
      this.updateCoordinates(x, y);
    });

    xContainer.appendChild(xLabel);
    xContainer.appendChild(this.xBox);
    coordinateContainer.appendChild(xContainer);

    // For the y-coordinate
    let yContainer = document.createElement("div");
    yContainer.classList.add("coordinate-pair");
    let yLabel = document.createElement("span");
    yLabel.innerHTML = "y = ";

    this.yBox = document.createElement("input");
    this.yBox.type = "number";
    this.yBox.className = "coordinate-numberbox";
    this.yBox.addEventListener('change', e => {
      let x = this.config.getX();
      let y = parseInt(e.target.value);
      this.updateCoordinates(x, y);
    });

    yContainer.appendChild(yLabel);
    yContainer.appendChild(this.yBox);
    coordinateContainer.appendChild(yContainer);
    innerContainer.appendChild(coordinateContainer); // Add the coordinate boxes to the outer grid container

    // cursor (dot on grid)
    this.cursorCircle = document.createElement("div");
    this.cursorCircle.classList.add("cursor-circle");
    grid.appendChild(this.cursorCircle);  // Add the circle to the grid

    // set initial values
    this.updateCoordinates(this.config.getX(),this.config.getY());

    let isMouseDown = false; // Track the mouse state

    grid.onmousedown = (e) => {
      isMouseDown = true;
      this.updateCoordinates(...this.scaleCoords(e.clientX, e.clientY));
      document.addEventListener('mouseup', globalMouseUp); // capture mouse released even if off the grid
    };

    grid.onmousemove = (e) => {
      if(isMouseDown) {
        this.updateCoordinates(...this.scaleCoords(e.clientX, e.clientY));
      }
    };

    grid.onmouseup = (e) => {
      isMouseDown = false;
    };

    let globalMouseUp = (e) => {
      isMouseDown = false;
      // Once the mouse is released, remove this global listener to avoid unnecessary overhead
      document.removeEventListener('mouseup', globalMouseUp);
    }
  }

  scaleCoords(viewportX, viewportY) {
    let origin = this.getOrigin(); //top left corner of the grid element
    let x = Math.round(viewportX - origin.left) * this.scaleFactor; // x relative to grid
  
    // Transform y-coordinate to make origin at bottom left
    let y = Math.round(this.max - (viewportY - origin.top) * this.scaleFactor);
  
    return [x, y];
  }
  

  updateCoordinates(x, y) {
    x = parseInt(x);
    y = parseInt(y);
    if(x < this.min) { x = this.min; }
    if(y < this.min) { y = this.min; }
    if(x > this.max) { x = this.max; }
    if(y > this.max) { y = this.max; }

    this.setCursorPos(x / this.scaleFactor, y / this.scaleFactor);
    this.setNumberBoxes(x, y);
    this.config.onchange(x, y);
  }

  getOrigin() {
    if (this.cache.origin) {
        return this.cache.origin;
    } else {
        let gridRect = this.grid.getBoundingClientRect();
        this.cache.origin = { left: gridRect.left, top: gridRect.top };
        return this.cache.origin;
    }
  }

  setNumberBoxes(x, y) {
    this.xBox.value = x;
    this.yBox.value = y;
  }

  setCursorPos(x, y) {
    this.cursorCircle.style.left = `${x}px`;
  
    // Transform y-coordinate for positioning on the UI
    this.cursorCircle.style.top = `${this.max / this.scaleFactor - y}px`;
  }
}

Joy.add({
  type: "singleAction",
  tags: ["ui"],
  init: function() {
      // Initialization logic
  },
  initWidget: function() {
      this.dom = document.createElement("li");
      this.dom.className = "joy-single-action";
      this.entry = {}; // Initially empty
  },
  setAction: function(actionType, settings={}) {
      // Remove previous action's representation if exists
      if(this.entry.actor) {
        this.dom.removeChild(this.entry.widget);
        this.removeChild(this.entry.actor);
        this.entry = {};
      }

      // Create and add the new action's widget
      let newActor = this.addChild({type: actionType}, settings); //this mutates 'settings' (becomes actor.data)
      let newWidget = newActor.createWidget();
      newWidget.classList.add("joy-single-action-widget");
      this.dom.appendChild(newWidget);
      
      this.entry.actor = newActor;
      this.entry.widget = newWidget;
      this.entry.actionData = settings;
      this.update();
  },
  getEntryData: function() {
    let entryActor = this.entry.actor;
    if(!entryActor) return {};
    return entryActor.getAllData();
  },
  
  getActionData: function() {
    let target = {};
    let entryActor = this.entry.actor;
    if(!entryActor) return {};
    let data = _clone(entryActor.data);
    entryActor.children.forEach((child) => {
      const dataID = child.dataID;
      if (dataID) {
        const value = child.get(target);
        data[dataID] = value;
      }
    });
    // console.log("data is", data);
    // let actionDataCopy = _clone(this.entry.actionData);
    return data;
  },
  setChildData(newData) {
    const targetActor = this.entry.actor;
    // console.log("newData is", newData);
    // console.log("current actor is", targetActor);
    for (let key in newData) {
      // console.log("\t\tLooking for key", key, "in actor", targetActor);
      const child = targetActor.findChild(key);
      if (child) {
        // console.log("\t\t\tFound child", child);
        child.switchData(newData[key]);
      }
      else {
        // console.log("\t\t\tDidn't find child for", key);
      }
    }
    targetActor.update();
    // console.log("after update: actor is", targetActor);
  },
  setChildDataByType(type, valueFunction) {
    const targetActor = this.entry.actor;
    // console.log("looking for...");
    for (let key in targetActor.data) {
      if (targetActor.data[key].type === type) {
        const child = targetActor.findChild(key);
        if (child) {
          child.switchData({ type: type, value: valueFunction() });
        }
      }
    }
    targetActor.update();
  },
  getActionType: function() {
    return this.entry.actor.type;
  },
  onact: function(my) {
    if(this.entry.actor) {
      this.entry.actor.act(my.target, this.getActionData());
    }
  },
  placeholder: {
      action: {}
  }
});



// class GroupUI {
//   constructor(config) {

//     this.dom = document.createElement("div");
//     this.dom.className = "joy-named-group";

// 		const arrow = document.createElement("span");
// 		arrow.contentEditable = false;
// 		arrow.innerText = "^ ";
// 		this.dom.appendChild(arrow);
  
//     const input = document.createElement("span");
//     input.contentEditable = true;
//     input.spellcheck = false;
  
//     this.dom.appendChild(input);
  
//     input.addEventListener("input", (event) => {
//       _fixStringInput(input);
//       const value = input.innerText; //todo - might be issue, expecting a string
//       config.onchange(value);
//     });
  
//     input.addEventListener("focus", () => {
//       _selectAll(input);
//     });
  
//     input.addEventListener("blur", () => {
//       _unselectAll();
//     });
// 		_preventWeirdCopyPaste(input);
  
//     input.addEventListener("keypress", (e) => {
//   	if (e.which === 13) {
//   	  input.blur();
//   	  return false;
//       }
//       return true;
//     });
  
//    // Set name
//     this.setName = function(value){
//     input.innerText = value;
//     _fixStringInput(input);
//     };
  
//     this.setColor = function (color) {
// 	  color = this._forceToRGB(color);
//   	  this.dom.style.color = color;
//   	  this.dom.style.borderColor = color;
//     };
  
//     if (config.color) {
//       this.setColor(config.color);
//     }
  
//     this.styles = config.styles || [];
//     this.styles.forEach((style) => {
//   	this.dom.classList.add(style);
//     });
  
//     this.setName(config.value);
//   }
// }











/****************

Number slider widget

****************/

Joy.add({
  type: "numberslider",
  tags: ["ui"],
  initWidget: function() {
    this.sigfigs = 0;
    let dom = document.createElement("div");
    dom.className = "number-widget";
    dom.innerHTML = this.getData("value");
    dom.onclick = () => {
      new SliderModal({
        source: this.dom,
        position: this.position,
        min: this.min,
        max: this.max,
        value: this.getData("value"),
        onchange: (value) => {
          // if(value < min) value = min;
          // if(value > max) value = max;
          this.dom.innerHTML = value;
          this.setData("value", value);
          //value.toFixed(this.sigfigs);
        }
      }).show();
    };
    this.dom = dom;
  },
  widgetPreview: {
    duration: 0.5, 
    amplitudeFunc: () => {
        return 0.1;
    },
    updateValueFunc: (initial, delta) => {
      // console.log("initial is", initial, "delta is ", delta);
      if(initial == 0) return 1;
      else return initial + delta * initial;
    }
  },
  onget: function(my) {
    return my.data.value;
  },
  placeholder: function() {
    return 5;
  }
});


/****************
Color Palette Widget
****************/

Joy.add({
  type: "color",
  tags: ["ui"],
  initWidget: function() {
    let colorButton = document.createElement("input");
    colorButton.type = "button";
    //TODO: set initial value of color - this.data.value
    colorButton.classList.add("color-palette-widget", "clr-field");
    colorButton.value = tinycolor(this.data.value).toRgbString();
    colorButton.style.background = tinycolor(this.data.value).toRgbString();
    colorButton.setAttribute("data-coloris", ""); //normally this would also add other coloris specific classes, but not if HTML isn't created yet
    colorButton.addEventListener('click', () => {
      new Coloris({
        swatches: this.colorOptions || [
          '#FF0000ff', // Red
          '#FFA500ff', // Orange
          '#FFD700ff', // Gold
          '#808000ff', // Olive
          '#008000ff', // Green
          '#26A2E0ff', // Light blue
          '#0000FFff', // Blue
          '#4B0082ff', // Indigo
          '#800080ff', // Purple
          '#EE82EEff', // Violet
          '#FFC0CBff', // Pink
          '#808080ff', // Gray
          '#FFFFFFff', // White
          '#000000ff', // Black
          '#5E2109ff', // Brown
          '#D2B48Cff'  // Tan
        ],
        theme: 'polaroid',
        formatToggle: this.formatToggle !== undefined ? this.formatToggle : true,
        swatchesOnly: this.swatchesOnly !== undefined ? this.swatchesOnly : false,
        alpha: this.alphaEnabled !== undefined ? this.alphaEnabled : true,
        defaultColor: '#800080',
        onChange: (color) => {
          this.dom.style.background = color;
          this.data.value = color;
          this.update();
        }
      });
    });
    this.dom = colorButton;
      // this.dom.style.background = this.data.value;
  },
  widgetPreview: {
    duration: 0.5, 
    amplitudeFunc: () => {
        return 0.3; //oscillate up to this value (how much lighter/darker)
    },
    updateValueFunc: (color, delta) => {
      if(delta > 0) return tinycolor(color).lighten(delta*100).toString();
      else return tinycolor(color).darken(Math.abs(delta)*100).toString();
    }
  },
  onget: function(my){
    return tinycolor(my.data.value).toRgbString();
  },
  placeholder: function(){
    if(this.colorOptions) {
      return this.colorOptions[Math.floor(Math.random() * this.colorOptions.length)];
    } else {
      return '#aaaaaa';
    }
  }
});

// Joy.add({
//   type: "color",
//   tags: ["ui"],
//   initWidget: function() {
//     let colorButton = document.createElement("input");
//     colorButton.type = "button";
//     colorButton.value = this.colorOptions[0];
//     colorButton.classList.add("color-palette-widget", "clr-field");
//     colorButton.setAttribute("data-coloris", ""); //normally this would also add other coloris specific classes, but not if HTML isn't created yet
//     colorButton.addEventListener('click', () => {
//         new Coloris({
//           swatches: this.colorOptions,
//           theme: 'polaroid',
//           formatToggle: true,
//           swatchesOnly: false,
//           alpha: this.alphaEnabled,
//           defaultColor: '#ffffff',
//           onChange: (color) => {
//             this.dom.style.background = color;
//             this.data.value = color;
//             this.update();
//           }
//         });
//       });
//       this.dom = colorButton;
//       this.dom.style.background = this.data.value;
//   },
//   onget: function(my){
//     return my.data.value;
//   },
//   placeholder: function(){
//     // todo: change to random color from the palette
//     return '#000000';
//   }
// });