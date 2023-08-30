//Singleton! Only one instance of this class should exist at a time.
class ModalBackdrop {
  constructor() {
    if (ModalBackdrop._instance) {
        return ModalBackdrop._instance;
    }

    // The main modal container
    this.dom = document.createElement('div');
    this.dom.id = "joy-modal";
    this.dom.style.display = 'none';
    document.body.appendChild(this.dom);

    // Transparent background you click to close!
    this.bg = document.createElement("div");
    this.bg.id = "joy-modal-bg";
    this.bg.onclick = () => {
      this.currentUI.kill();
    };
    this.dom.appendChild(this.bg);

    // The actual bubble box
    this.box = document.createElement("div");
    this.box.id = "joy-box";
    this.box.className = "arrow_box";
    this.dom.appendChild(this.box);

    // NO SCROLL
    this.dom.addEventListener('wheel', (event) => {
      event.preventDefault();
      return false;
    });

    ModalBackdrop._instance = this;
  }

  show(ui) {
    this._clear(this.box);

    this.dom.style.display = 'block';

    // Remember & add UI
    this.currentUI = ui;
    this.box.appendChild(ui.dom);
    
    // Position the Box
    let position = ui.config.position || "below";
    let boxBounds = this.box.getBoundingClientRect();
    let sourceBounds = ui.config.source.getBoundingClientRect();
    let x,y, margin=20;

    // HACK: IF BELOW & NO SPACE, do LEFT
    if(position=="below"){
      y = sourceBounds.top + sourceBounds.height + margin; // y: bottom
      if(y + boxBounds.height > document.body.clientHeight){ // below page!
        position = "left";
      }
    }

    this.box.setAttribute("position", position);
    switch(position){ // TODO: smarter positioning
      case "below":
        x = sourceBounds.left + sourceBounds.width/2; // x: middle
        y = sourceBounds.top + sourceBounds.height + margin; // y: bottom
        x -= boxBounds.width/2;
        break;
      case "left":
        x = sourceBounds.left - margin; // x: left
        y = sourceBounds.top + sourceBounds.height/2; // y: middle
        x -= boxBounds.width;
        y -= boxBounds.height/2;
        break;
    }
    this.box.style.left = x + "px";
    this.box.style.top = y + "px";

    // On Open
    if(this.currentUI.config.onopen) this.currentUI.config.onopen();
  }

  hide() {
    this._clear(this.box);
    this.dom.style.display = "none";

    // On Close
    if (this.currentUI.config.onclose) this.currentUI.config.onclose();
  }

  _clear(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  static getInstance() {
    if (!ModalBackdrop._instance) {
        new ModalBackdrop();
    }
    return ModalBackdrop._instance;
  }
}

class BaseModal {
  constructor(config) {
      this.config = config;
      this.dom = document.createElement("div");
  }

  kill() {
      ModalBackdrop.getInstance().hide();
  }

  show() {
    ModalBackdrop.getInstance().show(this.dom);
  }
}

class Chooser extends BaseModal {
  constructor(config) {
    super(config);
    this.categories = {};
    const _placeholder_ = "_placeholder_";

    this.dom = document.createElement("div");
    this.dom.className = "joy-modal-chooser";
    
    let list = document.createElement("div");
    this.dom.appendChild(list);

    this.options = config.options;

    // Private method to make a category
    const makeCategory = (category) => {
        let categoryDOM = document.createElement("div");
        list.appendChild(categoryDOM);
        this.categories[category] = categoryDOM;
    };

    // Create categories, if any!
    for(let option of this.options) {
        const category = option.category;
        if(category) {
            if(!this.categories[category]) {
                makeCategory(category);
            }
        } else {
            if(!this.categories[_placeholder_]) {
                makeCategory(_placeholder_);
            }
        }
    }

    // Create options
    for(let option of this.options) {
        let optionDOM = document.createElement("div");
        optionDOM.innerHTML = option.label;
        if(option.color) {
            optionDOM.style.color = option.color;
        }

        // Put it in its category!
        const category = option.category || _placeholder_;
        this.categories[category].appendChild(optionDOM);

        // On Click!
        optionDOM.onclick = (event) => {
          this.onchange(option.value);
          event.stopPropagation(); // no, don't double-fire
        };
    }
  }

  onchange(value) {
    this.kill();
    if (typeof this.config.onchange === "function") {
      this.config.onchange(value); // after closing the modal, since can create another modal
    }
  }
}

/********************
ColorPicker's config:
{
  source: [who this modal dialog should be "coming from"]
  value: [currently selected value, if any]
  onchange: function(value){}, // callback 
  onclose: function(){}
};
********************/
class ColorPicker extends BaseModal {
  constructor(config) {
    super(config);

  // Config
  this.config = config;

  // Create DOM
  this.dom = document.createElement("div");
  this.dom.className = "joy-modal-color";

  // COLOR is HSV.
  config.value = config.value || [0,1,1];
  self.h = config.value[0];
  self.s = config.value[1];
  self.v = config.value[2];

  // THREE ELEMENTS:
  // 1. Color Wheel
  // 2. Color Value
  // 3. Color Pickers

  var WHEEL_SIZE = 150;
  var SPECTRUM_WIDTH = 15;
  var MARGIN_1 = 10;
  var MARGIN_2 = 10;
  var MARGIN_3 = 10;

  var FULL_WIDTH = MARGIN_1+WHEEL_SIZE+MARGIN_2+SPECTRUM_WIDTH+MARGIN_3;
  var FULL_HEIGHT = MARGIN_1+WHEEL_SIZE+MARGIN_3;

  self.dom.style.width = FULL_WIDTH + "px";
  self.dom.style.height = FULL_HEIGHT + "px";

  /////////////////////////////
  // 1) The Color Wheel ///////
  /////////////////////////////

  var wheelCanvas = document.createElement("canvas");
  wheelCanvas.id = "joy-color-wheel";
  var wheelContext = wheelCanvas.getContext("2d");
  wheelCanvas.width = WHEEL_SIZE*2;
  wheelCanvas.height = WHEEL_SIZE*2;
  wheelCanvas.style.width = wheelCanvas.width/2 + "px";
  wheelCanvas.style.height = wheelCanvas.height/2 + "px";
  dom.appendChild(wheelCanvas);

  wheelCanvas.style.top = MARGIN_1 + "px";
  wheelCanvas.style.left = MARGIN_1 + "px";

  var _updateWheel = function(){

    // Image Data!
    var ctx = wheelContext;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    var w = wheelCanvas.width;
    var h = wheelCanvas.height;
    var image = ctx.createImageData(w,h);
    var imageData = image.data;

    // Create a circle of colors
    // Thanks to: https://medium.com/@bantic/hand-coding-a-color-wheel-with-canvas-78256c9d7d43
    var cx = w/2;
    var cy = h/2;
    var radius = w/2; // buffer for the crosshair
    var radiusBuffered = radius + 2; // small buffer for clipping
    for(var x=0; x<w; x++){
      for(var y=0; y<h; y++){
        var dx = x-cx;
        var dy = y-cy;
        var distance = Math.sqrt(dx*dx+dy*dy);
        if(distance<radiusBuffered){ // buffer for clipping
          if(distance>=radius) distance=radius;

          // Angle & Distance, re-mapped to [0,1]
          var angle = Math.atan2(dy,dx); // from [-tau/2, tau/2]
          angle = ((angle/Math.TAU)+0.5)*360; // to [0,360]
          distance = (distance/radius); // to [0,1]

          // HSV! (capitals, coz already using 'h')
          var H = angle;
          var S = distance;
          var V = self.v;

          // TO RGB
          var rgb = _HSVtoRGB(H,S,V);
          var i = (x + (y*w))*4;
          imageData[i] = rgb[0];
          imageData[i+1] = rgb[1];
          imageData[i+2] = rgb[2];
          imageData[i+3] = 255;

        }
      }
    }
    ctx.putImageData(image, 0, 0);

    // Clip it, for aliasing
    ctx.save();
    ctx.globalCompositeOperation = "destination-in";
    ctx.beginPath();
    ctx.fillStyle = "#fff";
    ctx.arc(cx,cy,radius,0,Math.TAU);
    ctx.fill();
    ctx.restore();

  };
  _updateWheel();

  /////////////////////////////
  // 2) The Value Spectrum ////
  /////////////////////////////

  var spectrumCanvas = document.createElement("canvas");
  spectrumCanvas.id = "joy-color-value";
  var spectrumContext = spectrumCanvas.getContext("2d");
  spectrumCanvas.width = SPECTRUM_WIDTH*2;
  spectrumCanvas.height = WHEEL_SIZE*2;
  spectrumCanvas.style.width = spectrumCanvas.width/2 + "px";
  spectrumCanvas.style.height = spectrumCanvas.height/2 + "px";
  dom.appendChild(spectrumCanvas);

  spectrumCanvas.style.top = MARGIN_1 + "px";
  spectrumCanvas.style.right = MARGIN_3 + "px";

  var _updateSpectrum = function(){

    // Image data
    var ctx = spectrumContext;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    var w = spectrumCanvas.width;
    var h = spectrumCanvas.height;
    var image = ctx.createImageData(w,h);
    var imageData = image.data;

    // Just a good ol' spectrum of values
    for(var x=0; x<w; x++){
      for(var y=0; y<h; y++){

        // HSV! (capitals, coz already using 'h')
        var H = self.h;
        var S = self.s;
        var V = 1-(y/h);

        // TO RGB
        var rgb = _HSVtoRGB(H,S,V);
        var i = (x + (y*w))*4;
        imageData[i] = rgb[0];
        imageData[i+1] = rgb[1];
        imageData[i+2] = rgb[2];
        imageData[i+3] = 255;

      }
    }
    ctx.putImageData(image, 0, 0);

  };
  _updateSpectrum();

  /////////////////////////////
  // 3) The Color Pickers /////
  /////////////////////////////

  var pickerCanvas = document.createElement("canvas");
  pickerCanvas.id = "joy-color-picker";
  var pickerContext = pickerCanvas.getContext("2d");
  pickerCanvas.width = FULL_WIDTH*2;
  pickerCanvas.height = FULL_HEIGHT*2;
  pickerCanvas.style.width = pickerCanvas.width/2 + "px";
  pickerCanvas.style.height = pickerCanvas.height/2 + "px";
  dom.appendChild(pickerCanvas);

  var _updatePickers = function(){

    // What's the color?
    var x,y;
    var ctx = pickerContext;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = _HSVToRGBString(self.h, self.s, self.v);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;

    // Draw it on the circle
    var cx = MARGIN_1*2 + wheelCanvas.width/2;
    var cy = MARGIN_1*2 + wheelCanvas.height/2;
    var angle = self.h*(Math.TAU/360);
    var radius = self.s*(wheelCanvas.width/2);
    x = cx - Math.cos(angle)*radius;
    y = cy - Math.sin(angle)*radius;
    ctx.beginPath();
    ctx.arc(x, y, SPECTRUM_WIDTH, 0, Math.TAU);
    ctx.fill();
    ctx.stroke();

    // Draw it on the spectrum
    var sx = MARGIN_1*2 + wheelCanvas.width + MARGIN_2*2 + spectrumCanvas.width/2;
    var sy = MARGIN_1*2;
    x = sx;
    y = sy + spectrumCanvas.height*(1-self.v);
    ctx.beginPath();
    ctx.arc(x, y, SPECTRUM_WIDTH, 0, Math.TAU);
    ctx.fill();
    ctx.stroke();

  };
  _updatePickers();

  // THE MOUSE EVENTS FOR THE PICKERS
  var editMode;
  var isDragging = false;
  var _update = function(event){

    if(event.target!=pickerCanvas) return; // if outta bounds forget it

    var x = event.offsetX*2;
    var y = event.offsetY*2;
    if(editMode=="hs"){
      x -= MARGIN_1*2;
      y -= MARGIN_1*2;
      _updateHS(x,y);
    }else{
      x -= MARGIN_1*2 + wheelCanvas.width + MARGIN_2*2;
      y -= MARGIN_1*2;
      _updateV(x,y);
    }

    // HEY TELL THE SOURCE
    _updateSource();

  };
  var _updateHS = function(x,y){

    // get polar
    var radius = wheelCanvas.width/2;
    var dx = x - radius;
    var dy = y - radius;
    var angle = Math.atan2(dy, dx);
    var distance = Math.sqrt(dx*dx+dy*dy);

    // Re-map
    angle = ((angle/Math.TAU)+0.5)*360; // to [0,360]
    if(angle<0) angle=0;
    if(angle>360) angle=360;
    distance = (distance/radius); // to [0,1]
    if(distance<0) distance=0;
    if(distance>1) distance=1;

    // update
    self.h = angle;
    self.s = distance;
    _updateSpectrum();
    _updatePickers();

  };
  var _updateV = function(x,y){
    self.v = 1-(y/spectrumCanvas.height);
    if(self.v<0) self.v=0;
    if(self.v>1) self.v=1;
    _updateWheel();
    _updatePickers();
  };
  var _onmousedown = function(event){
    isDragging = true;
    if(event.offsetX*2 < MARGIN_1*2 + wheelCanvas.width + MARGIN_2){
      editMode = "hs";
    }else{
      editMode = "v";
    }
    _update(event);
  };
  var _onmousemove = function(event){
    if(isDragging) _update(event);
  };
  var _onmouseup = function(){
    isDragging = false;
  };

  // MOUSE EVENTS
  pickerCanvas.addEventListener("mousedown", _onmousedown);
  window.addEventListener("mousemove", _onmousemove);
  window.addEventListener("mouseup", _onmouseup);

  // UPDATE SOURCE
  var _updateSource = function(){
    var newValue = [self.h, self.s, self.v];
    newValue[0] = parseFloat(newValue[0].toFixed(0));
    newValue[1] = parseFloat(newValue[1].toFixed(2));
    newValue[2] = parseFloat(newValue[2].toFixed(2));
    config.onchange(newValue);
  };

  self.kill() {
    
    // remove listeners
    dom.removeEventListener("mousedown", _onmousedown);
    window.removeEventListener("mousemove", _onmousemove);
    window.removeEventListener("mouseup", _onmouseup);

    // Hide Modal
    super.kill();

  }
}
