/*****************

JOY.js: make happy little programs

Created by Nicky Case http://ncase.me/

Forked by @nataliefreed - 2023

*****************/
import { 
  _blurOnEnter,
  _clone,
  _configure,
  _fixStringInput,
  _forceToArray,
  _forceToRGB,
  _generateUID,
  _getParameterByName,
  _insertTextAtCursor,
  _preventWeirdCopyPaste,
  _selectAll,
  _unselectAll,
} from './joy-utils.js';

// import WatchJS from 'melanke-watchjs';
// import WatchJS from '../../libraries/watch.js';

export class Joy {

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

      this.rootActor = new Actor(options);

      initReferences(this.rootActor); // set up reference list to use for synchronized actors

      // Allow previewing of... actions, numbers, variables?
      this.previewActions = this.previewActions === undefined ? true : this.previewActions;
      this.previewNumbers = this.previewNumbers === undefined ? true : this.previewNumbers;
      this.activePreview = null;

      // And: automatically create MY widget!
      this.rootActor.createWidget();
      this.dom = this.rootActor.dom;

      this.rootActor.canPreview = (type) => {
        type = type.charAt(0).toUpperCase() + type.slice(1);
        const allowed = this["preview" + type];
        return allowed && !this.activePreview;
      }

      // Append my dom to container specified by HTML element or CSS selector
      if(options.container) {
          if(typeof options.container === "string") 
              this.container = document.body.querySelector(options.container);
          this.container.appendChild(this.dom);
          this.rootActor.container = this.container;
      }

      // Initialize UI & Modal
      this._initUI();

      // Update!
      this.onupdate = this.onupdate || function(my) {};
      this.update();

      console.log("data", this.data);
  }

  update() {
      const my = {
          actor: this.rootActor,
          data: {}
      };

      // Try to pre-evaluate all data beforehand!
      if(this.rootActor.children) {
        this.rootActor.children.forEach(childActor => {
              const dataID = childActor.dataID;
              if(dataID) {
                  const value = childActor.get();
                  my.data[dataID] = value;
              }
          });

          // Aliases to all children too, though
          this.rootActor.children.forEach(child => {
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
  // TODO check this - some issues with refactor
  static modify(type, renameOrCallback, callback = null) {
      const oldTemplate = this.getTemplateByType(type);
      const newTemplate = {...oldTemplate};  // Shallow copy using spread operator
      //should this be _configure(newTemplate, oldTemplate) ?

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
      _configure(this, actorTemplate);
    }
    // Now configure the actor with any additional options provided
    _configure(this, this.options);

    this.children = []; // Children actors, if any
    this.dom = null;  // The DOM representation of this actor. Initialized later in "createWidget"
    this._myEditLock = false;

    this._initData(data);

    // If there's an initialization method or string provided, use it.
    // This allows for custom setup logic when the actor is created.
    if(this.init){
      // If the init is a string, use it as an initialization script
      if(typeof this.init==="string") this.initializeWithString(this.init);
      // If the init is a function, call it and pass the current actor as the argument
      if(typeof this.init==="function") this.init();
    }

    // WATCH DATA
    watch(this.data, this._onDataChange);
  }

  _initData(data) {
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

    console.log("setting placeholder to ", this.placeholder);
    console.log("data is ", this.data);

  }

  // Initializes the actor with a given markup string
  initializeWithString(markup) {
    console.log("initializing with string", markup);
    
    const actorOptions = [];
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

    // Initialize child actors from extracted options
    actorOptions.forEach((actorOption) => {
      console.log("adding child actor", actorOption);
      this.addChild(actorOption);
    });

    // Create the actor's widget using the processed markup.
    this.createWidget = function() {

      this.dom = document.createElement("span");
      this.dom.innerHTML = html;
  
      // Replace all <spans> with childrens' widgets.
      this.children.forEach((child) => {
  
        // Make child create a widget!
        child.createWidget();
  
        // Replace <span> with child's widget
        let selector = "#widget_"+child.id;
        let span = this.dom.querySelector(selector);
        this.dom.replaceChild(child.dom, span);
      });

      return this.dom;
    };
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
    unwatch(this.data, this._onDataChange);
    
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
    unwatch(this.data, this._onDataChange);
    this.data = newData;
    watch(this.data, this._onDataChange);
    if (this.onDataChange) this.onDataChange(newData);
  }

  /////////////////////////////////
  // ACTOR <-> EDITOR: "WIDGETS" //
  /////////////////////////////////

  // init widget - placeholder if not redefined
  initWidget = this.initWidget || function() {
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
    // console.log("empty onget method!");
  }

  get(target) {
    const data = this.previewData ? this.previewData : this.data;
    const clonedData = _clone(data);

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
let initReferences = function(actor) {
  // Create if not already
  let topdata = actor.top.data;
  if(!topdata._references) topdata._references={};

  // Zero out all connected, it's a brand new world.
  for(let id in topdata._references){
    let ref = topdata._references[id];
    ref.connected = 0;
  }
}

let createReference = function(actor, tags, data){
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

let getReferenceById = function(actor, refID){
  let topdata = actor.top.data;
  return topdata._references[refID];
};

let getReferencesByTag = function(actor, tag){
  let topdata = actor.top.data;
  let refs = [];
  for(let id in topdata._references){
    let ref = topdata._references[id];
    if(ref.tags.indexOf(tag)>=0) refs.push(ref);
  }
  return refs;
};

let connectReference = function(actor, refID){
  let ref = getReferenceById(actor, refID);
  ref.connected++;
};

let disconnectReference = function(actor, refID){
  let ref = getReferenceById(actor, refID);
  ref.connected--;
  if(ref.connected==0) deleteReference(actor, refID);
};

let deleteReference = function(actor, refID){
  let topdata = actor.top.data;
  let reference = topdata._references[refID];
  delete topdata._references[refID];
};


/**
 * WATCH.JS - TODO: install as module, possible update
 * 
 * DEVELOPED BY
 * GIL LOPES BUENO
 * gilbueno.mail@gmail.com
 *
 * WORKS WITH:
 * IE8*, IE 9+, FF 4+, SF 5+, WebKit, CH 7+, OP 12+, BESEN, Rhino 1.7+
 * For IE8 (and other legacy browsers) WatchJS will use dirty checking  
 *
 * FORK:
 * https://github.com/melanke/Watch.JS
 *
 * LICENSE: MIT
 */
"use strict";!function(a){"object"==typeof exports?module.exports=a():"function"==typeof define&&define.amd?define(a):(window.WatchJS=a(),window.watch=window.WatchJS.watch,window.unwatch=window.WatchJS.unwatch,window.callWatchers=window.WatchJS.callWatchers)}(function(){function x(){w=null;for(var a=0;a<v.length;a++)v[a]();v.length=0}var a={noMore:!1,useDirtyCheck:!1},b=[],c=[],d=[],e=!1;try{e=Object.defineProperty&&Object.defineProperty({},"x",{})}catch(a){}var f=function(a){var b={};return a&&"[object Function]"==b.toString.call(a)},h=function(a){return"[object Array]"===Object.prototype.toString.call(a)},i=function(a){return"[object Object]"==={}.toString.apply(a)},j=function(a,b){var c=[],d=[];if("string"!=typeof a&&"string"!=typeof b){if(h(a)&&b)for(var e=0;e<a.length;e++)void 0===b[e]&&c.push(e);else for(var e in a)a.hasOwnProperty(e)&&b&&void 0===b[e]&&c.push(e);if(h(b)&&a)for(var f=0;f<b.length;f++)void 0===a[f]&&d.push(f);else for(var f in b)b.hasOwnProperty(f)&&a&&void 0===a[f]&&d.push(f)}return{added:c,removed:d}},k=function(a){if(null==a||"object"!=typeof a)return a;var b=a.constructor();for(var c in a)b[c]=a[c];return b},l=function(a,b,c,d){try{Object.observe(a,function(a){a.forEach(function(a){a.name===b&&d(a.object[a.name])})})}catch(e){try{Object.defineProperty(a,b,{get:c,set:function(a){d.call(this,a,!0)},enumerable:!0,configurable:!0})}catch(e){try{Object.prototype.__defineGetter__.call(a,b,c),Object.prototype.__defineSetter__.call(a,b,function(a){d.call(this,a,!0)})}catch(c){n(a,b,d)}}}},m=function(a,b,c){try{Object.defineProperty(a,b,{enumerable:!1,configurable:!0,writable:!1,value:c})}catch(d){a[b]=c}},n=function(a,b,d){c[c.length]={prop:b,object:a,orig:k(a[b]),callback:d}},o=function(){f(arguments[1])?p.apply(this,arguments):h(arguments[1])?q.apply(this,arguments):r.apply(this,arguments)},p=function(a,b,c,d){if("string"!=typeof a&&(a instanceof Object||h(a))){if(h(a)){if(D(a,"__watchall__",b,c),void 0===c||c>0)for(var f=0;f<a.length;f++)p(a[f],b,c,d)}else{var f,g=[];for(f in a)"$val"==f||!e&&"watchers"===f||Object.prototype.hasOwnProperty.call(a,f)&&g.push(f);q(a,g,b,c,d)}d&&R(a,"$$watchlengthsubjectroot",b,c)}},q=function(a,b,c,d,e){if("string"!=typeof a&&(a instanceof Object||h(a)))for(var f=0;f<b.length;f++){var g=b[f];r(a,g,c,d,e)}},r=function(a,b,c,d,e){"string"!=typeof a&&(a instanceof Object||h(a))&&(f(a[b])||(null!=a[b]&&(void 0===d||d>0)&&p(a[b],c,void 0!==d?d-1:d),D(a,b,c,d),e&&(void 0===d||d>0)&&R(a,b,c,d)))},s=function(){f(arguments[1])?t.apply(this,arguments):h(arguments[1])?u.apply(this,arguments):I.apply(this,arguments)},t=function(a,b){if(!(a instanceof String)&&(a instanceof Object||h(a)))if(h(a)){for(var c=["__watchall__"],d=0;d<a.length;d++)c.push(d);u(a,c,b)}else{var e=function(a){var c=[];for(var d in a)a.hasOwnProperty(d)&&(a[d]instanceof Object?e(a[d]):c.push(d));u(a,c,b)};e(a)}},u=function(a,b,c){for(var d in b)b.hasOwnProperty(d)&&I(a,b[d],c)},v=[],w=null,y=function(){return w||(w=setTimeout(x)),w},z=function(a){null==w&&y(),v[v.length]=a},A=function(){var a=f(arguments[2])?C:B;a.apply(this,arguments)},B=function(a,b,c,d){var i,e=null,f=-1,g=h(a),j=function(c,d,h,i){var j=y();if(f!==j&&(f=j,e={type:"update"},e.value=a,e.splices=null,z(function(){b.call(this,e),e=null})),g&&a===this&&null!==e){if("pop"===d||"shift"===d)h=[],i=[i];else if("push"===d||"unshift"===d)h=[h],i=[];else if("splice"!==d)return;e.splices||(e.splices=[]),e.splices[e.splices.length]={index:c,deleteCount:i?i.length:0,addedCount:h?h.length:0,added:h,deleted:i}}};i=1==c?void 0:0,p(a,j,i,d)},C=function(a,b,c,d,e){a&&b&&(r(a,b,function(a,b,f,g){var j={type:"update"};j.value=f,j.oldvalue=g,(d&&i(f)||h(f))&&B(f,c,d,e),c.call(this,j)},0),(d&&i(a[b])||h(a[b]))&&B(a[b],c,d,e))},D=function(b,c,d,e){var f=!1,g=h(b);b.watchers||(m(b,"watchers",{}),g&&H(b,function(a,d,f,g){if(N(b,a,d,f,g),0!==e&&f&&(i(f)||h(f))){var j,k,l,m,n=b.watchers[c];for((m=b.watchers.__watchall__)&&(n=n?n.concat(m):m),l=n?n.length:0,j=0;j<l;j++)if("splice"!==d)p(f,n[j],void 0===e?e:e-1);else for(k=0;k<f.length;k++)p(f[k],n[j],void 0===e?e:e-1)}})),b.watchers[c]||(b.watchers[c]=[],g||(f=!0));for(var j=0;j<b.watchers[c].length;j++)if(b.watchers[c][j]===d)return;if(b.watchers[c].push(d),f){var k=b[c],o=function(){return k},q=function(d,f){var g=k;if(k=d,0!==e&&b[c]&&(i(b[c])||h(b[c]))&&!b[c].watchers){var j,l=b.watchers[c].length;for(j=0;j<l;j++)p(b[c],b.watchers[c][j],void 0===e?e:e-1)}return K(b,c)?void L(b,c):void(a.noMore||g!==d&&(f?N(b,c,"set",d,g):E(b,c,"set",d,g),a.noMore=!1))};a.useDirtyCheck?n(b,c,q):l(b,c,o,q)}},E=function(a,b,c,d,e){if(void 0!==b){var f,g,h=a.watchers[b];(g=a.watchers.__watchall__)&&(h=h?h.concat(g):g),f=h?h.length:0;for(var i=0;i<f;i++)h[i].call(a,b,c,d,e)}else for(var b in a)a.hasOwnProperty(b)&&E(a,b,c,d,e)},F=["pop","push","reverse","shift","sort","slice","unshift","splice"],G=function(a,b,c,d){m(a,c,function(){var f,g,h,i,e=0;if("splice"===c){var j=arguments[0],k=j+arguments[1];for(h=a.slice(j,k),g=[],f=2;f<arguments.length;f++)g[f-2]=arguments[f];e=j}else g=arguments.length>0?arguments[0]:void 0;return i=b.apply(a,arguments),"slice"!==c&&("pop"===c?(h=i,e=a.length):"push"===c?e=a.length-1:"shift"===c?h=i:"unshift"!==c&&void 0===g&&(g=i),d.call(a,e,c,g,h)),i})},H=function(a,b){if(f(b)&&a&&!(a instanceof String)&&h(a))for(var d,c=F.length;c--;)d=F[c],G(a,a[d],d,b)},I=function(a,b,c){if(b){if(a.watchers[b])if(void 0===c)delete a.watchers[b];else for(var d=0;d<a.watchers[b].length;d++){var e=a.watchers[b][d];e==c&&a.watchers[b].splice(d,1)}}else delete a.watchers;S(a,b,c),T(a,b)},J=function(a,b){if(a.watchers){var c="__wjs_suspend__"+(void 0!==b?b:"");a.watchers[c]=!0}},K=function(a,b){return a.watchers&&(a.watchers.__wjs_suspend__||a.watchers["__wjs_suspend__"+b])},L=function(a,b){z(function(){delete a.watchers.__wjs_suspend__,delete a.watchers["__wjs_suspend__"+b]})},M=null,N=function(a,b,c,e,f){d[d.length]={obj:a,prop:b,mode:c,newval:e,oldval:f},null===M&&(M=setTimeout(O))},O=function(){var a=null;M=null;for(var b=0;b<d.length;b++)a=d[b],E(a.obj,a.prop,a.mode,a.newval,a.oldval);a&&(d=[],a=null)},P=function(){for(var a=0;a<b.length;a++){var d=b[a];if("$$watchlengthsubjectroot"===d.prop){var e=j(d.obj,d.actual);(e.added.length||e.removed.length)&&(e.added.length&&q(d.obj,e.added,d.watcher,d.level-1,!0),d.watcher.call(d.obj,"root","differentattr",e,d.actual)),d.actual=k(d.obj)}else{var e=j(d.obj[d.prop],d.actual);if(e.added.length||e.removed.length){if(e.added.length)for(var f=0;f<d.obj.watchers[d.prop].length;f++)q(d.obj[d.prop],e.added,d.obj.watchers[d.prop][f],d.level-1,!0);E(d.obj,d.prop,"differentattr",e,d.actual)}d.actual=k(d.obj[d.prop])}}var g,h;if(c.length>0)for(var a=0;a<c.length;a++)g=c[a],h=g.object[g.prop],Q(g.orig,h)||(g.orig=k(h),g.callback(h))},Q=function(a,b){var c,d=!0;if(a!==b)if(i(a)){for(c in a)if((e||"watchers"!==c)&&a[c]!==b[c]){d=!1;break}}else d=!1;return d},R=function(a,c,d,e){var f;f=k("$$watchlengthsubjectroot"===c?a:a[c]),b.push({obj:a,prop:c,actual:f,watcher:d,level:e})},S=function(a,c,d){for(var e=0;e<b.length;e++){var f=b[e];f.obj==a&&(c&&f.prop!=c||d&&f.watcher!=d||b.splice(e--,1))}},T=function(a,b){for(var d,e=0;e<c.length;e++){var f=c[e],g=f.object.watchers;d=f.object==a&&(!b||f.prop==b)&&g&&(!b||!g[b]||0==g[b].length),d&&c.splice(e--,1)}};return setInterval(P,50),a.watch=o,a.unwatch=s,a.callWatchers=E,a.suspend=J,a.onChange=A,a});var LZString=function(){function o(o,r){if(!t[o]){t[o]={};for(var n=0;n<o.length;n++)t[o][o.charAt(n)]=n}return t[o][r]}var r=String.fromCharCode,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",t={},i={compressToBase64:function(o){if(null==o)return"";var r=i._compress(o,6,function(o){return n.charAt(o)});switch(r.length%4){default:case 0:return r;case 1:return r+"===";case 2:return r+"==";case 3:return r+"="}},decompressFromBase64:function(r){return null==r?"":""==r?null:i._decompress(r.length,32,function(e){return o(n,r.charAt(e))})},compressToUTF16:function(o){return null==o?"":i._compress(o,15,function(o){return r(o+32)})+" "},decompressFromUTF16:function(o){return null==o?"":""==o?null:i._decompress(o.length,16384,function(r){return o.charCodeAt(r)-32})},compressToUint8Array:function(o){for(var r=i.compress(o),n=new Uint8Array(2*r.length),e=0,t=r.length;t>e;e++){var s=r.charCodeAt(e);n[2*e]=s>>>8,n[2*e+1]=s%256}return n},decompressFromUint8Array:function(o){if(null===o||void 0===o)return i.decompress(o);for(var n=new Array(o.length/2),e=0,t=n.length;t>e;e++)n[e]=256*o[2*e]+o[2*e+1];var s=[];return n.forEach(function(o){s.push(r(o))}),i.decompress(s.join(""))},compressToEncodedURIComponent:function(o){return null==o?"":i._compress(o,6,function(o){return e.charAt(o)})},decompressFromEncodedURIComponent:function(r){return null==r?"":""==r?null:(r=r.replace(/ /g,"+"),i._decompress(r.length,32,function(n){return o(e,r.charAt(n))}))},compress:function(o){return i._compress(o,16,function(o){return r(o)})},_compress:function(o,r,n){if(null==o)return"";var e,t,i,s={},p={},u="",c="",a="",l=2,f=3,h=2,d=[],m=0,v=0;for(i=0;i<o.length;i+=1)if(u=o.charAt(i),Object.prototype.hasOwnProperty.call(s,u)||(s[u]=f++,p[u]=!0),c=a+u,Object.prototype.hasOwnProperty.call(s,c))a=c;else{if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++),s[c]=f++,a=String(u)}if(""!==a){if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++)}for(t=2,e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;for(;;){if(m<<=1,v==r-1){d.push(n(m));break}v++}return d.join("")},decompress:function(o){return null==o?"":""==o?null:i._decompress(o.length,32768,function(r){return o.charCodeAt(r)})},_decompress:function(o,n,e){var t,i,s,p,u,c,a,l,f=[],h=4,d=4,m=3,v="",w=[],A={val:e(0),position:n,index:1};for(i=0;3>i;i+=1)f[i]=i;for(p=0,c=Math.pow(2,2),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(t=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 2:return""}for(f[3]=l,s=l,w.push(l);;){if(A.index>o)return"";for(p=0,c=Math.pow(2,m),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(l=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 2:return w.join("")}if(0==h&&(h=Math.pow(2,m),m++),f[l])v=f[l];else{if(l!==d)return null;v=s+s.charAt(0)}w.push(v),f[d++]=s+v.charAt(0),h--,s=v,0==h&&(h=Math.pow(2,m),m++)}}};return i}();"function"==typeof define&&define.amd?define(function(){return LZString}):"undefined"!=typeof module&&null!=module&&(module.exports=LZString);