
import { ChooserModal } from './modals.js';
import { _preventWeirdCopyPaste, _blurOnEnter, _selectAll, _unselectAll } from '../joy-utils.js';

/********************
Button's config:
{
  label: "derp",
  onclick: function(){},
  styles: ["round", "hollow"] // optional
}
********************/

export class JoyWidget {
  constructor(config) {

    // Default the config object if it's not provided
    this.config = config || {};

    // Create the DOM element
    this.dom = document.createElement("div");

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
}

export class JoyButton extends JoyWidget {
  
  constructor(config) {
    super(config);

    this.dom.classList.add("joy-button");

    // Setting Label
    config.label = config.label || "";
    this.label = document.createElement("span");
    this.dom.appendChild(this.label);
    this.setLabel(config.label);
    
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
export class ChooserButton extends JoyButton {
  constructor(config) {

    const initialLabel = config.staticLabel !== undefined ? config.staticLabel : "";
    console.log("initial label", initialLabel);

    config.label = initialLabel;
    config.onclick = () => this.showChooserModal();
    
    super(config);

    this.options = config.options;
    this.onchange = config.onchange;
    this.position = config.position;

    this.value = config.value || this.options[0].value;

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
      console.log("setting label to ", matchingOption.label);
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
export class NumberScrubber {
  constructor(config) {
    // Config...
    let min = config.min;
    let max = config.max;

    this.value = config.value;

    // DOM
    let dom = document.createElement("div");
    dom.className = "joy-scrubber";
    this.dom = dom;

    // DOM *is* Label
    this.setLabel = (newValue) => {
      dom.innerHTML = newValue.toFixed(this.sigfigs);
    };

    // On Value Change: make sure it's the right num of sigfigs
    let _onValueChange = (newValue) => {
      newValue = parseFloat(newValue.toFixed(this.sigfigs));
      config.onchange(newValue);
    };

    // DRAG IT, BABY
    let isDragging = false;
    let wasDragging = false;
    let lastDragX, startDragValue;
    let delta = 0;
    let _onmousedown = (event) => {
      isDragging = true;
      lastDragX = event.clientX;
      startDragValue = this.value;
      delta = 0;
      if(config.onstart) config.onstart();
    };
    let _onmousemove = (event) => {
      if(isDragging){

        wasDragging = true;

        // What's the step?
        let step = Math.pow(0.1,this.sigfigs);
        step = parseFloat(step.toPrecision(1)); // floating point crap
        
        // Change number
        let velocity = event.clientX - lastDragX;
        lastDragX = event.clientX;
        let multiplier = Math.abs(velocity/10);
        if(multiplier<1) multiplier=1;
        if(multiplier>3) multiplier=3;
        delta += velocity*multiplier;
        let dx = Math.floor(delta/2);
        let newValue = startDragValue + dx*step;
        newValue = _boundNumber(newValue);
        
        // Only update if ACTUALLY new.
        if(this.value != newValue){
          this.value = newValue;
          this.setLabel(newValue);
          _onValueChange(newValue);
        }

      }
    };
    let _boundNumber = (newValue) => {
      if(min!==undefined && newValue<min) newValue=min;
      if(max!==undefined && newValue>max) newValue=max;
      // console.log("min ", min, " max ", max);
      return newValue;
    };
    let _onmouseup = () => {
      isDragging = false;
      if(config.onstop) config.onstop();
      setTimeout(() => {
        wasDragging = false; // so can't "click" if let go on scrubber
      },1);
    };

    // MOUSE EVENTS
    dom.addEventListener("mousedown", _onmousedown);
    window.addEventListener("mousemove", _onmousemove);
    window.addEventListener("mouseup", _onmouseup);

    // KILL ALL LISTENERS
    this.kill = () => {
      dom.removeEventListener("mousedown", _onmousedown);
      window.removeEventListener("mousemove", _onmousemove);
      window.removeEventListener("mouseup", _onmouseup);
    };

    // On click: edit manually!
    let _manuallyEditing = false;
    dom.onblur = () => {
      if(_manuallyEditing){

        _manuallyEditing = false;
        dom.contentEditable = false;
        _unselectAll();

        // Done manually updating! The new number!
        _countSigFigs(dom.innerText); // re-calc sigfigs
        this.value = _parseNumber();
        this.setLabel(this.value);
        _onValueChange(this.value);

        // On Stop editing
        if(config.onstop) config.onstop();

      }
    };
    _preventWeirdCopyPaste(dom);
    _blurOnEnter(dom);
    dom.onclick = () => {

      if(wasDragging) return; // can't click if I was just dragging!

      _manuallyEditing = true;
      
      // Make it editable, and select it!
      dom.contentEditable = true;
      dom.spellcheck = false;
      _selectAll(dom);

      // On Start editing
      if(config.onstart) config.onstart();

    };
    dom.oninput = (event) => {

      if(!_manuallyEditing) return;

      // Also, no non-decimal or numbers
      let regex = /[^0-9.\-]/g;
      if(dom.innerText.match(regex)){
        dom.innerText = dom.innerText.replace(regex,"");
      }
      _fixStringInput(dom);

      // Show that change!
      _onValueChange(_parseNumber());

    };
    let _parseNumber = () => {
      let num = parseFloat(dom.innerText);
      if(isNaN(num)) num=0;
      num = _boundNumber(num);
      return num;
    };

    // How many significant digits?
    this.sigfigs = 0;
    let _countSigFigs = (string) => {
      string = string.toString();
      let sigfigs;
      let positionOfPeriod = string.search(/\./);
      if(positionOfPeriod>=0){ // has a period
        sigfigs = (string.length-1)-positionOfPeriod;
      }else{
        sigfigs = 0;
      }
      this.sigfigs = sigfigs;
    };
    _countSigFigs(this.value);

    // Current value...
    this.setLabel(this.value);
  }
}

/********************
String's config:
{
  prefix: "[",
  suffix: "]",
  color:"whatever",
  value: data.value,
  onchange: function(value){
    data.value = value;
    this.update();
  },
  styles: ["comment"]
}
********************/
class JoyString {
  
  constructor(config) {
    // DOM
    this.dom = document.createElement("div");
    this.dom.className = "joy-string";
    
    // The Actual Part that's Content Editable
    let input = document.createElement("span");
    input.contentEditable = true;
    input.spellcheck = false;

    // Prefix & Suffix & Color: entirely cosmetic
    let prefixDOM = document.createElement("span");
    let suffixDOM = document.createElement("span");
    prefixDOM.innerHTML = config.prefix || "";
    suffixDOM.innerHTML = config.suffix || "";
    this.dom.appendChild(prefixDOM);
    this.dom.appendChild(input);
    this.dom.appendChild(suffixDOM);

    // On input!
    input.oninput = (event) => {
      _fixStringInput(input);
      let value = input.innerText; // NOT innerHTML
      config.onchange(value); // callback!
    };

    // On focus, select all
    input.onfocus = () => {
      _selectAll(input);
    };
    input.onblur = () => {
      _unselectAll();
    };
    _preventWeirdCopyPaste(input);

    // On pressing <enter>, DON'T line break, just blur
    input.onkeypress = (e) => {
      if(e.which == 13){
        input.blur();
        return false;
      }
      return true;
    };

    if(config.color) this.setColor(config.color);

    // Styles
    this.styles = config.styles || [];
    for(let i=0; i<this.styles.length; i++) {
      dom.classList.add(this.styles[i]);
    }

    this.setString(config.value); //start with the current value
  }

  // Set String
  setString(value) {
    input.innerText = value;
    _fixStringInput(input);
  }

  // Set Color, why not
  setColor(color) {
    color = _forceToRGB(color);
    this.dom.style.color = color;
    this.dom.style.borderColor = color;
  }
}

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
  
    this.setPath = (points) => {
  	  // input.innerText = value.substring(0, 8) + "...";
  	  // // _fixStringInput(input);
      // this.points = this._parse(value);
      console.log("points", points);
      // let thumbnail_canvas = this.getCanvas(points, 25, 25, 599, 599);
      // thumbnail_canvas.classList.add('thumbnail-canvas');
      // this.dom.getElementsByClassName('thumbnail-canvas').forEach(e => e.remove());
      // this.dom.appendChild(thumbnail_canvas);
    };
  
    this.setColor = (color) => {
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
export class JoyTextBox {
  constructor(config){
    // DOM
    let input;
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
    this.dom = input;

    // Config options
    if(config.readonly){
      input.setAttribute("readonly", 1);
      input.addEventListener("click", () => {
        this.select();
      });
    }else{
      input.oninput = (event) => {
        config.onchange(input.value);
      };
    }
    if(config.width){
      input.style.width = (typeof config.width==="number") ? config.width+"px" : config.width;
    }

    // Styles
    this.styles = config.styles || [];
    for(let i=0; i<this.styles.length; i++) {
      this.dom.classList.add(this.styles[i]);
    }

    // Start
    if(config.value) {
      this.setValue(config.value);
    }

    // If it's multiline, auto-resize!
    // Thanks to this: https://stackoverflow.com/a/25621277
    if(config.multiline){
      let _onInput = () => {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
      };
      this.dom.addEventListener("input", _onInput, false);
      setTimeout(() => {
        this.dom.setAttribute('style', 'height:' + (dom.scrollHeight) + 'px; overflow-y:hidden;');
      },1); // some threading thing?
    }
  }
    
  // Get & Set Value
  getValue() { return input.value; }
  setValue(value) { input.value = value; }

  // Select
  select() { input.select(); }  
}