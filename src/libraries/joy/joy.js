/*****************

JOY.js: make happy little programs

Created by Nicky Case http://ncase.me/

Forked by @nataliefreed - 2023

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

export class Joy extends Actor {

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
initReferences = function(actor) {
  // Create if not already
  let topdata = actor.top.data;
  if(!topdata._references) topdata._references={};

  // Zero out all connected, it's a brand new world.
  for(let id in topdata._references){
    let ref = topdata._references[id];
    ref.connected = 0;
  }
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