import { Joy } from "./joy.js";
import { BaseModal, ModalBackdrop, ChooserModal } from "./components/modals.js";
import { JoyWidget, JoyButton, JoyString, ChooserButton } from './components/ui-widgets.js';
import { _clone, _HSVtoRGB, _HSVToRGBString, _numberToAlphabet, _numberToRoman, _removeFromArray } from "./joy-utils.js";
import { _hexToRGB } from "../../utils/color-utils.js";

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
      }
    });
    this.dom = this.pathWidget.dom;

    // When data's changed, externally
    this.onDataChange = () => {
      var value = self.getData("value"); // value is a list of points
      this.pathWidget.setPath(value);
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
    this.setPoints(config.value);

    this.dom = document.createElement("div");
    this.dom.className = "path-widget-container";

    this.pathPreview = this.getPathView(this.points, 100, 100, 600, 600);
    this.pathPreview.classList.add("path-preview");
    this.dom.appendChild(this.pathPreview);

    // add a click event to the path preview, eventually will open a modal
  }

  setPoints(pointsList) {
    // Basic validation: ensure it's an array of objects with x and y properties.
    if (Array.isArray(pointsList)) {
      this.points = pointsList;
    } else {
      console.error("Invalid points data provided.");
    }
  }

  getPathView(points, width, height, originWidth, originHeight) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.style.background = "white";
    svg.style.border = '1px solid #888';

    // Draw lines connecting the points
    const pathData = points.map((pt, index) => {
      const x = (pt[0] / originWidth) * width;
      const y = (pt[1] / originHeight) * height;

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
      circle.setAttribute('cy', (pt[1] / originHeight) * height);
      circle.setAttribute('r', 4); // half the previous size for preview
      circle.setAttribute('fill', 'black');
      svg.appendChild(circle);
    });

    return svg;
  }
}

  // old version with canvas
  // getCanvas(points, width, height, originWidth, originHeight) {
    
  //   const canvas = document.createElement('canvas');
  //   canvas.width = width;
  //   canvas.height = height;
  //   canvas.style.background = "white";
  //   canvas.style.border = '1px solid #888';
    
  //   const ctx = canvas.getContext('2d');
  //   ctx.clearRect(0, 0, width, height);
  //   ctx.scale(width/originWidth, height/originHeight);
    
  //   const firstPoint = points[0];
  //   ctx.beginPath();
  //   ctx.moveTo(firstPoint.x, firstPoint.y);
    
  //   for (let i = 1; i < points.length; i++) {
  // 	  const { x, y } = points[i];
  // 	  ctx.lineTo(x, y);
  //   }
    
  //   ctx.strokeStyle = 'black';
  //   ctx.lineWidth = 3;
  //   ctx.stroke();
    
  //   ctx.fillStyle = 'black';
  //   for (const { x, y } of this.points) {
  // 	ctx.beginPath();
  // 	ctx.arc(x, y, 8, 0, Math.PI * 2);
  // 	ctx.fill();
  //   }
  //   return canvas;
  // }  

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
    init: "Along path {id:'path', type:'path', placeholder:[[20,50],[600,250]]} " +
        // "{id:'actions', type:'actions', resetVariables:false}",
        "{id:'actions', type:'actions', listName:'brush name', resetVariables:false}", //name makes it collapsible, eventually - variable name
    onact: function(my){
      console.log("What about here?", my.data.points);
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


  /******** Group  *********/
  Joy.add({
    name: "Group",
    type: "sequences/group",
    tags: ["sequences", "action"],
    init: "{id:'groupname', type:'string', placeholder:'brush name'}"+
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

/****************

A collapsible list of actions.

WidgetConfig:
{type:'actions', name:'actions', resetVariables:false, listName:'listName', onlyTags:['tag1']}
// if list name is defined, creates a collapsible list

****************/
Joy.add({
  type: "actions",
  tags: ["ui"],
  init: function(){
    if(this.resetVariables!==undefined) this.data.resetVariables=this.resetVariables;
  },
  initWidget: function(){

    let data = this.data;
    let actions = data.actions;

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
    console.log("listName", listName);
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
      let bulletContainer = document.createElement("div");
      bulletContainer.className = "joy-bullet-container";
      entryDOM.appendChild(bulletContainer);
      bulletContainer.appendChild(bullet.dom);
  
      // The Actor & Widget 
      let newActor = this.addChild({type:actionData.type}, actionData);
      let newWidget = newActor.createWidget();
      newWidget.classList.add("joy-widget");
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
      let _calculatePreviewParam = (event) => {
        let param = event.offsetY / bullet.dom.getBoundingClientRect().height;
        if(param<0) param=0;
        if(param>1) param=1;
        _previewAction._PREVIEW = param;
        this.update();
      };
      let _previewAction;
      let _previewStyle;
      bulletContainer.onmouseenter = (event) => {

        if(!this.top.canPreview("actions")) return;

        this.top.activePreview = this;
        
        // Create Preview Data
        this.previewData = _clone(this.data);
        let actionIndex = this.entries.indexOf(entry);
        _previewAction = this.previewData.actions[actionIndex];

        // STOP after that action!
        this.previewData.actions.splice(actionIndex+1, 0, {STOP:true});

        // How far to go along action?
        _calculatePreviewParam(event);

        // Add in a style
        _previewStyle = document.createElement("style");
        document.head.appendChild(_previewStyle);
        _previewStyle.sheet.insertRule('.joy-actions.joy-previewing > #joy-list > div:nth-child(n+'+(actionIndex+2)+') { opacity:0.1; }');
        _previewStyle.sheet.insertRule('.joy-actions.joy-previewing > div.joy-bullet { opacity:0.1; }');
        this.dom.classList.add("joy-previewing");

      };
      bulletContainer.onmousemove = (event) => {
        if(this.previewData) _calculatePreviewParam(event);
      };
      bulletContainer.onmouseleave = () => {
        if(this.previewData){
          this.previewData = null;
          this.top.activePreview = null;
          this.update();
          document.head.removeChild(_previewStyle);
          this.dom.classList.remove("joy-previewing");
        }
      };

      // select or deselect when clicked
      // entryDOM.addEventListener('click', function() {
      //   entry.selected = !entry.selected;
      //   entryDOM.classList.toggle('selected');
      // });

      return entry;

    };
    // add all INITIAL actions as widgets
    for(let i=0;i<actions.length;i++) _addEntry(actions[i]);

    // ///////////////////////////////////////
    // // Reorder Entries - NF added /////////
    // ///////////////////////////////////////
    let _moveEntry = (oldIndex, newIndex) => {
      let item = this.entries.splice(oldIndex, 1)[0];
      this.entries.splice(newIndex, 0, item);
      this.update();
      _updateBullets();
    };
    this.moveAction = _moveEntry;

    ///////////////////////////////////////
    // Add Action /////////////////////////
    ///////////////////////////////////////

    // Manually add New Action To Actions + Widgets + DOM
    let _addAction = (actorType, atIndex, data={}) => {
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

    // Actions you can add:
    // TODO: INCLUDE ALIASED ACTIONS
    let actionOptions = [];

    //TODO: refactor into functions

    if(this.onlyActions){ //get a specific list of types
      for(let i=0;i<this.onlyActions.length;i++){
        let actionType = this.onlyActions[i];
        let actorTemplate = Joy.getTemplateByType(actionType);
        let notActionTag = actorTemplate.tags.filter((tag) => {
          return tag!="action"; // first tag that's NOT "action" (so that actions categorized in the chooser menu based on their secondary tag)
        })[0];
        actionOptions.push({
          label: actorTemplate.name,
          value: actionType,
          category: notActionTag
        });
      }
    }else{ //find anything tagged action
      let actionActors = Joy.getTemplatesByTag("action");
      for(let i=0;i<actionActors.length;i++){
        let actionActor = actionActors[i];
        let notActionTag = actionActor.tags.filter((tag) => {
          return tag!="action";
        })[0];
        actionOptions.push({
          label: actionActor.name,
          value: actionActor.type,
          category: notActionTag
        });
      }
    }

    // NF: Add only actions in specified modules to chooser menu
    // TODO: merge with previous filter code
    let modules = this.modules || [];
    let moduleOptions = [];
    modules.forEach((module) => {
      let moduleActors = Joy.getTemplatesByTag(module);
      moduleActors.forEach((moduleActor) => {
        let notActionTag = moduleActor.tags.filter((tag) => {
          return tag!="action";
        })[0];
        moduleOptions.push({
          label: moduleActor.name,
          value: moduleActor.type,
          category: notActionTag
        });
      });
    });

    // "+" Button: When clicked, prompt what actions to add!
    let addButton = new ChooserButton({
      staticLabel: "+",
      options: actionOptions,
      onchange: (value) => {
        _addAction(value);
        console.log("value passed to addaction", value);
        this.update(); // You oughta know!
      },
      styles: ["joy-bullet", "joy-add-bullet"]
    });
    let addButtonLi = document.createElement('li'); //make it the last element in the list
    addButtonLi.classList.add('joy-add-item');
    addButtonLi.appendChild(addButton.dom);
    this.list.appendChild(addButtonLi);

  },
  onact: function(my){

    // Create _lets, if not already there
    if(!my.target._variables) my.target._variables={}; 

    // Reset all of target's variables?
    if(my.data.resetVariables) my.target._variables = {};

    // Do those actions, baby!!!
    for(let i=0; i<my.data.actions.length; i++){

      // Stop?
      let actionData = my.data.actions[i];
      if(actionData.STOP) return "STOP";

      // Run 
      let actor = my.actor.entries[i].actor; // TODO: THIS IS A HACK AND SHOULD NOT RELY ON THAT
      let actorMessage = actor.act(my.target, actionData); // use ol' actor, but GIVEN data.
      if(actorMessage=="STOP") return actorMessage;

    }

  },
  placeholder: {
    actions: [],
    resetVariables: true
  }
});

//new widget
Joy.add({
  type: "group",
  tags: ["ui"],
  initWidget: function(self){

    // String *IS* DOM
    var o = this.options;
    self.groupUI = new GroupUI({
      prefix: o.prefix,
      suffix: o.suffix,
      color: o.color, 
      value: this.getData("value"),
      onchange: function(value){
        this.setData("value", value);
      }
    });
    this.dom = this.groupUI.dom;

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

Joy.add({
  type: "coordinate",
  tags: ["ui"],
  initWidget: function() {
    // DOM representation for the widget
    let dom = document.createElement("div");
    dom.className = "coordinate-widget";

    let x = this.getX(); // set initial value in the DOM
    let y = this.getY();
    dom.innerHTML = `(${x}, ${y})`;

    dom.onclick = () => {
      // Create and show the grid modal
      new GridModal({
        source: this.dom,
        onchange: (x, y) => {
          dom.innerHTML = `(${x}, ${y})`;
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
  onget: function(my) {
    return { x: my.data.value[0], y: my.data.value[1] };
  },
  placeholder: function() {
    return { x: 0, y: 0 }; // placeholder if we never set the value originally, does this ever get used?
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

    this.scaleFactor = 5; // 5 pixels in the grid corresponds to 1 pixel in the canvas
    this.min = 0;
    this.max = 600; //size of canvas

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
    let y = Math.round(viewportY - origin.top) * this.scaleFactor; // y relative to grid

    return [x, y];
  }

  updateCoordinates(x, y) {
    x = parseInt(x);
    y = parseInt(y);
    if(x < this.min) { x = this.min; }
    if(y < this.min) { y = this.min; }
    if(x > this.max) { x = this.max; }
    if(y > this.max) { y = this.max; }
    console.log("x: ", x, " y: ", y);

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
    this.cursorCircle.style.top = `${y}px`;
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
  addAction: function(actionType, index=undefined, actionOptions={}) {
      // Remove previous action's representation if exists
      if(this.entry.actor) {
        this.dom.removeChild(this.entry.widget);
        this.removeChild(this.entry.actor);
        this.entry = {};
      }

      // Create and add the new action's widget
      let newActor = this.addChild({type: actionType}, actionOptions);
      let newWidget = newActor.createWidget();
      newWidget.classList.add("joy-widget");
      this.dom.appendChild(newWidget);
      
      this.entry.actor = newActor;
      this.entry.widget = newWidget;
      this.entry.actionData = actionOptions;
  },
  getAction: function() {
      return this.entry.actionData;
  },
  onact: function(my) {
      if (my.data.action) {
          let actor = this.children[0]; // Assuming the single action actor is the first child
          let actorMessage = actor.act(my.target, my.data.action);
          if (actorMessage === "STOP") return actorMessage;
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
          this.dom.innerHTML = value;
          this.setData("value", value);
          //value.toFixed(this.sigfigs);
        }
      }).show();
    };
    this.dom = dom;
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
  type: "colorpalette",
  tags: ["ui"],
  initWidget: function() {

    let colorButton = document.createElement("input");
    colorButton.type = "button";
    colorButton.value = "&nbsp;";
    colorButton.classList.add("color-palette-widget", "clr-field");
    colorButton.setAttribute("data-coloris", ""); //normally this would also add other coloris specific classes, but not if HTML isn't created yet
    colorButton.addEventListener('click', () => {
        new Coloris({
          swatches: this.colorOptions,
          theme: 'polaroid',
          formatToggle: false,
          swatchesOnly: true,
          alpha: false,
          defaultColor: this.colorOptions[0] || '#aabbcc',
          onChange: (color) => {
            this.dom.style.background = color;
            this.data.value = color;
            this.update();
          }
        });
      });
      this.dom = colorButton;
      this.dom.style.background = this.data.value;
  },
  onget: function(my){
    return my.data.value;
  },
  placeholder: function(){
    let hue = Math.floor(Math.random()*360); // Random color! 
    // change to random color from the palette
    return '#FAE7D0';
  }
});


/********************
Color Palette Modal
********************/
export class ColorPalette extends BaseModal {
  constructor(config) {
    super(config);

    // Add input field for Coloris
    this.colorisInput = document.createElement('input');
    // this.colorisInput.type = "hidden";
    this.colorisInput.setAttribute('data-coloris', '');
    this.dom.appendChild(this.colorisInput);

    // this._attachEvents();
  }

  show() {
    const modalInstance = ModalBackdrop.getInstance();
    this._initializeColoris(modalInstance.box);
    super.show();
  }

  _initializeColoris() {
    this.colorisInstance = Coloris({
      parent: this.modalContainer, // Assuming modalContainer is where the color picker should show
      swatches: this.config.colorOptionsHex,
      inline: false, // we don't want the color picker to be always visible
      onChange: (color) => {
        if(config.onchange) {
          config.onchange(color);
        }
      }
    });
  }


}


  // Joy.add({
  //   type: "number-with-modal",
  //   tags: ["ui"],
  //   initWidget: function(){
  //     let o = this.options;
  
  //     let slider = new NumberSlider({
  //       min: o.min,
  //       max: o.max,
  //       step: o.step,
  //       value: this.getData("value"),
  //       onstart: () => {
  //         this.top.activePreview = this;
  //       },
  //       onstop: () => {
  //         this.top.activePreview = null;
  //       },
  //       onchange: (value) => {
  //         this.setData("value", value);
  //       },
  //     });
  //     this.dom = slider.dom;
  
  //     // PREVIEW ON HOVER. WIGGLE IT JUST ONCE.
      
  //     let _ticker = null;
  //     let _fps = 30;
  //     this.dom.onmouseenter = () => {
  
  //       if(!this.top.canPreview("numbers")) return;
        
  //       // Create Preview Data
  //       this.previewData = _clone(this.data);
  
  //       // Wiggle by 5%... as long as that's not less than 0.5, not more than 2.
  //       let _amplitude = Math.abs(this.data.value*0.05);
  //       //if(_amplitude<0.5) _amplitude=0.5; // TODO: WITH SIGFIG
  //       //if(_amplitude>3) _amplitude=3;
  //       if(_amplitude==0) _amplitude=1; // If it's EXACTLY zero, wiggle with 1, whatever.
  //       let _timer = 0;
  //       _ticker = setInterval(() => {
  
  //         if(!this.top.canPreview("numbers")) return _stopPreview(); // don't even
  
  //         _timer += (Math.PI*2/_fps)/0.25; // 0.25 seconds
  //         this.previewData.value = this.data.value + Math.sin(_timer)*_amplitude;
  //         this.update();
  
  //         if(_timer>Math.PI*2) _stopPreview(); // yer done, son.
  
  //       },1000/_fps);
  
  //     };
  //     let _stopPreview = () => {
  //       if(_ticker) clearInterval(_ticker);
  //       this.previewData = null;
  //       this.update();
  //     };
  //     this.dom.onmouseleave = _stopPreview;
  //   },
  //   onget: function(my) {
  //     return my.data.value;
  //   },
  //   placeholder: {
  //     value: 3
  //   }
  // });
  
  // export class NumberSlider extends JoyWidget {
  //   constructor(config) {
  //     super(config);
  
  //     this.sigfigs = 0;
  //     this.min = config.min;
  //     this.max = config.max;
  //     this.value = config.value;
  
  //     this.dom.onclick = () => this._showSliderModal();
  
  //     this.dom.className = "number-slider-widget";
  
  //     this._setLabel(this.value);
  //   }
  
  //   _setLabel(value) {
  //     this.dom.innerHTML = value.toFixed(this.sigfigs);
  //   }
  
  //   _onValueChange(value) {
  //     value = parseFloat(value.toFixed(this.sigfigs));
  //     this.config.onChange(value);
  //   }
  
  //   _showSliderModal() {
  //     new SliderModal({
  //       source: this.dom,
  //       position: this.position,
  //       onchange: (value) => {
  //         this.value = value;
  //       },
  //       min: this.min,
  //       max: this.max
  //     }).show();
  //   }
  // }
  






    // const colorButton = new ColorisButton({
    //   label: "&nbsp;",
    //   onclick: () => {
    //     new Coloris({
    //       closeButton: true,
    //       swatches: this.colorOptions,
    //       theme: 'polaroid',
    //       formatToggle: false,
    //       swatchesOnly: true,
    //       alpha: false,
    //       defaultColor: this.colorOptions[0] || '#aabbcc',
    //       onChange: (color) => {
    //         this.dom.style.background = color;
    //         this.data.value = color;
    //         this.update();
    //       }
    //     });
    //   },
    //   styles:["joy-color", "color-palette-widget"]
    // });
    // this.dom = colorButton.dom;
    // this.dom.style.background = this.data.value;


    // hiddenInput.addEventListener('click', () => {
    //   this.colorisInstance = Coloris({
    //     closeButton: true,
    //     swatches: this.colorOptions,
    //     theme: 'polaroid',
    //     formatToggle: false,
    //     swatchesOnly: true,
    //     alpha: false,
    //     defaultColor: this.colorOptions[0] || '#aabbcc',
    //     onChange: (color) => {
    //       this.dom.style.background = color;
    //       this.data.value = color;
    //       this.update();
    //     }
    //   });
    // });
    // this.dom = colorButton;

    // let colorButton = new JoyButton({
    //   label: "&nbsp;",
    //   onclick: () => {
    //     // We create a ColorPalette, which in turn initializes coloris
    //     new ColorPalette({
    //       source: this.dom,
    //       value: this.getData("value"),
    //       colorOptionsHex: [ '#FAE7D0', '#FFCC99', '#FEB186', '#DFC183', '#CEAB69', '#B98865', '#AA724B', '#935D37', '#7B4B2A', '#C8ACA3', '#E8ACA3', '#E8CDA8', '#7B4B2A', '#483728', '#CAA661'],
    //       onchange: (value) => {
    //         this.setData("value", value);
    //         _changeLabelColor();
    //       },
    //       onopen: () => {
    //         this.top.activePreview = this;
    //       },
    //       onclose: () => {
    //         this.top.activePreview = null;
    //       }
    //     }).show();  // This should trigger the modal to show, and the color picker within it
    //   },
    //   styles:["joy-color"]
    // });
    // this.dom = colorButton.dom;

    // _changeLabelColor();

    // PREVIEW ON HOVER
    // BOUNCE the HSL Value up & down!
  //   let _ticker = null;
  //   let _fps = 30;
  //   let _initialV, _vel, _timer;
  //   this.dom.onmouseenter = () => {

  //     if(!this.top.canPreview("numbers")) return; // yeah let's pretend it's a number
      
  //     // Create Preview Data
  //     _initialV = this.data.value[2];
  //     this.previewData = _clone(this.data);

  //     // Bounce up & down for HALF a second
  //     _timer = 0;
  //     _vel = 2*(2/_fps);
  //     _ticker = setInterval(() =>{

  //       if(!this.top.canPreview("numbers")) return _stopPreview(); // don't

  //       // Bounce up & down
  //       let hsl = this.previewData.value;
  //       hsl[2] += _vel;
  //       if(hsl[2] > 1){
  //         hsl[2] = 1;
  //         _vel *= -1;
  //       }
  //       if(hsl[2] < 0){
  //         hsl[2] = 0;
  //         _vel *= -1;
  //       }
  //       this.update();

  //       // Done!
  //       _timer += 2/_fps;
  //       if(_timer>=1) _stopPreview();

  //     },1000/_fps);
  //   };
  //   let _stopPreview = () => {
  //     if(_ticker) clearInterval(_ticker);
  //     this.previewData = null;
  //     this.update();
  //   };
  //   this.dom.onmouseleave = _stopPreview;




// export class ColorPalette extends BaseModal {
//   constructor(config) {
//     super(config);

//     this.WHEEL_SIZE = 150;
//     this.SPECTRUM_WIDTH = 15;
//     this.MARGIN_1 = 10;
//     this.MARGIN_2 = 10;
//     this.MARGIN_3 = 10;
  
//     this.FULL_WIDTH = this.MARGIN_1+this.WHEEL_SIZE+this.MARGIN_2+this.SPECTRUM_WIDTH+this.MARGIN_3;
//     this.FULL_HEIGHT = this.MARGIN_1+this.WHEEL_SIZE+this.MARGIN_3;

//     // COLOR is RGB.
//     config.value = config.value || [0,1,1];
//     this.h = config.value[0];
//     this.s = config.value[1];
//     this.v = config.value[2];

//     this.colorOptionsRGB = this.config.colorOptionsHex.map(_hexToRGB);
//     this.segment = 0;

//     this.dom = this._createDOM();
//     this._attachEvents();
//   }

//   _createDOM() {
//     const dom = document.createElement("div");
//     dom.className = "joy-modal-color";

//     // Add the color wheel, spectrum and picker here...
//     this.wheelCanvas = this._createColorWheel(dom, this.colorOptionsRGB);
//     this.spectrumCanvas = this._createValueSpectrum(dom);
//     this.pickerCanvas = this._createColorPickers(dom, this.wheelCanvas, this.spectrumCanvas);

//     return dom;
//   }

//   _createColorWheel(dom) {

//     // THREE ELEMENTS:
//     // 1. Color Wheel
//     // 2. Color Value
//     // 3. Color Pickers

//     dom.style.width = this.FULL_WIDTH + "px";
//     dom.style.height = this.FULL_HEIGHT + "px";

//     /////////////////////////////
//     // 1) The Color Wheel ///////
//     /////////////////////////////

//     let wheelCanvas = document.createElement("canvas");
//     wheelCanvas.id = "skintone-color-wheel";
//     wheelCanvas.width = this.WHEEL_SIZE*2;
//     wheelCanvas.height = this.WHEEL_SIZE*2;
//     wheelCanvas.style.width = wheelCanvas.width/2 + "px";
//     wheelCanvas.style.height = wheelCanvas.height/2 + "px";
//     dom.appendChild(wheelCanvas);

//     wheelCanvas.style.top = this.MARGIN_1 + "px";
//     wheelCanvas.style.left = this.MARGIN_1 + "px";

//     this._updateWheel(wheelCanvas, this.colorOptionsRGB);
//     return wheelCanvas;
//   }

//   _updateWheel(wheelCanvas, colorOptionsRGB) {
//     let ctx = wheelCanvas.getContext("2d");
//     ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
//     let w = wheelCanvas.width;
//     let h = wheelCanvas.height;
//     let image = ctx.createImageData(w,h);
//     let imageData = image.data;

//     let cx = w/2;
//     let cy = h/2;
//     let radius = w/2;

//     let numColors = colorOptionsRGB.length;

//     for(let x=0; x<w; x++){
//       for(let y=0; y<h; y++){
//         let dx = x-cx;
//         let dy = y-cy;
//         let distance = Math.sqrt(dx*dx+dy*dy);
//         if(distance < radius){
//           let angle = Math.atan2(dy,dx) + Math.PI; // [0, 2*PI]
//           let segment = Math.floor(angle / (2 * Math.PI / numColors));
//           let color = colorOptionsRGB[segment % numColors];
//           let i = (x + (y*w))*4;
//           imageData[i] = color[0];
//           imageData[i+1] = color[1];
//           imageData[i+2] = color[2];
//           imageData[i+3] = 255;
//         }
//       }
//     }
//     ctx.putImageData(image, 0, 0);

//     // Clip it, for aliasing
//     ctx.save();
//     ctx.globalCompositeOperation = "destination-in";
//     ctx.beginPath();
//     ctx.fillStyle = "#fff";
//     ctx.arc(cx,cy,radius,0,2*Math.PI);
//     ctx.fill();
//     ctx.restore();
//   }

//     /////////////////////////////
//     // 2) The Value Spectrum ////
//     /////////////////////////////
//   _createValueSpectrum(dom) {

//     let spectrumCanvas = document.createElement("canvas");
//     spectrumCanvas.id = "joy-color-value";
//     spectrumCanvas.width = this.SPECTRUM_WIDTH*2;
//     spectrumCanvas.height = this.WHEEL_SIZE*2;
//     spectrumCanvas.style.width = spectrumCanvas.width/2 + "px";
//     spectrumCanvas.style.height = spectrumCanvas.height/2 + "px";
//     dom.appendChild(spectrumCanvas);

//     spectrumCanvas.style.top = this.MARGIN_1 + "px";
//     spectrumCanvas.style.right = this.MARGIN_3 + "px";

//     this._updateSpectrum(spectrumCanvas);
//     return spectrumCanvas;
//   }

//   _updateSpectrum (spectrumCanvas) {
//     // Image data
//     let ctx = spectrumCanvas.getContext("2d");
//     ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
//     let w = spectrumCanvas.width;
//     let h = spectrumCanvas.height;
//     let image = ctx.createImageData(w,h);
//     let imageData = image.data;

//     // Just a good ol' spectrum of values
//     for(let x=0; x<w; x++){
//       for(let y=0; y<h; y++){

//         // HSV! (capitals, coz already using 'h')
//         let H = this.h;
//         let S = this.s;
//         let V = 1-(y/h);

//         // TO RGB
//         let rgb = _HSVtoRGB(H,S,V);
//         let i = (x + (y*w))*4;
//         imageData[i] = rgb[0];
//         imageData[i+1] = rgb[1];
//         imageData[i+2] = rgb[2];
//         imageData[i+3] = 255;

//       }
//     }
//     ctx.putImageData(image, 0, 0);
//   }

//     /////////////////////////////
//     // 3) The Color Pickers /////
//     /////////////////////////////

//   _createColorPickers(dom, wheelCanvas, spectrumCanvas) {
//     let pickerCanvas = document.createElement("canvas");
//     this.pickerCanvas = pickerCanvas;
//     pickerCanvas.id = "joy-color-picker";
//     pickerCanvas.width = this.FULL_WIDTH*2;
//     pickerCanvas.height = this.FULL_HEIGHT*2;
//     pickerCanvas.style.width = pickerCanvas.width/2 + "px";
//     pickerCanvas.style.height = pickerCanvas.height/2 + "px";
//     dom.appendChild(pickerCanvas);

//     this._updatePickers(pickerCanvas, wheelCanvas, spectrumCanvas);
//     return pickerCanvas;
//   }

//   _updatePickers(pickerCanvas, wheelCanvas, spectrumCanvas) {
//     let ctx = pickerCanvas.getContext("2d");
//     ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
//     let baseColor = this.colorOptionsRGB[this.segment];
//     console.log(baseColor);
//     ctx.fillStyle = `rgb(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]})`;

//     ctx.strokeStyle = "#fff";
//     ctx.lineWidth = 2;

//     // Draw it on the circle
//     let cx = this.MARGIN_1*2 + wheelCanvas.width / 2;
//     let cy = this.MARGIN_1*2 + wheelCanvas.height / 2;
//     let segmentAngle = (2 * Math.PI / this.colorOptionsRGB.length) * this.segment;
//     let angle = segmentAngle - Math.PI / 2; // Subtracting PI/2 to start from the top
//     let radius = this.intensity * (wheelCanvas.width / 2);
//     let x = cx + Math.cos(angle) * radius;
//     let y = cy + Math.sin(angle) * radius;
//     ctx.beginPath();
//     ctx.arc(x, y, this.SPECTRUM_WIDTH, 0, 2 * Math.PI);
//     ctx.fill();
//     ctx.stroke();

// }

// _updateHS(x, y) {
//   let radius = this.wheelCanvas.width / 2;
//   let dx = x - radius;
//   let dy = y - radius;
//   let angle = Math.atan2(dy, dx) + Math.PI;

//   let segmentCount = this.colorOptionsRGB.length;
//   this.segment = Math.floor(angle / (2 * Math.PI / segmentCount));
  
//   this.intensity = Math.min(Math.max(Math.sqrt(dx*dx+dy*dy) / radius, 0), 1);

//   this._updateSpectrum(this.spectrumCanvas);
//   this._updatePickers(this.pickerCanvas, this.wheelCanvas, this.spectrumCanvas);
// }


// //   _updateHS(x,y) {
// //     // get polar
// //     let radius = this.wheelCanvas.width/2;
// //     let dx = x - radius;
// //     let dy = y - radius;
// //     let angle = Math.atan2(dy, dx) + Math.PI; // Adjusting to [0, 2*PI]
    
// //     let segmentCount = this.colorOptionsRGB.length;
// //     let segment = Math.floor(angle / (2 * Math.PI / segmentCount));
    
// //     // Assume hue is evenly distributed based on segmentCount and segment position
// //     let hueSegmentWidth = 360 / segmentCount;
// //     this.h = segment * hueSegmentWidth;
    
// //     let distance = Math.sqrt(dx*dx+dy*dy);
// //     distance = (distance/radius); // to [0,1]
// //     if(distance<0) distance=0;
// //     if(distance>1) distance=1;
    
// //     this.s = distance;

// //     this._updateSpectrum(this.spectrumCanvas);
// //     this._updatePickers(this.pickerCanvas, this.wheelCanvas, this.spectrumCanvas);
// // }

//   _updateV(x,y) {
//       this.v = 1-(y/this.spectrumCanvas.height);
//       if(this.v<0) this.v=0;
//       if(this.v>1) this.v=1;
//       this._updateWheel(this.wheelCanvas, this.colorOptionsRGB);
//       this._updatePickers(this.pickerCanvas, this.wheelCanvas, this.spectrumCanvas);
//   }

//   _getCurrentRGB() {
//     let baseColor = this.colorOptionsRGB[this.segment];
//     return [
//         Math.round(baseColor[0] * this.intensity),
//         Math.round(baseColor[1] * this.intensity),
//         Math.round(baseColor[2] * this.intensity)
//     ];
//   }

//   _onmousedown(event) {
//     this.isDragging = true;
//     if(event.offsetX*2 < this.MARGIN_1*2 + this.wheelCanvas.width + this.MARGIN_2){
//       this.editMode = "hs";
//     }else{
//       this.editMode = "v";
//     }
//     this._update(event);
//   }

//   _onmousemove(event) {
//     if(this.isDragging) this._update(event);
//   }

//   _onmouseup() {
//     this.isDragging = false;
//   }

//   _update(event) {

//     if(event.target!=this.pickerCanvas) return; // if outta bounds forget it

//     let x = event.offsetX*2;
//     let y = event.offsetY*2;
//     if(this.editMode=="hs"){
//       x -= this.MARGIN_1*2;
//       y -= this.MARGIN_1*2;
//       this._updateHS(x,y);
//     }else{
//       x -= this.MARGIN_1*2 + this.wheelCanvas.width + this.MARGIN_2*2;
//       y -= this.MARGIN_1*2;
//       this._updateV(x,y);
//     }

//     // HEY TELL THE SOURCE
//     this._updateSource();
//   }

//   // // UPDATE SOURCE
//   // _updateSource() {
//   //   // let newValue = [this.h, this.s, this.v];
//   //   // newValue[0] = parseFloat(newValue[0].toFixed(0));
//   //   // newValue[1] = parseFloat(newValue[1].toFixed(2));
//   //   // newValue[2] = parseFloat(newValue[2].toFixed(2));
//   //   let rgbValue = this._getCurrentRGB();

//   //   this.config.onchange(rgbValue);
//   // }


//   _updateSource() {
//       let rgbValue = this._getCurrentRGB();
//       this.config.onchange(rgbValue);
//   }

//   // MOUSE EVENTS
//   _attachEvents() {
//     // THE MOUSE EVENTS FOR THE PICKERS
//     this.editMode = "";
//     this.isDragging = false;
  
//     this.dom.addEventListener("mousedown", this._onmousedown.bind(this));
//     window.addEventListener("mousemove", this._onmousemove.bind(this));
//     window.addEventListener("mouseup", this._onmouseup.bind(this));
//   }

//   _detachEvents() {
//     // remove listeners
//     this.dom.removeEventListener("mousedown", this._onmousedown);
//     window.removeEventListener("mousemove", this._onmousemove);
//     window.removeEventListener("mouseup", this._onmouseup);
//   }

//   kill() {
//     this._detachEvents();

//     // Hide Modal
//     super.kill();
//   }
// }


// constructor(config) {
//   super(config);
//   this.categories = {};
//   const _placeholder_ = "_placeholder_";

//   this.dom.className = "joy-modal-chooser";
  
//   let list = document.createElement("div");
//   this.dom.appendChild(list);

//   this.options = config.options;

//   // Private method to make a category
//   const makeCategory = (category) => {
//       let categoryDOM = document.createElement("div");
//       list.appendChild(categoryDOM);
//       this.categories[category] = categoryDOM;
//   };

//   // Create categories, if any!
//   for(let option of this.options) {
//       const category = option.category;
//       if(category) {
//           if(!this.categories[category]) {
//               makeCategory(category);
//           }
//       } else {
//           if(!this.categories[_placeholder_]) {
//               makeCategory(_placeholder_);
//           }
//       }
//   }

//   // Create options
//   for(let option of this.options) {
//       let optionDOM = document.createElement("div");
//       optionDOM.innerHTML = option.label;
//       if(option.color) {
//           optionDOM.style.color = option.color;
//       }

//       // Put it in its category!
//       const category = option.category || _placeholder_;
//       this.categories[category].appendChild(optionDOM);

//       // On Click!
//       optionDOM.onclick = (event) => {
//         this.onchange(option.value);
//         event.stopPropagation(); // no, don't double-fire
//       };
//   }
// }

// onchange(value) {
//   this.kill();
//   if (typeof this.config.onchange === "function") {
//     this.config.onchange(value); // after closing the modal, since this can create another modal
//   }
// }

// kill() {
//   super.kill();
// }