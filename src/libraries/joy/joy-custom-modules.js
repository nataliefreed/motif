import { Joy } from "./joy.js";
import { BaseModal, ModalBackdrop } from "./components/modals.js";
import { JoyWidget, JoyButton } from './components/ui-widgets.js';
import { _clone, _HSVtoRGB, _HSVToRGBString } from "./joy-utils.js";
import { _hexToRGB } from "../../utils/color-utils.js";

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
      self.pathUI.setPath(value);
    };

  },
  onget: function(my){
    return my.data.value;
  },
  placeholder: "???"
});

// source: this.dom,
// options: this.options,
// onchange: (value) => {
//     this.value = value;
//     this.updateLabel();
//     if (typeof this.onchange === "function") {
//       this.onchange(value);
//     }
// },
// position: this.position
// }).show();


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

    number.addEventListener('input', e => {
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
          closeButton: true,
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