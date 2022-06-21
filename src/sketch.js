let stripe, dot;
let drawingTools;
let code = [];
let codePanel;
let currentEffect, selectedEffect;
let effects = {};
let dressStencil;
let drawingCanvas;
let stencils = {};

let line = null;
let lines = [];
let history = [];
let currentEvent = null;
let time;
let playing = false;

function preload() {
  stencils["dress"] = loadImage("./src/assets/no sleeve dress.png");
  stencils["shirt and pants"] = loadImage("./src/assets/shirt and pants.png");
  stencils["fishbowl"] = loadImage("./src/assets/fishbowl.png");
  stencils["cake"] = loadImage("./src/assets/cake.png");
}

/*
                   _               _ __  
   ___     ___    | |_    _  _    | '_ \ 
  (_-<    / -_)   |  _|  | +| |   | .__/ 
  /__/_   \___|   _\__|   \_,_|   |_|__  
_|"""""|_|"""""|_|"""""|_|"""""|_|"""""| 
"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-' 

*/

function setup() {
  createCanvas(1100, 600);
  background(255);

  drawingCanvas = createGraphics(height, height);
  drawingCanvas.background(200);

  toolPalette = createRadio();
  toolPalette.addClass("tool-palette");
  
  button = createButton('delete').position(650, 380).mousePressed(deleteSelectedCodeLine);
  button = createButton('move up').position(718, 380).mousePressed(moveSelectedCodeLineUp);
  button = createButton('clear all').position(800, 380).mousePressed(clearAll);
  // button = createButton('repeat').position(700, 410);
  // button = createButton('select similar').position(815, 410);
  
  loadEffects();

  codePanel = document.getElementById('code-panel');

//   codePanel = createDiv("")
//     .size(300, 350)
//     .position(630, 20)
//     .id("code-panel");
}

/* 
     _                            
  __| |     _ _   __ _   __ __ __ 
 / _` |    | '_| / _` |  \ V  V / 
 \__,_|   _|_|_  \__,_|   \_/\_/  
_|"""""|_|"""""|_|"""""|_|"""""|  
"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'  

*/

function draw() {
  background(255);
  drawingCanvas.background(200);

  if (history.length > 0) {
    let lineNum = getSelectedLineNumber();
    // let historyNow = history.filter(event => event.startTime < millis() % 5000);
    for(let i=0;i<=lineNum;i++) {
      let event = history[i];
      let effect = effects[event.effect];
      let points = event.pointsByTime(millis());
      effect.applyEffect(drawingCanvas, points, event.settings);
    }
  }

  image(drawingCanvas, 0, 0);
  image(getMaskedImage(), 610, 450, 150, 150);
}

function getSelectedLineNumber() {
  let selectedLines = document.getElementsByClassName("code-line selected");
  if(selectedLines.length > 0) {
    return selectedLines[0].id.split("-")[2];
  }
  else return 0;
}

function moveSelectedCodeLineUp() {
  let lineNum = getSelectedLineNumber();
  if(lineNum < history.length) {
    if(lineNum > 0) {
      let line = history[lineNum];
      history.splice(lineNum, 1);
      history.splice(lineNum-1, 0, line);
      updateCode();
      let newLineNum = lineNum - 1;
      markSelected("code-line", "code-line-" + newLineNum);
    }
  }
}

function deleteSelectedCodeLine() {
  let lineNum = getSelectedLineNumber();
  if(lineNum < history.length) {
    //add to undo/redo here
    history.splice(lineNum, 1);
    updateCode();
    if(history.length > 0) {
      if(lineNum > 0 && lineNum < history.length) {
        markSelected("code-line", "code-line-" + lineNum);
      }
      else if(lineNum == 0) {
        markSelected("code-line", "code-line-0");
      }
    }
  }
}

function clearAll() {
  history = [];
  updateCode();
}

//event.getEndTime()

function markSelected(className, id) {
  document.getElementsByClassName(className).forEach(b => {
    b.classList.remove('selected');
  });
  document.getElementById(id).classList.add('selected');
}

function getMaskedImage() {
  let currentStencil = document.getElementById("stencil").value;
  let drawingImage = pGraphicsToPImage(drawingCanvas);
  drawingImage.mask(stencils[currentStencil]);
  return drawingImage;
}

/* A particular drawing tool */
class Effect {
  constructor(name, methods, settings, category) {
    this.name = name;
    this.applyEffect = methods.applyEffect;
    this.category = category;
    this.settings = settings;
  }

  addButton() {
    addEffectButtonAndShowSettings(this.name, this.settings);
  }
}

function addEffectButtonAndShowSettings(name, settings) {
  let b = document.createElement("input");
  b.setAttribute("type", "button");
    b.classList.add('effect-button');
    b.setAttribute("value", name);
    b.setAttribute("id", name);
    b.addEventListener("click", function(e) {
      selectedEffect = name;
      markSelected("effect-button", name);
      showEffectSettings(settings);
    });
    document.getElementById('options-bar').appendChild(b);
}

function showEffectSettings(settings) {
  let settingsPanel = document.getElementById('current-effect-params');
  settingsPanel.replaceChildren(); //clear all
  console.log(settings);
  for (const [key, value] of Object.entries(settings)) {
    // console.log(key, value);
    settingsPanel.appendChild(createParameterDiv(key, key, value));
  }
}

class DrawnLine {
  constructor(startPosition, time) {
    this.startPosition = startPosition;
    this.startTime = time;
    this.points = [];
    this.points.push({ position: startPosition, time: 0 });
  }

  addPoint(point, time) {
    this.points.push({ position: point, time: time - this.startTime });
  }

  renderByPoints(n) {
    push();
    strokeWeight(5);
    stroke(0);
    let m = min(n, this.points.length);
    for (let i = 0; i < m; i++) {
      point(this.points[i].position);
    }
    pop();
  }

  renderByTime(t) {
    push();
    strokeWeight(5);
    stroke(0);

    let pointsToRender = this.points.filter((p) => p.time <= t);
    pointsToRender.forEach((p) => point(p.position));

    pop();
  }

  pointsByTime(t) {
    let pointSet = this.points.filter((p) => p.time <= t);
    return pointSet;
  }
}

function isOnCanvas() {
  return (
    mouseIsPressed &&
    mouseX > 0 &&
    mouseX < drawingCanvas.width &&
    mouseY > 0 &&
    mouseY < drawingCanvas.height
  );
}

function getCurrentEffect() {
  // let selectedEffect = toolPalette.value();
  // console.log(selectedEffect);
  if (selectedEffect) {
    let currentEffect = effects[selectedEffect];
    return currentEffect;
  } else return null;
}

function pGraphicsToPImage(pg) {
  let img = createImage(pg.width, pg.height);
  img.copy(pg, 0, 0, pg.width, pg.height, 0, 0, pg.width, pg.height);
  return img;
}

function mouseDragged() {
  if (isOnCanvas() && selectedEffect) {
    if(currentEvent) {
      currentEvent.addPoint(createVector(mouseX, mouseY), millis());
    } else {
      currentEvent = new DrawingEvent(
        selectedEffect,
        getCurrentSettings(),
        createVector(mouseX, mouseY),
        millis()
      );
      history.push(currentEvent);
      updateCode();
    }
  }
}

function mouseReleased() {
  if(currentEvent) {
    currentEvent = null;
  }
}

function mousePressed() {
  if (isOnCanvas() && selectedEffect) {
    if(currentEvent) {
      currentEvent.addPoint(createVector(mouseX, mouseY), millis());
    } else {
      currentEvent = new DrawingEvent(
        selectedEffect,
        getCurrentSettings(), //<--- this is where currently active settings get passed in
        createVector(mouseX, mouseY),
        millis()
      );
      history.push(currentEvent);
      updateCode();
    }
  }
}

function updateCode() {
  codePanel.replaceChildren(); //clear
  let index = 0;
  let lastAdded;
  history.forEach(event => {
    let newLine = createEventDiv(event, index++);
    codePanel.appendChild(newLine);
    lastAdded = newLine;
  });
  if(lastAdded) {
    markSelected("code-line", lastAdded.id); //last one added
  }
}

function createEventDiv(event, index) {
  let effect = event.effect;
  let id = "code-line-" + index;
  let eventDiv = document.createElement('div');
  eventDiv.setAttribute("id", id);
  eventDiv.innerText = effect;
  eventDiv.classList.add("code-line");

  eventDiv.addEventListener("click", function(e) {
    markSelected("code-line", id);
  });
  for (const [key, value] of Object.entries(event.settings)) {
    eventDiv.appendChild(createParameterDiv(key, key, value, index));
  }
  return eventDiv;
}

//TODO: switch this to Javascript style divs etc. not P5 so I can have event handlers that know where they are. Or something. Right now I don't seem to be accessing the new color picker value.
function createParameterDiv(name, type, value, lineNumToUpdate) {
  let param;
  switch(type) {
    case "color":
      // param = document.createElement(color(value)).addClass("param");
      param = document.createElement('input');
      param.setAttribute("type", "color");
      param.setAttribute("value", value);
      param.classList.add("param");
      break;
    default:
      // param = createDiv(key + " " + value).addClass("param");
      break;
  }
  if(param) {
    param.setAttribute("name", name);
    param.addEventListener("input", function(e) {
      console.log(lineNumToUpdate, e.target.value);
      if(lineNumToUpdate !== undefined) { 
        updateEffectSetting(lineNumToUpdate, name, e.target.value);
      }
      e.stopPropagation(); //not working, full line still selected
              
    });
  }
  return param;
}

function updateEffectSetting(lineNum, name, value) {
  console.log(lineNum, name, value);
  if(lineNum < history.length) {
    history[lineNum].updateSetting(name, value);
  }
}

//deprecated - remove after testing
function getCurrentColor() {
  let c = document.getElementById("color-picker").value;
  return c;
}

function getCurrentSettings() {
  let settingsPanel = document.getElementById('current-effect-params');
  return { "color": settingsPanel.firstChild.value }; //temp
}

class DrawingEvent {
  constructor(effect, settings, startPosition, time) {
    this.effect = effect; //effect name
    this.startTime = time;
    this.line = new DrawnLine(createVector(startPosition.x, startPosition.y), time);
    this.settings = settings;
    // console.log(settings.color);
  }
  
  addPoint(point, time) {
    this.line.addPoint(point, time);
  }
  
  pointsByTime(t) {
    return this.line.pointsByTime(t);
  }
  
  getEndTime() {
    let numPoints = this.line.points.length;
    return this.line.points[numPoints - 1].time;
  }
  
  updateSetting(name, value) {
    this.settings[name] = value;
    console.log("setting " + name + " to " + value);
  }
}

// class EffectSettings {
//   constructor()
  
// }

/*
Each drawing effect has a set of parameters and controllers for those parameters
Examples of parameters: fill color, stripe width, swirl radius...
Examples of controllers: slider, color picker,...
Parameters are (mostly) unique to the effects (stripe width for eg)
Controllers are more general but will be set differently based on the effect (min and max of slider, colors available,...)

- When event is created, pass currently active settings in
- When effect is selected, display settings pane that is associated with that effect
  - createSettingsPanel -> takes in effect object and generates HTML
- When event is selected, display settings pane that is associated with that event based on effect
- Effect definition needs to include settings pane and use whichever settings it needs
    stripeWidth --- slider with min 2 and max 10
    
- When "code" is printed, it should list parameters (eg. colorize fill blue)
    - can get these from the effect in "history" that is associated with that line of code

*/

function loadEffects() {
   effects["horizontal stripe"] = new Effect(
    "horizontal stripe",
    {
      applyEffect: (pg, points, settings) => {
        let c = color(settings.color);
        c.setAlpha(50);
        pg.stroke(c);
        pg.noFill();
        pg.strokeWeight(10);
        points.forEach(p => {
          pg.line(0, p.position.y, width, p.position.y);
        });
      }
    },
    { color: '#B9B9B9' },
    "effect"
  );

  effects["vertical stripe"] = new Effect(
    "vertical stripe",
    {
      applyEffect: (pg, points, settings) => {
        let c = color(settings.color);
        c.setAlpha(50);
        pg.stroke(c);
        pg.noFill();
        pg.strokeWeight(10);
        points.forEach(p => {
          pg.line(p.position.x, 0, p.position.x, height);
        });
      },
    },
    { color: '#ffffff' },
    "brush"
  );

  effects["colorize"] = new Effect(
    "colorize",
    {
      applyEffect: (pg, points, settings) => {
        //doesn't use location of click
        if(points.length > 0) {
          let c = color(settings.color);
          c.setAlpha(100);
          pg.fill(c);
          pg.noStroke();
          pg.rect(0, 0, pg.width, pg.height);
        }
      },
    },
    { color: '#6366F4' },
    "brush"
  );
     
  effects["stoplight"] = new Effect(
    "stoplight",
    {
      applyEffect: (pg, points, settings) => {
        colors = ['#ff0066', '#ffe100', '#00c750'];
        pg.push();
        let timeInterval = 500;
        for(let i=0;i<points.length;i++) {
          // let c = i % 10; //change based on number of points
          let c = points[i].time % timeInterval;
          if(c < timeInterval*0.4) {
            pg.fill(colors[0]);
          } else if(c < timeInterval*0.5) {
            pg.fill(colors[1]);
          } else if(c < timeInterval){
            pg.fill(colors[2]);
          }
          pg.noStroke();
          pg.circle(points[i].position.x, points[i].position.y, 10);
        }
        pg.pop();
      }
    },
    { color: '#F3DA2B' },
    "brush"
  )

  Object.values(effects).forEach((item) => {
    item.addButton(this, toolPalette);
  });
}
