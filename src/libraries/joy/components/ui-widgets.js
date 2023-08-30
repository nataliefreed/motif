
import { ChooserModal } from './chooser-modal.js';

/********************
Button's config:
{
  label: "derp",
  onclick: function(){},
  styles: ["round", "hollow"] // optional
}
********************/

export class Button {
  
  constructor(config) {
    
    // Default the config object if it's not provided
    config = config || {};

    // Create the DOM element
    this.dom = document.createElement("div");
    this.dom.className = "joy-button";

    // Setting Label
    config.label = config.label || "";
    this.label = document.createElement("span");
    this.dom.appendChild(this.label);
    this.setLabel(config.label);

    // On Click
    this.dom.onclick = () => {
      if (config.onclick) {
        config.onclick();
      }
    };

    // Styles
    this.styles = config.styles || [];
    this.styles.forEach(style => {
      this.dom.classList.add(style);
    });
    
  }
  // Setter for label
  setLabel(newLabel) {
    this.label.innerHTML = newLabel;
  }
}


/********************
ChooserButton's config:
{
  value: [current value], (optional)
  staticLabel: "+", (optional)
  options: options,
  onchange: function(value){},
  position: "left" // optional: for the Joy.modal
  styles: ["round", "hollow"] // optional: for the button
}
********************/
export class ChooserButton {

  constructor(config) {
    this.value = config.value;
    this.options = config.options;
    this.onchange = config.onchange;

    // If no value provided, default to the first option's value
    if (!this.value && this.options.length > 0) {
      this.value = this.options[0].value;
    }

    // Initialize as a button with the provided label and click callback
    this.button = new Button({
      label: (config.staticLabel === undefined) ? "" : config.staticLabel,
      onclick: () => this.showChooser(config.position),
      styles: config.styles
    });

    // Update label
    this.updateLabel();
  }

  // Method to show the chooser modal
  showChooser(position) {
    Joy.modal.Chooser({
      source: this.button.dom,
      options: this.options,
      onchange: (value) => {
        // Update value & label
        this.value = value;
        this.updateLabel();
        // On Select callback
        if (this.onchange) {
          this.onchange(value);
        }
      },
      position: position
    });
  }

  // Helper method to update the button's label
  updateLabel() {
    if (this.button.config && this.button.config.staticLabel !== undefined) {
      return; // if static label, do not update.
    }

    // Otherwise, find the corresponding label to the current value & set to that.
    let matchingOption = this.options.find(pair => pair.value == this.value);
    if (matchingOption) {
      this.button.setLabel(matchingOption.label);
    }
  }
}

class ChooserButton extends Button {
  constructor(config) {
    const initialLabel = config.staticLabel !== undefined ? config.staticLabel : "";
    
    super({
        label: initialLabel,
        onclick: () => this.showChooserModal(),
        styles: config.styles
    });

    this.value = config.value || this.options[0].value;
    this.options = config.options;
    this.onchange = config.onchange;
    this.position = config.position;

    this.updateLabel();
}

showChooserModal() {
    new ChooserModal({
      source: this.dom,
      options: this.options,
      onchange: (value) => {
          this.value = value;
          this.updateLabel();
          if (typeof this.onchange === "function") {
            this.onchange(value);
          }
      },
      position: this.position
    }).show();
}

updateLabel() {
  if (this.config && this.config.staticLabel !== undefined) {
      return;
  }

  let matchingOption = this.options.find(pair => pair.value === this.value);
  if (matchingOption) {
    this.setLabel(matchingOption.label);
  }
  }
}


/********************
Scrubber's config:
{
  min: 0,
  max: 180,
  value: [current value],
  onchange: function(value){}
}
********************/
ui.Scrubber = function(config){

  var self = this;

  // Config...
  var min = config.min;
  var max = config.max;

  // console.log(config);

  self.value = config.value;

  // DOM
  var dom = document.createElement("div");
  dom.className = "joy-scrubber";
  self.dom = dom;

  // DOM *is* Label
  self.setLabel = function(newValue){
    dom.innerHTML = newValue.toFixed(self.sigfigs);
  };

  // On Value Change: make sure it's the right num of sigfigs
  var _onValueChange = function(newValue){
    newValue = parseFloat(newValue.toFixed(self.sigfigs));
    config.onchange(newValue);
  };

  // DRAG IT, BABY
  var isDragging = false;
  var wasDragging = false;
  var lastDragX, startDragValue;
  var delta = 0;
  var _onmousedown = function(event){
    isDragging = true;
    lastDragX = event.clientX;
    startDragValue = self.value;
    delta = 0;
    if(config.onstart) config.onstart();
  };
  var _onmousemove = function(event){
    if(isDragging){

      wasDragging = true;

      // What's the step?
      var step = Math.pow(0.1,self.sigfigs);
      step = parseFloat(step.toPrecision(1)); // floating point crap
      
      // Change number
      var velocity = event.clientX - lastDragX;
      lastDragX = event.clientX;
      var multiplier = Math.abs(velocity/10);
      if(multiplier<1) multiplier=1;
      if(multiplier>3) multiplier=3;
      delta += velocity*multiplier;
      var dx = Math.floor(delta/2);
      var newValue = startDragValue + dx*step;
      newValue = _boundNumber(newValue);
      
      // Only update if ACTUALLY new.
      if(self.value != newValue){
        self.value = newValue;
        self.setLabel(newValue);
        _onValueChange(newValue);
      }

    }
  };
  var _boundNumber = function(newValue){
    if(min!==undefined && newValue<min) newValue=min;
    if(max!==undefined && newValue>max) newValue=max;
    // console.log("min ", min, " max ", max);
    return newValue;
  };
  var _onmouseup = function(){
    isDragging = false;
    if(config.onstop) config.onstop();
    setTimeout(function(){
      wasDragging = false; // so can't "click" if let go on scrubber
    },1);
  };

  // MOUSE EVENTS
  dom.addEventListener("mousedown", _onmousedown);
  window.addEventListener("mousemove", _onmousemove);
  window.addEventListener("mouseup", _onmouseup);

  // KILL ALL LISTENERS
  self.kill = function(){
    dom.removeEventListener("mousedown", _onmousedown);
    window.removeEventListener("mousemove", _onmousemove);
    window.removeEventListener("mouseup", _onmouseup);
  };

  // On click: edit manually!
  var _manuallyEditing = false;
  dom.onblur = function(){
    if(_manuallyEditing){

      _manuallyEditing = false;
      dom.contentEditable = false;
      _unselectAll();

      // Done manually updating! The new number!
      _countSigFigs(dom.innerText); // re-calc sigfigs
      self.value = _parseNumber();
      self.setLabel(self.value);
      _onValueChange(self.value);

      // On Stop editing
      if(config.onstop) config.onstop();

    }
  };
  _preventWeirdCopyPaste(dom);
  _blurOnEnter(dom);
  dom.onclick = function(){

    if(wasDragging) return; // can't click if I was just dragging!

    _manuallyEditing = true;
    
    // Make it editable, and select it!
    dom.contentEditable = true;
    dom.spellcheck = false;
    _selectAll(dom);

    // On Start editing
    if(config.onstart) config.onstart();

  };
  dom.oninput = function(event){

    if(!_manuallyEditing) return;

    // Also, no non-decimal or numbers
    var regex = /[^0-9.\-]/g;
    if(dom.innerText.match(regex)){
      dom.innerText = dom.innerText.replace(regex,"");
    }
    _fixStringInput(dom);

    // Show that change!
    _onValueChange(_parseNumber());

  };
  var _parseNumber = function(){
    var num = parseFloat(dom.innerText);
    if(isNaN(num)) num=0;
    num = _boundNumber(num);
    return num;
  };

  // How many significant digits?
  self.sigfigs = 0;
  var _countSigFigs = function(string){
    string = string.toString();
    var sigfigs;
    var positionOfPeriod = string.search(/\./);
    if(positionOfPeriod>=0){ // has a period
      sigfigs = (string.length-1)-positionOfPeriod;
    }else{
      sigfigs = 0;
    }
    self.sigfigs = sigfigs;
  };
  _countSigFigs(self.value);

  // Current value...
  self.setLabel(self.value);

};

/********************
String's config:
{
  prefix: "[",
  suffix: "]",
  color:"whatever",
  value: data.value,
  onchange: function(value){
    data.value = value;
    self.update();
  },
  styles: ["comment"]
}
********************/
ui.String = function(config){
  
  var self = this;

  // DOM
  var dom = document.createElement("div");
  dom.className = "joy-string";
  self.dom = dom;
  
  // The Actual Part that's Content Editable
  var input = document.createElement("span");
  input.contentEditable = true;
  input.spellcheck = false;

  // Prefix & Suffix & Color: entirely cosmetic
  var prefixDOM = document.createElement("span");
  var suffixDOM = document.createElement("span");
  prefixDOM.innerHTML = config.prefix || "";
  suffixDOM.innerHTML = config.suffix || "";
  dom.appendChild(prefixDOM);
  dom.appendChild(input);
  dom.appendChild(suffixDOM);

  // On input!
  input.oninput = function(event){
    _fixStringInput(input);
    var value = input.innerText; // NOT innerHTML
    config.onchange(value); // callback!
  };

  // On focus, select all
  input.onfocus = function(){
    _selectAll(input);
  };
  input.onblur = function(){
    _unselectAll();
  };
  _preventWeirdCopyPaste(input);

  // On pressing <enter>, DON'T line break, just blur
  input.onkeypress = function(e){
    if(e.which == 13){
      input.blur();
      return false;
    }
    return true;
  };

  // Set String
  self.setString = function(value){
    input.innerText = value;
    _fixStringInput(input);
  };

  // Set Color, why not
  self.setColor = function(color){
    color = _forceToRGB(color);
    dom.style.color = color;
    dom.style.borderColor = color;
  }
  if(config.color) self.setColor(config.color);

  // Styles
  self.styles = config.styles || [];
  for(var i=0; i<self.styles.length; i++) dom.classList.add(self.styles[i]);

  // Start with the current value
  self.setString(config.value);

};

// path (list of points) type
/****************************************/

class PathUI {
  constructor(config) {

    this.points = [];

    this.dom = document.createElement("div");
    this.dom.className = "joy-path";
  
    input.addEventListener("focus", () => {
      _selectAll(input);
    });
  
    input.addEventListener("blur", () => {
      _unselectAll();
    });
  
    input.addEventListener("keypress", (e) => {
  	if (e.which === 13) {
  	  input.blur();
  	  return false;
      }
      return true;
    });
  
    this.setPath = function(points) {
  	  // input.innerText = value.substring(0, 8) + "...";
  	  // // _fixStringInput(input);
      // this.points = this._parse(value);
      console.log("points", points);
      // let thumbnail_canvas = this.getCanvas(points, 25, 25, 599, 599);
      // thumbnail_canvas.classList.add('thumbnail-canvas');
      // this.dom.getElementsByClassName('thumbnail-canvas').forEach(e => e.remove());
      // this.dom.appendChild(thumbnail_canvas);
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
  
    this.setPath(config.value);
  }

  getCanvas(points, width, height, originWidth, originHeight) {
    
    console.log(points);
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.background = "white";
    canvas.style.border = '1px solid #888';
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.scale(width/originWidth, height/originHeight);
    
    const firstPoint = points[0];
    ctx.beginPath();
    ctx.moveTo(firstPoint.x, firstPoint.y);
    
    for (let i = 1; i < points.length; i++) {
  	  const { x, y } = points[i];
  	  ctx.lineTo(x, y);
    }
    
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.fillStyle = 'black';
    for (const { x, y } of this.points) {
  	ctx.beginPath();
  	ctx.arc(x, y, 8, 0, Math.PI * 2);
  	ctx.fill();
    }
    return canvas;
  }  
}


/********************
TextLine's config:
{
  multiline: true,
  readonly: true,
  width: number or "[style]",
  onchange: function(newValue){},
  placeholder: "//derp"
  styles: ["box"]
}
********************/
// TODO: a full WSIYWIG editor?
// https://hackernoon.com/easily-create-an-html-editor-with-designmode-and-contenteditable-7ed1c465d39b
ui.TextBox = function(config){
  
  var self = this;

  // DOM
  var input;
  if(config.multiline){
    input = document.createElement("textarea");
  }else{
    input = document.createElement("input");
    input.type = "text";
  }
  if(config.placeholder){
    input.placeholder = config.placeholder;
  }
  input.spellcheck = false;
  input.className = "joy-textbox";
  self.dom = input;
  var dom = self.dom;

  // Config options
  if(config.readonly){
    input.setAttribute("readonly", 1);
    input.addEventListener("click",function(){
      self.select();
    });
  }else{
    input.oninput = function(event){
      config.onchange(input.value);
    };
  }
  if(config.width){
    input.style.width = (typeof config.width==="number") ? config.width+"px" : config.width;
  }
  
  // Get & Set Value
  self.getValue = function(){ return input.value; };
  self.setValue = function(value){ input.value = value; };

  // Select
  self.select = function(){
    input.select();
  };

  // Styles
  self.styles = config.styles || [];
  for(var i=0; i<self.styles.length; i++) dom.classList.add(self.styles[i]);

  // Start
  if(config.value) self.setValue(config.value);

  // If it's multiline, auto-resize!
  // Thanks to this: https://stackoverflow.com/a/25621277
  if(config.multiline){
    var _onInput = function(){
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    };
    dom.addEventListener("input", _onInput, false);
    setTimeout(function(){
      dom.setAttribute('style', 'height:' + (dom.scrollHeight) + 'px; overflow-y:hidden;');
    },1); // some threading thing?
  }

};