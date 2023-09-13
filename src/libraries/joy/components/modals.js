import { _HSVtoRGB, _HSVToRGBString, TAU } from "../joy-utils.js";
  
  //Singleton! Only one instance of this class should exist at a time.
export class ModalBackdrop {
  constructor() {
    if (ModalBackdrop._instance) {
        return ModalBackdrop._instance;
    }

    // The main modal container
    this.dom = document.createElement('div');
    this.dom.id = "joy-modal";
    document.body.appendChild(this.dom);

    // Transparent background you click to close!
    this.bg = document.createElement("div");
    this.bg.id = "joy-bg";
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



/* Base Modal */

export class BaseModal {
  constructor(config) {
      this.config = config;
      this.dom = document.createElement("div");
      this.dom.classList.add("base-modal");
  }

  kill() {
      ModalBackdrop.getInstance().hide();
  }

  show() {
    const modalInstance = ModalBackdrop.getInstance();
    if (modalInstance instanceof ModalBackdrop) {
      modalInstance.show(this);
    } else {
      console.error("Unexpected instance:", modalInstance);
    }
  }
}





export class ChooserModal extends BaseModal {
  constructor(config) {
    super(config);
    this.categories = {};
    const _placeholder_ = "_placeholder_";

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
      this.config.onchange(value); // after closing the modal, since this can create another modal
    }
  }

  kill() {
    super.kill();
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
export class ColorPicker extends BaseModal {
  constructor(config) {
    super(config);

    this.WHEEL_SIZE = 150;
    this.SPECTRUM_WIDTH = 15;
    this.MARGIN_1 = 10;
    this.MARGIN_2 = 10;
    this.MARGIN_3 = 10;
  
    this.FULL_WIDTH = this.MARGIN_1+this.WHEEL_SIZE+this.MARGIN_2+this.SPECTRUM_WIDTH+this.MARGIN_3;
    this.FULL_HEIGHT = this.MARGIN_1+this.WHEEL_SIZE+this.MARGIN_3;

    // COLOR is HSV.
    config.value = config.value || [0,1,1];
    this.h = config.value[0];
    this.s = config.value[1];
    this.v = config.value[2];

    this.dom = this._createDOM();
    this._attachEvents();
  }

  _createDOM() {
    const dom = document.createElement("div");
    dom.className = "joy-modal-color";

    // Add the color wheel, spectrum and picker here...
    this.wheelCanvas = this._createColorWheel(dom);
    this.spectrumCanvas = this._createValueSpectrum(dom);
    this.pickerCanvas = this._createColorPickers(dom, this.wheelCanvas, this.spectrumCanvas);

    return dom;
  }

  _createColorWheel(dom) {

    // THREE ELEMENTS:
    // 1. Color Wheel
    // 2. Color Value
    // 3. Color Pickers

    dom.style.width = this.FULL_WIDTH + "px";
    dom.style.height = this.FULL_HEIGHT + "px";

    /////////////////////////////
    // 1) The Color Wheel ///////
    /////////////////////////////

    let wheelCanvas = document.createElement("canvas");
    wheelCanvas.id = "joy-color-wheel";
    wheelCanvas.width = this.WHEEL_SIZE*2;
    wheelCanvas.height = this.WHEEL_SIZE*2;
    wheelCanvas.style.width = wheelCanvas.width/2 + "px";
    wheelCanvas.style.height = wheelCanvas.height/2 + "px";
    dom.appendChild(wheelCanvas);

    wheelCanvas.style.top = this.MARGIN_1 + "px";
    wheelCanvas.style.left = this.MARGIN_1 + "px";

    this._updateWheel(wheelCanvas);
    return wheelCanvas;
  }

  _updateWheel(wheelCanvas) {
    // Image Data!
    let ctx = wheelCanvas.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    let w = wheelCanvas.width;
    let h = wheelCanvas.height;
    let image = ctx.createImageData(w,h);
    let imageData = image.data;

    // Create a circle of colors
    // Thanks to: https://medium.com/@bantic/hand-coding-a-color-wheel-with-canvas-78256c9d7d43
    let cx = w/2;
    let cy = h/2;
    let radius = w/2; // buffer for the crosshair
    let radiusBuffered = radius + 2; // small buffer for clipping
    for(let x=0; x<w; x++){
      for(let y=0; y<h; y++){
        let dx = x-cx;
        let dy = y-cy;
        let distance = Math.sqrt(dx*dx+dy*dy);
        if(distance<radiusBuffered){ // buffer for clipping
          if(distance>=radius) distance=radius;

          // Angle & Distance, re-mapped to [0,1]
          let angle = Math.atan2(dy,dx); // from [-tau/2, tau/2]
          angle = ((angle/TAU)+0.5)*360; // to [0,360]
          distance = (distance/radius); // to [0,1]

          // HSV! (capitals, coz already using 'h')
          let H = angle;
          let S = distance;
          let V = this.v;

          // TO RGB
          let rgb = _HSVtoRGB(H,S,V);
          let i = (x + (y*w))*4;
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
    ctx.arc(cx,cy,radius,0,TAU);
    ctx.fill();
    ctx.restore();
  }

    /////////////////////////////
    // 2) The Value Spectrum ////
    /////////////////////////////
  _createValueSpectrum(dom) {

    let spectrumCanvas = document.createElement("canvas");
    spectrumCanvas.id = "joy-color-value";
    spectrumCanvas.width = this.SPECTRUM_WIDTH*2;
    spectrumCanvas.height = this.WHEEL_SIZE*2;
    spectrumCanvas.style.width = spectrumCanvas.width/2 + "px";
    spectrumCanvas.style.height = spectrumCanvas.height/2 + "px";
    dom.appendChild(spectrumCanvas);

    spectrumCanvas.style.top = this.MARGIN_1 + "px";
    spectrumCanvas.style.right = this.MARGIN_3 + "px";

    this._updateSpectrum(spectrumCanvas);
    return spectrumCanvas;
  }

  _updateSpectrum (spectrumCanvas) {
    // Image data
    let ctx = spectrumCanvas.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    let w = spectrumCanvas.width;
    let h = spectrumCanvas.height;
    let image = ctx.createImageData(w,h);
    let imageData = image.data;

    // Just a good ol' spectrum of values
    for(let x=0; x<w; x++){
      for(let y=0; y<h; y++){

        // HSV! (capitals, coz already using 'h')
        let H = this.h;
        let S = this.s;
        let V = 1-(y/h);

        // TO RGB
        let rgb = _HSVtoRGB(H,S,V);
        let i = (x + (y*w))*4;
        imageData[i] = rgb[0];
        imageData[i+1] = rgb[1];
        imageData[i+2] = rgb[2];
        imageData[i+3] = 255;

      }
    }
    ctx.putImageData(image, 0, 0);
  }

    /////////////////////////////
    // 3) The Color Pickers /////
    /////////////////////////////

  _createColorPickers(dom, wheelCanvas, spectrumCanvas) {
    let pickerCanvas = document.createElement("canvas");
    this.pickerCanvas = pickerCanvas;
    pickerCanvas.id = "joy-color-picker";
    pickerCanvas.width = this.FULL_WIDTH*2;
    pickerCanvas.height = this.FULL_HEIGHT*2;
    pickerCanvas.style.width = pickerCanvas.width/2 + "px";
    pickerCanvas.style.height = pickerCanvas.height/2 + "px";
    dom.appendChild(pickerCanvas);

    this._updatePickers(pickerCanvas, wheelCanvas, spectrumCanvas);
    return pickerCanvas;
  }

  _updatePickers(pickerCanvas, wheelCanvas, spectrumCanvas) {
    // What's the color?
    let x,y;
    let ctx = pickerCanvas.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = _HSVToRGBString(this.h, this.s, this.v);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;

    // Draw it on the circle
    let cx = this.MARGIN_1*2 + wheelCanvas.width/2;
    let cy = this.MARGIN_1*2 + wheelCanvas.height/2;
    let angle = this.h*(TAU/360);
    let radius = this.s*(wheelCanvas.width/2);
    x = cx - Math.cos(angle)*radius;
    y = cy - Math.sin(angle)*radius;
    ctx.beginPath();
    ctx.arc(x, y, this.SPECTRUM_WIDTH, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // Draw it on the spectrum
    let sx = this.MARGIN_1*2 + wheelCanvas.width + this.MARGIN_2*2 + spectrumCanvas.width/2;
    let sy = this.MARGIN_1*2;
    x = sx;
    y = sy + spectrumCanvas.height*(1-this.v);
    ctx.beginPath();
    ctx.arc(x, y, this.SPECTRUM_WIDTH, 0, TAU);
    ctx.fill();
    ctx.stroke();

  }

  _updateHS(x,y) {
    // get polar
    let radius = this.wheelCanvas.width/2;
    let dx = x - radius;
    let dy = y - radius;
    let angle = Math.atan2(dy, dx);
    let distance = Math.sqrt(dx*dx+dy*dy);

    // Re-map
    angle = ((angle/TAU)+0.5)*360; // to [0,360]
    if(angle<0) angle=0;
    if(angle>360) angle=360;
    distance = (distance/radius); // to [0,1]
    if(distance<0) distance=0;
    if(distance>1) distance=1;

    // update
    this.h = angle;
    this.s = distance;
    this._updateSpectrum(this.spectrumCanvas);
    this._updatePickers(this.pickerCanvas, this.wheelCanvas, this.spectrumCanvas);

  }

  _updateV(x,y) {
      this.v = 1-(y/this.spectrumCanvas.height);
      if(this.v<0) this.v=0;
      if(this.v>1) this.v=1;
      this._updateWheel(this.wheelCanvas);
      this._updatePickers(this.pickerCanvas, this.wheelCanvas, this.spectrumCanvas);
  }

  _onmousedown(event) {
    this.isDragging = true;
    if(event.offsetX*2 < this.MARGIN_1*2 + this.wheelCanvas.width + this.MARGIN_2){
      this.editMode = "hs";
    }else{
      this.editMode = "v";
    }
    this._update(event);
  }

  _onmousemove(event) {
    if(this.isDragging) this._update(event);
  }

  _onmouseup() {
    this.isDragging = false;
  }

  _update(event) {

    if(event.target!=this.pickerCanvas) return; // if outta bounds forget it

    let x = event.offsetX*2;
    let y = event.offsetY*2;
    if(this.editMode=="hs"){
      x -= this.MARGIN_1*2;
      y -= this.MARGIN_1*2;
      this._updateHS(x,y);
    }else{
      x -= this.MARGIN_1*2 + this.wheelCanvas.width + this.MARGIN_2*2;
      y -= this.MARGIN_1*2;
      this._updateV(x,y);
    }

    // HEY TELL THE SOURCE
    this._updateSource();
  }

  // MOUSE EVENTS
  _attachEvents() {
    // THE MOUSE EVENTS FOR THE PICKERS
    this.editMode = "";
    this.isDragging = false;
  
    this.dom.addEventListener("mousedown", this._onmousedown.bind(this));
    window.addEventListener("mousemove", this._onmousemove.bind(this));
    window.addEventListener("mouseup", this._onmouseup.bind(this));
  }

  _detachEvents() {
    // remove listeners
    this.dom.removeEventListener("mousedown", this._onmousedown);
    window.removeEventListener("mousemove", this._onmousemove);
    window.removeEventListener("mouseup", this._onmouseup);
  }

    // UPDATE SOURCE
  _updateSource() {
    let newValue = [this.h, this.s, this.v];
    newValue[0] = parseFloat(newValue[0].toFixed(0));
    newValue[1] = parseFloat(newValue[1].toFixed(2));
    newValue[2] = parseFloat(newValue[2].toFixed(2));
    this.config.onchange(newValue);
  }

  kill() {
    this._detachEvents();

    // Hide Modal
    super.kill();
  }
}
