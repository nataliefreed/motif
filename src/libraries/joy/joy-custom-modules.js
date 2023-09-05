import { Joy } from "./joy.js";
import { BaseModal, ModalBackdrop } from "./components/modals.js";
import { JoyWidget } from './components/ui-widgets.js';
import { _clone } from "./joy-utils.js";

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

Joy.add({
  type: "number-with-modal",
  tags: ["ui"],
  initWidget: function(){
    let o = this.options;

    let slider = new NumberSlider({
      min: o.min,
      max: o.max,
      step: o.step,
      value: this.getData("value"),
      onstart: () => {
        this.top.activePreview = this;
      },
      onstop: () => {
        this.top.activePreview = null;
      },
      onchange: (value) => {
        this.setData("value", value);
      },
    });
    this.dom = slider.dom;

    // PREVIEW ON HOVER. WIGGLE IT JUST ONCE.
    
    let _ticker = null;
    let _fps = 30;
    this.dom.onmouseenter = () => {

      if(!this.top.canPreview("numbers")) return;
      
      // Create Preview Data
      this.previewData = _clone(this.data);

      // Wiggle by 5%... as long as that's not less than 0.5, not more than 2.
      let _amplitude = Math.abs(this.data.value*0.05);
      //if(_amplitude<0.5) _amplitude=0.5; // TODO: WITH SIGFIG
      //if(_amplitude>3) _amplitude=3;
      if(_amplitude==0) _amplitude=1; // If it's EXACTLY zero, wiggle with 1, whatever.
      let _timer = 0;
      _ticker = setInterval(() => {

        if(!this.top.canPreview("numbers")) return _stopPreview(); // don't even

        _timer += (Math.PI*2/_fps)/0.25; // 0.25 seconds
        this.previewData.value = this.data.value + Math.sin(_timer)*_amplitude;
        this.update();

        if(_timer>Math.PI*2) _stopPreview(); // yer done, son.

      },1000/_fps);

    };
    let _stopPreview = () => {
      if(_ticker) clearInterval(_ticker);
      this.previewData = null;
      this.update();
    };
    this.dom.onmouseleave = _stopPreview;
  },
  onget: function(my) {
    return my.data.value;
  },
  placeholder: {
    value: 3
  }
});

export class NumberSlider extends JoyWidget {
  constructor(config) {
    super(config);

    this.sigfigs = 0;
    this.min = config.min;
    this.max = config.max;
    this.value = config.value;

    this.dom.onclick = () => this._showSliderModal();

    this.dom.className = "number-slider-widget";

    this._setLabel(this.value);
  }

  _setLabel(value) {
    this.dom.innerHTML = value.toFixed(this.sigfigs);
  }

  _onValueChange(value) {
    value = parseFloat(value.toFixed(this.sigfigs));
    this.config.onChange(value);
  }

  _showSliderModal() {
    new SliderModal({
      source: this.dom,
      position: this.position,
      onchange: (value) => {
        this.value = value;
      },
      min: this.min,
      max: this.max
    }).show();
  }
}



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
    this.min = config.min;
    this.max = config.max;

    this.dom.style.width = "30px";
    this.dom.style.height = "10px";

    this.dom.classList.add("slider-modal");
    let slider = document.createElement("input");
    slider.classList.add("slider");
    this.dom.appendChild(slider);
  }

  onchange(value) {
    this.kill();
  }

  // show() {
  //   console.log(this);
  // }
  
  kill() {
    super.kill();
  }
}


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