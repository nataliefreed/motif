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

export class BaseModal {
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

export class Chooser extends BaseModal {
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

    // Config
    this.config = config;

    // Create DOM
    this.dom = document.createElement("div");
    this.dom.className = "joy-modal-color";

    // COLOR is HSV.
    config.value = config.value || [0,1,1];
    this.h = config.value[0];
    this.s = config.value[1];
    this.v = config.value[2];

    // THREE ELEMENTS:
    // 1. Color Wheel
    // 2. Color Value
    // 3. Color Pickers

    let WHEEL_SIZE = 150;
    let SPECTRUM_WIDTH = 15;
    let MARGIN_1 = 10;
    let MARGIN_2 = 10;
    let MARGIN_3 = 10;

    let FULL_WIDTH = MARGIN_1+WHEEL_SIZE+MARGIN_2+SPECTRUM_WIDTH+MARGIN_3;
    let FULL_HEIGHT = MARGIN_1+WHEEL_SIZE+MARGIN_3;

    this.dom.style.width = FULL_WIDTH + "px";
    this.dom.style.height = FULL_HEIGHT + "px";

    /////////////////////////////
    // 1) The Color Wheel ///////
    /////////////////////////////

    let wheelCanvas = document.createElement("canvas");
    wheelCanvas.id = "joy-color-wheel";
    let wheelContext = wheelCanvas.getContext("2d");
    wheelCanvas.width = WHEEL_SIZE*2;
    wheelCanvas.height = WHEEL_SIZE*2;
    wheelCanvas.style.width = wheelCanvas.width/2 + "px";
    wheelCanvas.style.height = wheelCanvas.height/2 + "px";
    dom.appendChild(wheelCanvas);

    wheelCanvas.style.top = MARGIN_1 + "px";
    wheelCanvas.style.left = MARGIN_1 + "px";

    let _updateWheel = function(){

      // Image Data!
      let ctx = wheelContext;
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
            angle = ((angle/Math.TAU)+0.5)*360; // to [0,360]
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
      ctx.arc(cx,cy,radius,0,Math.TAU);
      ctx.fill();
      ctx.restore();

    };
    _updateWheel();

    /////////////////////////////
    // 2) The Value Spectrum ////
    /////////////////////////////

    let spectrumCanvas = document.createElement("canvas");
    spectrumCanvas.id = "joy-color-value";
    let spectrumContext = spectrumCanvas.getContext("2d");
    spectrumCanvas.width = SPECTRUM_WIDTH*2;
    spectrumCanvas.height = WHEEL_SIZE*2;
    spectrumCanvas.style.width = spectrumCanvas.width/2 + "px";
    spectrumCanvas.style.height = spectrumCanvas.height/2 + "px";
    dom.appendChild(spectrumCanvas);

    spectrumCanvas.style.top = MARGIN_1 + "px";
    spectrumCanvas.style.right = MARGIN_3 + "px";

    let _updateSpectrum = function(){

      // Image data
      let ctx = spectrumContext;
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

    };
    _updateSpectrum();

    /////////////////////////////
    // 3) The Color Pickers /////
    /////////////////////////////

    let pickerCanvas = document.createElement("canvas");
    pickerCanvas.id = "joy-color-picker";
    let pickerContext = pickerCanvas.getContext("2d");
    pickerCanvas.width = FULL_WIDTH*2;
    pickerCanvas.height = FULL_HEIGHT*2;
    pickerCanvas.style.width = pickerCanvas.width/2 + "px";
    pickerCanvas.style.height = pickerCanvas.height/2 + "px";
    dom.appendChild(pickerCanvas);

    let _updatePickers = function(){

      // What's the color?
      let x,y;
      let ctx = pickerContext;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = _HSVToRGBString(this.h, this.s, this.v);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;

      // Draw it on the circle
      let cx = MARGIN_1*2 + wheelCanvas.width/2;
      let cy = MARGIN_1*2 + wheelCanvas.height/2;
      let angle = this.h*(Math.TAU/360);
      let radius = this.s*(wheelCanvas.width/2);
      x = cx - Math.cos(angle)*radius;
      y = cy - Math.sin(angle)*radius;
      ctx.beginPath();
      ctx.arc(x, y, SPECTRUM_WIDTH, 0, Math.TAU);
      ctx.fill();
      ctx.stroke();

      // Draw it on the spectrum
      let sx = MARGIN_1*2 + wheelCanvas.width + MARGIN_2*2 + spectrumCanvas.width/2;
      let sy = MARGIN_1*2;
      x = sx;
      y = sy + spectrumCanvas.height*(1-this.v);
      ctx.beginPath();
      ctx.arc(x, y, SPECTRUM_WIDTH, 0, Math.TAU);
      ctx.fill();
      ctx.stroke();

    };
    _updatePickers();

    // THE MOUSE EVENTS FOR THE PICKERS
    let editMode;
    let isDragging = false;
    let _update = function(event){

      if(event.target!=pickerCanvas) return; // if outta bounds forget it

      let x = event.offsetX*2;
      let y = event.offsetY*2;
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
    let _updateHS = function(x,y){

      // get polar
      let radius = wheelCanvas.width/2;
      let dx = x - radius;
      let dy = y - radius;
      let angle = Math.atan2(dy, dx);
      let distance = Math.sqrt(dx*dx+dy*dy);

      // Re-map
      angle = ((angle/Math.TAU)+0.5)*360; // to [0,360]
      if(angle<0) angle=0;
      if(angle>360) angle=360;
      distance = (distance/radius); // to [0,1]
      if(distance<0) distance=0;
      if(distance>1) distance=1;

      // update
      this.h = angle;
      this.s = distance;
      _updateSpectrum();
      _updatePickers();

    };
    let _updateV = function(x,y){
      this.v = 1-(y/spectrumCanvas.height);
      if(this.v<0) this.v=0;
      if(this.v>1) this.v=1;
      _updateWheel();
      _updatePickers();
    };
    let _onmousedown = function(event){
      isDragging = true;
      if(event.offsetX*2 < MARGIN_1*2 + wheelCanvas.width + MARGIN_2){
        editMode = "hs";
      }else{
        editMode = "v";
      }
      _update(event);
    };
    let _onmousemove = function(event){
      if(isDragging) _update(event);
    };
    let _onmouseup = function(){
      isDragging = false;
    };

    // MOUSE EVENTS
    pickerCanvas.addEventListener("mousedown", _onmousedown);
    window.addEventListener("mousemove", _onmousemove);
    window.addEventListener("mouseup", _onmouseup);
  }

    // UPDATE SOURCE
  _updateSource() {
    let newValue = [this.h, this.s, this.v];
    newValue[0] = parseFloat(newValue[0].toFixed(0));
    newValue[1] = parseFloat(newValue[1].toFixed(2));
    newValue[2] = parseFloat(newValue[2].toFixed(2));
    config.onchange(newValue);
  }

  kill() {
    // remove listeners
    dom.removeEventListener("mousedown", _onmousedown);
    window.removeEventListener("mousemove", _onmousemove);
    window.removeEventListener("mouseup", _onmouseup);

    // Hide Modal
    super.kill();
  }
}
