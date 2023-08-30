/*****************

JOY.js: make happy little programs

VERSION 0 (the incredibly clunky first version) (sorry)

Created by Nicky Case http://ncase.me/

*****************/
import { 
  _generateUID,
  _forceToArray,
  _clone,
  _getParameterByName,
  _configure,
  _insertTextAtCursor,
  _selectAll,
  _unselectAll,
  _fixStringInput,
  _blurOnEnter,
  _preventWeirdCopyPaste,
  _forceToRGB
} from './joy-utils.js';

import { Modal } from './joy-modal.js';

import WatchJS from 'melanke-watchjs';

class Joy extends Actor {

  static templates = [];
  static modules = {};

  constructor(options) {
      // Modules to import?
      if(options.modules) {
          options.modules.forEach(module => Joy.loadModule(module));
      }

      // this.rootActor = new Actor({
      //   init: options.init,
      //   data: options.data,
      //   onupdate: options.onupdate
      // });
      super(options);

      initReferences(this.rootActor); // set up reference list for any synchronized actors

      // Allow previewing of... actions, numbers, variables?
      this.previewActions = this.previewActions === undefined ? true : this.previewActions;
      this.previewNumbers = this.previewNumbers === undefined ? true : this.previewNumbers;
      this.activePreview = null;

      // And: automatically create MY widget!
      this.createWidget();

      // Append my dom to container specified by HTML element or CSS selector
      if(this.container) {
          if(typeof this.container === "string") 
              this.container = document.body.querySelector(this.container);
          this.container.appendChild(rootActor.dom);
      }

      // Initialize UI & Modal
      this._initUI();
      this.modal = new Modal();

      // Update!
      this.onupdate = this.onupdate || function(my) {};
      this.update();
  }

  canPreview(type) {
      type = type.charAt(0).toUpperCase() + type.slice(1);
      const allowed = this["preview" + type];
      return allowed && !this.activePreview;
  }

  update() {
      const my = {
          actor: this,
          data: {}
      };

      // Try to pre-evaluate all data beforehand!
      if(this.children) {
          this.children.forEach(childActor => {
              const dataID = childActor.dataID;
              if(dataID) {
                  const value = childActor.get();
                  my.data[dataID] = value;
              }
          });

          // Aliases to all children too, though
          this.children.forEach(child => {
              if(child.id) my[child.id] = child;
          });
      }

      // On Update!
      this.onupdate(my);
  }

  _initUI() {
    // CSS
    this.dom.classList.add("joy-master");

    // Manual Scroll (to prevent it propagating up...)
    this.container.addEventListener('wheel', this.handleScroll.bind(this));

    // Prevent accidental backspace-history
    document.body.addEventListener('keydown', this.preventBackspaceNavigation.bind(this));
  }

  // Manual Scroll (to prevent it propagating up...)
  handleScroll(event) {
      const delta = event.deltaY;
      this.container.scrollTop += delta;
      event.preventDefault();
      return false;
  }

  // Prevent accidental backspace-history
  // because why the heck is this even a thing, jeez.
  // thx: https://stackoverflow.com/a/2768256
  preventBackspaceNavigation(event) {
    if(event.keyCode === 8) {
      let doPrevent = true;
      const types = ["text", "password", "file", "search", "email", "number", "date", "color", "datetime", "datetime-local", "month", "range", "search", "tel", "time", "url", "week"];
      const d = event.srcElement || event.target;
      const disabled = d.getAttribute("readonly") || d.getAttribute("disabled");
      
      if (!disabled) {
        if (d.isContentEditable) {
            doPrevent = false;
        } else if (d.tagName.toUpperCase() === "INPUT") {
            let type = d.getAttribute("type");
            if (type) {
                type = type.toLowerCase();
            }
            if (types.includes(type)) {
                doPrevent = false;
            }
        } else if (d.tagName.toUpperCase() === "TEXTAREA") {
            doPrevent = false;
        }
     }
     if (doPrevent) {
        event.preventDefault();
        return false;
     }
    }
  }

  /*****************

  ACTOR TEMPLATES that future Actors can be made from! Looks like this:

  Joy.add({
    name: "Turn turtle", // what the Actions Widget calls it
    type: "turtle/turn", // what it's called in Actor & Data
    tags: ["turtle", "action"], // meta tags
    init: "Turn {id:'angle', type:'number', placeholder:10} degrees", // for init'ing actor & widget
    onact: function(my){
      my.target.turn(my.data.angle);
    }
  });

  *****************/

  // Add a new template to the list of actor templates.
  static add(template) {
      this.templates.push(template);
  }

  // Retrieve an actor template by its unique type.
  // eg. "number", "color", "turtle/forward"
  static getTemplateByType(type) {
      const template = this.templates.find(temp => temp.type === type);
      if (!template) throw Error(`No actor template of type '${type}'!`);
      return template;
  }

  // Retrieve all actor templates that match a specific tag.
  // eg. "action", "turtle"
  static getTemplatesByTag(tag) {
      return this.templates.filter(template => template.tags.includes(tag));
  }

  // Modify an existing actor template, either update or rename it
  static modify(type, renameOrCallback, callback = null) {
      const oldTemplate = this.getTemplateByType(type);
      const newTemplate = {...oldTemplate};  // Shallow copy using spread operator

      if (typeof renameOrCallback === "string") {
          oldTemplate.type = renameOrCallback;
          if (callback) {
              Object.assign(newTemplate, callback(oldTemplate));
          }
      } else {
          Object.assign(newTemplate, renameOrCallback(oldTemplate));
          const index = this.templates.indexOf(oldTemplate);
          if (index !== -1) {
              this.templates.splice(index, 1);  // Remove the old template
          }
      }
      this.add(newTemplate);  // Add the modified/new template
  }

  /*****************

  JOY MODULES

  So that a player can slowly step up the staircase of complexity
  (also maybe import Actors in the future?)

  *****************/

  // Registers a new module with a specified ID.
  static module(id, callback) {
    this.modules[id] = callback;
  }

  // Loads and executes a module by its ID.
  static loadModule(id) {
    const module = this.modules[id];
    if (!module) throw new Error(`There's no module called '${id}'!`);
    module();
  }

  /******************************

  SAVE & LOAD

  No need for a server!
  Just compresses JSON with LZ-String and puts it in the URL

  ******************************/

  static saveToURL = function(data) {
    var json = JSON.stringify(data); // Stringify
    var compressed = LZString.compressToEncodedURIComponent(json); // Compress
    var url = window.location.origin+window.location.pathname+"?data="+compressed; // append to current URL
    // TODO: keep # and OTHER query stuff the same, just change ?data
    return url;
  };

  static loadFromURL = function() {
    var hash = _getParameterByName("data");
    var decompressed = LZString.decompressFromEncodedURIComponent(hash);
    if(decompressed){
      var data = JSON.parse(decompressed);
      return data;
    }else{
      return null;
    }
  };
}

/**** ACTORS ***

ACTORS help the Player, Editor & Data talk to each other.

To create an Actor, you need to pass it a "options" object like so:
(ALL the parameters are optional, btw)
{
  id: "steps", // by default, this is actorID AND dataID
  dataID: "steps", // ONLY if actorID=/=dataID. (e.g. two actors modify same data)
  type: "number", // what Actor Template to inherit from, if any
  placeholder: 50 // if no data, what should be the placeholder?
}

*****************/

class Actor {

  constructor(options, parent, data) {
    this._class_ = "Actor";
    this.options = options;
    this.parent = parent;
    this.top = this.parent ? this.parent.top : this;  // if no parent, I'M top dog.
    this.previewData = null;
    
    // If an actor type is provided in options, fetch the corresponding template
    // and configure this actor based on that template
    this.type = options.type;
    if (this.type) {
      let actorTemplate = Joy.getTemplateByType(this.type);
      _configure(actorTemplate);
    }
    // Now configure the actor with any additional options provided
    _configure(this.options);

    this.children = []; // Children actors, if any
    this.dom = null;  // The DOM representation of this actor. Initialized later in "createWidget"
    this._myEditLock = false;

    this._initData();

    // If there's an initialization method or string provided, use it.
    // This allows for custom setup logic when the actor is created.
    if(this.init){
      // If the init is a string, use it as an initialization script
      if(typeof this.init==="string") Joy.initializeWithString(self, self.init);
      // If the init is a function, call it and pass the current actor as the argument
      if(typeof this.init==="function") self.init(self);
    }

    // WATCH DATA
    WatchJS.watch(this.data, _onDataChange);
  }

  _initData() {
    /////////////////////////////////
    // ACTOR <-> DATA: //////////////
    /////////////////////////////////

    // If placeholder is undefined, set it to an empty object
    if (this.placeholder === undefined) {
      this.placeholder = {};
    }

    // If placeholder is a function, run it!
    if (typeof this.placeholder === "function") {
        this.placeholder = this.placeholder();
    }

    // Ensure the placeholder is an object or array
    // If it's not an object or array, convert it to an object with a 'value' property
    if (typeof this.placeholder !== "object" || Array.isArray(this.placeholder)) {
        this.placeholder = {
            value: _clone(this.placeholder)
        };
    }

    // // If data type not already specified, set it to the actor's type
    if (!this.placeholder.type) {
        this.placeholder.type = this.type;
    }

    // If you didn't already pass in a data object, let's figure it out!
    // Use the provided data or fall back to the actor's current data property
    this.data = this.data || data;

    // If still no data, determine where the data should come from
    if (!this.data) {
      let parent = this.parent;
      let dataID = this.dataID;

      // If the actor has a parent and a data ID
      if (parent && dataID) {
          // If the parent doesn't already have data for this actor's data ID, use the placeholder
          if (!parent.data[dataID]) {
              parent.data[dataID] = _clone(this.placeholder);
          }

          // Set the actor's data to the relevant part of the parent's data
          this.data = parent.data[dataID];
      } else {
          // If the actor doesn't have a parent or data ID, it's standalone data
          this.data = _clone(this.placeholder);
      }
    }
  }

  // Initializes the actor with a given markup string
  initializeWithString(markup) {
    const actorOptions = [];
    let html = markup;

    // Extract actor options from the markup
    html = this._extractActorOptions(html, actorOptions);

    // Initialize child actors from extracted options.
    actorOptions.forEach((actorOption) => this.addChild(actorOption));

    // Create and initialize the widget.
    this._initializeWidgetFromMarkup(html);
  }

  // Extracts actor options from the given markup
  _extractActorOptions(markup, actorOptions) {
    let html = markup;

    // Split the markup into Actor Options & Widget HTML
    let startIndex = -1;
    let endIndex = -1;
    let stack = 0;
    // Go through each character. When you find a top-level "{...}" JSON string,
    // 1) parse it into an Actor Option
    // 2) replace it in the markup with a <span> saying where its widget should go
    for(var i=0; i<html.length; i++){
      var character = html[i];

      // ONLY the top-level {...}'s...
      if(stack==0 && character=="{") startIndex=i;
      if(character=="{") stack++;
      if(character=="}") stack--;
      if(stack==0 && character=="}"){
        endIndex = i+1;

        // Cut out start to end, save as JSON & replace markup with <span>
        var json = html.slice(startIndex, endIndex);
        json = json.replace(/(\w+)\:/g,"'$1':"); // cleanup: give nameerties quotes
        json = json.replace(/\'/g,'"'); // cleanup: replace ' with "
        json = JSON.parse(json);
        json.dataID = json.dataID || json.id; // cleanup: dataID=id by default
        actorOptions.push(json); // remember option!
        html = html.substr(0, startIndex)
            + "<span id='widget_"+json.id+"'></span>"
            + html.substr(endIndex); // replace markup

        // GO BACK TO THE BEGINNING & START OVER
        // because i'm too lazy to calculate where the index should go now
        i=0;
        startIndex = -1;
        endIndex = -1;
        stack = 0;
      }
    }
    return html;
  }

  // Initializes the actor's widget using the processed markup.
  _initializeWidgetFromMarkup(html) {
      this.dom = document.createElement("span");
      this.dom.innerHTML = html;

      this.children.forEach((child) => {
        child.createWidget();
        const selector = "#widget_" + child.id;
        const span = this.dom.querySelector(selector);
        this.dom.replaceChild(child.dom, span);
      });
  }

  addChild(child, data) {
    if (child._class_ !== "Actor") child = new Actor(child, this, data);
    this.children.push(child);
    if (child.id) this[child.id] = child;
    return child;
  }

  removeChild(child) {
    this.children = this.children.filter(c => c !== child);
    child.kill();
  }

  update() {
    if (this.onupdate) this.onupdate(this);
    if (this.parent) this.parent.update();
  }

  kill() {
    // Remove my DOM, if any.
    if (this.dom && this.dom.parentNode) this.dom.parentNode.removeChild(this.dom);

    // Un-watch my data
    WatchJS.unwatch(this.data, this._onDataChange);
    
    // Kill all child nodes, too
    while (this.children.length > 0) {
      this.removeChild(this.children[0]);
    }
    // On Kill?
    if (this.onkill) this.onkill(this);
  }

  // Get & Set!
  getData(dataID) {
    return this.data[dataID];
  }

  setData(dataID, newValue, noUpdate) {
    this._myEditLock = true;
    
    if (newValue === undefined) {
      delete this.data[dataID];
    } else {
      this.data[dataID] = newValue;
    }
    
    setTimeout(() => { this._myEditLock = false; }, 1);
    if (!noUpdate) this.update();
  }

  switchData(newData) {
    WatchJS.unwatch(this.data, this._onDataChange);
    this.data = newData;
    WatchJS.watch(this.data, this._onDataChange);
    if (this.onDataChange) this.onDataChange(newData);
  }

  /////////////////////////////////
  // ACTOR <-> EDITOR: "WIDGETS" //
  /////////////////////////////////

  // virtual init widget - placeholder if not redefined
  initWidget() {
    this.dom = document.createElement("span");
    this.dom.innerHTML = `[todo: '${this.type}' widget]`;
  }

  createWidget() {
    this.initWidget();
    return this.dom;
  }

  /////////////////////////////////
  // ACTOR <-> PLAYER: "TARGETS" //
  /////////////////////////////////

  onact() {
    console.log("empty onact method!");
  }

  act(target, altData) {
    let data;
    // Determine which data to use:
    // - Use provided 'altData' if available.
    // - If not, check for 'previewData' (temporary or staging data).
    // - Default to (stored?) data if neither of the above is provided
    if (altData) {
      data = _clone(altData);
    } else if (this.previewData) {
      data = _clone(this.previewData);
    } else {
      data = _clone(this.data); // existing data if no new or preview data?
    }

    // Pre-evaluate data using child actors:
    // - Iterate through all child actors of the current object.
    // - For each child actor with a 'dataID' property, retrieve a value based on the target.
    // - Update the main 'data' object with the retrieved value.
    this.children.forEach(childActor => {
      const dataID = childActor.dataID;
      if (dataID) {
        const value = childActor.get(target);
        data[dataID] = value;
      }
    });

    // Call onact with current actor, target, and data
    return this.onact({
      actor: this,
      target: target,
      data: data
    });
  }

  // ...or GET INFO from targets.
  onget() {
    console.log("empty onget method!");
  }

  get(target) {
    const data = this.previewData ? this.previewData : this.data;
    const clonedData = this._clone(data);

    return this.onget({
      actor: this,
      target: target,
      data: clonedData
    });
  }

  _onDataChange(attr, op, newValue, oldValue) {
    if (this._myEditLock) return;
    if (this.onDataChange) this.onDataChange();
  }
}


/******************************

GETTING & SETTING REFERENCES FROM TOP.DATA

This is so you can sync variables, functions, strings, object names, etc.

Each reference should have: Unique ID, Tag, Data, Watchers
// (when Watchers[].length==0, delete that reference. Garbage day)


Refactor notes: Right now the root actor keeps track of the list of references
and other specific actors (variables) create new references to be managed
by the root actor. I'm not sure if all actors need to keep the ability to have
their own list of references, or if this is something that should go only in the
Joy class (the part that's not an actor) (that all actors should be able to use?)
Maybe actors with locally scoped variables will need to keep their own list of
references, eg. a for loop actor with an index variable.

I think actor.top.data always references the main root actor right now, which 
is how the child actors can access/modify it themselves.

Leaving it all here for now.

******************************/

// Function to initialize references (for synchronized actors)
initReferences(actor) {
      // Create if not already
    let topdata = actor.top.data;
    if(!topdata._references) topdata._references={};

    // Zero out all connected, it's a brand new world.
    for(let id in topdata._references){
      let ref = topdata._references[id];
      ref.connected = 0;
  }

createReference = function(actor, tags, data){
  // The reference
  let topdata = actor.top.data;
  let reference = {
    id: _generateUID(topdata._references),
    tags: _forceToArray(tags),
    data: data,
    connected: 0 // tracks how many actors this thing actually depends on
  };
  topdata._references[reference.id] = reference;

  // Gimme
  return reference;
};

getReferenceById = function(actor, refID){
  let topdata = actor.top.data;
  return topdata._references[refID];
};

getReferencesByTag = function(actor, tag){
  let topdata = actor.top.data;
  let refs = [];
  for(let id in topdata._references){
    let ref = topdata._references[id];
    if(ref.tags.indexOf(tag)>=0) refs.push(ref);
  }
  return refs;
};

connectReference = function(actor, refID){
  let ref = getReferenceById(actor, refID);
  ref.connected++;
};

disconnectReference = function(actor, refID){
  let ref = getReferenceById(actor, refID);
  ref.connected--;
  if(ref.connected==0) deleteReference(actor, refID);
};

deleteReference = function(actor, refID){
  let topdata = actor.top.data;
  let reference = topdata._references[refID];
  delete topdata._references[refID];
};

/****************

A widget for paths!

Widget Options:
{name:'name', type:'path', color:"whatever"}

****************/
Joy.add({
  type: "path",
  tags: ["ui"],
  initWidget: function(self){

    // String *IS* DOM
    var o = self.options;
    self.pathUI = new PathUI({
      prefix: o.prefix,
      suffix: o.suffix,
      color: o.color, 
      value: self.getData("value"),
      onchange: function(value){
        self.setData("value", value);
      }
    });
    self.dom = self.pathUI.dom;

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
  placeholder: "???"
});

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
  initWidget: function(self){

    // Scrubber IS the DOM
    var o = self.options;
    var scrubber = new Joy.ui.Scrubber({
      min: o.min,
      max: o.max,
      step: o.step,
      value: self.getData("value"),
      onstart: function(){
        self.top.activePreview = self;
      },
      onstop: function(){
        self.top.activePreview = null;
      },
      onchange: function(value){
        self.setData("value", value);
      }
    });
    self.dom = scrubber.dom;

    // PREVIEW ON HOVER. WIGGLE IT JUST ONCE.
    
    var _ticker = null;
    var _fps = 30;
    self.dom.onmouseenter = function(){

      if(!self.top.canPreview("numbers")) return;
      
      // Create Preview Data
      self.previewData = _clone(self.data);

      // Wiggle by 5%... as long as that's not less than 0.5, not more than 2.
      var _amplitude = Math.abs(self.data.value*0.05);
      //if(_amplitude<0.5) _amplitude=0.5; // TODO: WITH SIGFIG
      //if(_amplitude>3) _amplitude=3;
      if(_amplitude==0) _amplitude=1; // If it's EXACTLY zero, wiggle with 1, whatever.
      var _timer = 0;
      _ticker = setInterval(function(){

        if(!self.top.canPreview("numbers")) return _stopPreview(); // don't even

        _timer += (Math.TAU/_fps)/0.25; // 0.25 seconds
        self.previewData.value = self.data.value + Math.sin(_timer)*_amplitude;
        self.update();

        if(_timer>Math.TAU) _stopPreview(); // yer done, son.

      },1000/_fps);

    };
    var _stopPreview = function(){
      if(_ticker) clearInterval(_ticker);
      self.previewData = null;
      self.update();
    };
    self.dom.onmouseleave = _stopPreview;
    

  },
  onget: function(my){
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
  initWidget: function(self){

    // Color Button IS the DOM
    var colorButton = new Joy.ui.Button({
      label: "&nbsp;",
      onclick: function(){

        Joy.modal.Color({ // TODO: precision for those floats, y'know
          source: self.dom,
          value: self.getData("value"),
          onchange: function(value){
            self.setData("value", value);
            _changeLabelColor();
          },
          onopen: function(){
            self.top.activePreview = self;
          },
          onclose: function(){
            self.top.activePreview = null;
          }
        });

      },
      styles:["joy-color"]
    });
    self.dom = colorButton.dom;

    // Change button color!
    var _changeLabelColor = function(){
      var hsl = self.getData("value");
      colorButton.dom.style.background = _HSVToRGBString(hsl);
    };
    _changeLabelColor();

    // PREVIEW ON HOVER
    // BOUNCE the HSL Value up & down!
    var _ticker = null;
    var _fps = 30;
    var _initialV, _vel, _timer;
    self.dom.onmouseenter = function(){

      if(!self.top.canPreview("numbers")) return; // yeah let's pretend it's a number
      
      // Create Preview Data
      _initialV = self.data.value[2];
      self.previewData = _clone(self.data);

      // Bounce up & down for HALF a second
      _timer = 0;
      _vel = 2*(2/_fps);
      _ticker = setInterval(function(){

        if(!self.top.canPreview("numbers")) return _stopPreview(); // don't

        // Bounce up & down
        var hsl = self.previewData.value;
        hsl[2] += _vel;
        if(hsl[2] > 1){
          hsl[2] = 1;
          _vel *= -1;
        }
        if(hsl[2] < 0){
          hsl[2] = 0;
          _vel *= -1;
        }
        self.update();

        // Done!
        _timer += 2/_fps;
        if(_timer>=1) _stopPreview();

      },1000/_fps);
    };
    var _stopPreview = function(){
      if(_ticker) clearInterval(_ticker);
      self.previewData = null;
      self.update();
    };
    self.dom.onmouseleave = _stopPreview;

  },
  onget: function(my){
    return _HSVToRGBString(my.data.value);
  },
  placeholder: function(){
    var hue = Math.floor(Math.random()*360); // Random color!
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
  initWidget: function(self){

    var data = self.data;

    // Options
    var options = self.options;
    for(var i=0; i<options.length; i++){

      // convert to label/value if not already
      var o = options[i];
      if(!(o.label!==undefined && o.value!==undefined)){
        options[i] = {
          label: o.toString(),
          value: o
        };
      }

    }

    // ChooserButton *IS* DOM
    var chooserButton = new Joy.ui.ChooserButton({
      value: data.value,
      options: options,
      onchange: function(value){
        data.value = value;
        self.update(); // you oughta know!
      },
      styles: self.styles
    });
    self.dom = chooserButton.dom;

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
  initWidget: function(self){

    // String *IS* DOM
    var o = self.options;
    self.stringUI = new Joy.ui.String({
      prefix: o.prefix,
      suffix: o.suffix,
      color: o.color, 
      value: self.getData("value"),
      onchange: function(value){
        self.setData("value", value);
      }
    });
    self.dom = self.stringUI.dom;

    // When data's changed, externally
    self.onDataChange = function(){
      var value = self.getData("value");
      self.stringUI.setString(value);
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
  initWidget: function(self){

    // DOM
    var dom = document.createElement("div");
    dom.className = "joy-save";
    self.dom = dom;
    
    // Save Button
    self.saveButton = new Joy.ui.Button({
      label: "save:",
      onclick: function(){
        
        var url = Joy.saveToURL(self.top.data);
        self.url.setValue(url);
        self.url.select();

        // info
        var chars = url.length;
        self.info.innerHTML = "P.S: you can shorten your link with <a href='http://tinyurl.com/' target='_blank'>TinyURL</a>!"

      }
    });
    dom.appendChild(self.saveButton.dom);

    // URL TextBox
    self.url = new Joy.ui.TextBox({
      readonly: true
    });
    dom.appendChild(self.url.dom);

    // Details: chars & tinyurl link
    self.info = document.createElement("div");
    self.info.id = "joy-save-info";
    dom.appendChild(self.info);    

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
Joy.add({
  type: "actions",
  tags: ["ui"],
  init: function(self){

    if(self.resetVariables!==undefined) self.data.resetVariables=self.resetVariables;

    // TODO: ACTUALLY REFACTOR
    // TODO: Separate out Actor code from Widget code
    // so that this can run EVEN WITHOUT WIDGETS.
    // Using messages, probably.

  },
  initWidget: function(self){

    var data = self.data;
    var actions = data.actions;

    // DOM
    var dom = document.createElement("div");
    dom.className = "joy-actions";
    self.dom = dom;

    // List
    var list = document.createElement("list");
    // list.id = "joylist"; //NF TODO: make this a class or unique id because there can be more than one list
    list.classList.add('joy-list');
    list.id = self.id + "-joy-list";
    dom.appendChild(list);

    // Preview Variables?
    /*var varPreview;
    if(self.top.canPreview("variables")){
      varPreview = document.createElement("div");
      varPreview.id = "joy-variables-preview";
      varPreview.innerHTML = "AHHHH";
      dom.appendChild(varPreview);
    }*/

    //////////////////////////////////////////
    // Create Bullet /////////////////////////
    //////////////////////////////////////////

    var bulletOptions = [
      {label:"Add action above", value:"action_above"},
      {label:"Add action below", value:"action_below"},
      {label:"Delete", value:"delete"}
    ];
    var _onBulletChoice = function(entry, choice){

      // ACTION ABOVE or BELOW
      var newActionWhere = 0;
      if(choice=="action_above") newActionWhere=-1; // above
      if(choice=="action_below") newActionWhere=1; // below
      if(newActionWhere!=0){ // not NOT new action
        
        var newEntryIndex = self.entries.indexOf(entry);
        if(newActionWhere>0) newEntryIndex+=1;

        // Chooser Modal!
        Joy.modal.Chooser({
          position: "left",
          source: entry.bullet.dom,
          options: actionOptions,
          onchange: function(value){
            _addAction(value, newEntryIndex);
            self.update(); // You oughta know!
            _updateBullets(); // update the UI, re-number it.
          }
        });

      }

      // DELETE
      if(choice=="delete"){
        _removeFromArray(self.entries, entry); // Delete entry from Entries[]
        _removeFromArray(actions, entry.actionData); // Delete action from Data's Actions[]
        self.removeChild(entry.actor); // Delete actor from Children[]
        list.removeChild(entry.dom); // Delete entry from DOM
        self.update(); // You oughta know!
        _updateBullets(); // update the UI, re-number it.
      }

    };
    var _createBullet = function(entry){
    
      var bullet = new Joy.ui.ChooserButton({
        position: "left",
        staticLabel: _getBulletLabel(entry),
        options: bulletOptions,
        onchange: function(choice){
          _onBulletChoice(entry, choice);
        },
        styles: ["joy-bullet"]
      });
      bullet.dom.id = "joy-bullet";

      return bullet;

    };

    // Get the digit (or letter, or roman) for this bullet...
    var _getBulletLabel = function(entry){

      // What index am I?
      var index = self.entries.indexOf(entry)+1;

      // How many levels deep in "actions" am I?
      var levelsDeep = 0;
      var parent = self.parent;
      while(parent){
        if(parent.type=="actions") levelsDeep++;
        parent = parent.parent;
      }

      // Digit, Letter, or Roman? (Cycle around)
      var label;
      switch(levelsDeep%3){
        case 0: label=index; break; // digits
        case 1: label=_numberToAlphabet(index); break; // letter
        case 2: label=_numberToRoman(index); break; // roman
      }

      return label;

    };

    // Re-number ALL these bad boys
    var _updateBullets = function(){
      for(var i=0; i<self.entries.length; i++){
        var entry = self.entries[i];
        var bullet = entry.bullet;
        var label = _getBulletLabel(entry);
        bullet.setLabel(label);
      }
    };

    ////////////////////////////////////////////////////////////////////
    // Add Entry: Entries have a Bullet (the number) & actual widget! //
    ////////////////////////////////////////////////////////////////////

    self.entries = [];
    var _addEntry = function(actionData, atIndex){

      // New entry
      var entry = {};
      var entryDOM = document.createElement("div");
      entryDOM.classList.add('joy-list-item');
      if(atIndex===undefined) atIndex = self.entries.length;

      // If entries selected, insert after last selected entry
      // if (self.entries.some(function(entry) { return entry.selected; })) {
      //   // Find the index of the last selected entry
      //   var lastSelectedIndex = self.entries.reduce(function(index, entry, currentIndex) {
      //     return entry.selected ? currentIndex : index;
      //   }, -1);
    
      //   atIndex = lastSelectedIndex + 1;

      //   console.log("selected index to add entry", atIndex);
      // }
      self.entries.splice(atIndex, 0, entry);
      list.insertBefore(entryDOM, list.children[atIndex]);

      // The Bullet is a Chooser!
      var bullet = _createBullet(entry);
      var bulletContainer = document.createElement("div");
      bulletContainer.id = "joy-bullet-container";
      entryDOM.appendChild(bulletContainer);
      bulletContainer.appendChild(bullet.dom);

      // New Actor!
      var newActor = self.addChild({type:actionData.type}, actionData);

      // The Widget
      var newWidget = newActor.createWidget();
      newWidget.id = "joy-widget";
      entryDOM.appendChild(newWidget);

      // (Remember all this)
      entry.dom = entryDOM;
      entry.bullet = bullet;
      entry.actor = newActor;
      entry.widget = newWidget;
      entry.actionData = actionData;
      entry.selected = false;

      // PREVIEW ON HOVER
      // Also tell the action "_PREVIEW": how far in the action to go?
      var _calculatePreviewParam = function(event){
        var param = event.offsetY / bullet.dom.getBoundingClientRect().height;
        if(param<0) param=0;
        if(param>1) param=1;
        _previewAction._PREVIEW = param;
        self.update();
      };
      var _previewAction;
      var _previewStyle;
      bulletContainer.onmouseenter = function(event){

        if(!self.top.canPreview("actions")) return;

        self.top.activePreview = self;
        
        // Create Preview Data
        self.previewData = _clone(self.data);
        var actionIndex = self.entries.indexOf(entry);
        _previewAction = self.previewData.actions[actionIndex];

        // STOP after that action!
        self.previewData.actions.splice(actionIndex+1, 0, {STOP:true});

        // How far to go along action?
        _calculatePreviewParam(event);

        // Add in a style
        _previewStyle = document.createElement("style");
        document.head.appendChild(_previewStyle);
        _previewStyle.sheet.insertRule('.joy-actions.joy-previewing > #joy-list > div:nth-child(n+'+(actionIndex+2)+') { opacity:0.1; }');
        _previewStyle.sheet.insertRule('.joy-actions.joy-previewing > div.joy-bullet { opacity:0.1; }');
        dom.classList.add("joy-previewing");

      };
      bulletContainer.onmousemove = function(event){
        if(self.previewData) _calculatePreviewParam(event);
      };
      bulletContainer.onmouseleave = function(){
        if(self.previewData){
          self.previewData = null;
          self.top.activePreview = null;
          self.update();
          document.head.removeChild(_previewStyle);
          dom.classList.remove("joy-previewing");
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
    for(var i=0;i<actions.length;i++) _addEntry(actions[i]);

    // ///////////////////////////////////////
    // // Reorder Entries - NF added /////////
    // ///////////////////////////////////////
    self.moveEntry = function(oldIndex, newIndex) {
      var item = self.entries.splice(oldIndex, 1)[0];
      self.entries.splice(newIndex, 0, item);
      self.update();
      _updateBullets();
    }

    ///////////////////////////////////////
    // Add Action /////////////////////////
    ///////////////////////////////////////

    // Manually add New Action To Actions + Widgets + DOM
    var _addAction = function(actorType, atIndex, data={}){ //FG added data
      // Create that new entry & everything
      console.log("data in joy: " + data);
      var newAction = {type:actorType, ...data};
      if(atIndex===undefined){
        actions.push(newAction);
      }else{
        actions.splice(atIndex, 0, newAction);
      }
      var entry = _addEntry(newAction, atIndex);

      // Focus on that entry's widget!
      // entry.widget.focus();
    };
    self.addAction = _addAction; //FG added

    // Actions you can add:
    // TODO: INCLUDE ALIASED ACTIONS
    var actionOptions = [];

    //TODO: refactor into functions

    if(self.onlyActions){ //get a specific list of types
      for(var i=0;i<self.onlyActions.length;i++){
        var actionType = self.onlyActions[i];
        var actorTemplate = Joy.getTemplateByType(actionType);
        var notActionTag = actorTemplate.tags.filter(function(tag){
          return tag!="action"; // first tag that's NOT "action" (so that actions categorized in the chooser menu based on their secondary tag)
        })[0];
        actionOptions.push({
          label: actorTemplate.name,
          value: actionType,
          category: notActionTag
        });
      }
    }else{ //find anything tagged action
      var actionActors = Joy.getTemplatesByTag("action");
      for(var i=0;i<actionActors.length;i++){
        var actionActor = actionActors[i];
        var notActionTag = actionActor.tags.filter(function(tag){
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
    var modules = self.modules || [];
    var moduleOptions = [];
    modules.forEach((module) => {
      var moduleActors = Joy.getTemplatesByTag(module);
      moduleActors.forEach((moduleActor) => {
        var notActionTag = moduleActor.tags.filter(function(tag){
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
    var addButton = new Joy.ui.ChooserButton({
      staticLabel: "+",
      options: actionOptions,
      onchange: function(value){
        _addAction(value);
        self.update(); // You oughta know!
      },
      styles: ["joy-bullet"]
    });
    dom.appendChild(addButton.dom);

  },
  onact: function(my){

    // Create _vars, if not already there
    if(!my.target._variables) my.target._variables={}; 

    // Reset all of target's variables?
    if(my.data.resetVariables) my.target._variables = {};

    // Do those actions, baby!!!
    for(var i=0; i<my.data.actions.length; i++){

      // Stop?
      var actionData = my.data.actions[i];
      if(actionData.STOP) return "STOP";

      // Run 
      var actor = my.actor.entries[i].actor; // TODO: THIS IS A HACK AND SHOULD NOT RELY ON THAT
      var actorMessage = actor.act(my.target, actionData); // use ol' actor, but GIVEN data.
      if(actorMessage=="STOP") return actorMessage;

    }

  },
  placeholder: {
    actions: [],
    resetVariables: true
  }
});
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

  /*Joy.add({
    name: "If... then...",
    type: "instructions/if",
    tags: ["instructions", "action"],
    init: "If AHHH, then: "+
        "{id:'actions', type:'actions', resetVariables:false}",
    onact: function(my){
      var message = my.actor.actions.act(my.target);
      if(message=="STOP") return message; // STOP
    }
  });*/

  Joy.add({
    name: "// Write a note",
    type: "instructions/comment",
    tags: ["instructions", "action"],
    initWidget: function(self){

      // DOM
      self.dom = document.createElement("div");

      // Comment Box
      self.box = new Joy.ui.TextBox({
        multiline: true,
        placeholder: "// your notes here",
        value: self.getData("value"),
        onchange: function(value){
          self.setData("value", value);
        },
        styles: ["box"]
      });
      self.dom.appendChild(self.box.dom);

    }
  });

});
// VARIABLE NAME: you're just a synchronized string, yo.
Joy.add({
  type: "variableName",
  tags: ["ui"],
  init: function(self){

    var variableType = self.variableType;

    // Unique Variable Name
    var _uniqueVariableName = function(){
      var varnames = Joy.getReferencesByTag(self, variableType).map(function(ref){
        return ref.data.value;
      });
      var highestCount=0;
      varnames.forEach(function(varname){
        var num;
        if(varname=="thing") num=1; // at least 1
        var match = varname.match(/thing\s(\d+)/);
        if(match) num = parseInt(match[1]); // or more
        if(highestCount<num) highestCount=num;
      });
      if(highestCount==0) return "thing";
      else return "thing "+(highestCount+1);
    };

    // Create Reference method
    self._createNewReference = function(){
      var refData = {
        value: _uniqueVariableName(),
        color: _randomHSV()
      };
      var ref = Joy.createReference(self, variableType, refData);
      self.setData("refID", ref.id, true); // Remember Ref ID. And DON'T update.
      Joy.connectReference(self, ref.id); // connect new ref
    };

    // Do I already have a reference? Create one if no.
    var refID = self.getData("refID");
    if(refID){
      Joy.connectReference(self, refID); // connect this ref
    }else{

      // Well, first try seeing if there are any vars.
      // If so, connect to most recently created one
      var varReferences = Joy.getReferencesByTag(self, variableType);
      // CONFIG: self.startWithExisting!
      if(self.startWithExisting && varReferences.length>0){
        var latestReference = varReferences[varReferences.length-1];
        refID = latestReference.id;
        self.setData("refID", refID, true); // set data
        Joy.connectReference(self, refID); // connect this ref
      }else{
        // Otherwise, make a new one!
        self._createNewReference();
      }
      
    }

    // Switch reference 
    self._switchReference = function(newRefID){
      var refID = self.getData("refID");
      Joy.disconnectReference(self, refID); // disconnect old ref
      self.setData("refID", newRefID); // DO update this!
      Joy.connectReference(self, newRefID); // connect new ref
    };

  },
  initWidget: function(self){

    self.dom = document.createElement("span");
    
    // The String edits my REFERENCE'S data.
    var refID = self.getData("refID");
    var refData = Joy.getReferenceById(self, refID).data;
    var stringActor = self.addChild({
      type: "string",
      prefix:"[", suffix:"]",
      color: refData.color
    }, refData);
    var stringWidget = stringActor.createWidget();
    self.dom.appendChild(stringWidget);

    // This String Actor also updates its color
    var _old_stringActor_onDataChange = stringActor.onDataChange;
    stringActor.onDataChange = function(){
      _old_stringActor_onDataChange();
      var color = stringActor.getData("color");
      stringActor.stringUI.setColor(color);
    };

    // Chooser? Can choose to switch to other variables (or make new one)
    var variableType = self.variableType;
    var _showChooser = function(){

      var options = [];

      // Get all references that are of this type
      var refs = Joy.getReferencesByTag(self, variableType);
      var myRefID = self.getData("refID");
      refs.forEach(function(ref){
        if(ref.id==myRefID) return; // don't show SELF
        var color = ref.data.color;
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
        source: self.dom,
        options: options,
        onchange: function(newRefID){

          if(newRefID=="CHANGE_COLOR"){

            // Just change color, ha.
            Joy.modal.Color({
              source: self.dom,
              value: stringActor.getData("color"),
              onchange: function(newColor){
                stringActor.setData("color", newColor);
                stringActor.stringUI.setColor(newColor); // do this again coz edit lock
              }
            });

          }else{

            // Make a new reference? Either way, set refID
            if(newRefID=="NEW"){
              var oldRefID = self.getData("refID");
              Joy.disconnectReference(self, oldRefID); // disconnect old ref
              self._createNewReference();
              self.update(); // update, yo
            }else{
              self._switchReference(newRefID);
            }

            // Make String Widget edit that instead
            var refID = self.getData("refID");
            var ref = Joy.getReferenceById(self, refID);
            stringActor.switchData(ref.data);

          }

        }
      });

    };

    // Show ON CLICK!
    if(!self.noChooser){
      self.dom.onclick = _showChooser;
    }
    
  },
  onget: function(my){
    var refID = my.data.refID;
    var ref = Joy.getReferenceById(my.actor, refID);
    return ref.data.value; // returns the variable name
  },
  onkill: function(self){
    
    // Disconnect any references I may have
    var refID = self.getData("refID");
    Joy.disconnectReference(self, refID); // disconnect old ref

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
      init: function(self){

        // no variables?
        if(self.noVariables) return;

        // Force data to a chain...
        var originalValue = self.getData("value");
        if(typeof originalValue==="number"){
          self.setData("value",undefined,true); // delete "value", no update
          self.setData("chain",[
            {type:"number_raw", value:originalValue}
          ],true); // create "chain", no update
        }

        // MAKE A NEW CHAIN ACTOR *AND DATA(?)*
        self._makeNewChainActor = function(chainItem, atIndex){

          // Make it
          var chainActor;
          var type = chainItem.type;
          var options = {};
          var isFirst = (atIndex === undefined) ? (self.chainActors.length == 0) : (atIndex == 0); 
          if (isFirst && self.options !== undefined) {
            options.min = self.options.min;
            options.max = self.options.max;
          }
          switch(type){

            // Elements
            case "number_raw":
              chainActor = self.addChild({type:type, ...options}, chainItem);
              break;
            case "variableName":
              chainActor = self.addChild({
                type: type,
                variableType: 'number',
                noChooser: true
              }, chainItem);
              break;

            // Operand
            case "choose":
              chainActor = self.addChild({
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
          var chain = self.getData("chain");
          if(atIndex!==undefined){
            self.chainActors.splice(atIndex, 0, chainActor);
            chain.splice(atIndex, 0, chainItem);
          }else{
            self.chainActors.push(chainActor);
            chain.push(chainItem);
          }

          // Return
          return chainActor;

        }

        // Create an actor for each element in the chain
        self.chainActors = []; // keep a chain parallel to children. this one's in ORDER.
        var realChain = self.getData("chain");
        var chain = _clone(realChain);
        realChain.splice(0, realChain.length); // empty out realChain
        for(var i=0; i<chain.length; i++){
          self._makeNewChainActor(chain[i]);
        }

        // REPLACE A CHAIN ACTOR *AND DATA*
        self._replaceChainActor = function(oldChainActor, newItem){

          // Delete old actor, and add new actor where it was
          var oldIndex = self._deleteChainActor(oldChainActor);
          var newChainActor = self._makeNewChainActor(newItem, oldIndex);

          // update manually!
          self.update();

          // Return
          return newChainActor;

        };

        // DELETE A CHAIN ACTOR *AND DATA*
        self._deleteChainActor = function(chainActor){

          // Delete actor
          var oldIndex = self.chainActors.indexOf(chainActor);
          _removeFromArray(self.chainActors, chainActor);
          self.removeChild(chainActor);

          // and data!
          var chain = self.getData("chain");
          chain.splice(oldIndex, 1);

           // so can re-use index
          return oldIndex;

        };

      },
      initWidget: function(self){

        // no variables?
        if(self.noVariables){
          _old.initWidget(self);
          return;
        }

        // Container!
        self.dom = document.createElement("span");
        self.dom.className = "joy-number";

        // Show Chooser!
        var _showChooser = function(chainActor){

          var options = [];

          // Show placeholder number (unless i'm a number_raw, or there isn't one)
          if(chainActor.type!="number_raw"){
            var placeholderNumber = self.placeholder.value;
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
          var refs = Joy.getReferencesByTag(self, "number");
          var myRefID;
          if(chainActor.type=="variableName") myRefID=chainActor.getData("refID");
          refs.forEach(function(ref){
            if(ref.id==myRefID) return; // don't show SELF
            var color = ref.data.color;
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
              onchange: function(newItem){
                // REPLACE CHAIN ACTOR & ENTRY
                var newChainActor = self._replaceChainActor(chainActor, newItem);
                self._replaceChainEntry(chainActor, newChainActor);
              }
            });
          }

        };

        // THE WAY TO ORGANIZE THIS: ENTRIES that have DOM *and* ACTOR
        self._chainEntries = [];

        // MAKE CHAIN ENTRY
        self._makeChainEntry = function(chainActor, atIndex){

          // Widget
          var widget = document.createElement("span");
          chainActor.createWidget();
          widget.appendChild(chainActor.dom);

          // Widget chooser, if NOT an operand
          if(chainActor.type!="choose"){
            var entry;
            var moreButton = new Joy.ui.Button({
              onclick: function(){
                _showChainOptions(entry);
              },
              styles: ["joy-more"]
            });
            widget.appendChild(moreButton.dom);
          }

          // Place in widget
          if(atIndex!==undefined){
            if(atIndex < self.dom.childNodes.length){
              // replacing NOT at last child...
              var beforeThisWidget = self.dom.childNodes[atIndex];
              self.dom.insertBefore(widget, beforeThisWidget);
            }else{
              // Otherwise just append
              self.dom.appendChild(widget);
            }
          }else{
            self.dom.appendChild(widget);
          }

          // If it's NOT an operand, clicking it reveals options
          if(chainActor.type!="choose"){
            (function(ca){
              // HACK: click, NOT scrub. detect w/ time frame
              var _mouseDownTime;
              ca.dom.addEventListener("mousedown", function(){
                _mouseDownTime = +(new Date());
              });
              ca.dom.addEventListener("mouseup", function(){
                var _time = +(new Date());
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
            self._chainEntries.splice(atIndex, 0, entry);
          }else{
            self._chainEntries.push(entry);
          }

        };

        // DELETE CHAIN ENTRY
        self._deleteChainEntry = function(chainActor){

          // Get index (so can return later)
          var entry = self._chainEntries.find(function(entry){
            return entry.actor == chainActor;
          });
          var index = self._chainEntries.indexOf(entry);

          // Delete widget & entry (actor's already been deleted)
          var widget = entry.widget;
          self.dom.removeChild(widget);
          _removeFromArray(self._chainEntries, entry);

          // Index?
          return index;

        };

        // REPLACE CHAIN ENTRY
        self._replaceChainEntry = function(oldChainActor, newChainActor){
          var oldIndex = self._deleteChainEntry(oldChainActor);          
          self._makeChainEntry(newChainActor, oldIndex);
        };

        // SHOW CHAIN OPTIONS
        var _showChainOptions = function(entry){

          // Possible operands
          var currentLabel = entry.widget.innerText;
          var options = [
            {label:currentLabel+" + 2", value:"+"},
            {label:currentLabel+" - 2", value:"-"},
            {label:currentLabel+" &times; 2", value:"*"},
            {label:currentLabel+" &divide; 2", value:"/"}
          ];

          // To delete... which operand?
          var elementIndex = self._chainEntries.indexOf(entry);
          if(self._chainEntries.length>1){ // can't delete if just one
            
            // The operand...
            var operandIndex;
            if(elementIndex==0) operandIndex=elementIndex+1; // first
            else operandIndex=elementIndex-1; // not

            // Label
            var label;
            var operandLabel = self._chainEntries[operandIndex].widget.innerText;
            if(elementIndex==0) label = currentLabel+" "+operandLabel; // first
            else label = operandLabel+" "+currentLabel; // not

            // Indices to delete
            var indicesToDelete = [elementIndex, operandIndex].sort(); // increasing order

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
            onchange: function(operand){

              // It's an operand...
              if(typeof operand==="string"){

                // Get index of the actor...
                var index = self._chainEntries.indexOf(entry);

                // Make the OPERAND actor(+data) & entry
                index++;
                var operandActor = self._makeNewChainActor({type:"choose", value:operand}, index);
                self._makeChainEntry(operandActor, index);

                // Make the NUMBER actor(+data) & entry (just the number 2, why hot)
                index++;
                var numberActor = self._makeNewChainActor({type:"number_raw", value:2}, index);
                self._makeChainEntry(numberActor, index);

              }else{

                // Otherwise, DELETE ACTOR & ENTRY!
                var indices = operand;
                for(var i=indices.length-1; i>=0; i--){ // flip around coz DELETING
                  var indexToDelete = indices[i];
                  var actorToDelete = self._chainEntries[indexToDelete].actor;
                  self._deleteChainActor(actorToDelete);
                  self._deleteChainEntry(actorToDelete);
                }

              }

              // Update!
              self.update();

            }
          });

        };

        // For each chain actor, put in that entry
        for(var i=0; i<self.chainActors.length; i++){
          var chainActor = self.chainActors[i];
          self._makeChainEntry(chainActor);
        }

      },
      onget: function(my){

        // no variables?
        if(my.actor.noVariables){
          return _old.onget(my);
        }

        ////////////////

        var nums_and_ops = []; // just gets chain of nums & ops

        // EVALUATE EACH ELEMENT FIRST
        for(var i=0; i<my.data.chain.length; i+=2){

          // Synched indices!
          var chainActor = my.actor.chainActors[i]; 

          // Evaluate element
          var num;
          switch(chainActor.type){
            case "number_raw":
              num = chainActor.get(my.target);
              break;
            case "variableName":
              var _variables = my.target._variables;
              var varname = chainActor.get(my.target); // it's just a synchronized string
              num = _variables[varname];
              break; 
          }

          // Any operator before it?
          if(i>0){
            var operandActor = my.actor.chainActors[i-1];
            var op = operandActor.get();
            nums_and_ops.push(op);
          }

          // Push num
          nums_and_ops.push(num);

        }

        // MULTIPLICATION AND DIVISION FIRST. LEFT-ASSOCIATIVE
        for(var i=1; i<nums_and_ops.length; i+=2){

          var op = nums_and_ops[i];
          if(op=="*" || op=="/"){

            // Do math to the two numbers
            var num1 = nums_and_ops[i-1];
            var num2 = nums_and_ops[i+1];
            var res;
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
        for(var i=1; i<nums_and_ops.length; i+=2){

          var op = nums_and_ops[i];
          if(op=="+" || op=="-"){

            // Do math to the two numbers
            var num1 = nums_and_ops[i-1];
            var num2 = nums_and_ops[i+1];
            var res;
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
      var _variables = my.target._variables;
      var varname = my.data.varname; // it's just a synchronized string
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

      var vars = my.target._variables;
      var varname = my.data.varname;
      if(vars[varname]===undefined) vars[varname]=0; // Set to 0, if nothing's there.

      switch(my.data.operation){
        case "+": vars[varname] += my.data.value; break;
        case "-": vars[varname] -= my.data.value; break;
        case "*": vars[varname] *= my.data.value; break;
        case "/": vars[varname] /= my.data.value; break;
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

      var value1 = my.data.value1;
      var value2 = my.data.value2;

      var result;
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
        var message = my.actor.actions.act(my.target);
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
      
      var probability = my.data.chance/100;
      if(Math.random() < probability){
        var message = my.actor.actions.act(my.target);
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

      var _variables = my.target._variables;
      var varname = my.data.varname; // it's just a synchronized string

      var _min = my.data.min;
      var _max = my.data.max;
      var min = Math.min(_min,_max); // just in case
      var max = Math.max(_min,_max); // just in case

      var randomValue;
      if(my.data.numtype=="integer"){
        randomValue = min + Math.floor( Math.random()*((max-min)+1) );
      }else{
        randomValue = min + (Math.random()*(max-min));
      }
      _variables[varname] = randomValue; // Set the variable

    }
  });

});

export default Joy;