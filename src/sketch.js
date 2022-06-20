//move in X (left-right)
//move in Y (up-down)
//stamp
//color filter
//


let drawingButtons = [];
let code = [];
let codePanel;
let motif = [];
let drawingArea, motifArea;
let cursor;

let colors = [
  '#648FFF',
  '#785EF0',
  '#DC267F',
  '#FE6100',
  '#FFB000',
  '#7BC56E'
];

function setup() {
  createCanvas(1000, 800);
  
  cursor = createVector(100, 100);
  
  drawingArea = createGraphics(800, 800);
  motifArea = createGraphics(160, 160);
  
  let buttonNames = ['stamp', 'colorize', 'stripe', 'invert', 'clearScreen'];
  
  buttonNames.forEach(element =>
       drawingButtons.push(createButton(element).mousePressed(eval(element))));
  
  codePanel = createElement('textarea', '').size(300, 350).id('codeArea').position(10, 1000);

  drawingArea.background(255);
}

function draw() {
  
  if(mouseIsPressed) {
    drawingArea.strokeWeight(random(8, 25));
    drawingArea.colorMode(HSB);
    drawingArea.stroke(color(random(255), 50, 200));
    drawingArea.ellipse(mouseX, mouseY, 2, 2);
  }
  
  renderMotif(motif, motifArea, 0, 0, 20);
  codePanel.html(code.join("\n"));
  
  image(drawingArea, 0, 0);
  image(motifArea, 830, 0);
  
  // noFill();
  // strokeWeight(1);
  // stroke(0);
  // rect(10, 10, 380, 380);
}

function left() {
  
}

function right() {
  
}

function up() {
  
}

function down() {
  
}

function stamp() {
  let diameter = random(30, 60);
  drawingArea.colorMode(HSB);
  drawingArea.fill(random(255), 50, 200);
  drawingArea.noStroke();
  drawingArea.ellipse(random(drawingArea.width), random(drawingArea.height), diameter, diameter);
  code.push("stamp");
  motif.push(colors[0]);
}

function colorize() {
  drawingArea.colorMode(HSB);
  let c = drawingArea.color(random(255), 50, 200, 0.3);
  drawingArea.noStroke();
  drawingArea.fill(c);
  drawingArea.rect(0, 0, drawingArea.width, drawingArea.height);
  code.push("colorize");
  // motif.push(c);
  motif.push(colors[1]);
}

function invert() {
  drawingArea.filter(INVERT);
  code.push("invert");
  colorMode(RGB);
  motif.push(colors[2]);
  
}

function stripe() {
  drawingArea.push();
  drawingArea.strokeCap(SQUARE);
  drawingArea.strokeWeight(10);
  drawingArea.stroke(255, 0.4)
  for(let i=10;i<drawingArea.height;i+=20) {
    drawingArea.line(0, i, drawingArea.width, i);
  }
  code.push("stripe");
  colorMode(RGB);
  motif.push(colors[3]);
  drawingArea.pop();
}

function clearScreen() {
  drawingArea.background(255);
  code.push("clear");
  colorMode(RGB);
  motif.push(colors[4]);
}

function motifToCode() {
  
}

function renderMotif(m, g, x, y, cellSize) {
  g.push();
  let k = 0;
  let len = m.length;
  g.colorMode(RGB);
  g.strokeWeight(1);
  g.stroke(0);
  for(let row=0;row<8;row++) {
    for(let col=0;col<8;col++) {
      if(k < len) {
        g.fill(m[k]);
      } else {
        g.fill(255);
      }
      g.rect(x+col*cellSize, y+row*cellSize, cellSize, cellSize);
      k++;
    }
  }
  g.pop();
}

function parseMotifImg(pixels) {
  let code = [];
  return code;
}

/* a drawing tool (command?) has code it runs,
a color or icon associated with it,

*/

// class DrawingParameterizer {
//   constructor() {
    
//   }
//   getUI() {
    
//   }
//   getParameter() {
    
//   }
// };

// class DrawingColorPicker extends DrawingParameterizer {
  
// };

// class DrawingTool {
//   constructor(name, displayColor, parametrizers, fxnDef) {
//     this.name = name;
//     this.displayColor = displayColor;
//     this.parametrizers = parametrizers;
//     this.fxnDef = fxnDef;
//   }
  
//   getUI() {
    
//   }
  
  
  
//   onClicked() {
//     const params = {};
//     parametrizers.forEach(p => {
//       params[p.key] = p.value.getParameter();
//     });
//     return new DrawingEvent(this.name, this.fxnDef, params, this.displayColor);
//   }
// }

// function initTools() {
//   const allTools = [];
//   allTools.push(new DrawingTool(
//     "colorize", colors[0], 
//     {color: new DrawingColorPicker(),},
//     ({color}) => {
//       drawingArea.colorMode(HSB);
//       let c = drawingArea.color(random(255), 50, 200, 0.3);
//       drawingArea.noStroke();
//       drawingArea.fill(c);
//       drawingArea.rect(0, 0, 380, 380);
//     }
//   ));
// }


// class DrawingEvent {
//   constructor(name, fxnDef, params, color) {
//     this.name = name;
//     this.def = fxnDef;
//     this.params = params;
//     this.color = color;
//   }
  
//   apply() {
    
//   }
// }