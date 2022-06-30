let code = [];
let codePanel;
let drawingCanvas;
let stencils = {};

let line = null;
let lines = [];

let app;

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

  app = new MotifApp();

  drawingCanvas = createGraphics(height, height);
  drawingCanvas.background(200);
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

  app.render(drawingCanvas);

  image(drawingCanvas, 0, 0); //main drawing area
  image(getMaskedImage(), 610, 450, 150, 150); // small preview
}

function mouseDragged() {
  if (isOnCanvas()) {
    app.logMouseEvent();
  }
}

function mousePressed() {
  if (isOnCanvas()) {
    app.logMouseEvent();
  }
}

function mouseReleased() {
  app.endCurrentEvent();
}

/*

                    _                               _ __    _ __  
  _ __    __ _     (_)    _ _       o O O  __ _    | '_ \  | '_ \ 
 | '  \  / _` |    | |   | ' \     o      / _` |   | .__/  | .__/ 
 |_|_|_| \__,_|   _|_|_  |_||_|   TS__[O] \__,_|   |_|__   |_|__  
_|"""""|_|"""""|_|"""""|_|"""""| {======|_|"""""|_|"""""|_|"""""| 
"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'./o--000'"`-0-0-'"`-0-0-'"`-0-0-' 

*/

class MotifApp {
  constructor() {
    this.eventList = new EventList();
    this.effects = new EffectSet();
    this.loadEffects();
    this.initUI();
    this.codePanel = document.getElementById('code-panel');
    this.currentEvent = null;
  }

  initUI() {
    //add effect buttons
    let options = document.getElementById('options-bar');
    this.effects.getButtonsHTML().forEach((b) => {
      b.addEventListener("click", (e) => {
        markSelectedById("effect-button", e.target.id);
        this.showEffectSettings(e.target.id);
      });
      options.appendChild(b);
    });
    //add history editing buttons
    document.getElementById("delete-button").addEventListener('click', this.deleteSelectedCodeLine);
    document.getElementById("move-up-button").addEventListener('click', this.moveSelectedCodeLineUp);
    // document.getElementById("move-down-button").addEventListener('click', moveSelectedCodeLineDown);
    document.getElementById("clear-all-button").addEventListener('click', this.clearAll);
  }

  showEffectSettings(effectName) {
    let effect = this.effects.getEffectByName(effectName);
    let settingsPanel = document.getElementById('current-effect-params');
    settingsPanel.replaceChildren(); //clear all

    for (const name in effect.settings) {
      settingsPanel.appendChild(effect.settings[name].createDiv((e) => {
        effect.settings[name].update(e.target.value);
      }));
    }
  }

        // param.addEventListener("input", function(e) {
      //   console.log(lineNumToUpdate, e.target.value);
      //   if(lineNumToUpdate !== undefined) { 
      //     updateEffectSetting(lineNumToUpdate, name, e.target.value);
      //   }
      //   e.stopPropagation(); //not working, full line still selected      
      // });
    // }

  getActiveEffect() {
    return this.effects.getEffectByName(this.getActiveEffectName());
  }

  render(p5) {
    this.eventList.render(p5, this.getSelectedLineNum());
  }

  loadEffects() {
    this.effects.addEffect("horizontal stripe", new Effect(
      "horizontal stripe",
      (pg, points, settings) => {
          let c = color(settings.color.getValue());
          c.setAlpha(pg.map(settings.opacity.getValue(), 0, 100, 0, 255));
          pg.stroke(c);
          pg.noFill();
          pg.strokeWeight(settings.lineWeight.getValue());
          points.forEach(p => {
            pg.line(0, p.position.y, width, p.position.y);
          });
      },
      {
        color: new DrawingParameterColor('color', '#4422aa'),
        opacity: new DrawingParameterRange('opacity', 30, 1, 100),
        lineWeight: new DrawingParameterRange('lineWeight', 10, 2, 16),
      },
      "brush"
    ));
  
    this.effects.addEffect("vertical stripe", new Effect(
      "vertical stripe",
        (pg, points, settings) => {
          let c = color(settings.color.getValue());
          c.setAlpha(pg.map(settings.opacity.getValue(), 0, 100, 0, 255));
          pg.stroke(c);
          pg.noFill();
          pg.strokeWeight(settings.lineWeight.getValue());
          points.forEach(p => {
            pg.line(p.position.x, 0, p.position.x, height);
          });
      },
      { 
        color: new DrawingParameterColor('color', '#11ffbb'),
        opacity: new DrawingParameterRange('opacity', 30, 1, 100),
        lineWeight: new DrawingParameterRange('lineWeight', 10, 2, 16),
      },
      "brush"
    ));
  
    this.effects.addEffect("colorize", new Effect(
      "colorize",
        (pg, points, settings) => {
          //doesn't use location of click
          if(points.length > 0) {
            let c = color(settings.color.getValue());
            c.setAlpha(pg.map(settings.opacity.getValue(), 0, 100, 0, 255));
            pg.fill(c);
            pg.noStroke();
            pg.rect(0, 0, pg.width, pg.height);
          }
        },
      { 
        color: new DrawingParameterColor('color', '#ff22aa'),
        opacity: new DrawingParameterRange('opacity', 30, 1, 100),
     },
      "effect"
    ));
       
    this.effects.addEffect("stoplight", new Effect(
      "stoplight",
      (pg, points, settings) => {
          let colors = ['#ff0066', '#ffe100', '#00c750'];
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
            pg.circle(points[i].position.x, points[i].position.y, settings.diameter.getValue());
          }
          pg.pop();
        },
      {
        diameter: new DrawingParameterRange('diameter', 10, 5, 40),
      },
      "brush"
    ));
  }

  initP5() { //example of P5 in instance mode
    let p5Instance = new p5((sketch) => {

      let x = 100;
      let y = 100;
    
      sketch.setup = () => {
        sketch.createCanvas(200, 200);
      };
    
      sketch.draw = () => {
        sketch.background(0);
        sketch.fill(255);
        sketch.rect(x,y,50,50);
      };
    },
    document.getElementById('p5sketch')); //<---it will go in this div
    return p5Instance;
  }

  logMouseEvent() {
    if(this.currentEvent != null) {
      this.currentEvent.addPoint(createVector(mouseX, mouseY), millis());
    } else {
      let activeEffect = this.getActiveEffect();
      if(activeEffect) {
        this.currentEvent = activeEffect.createEvent(createVector(mouseX, mouseY), millis());
        this.eventList.addDrawingEvent(this.currentEvent);
        this.updateCodePanel();
      }
    }
  }

  endCurrentEvent() {
    this.currentEvent = null;
  }

  //currently selected line number
  getSelectedLineNum() {
    let selectedLines = document.getElementsByClassName("code-line selected");
    if(selectedLines.length > 0) {
      return selectedLines[0].id.split("-")[2]; //line num is saved in ID
    }
    else return 0;
  }

  deleteSelectedCodeLine = () => {
    let lineNum = this.getSelectedLineNum();
    this.eventList.deleteLineAt(lineNum);
    this.updateCodePanel();
  }

  moveSelectedCodeLineUp = () => {
    let lineNum = this.getSelectedLineNum();
    this.eventList.moveLineUp(lineNum);
    this.updateCodePanel();
  }

  moveSelectedCodeLineDown() {
    let lineNum = this.getSelectedLineNum();
    this.eventList.moveLineDown(lineNum);
    this.updateCodePanel();
  }

  clearAll() {
    this.eventList.clear();
    this.updateCodePanel();
  }

  updateCodePanel() {
    this.codePanel.replaceChildren(); //clear
    let index = 0;
    let lastAdded;
    let eventDivs = this.eventList.getEventDivs();
    eventDivs.forEach(eventDiv => {
      eventDiv.addEventListener("click", (e) => {
        if(e.target.classList.contains("code-line")) { //don't select if only setting clicked
          markSelectedById("code-line", eventDiv.id);
        }
      });
      this.codePanel.appendChild(eventDiv);
      lastAdded = eventDiv;
    });
    if(lastAdded) {
      markSelectedById("code-line", lastAdded.id); //select the last one added
    }
  }

  //TODO
  getActiveEffectName() {
    let selectedEffects = document.getElementsByClassName("effect-button selected");
    if(selectedEffects.length > 0) {
      let selectedEffect = selectedEffects[0];
      return selectedEffect.id;
    } else return "";
  }
}
/*
                                   _             
   ___    __ __    ___    _ _     | |_     ___   
  / -_)   \ V /   / -_)  | ' \    |  _|   (_-<   
  \___|   _\_/_   \___|  |_||_|   _\__|   /__/_  
_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""| 
"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-' 
*/
class EventList {
  constructor() {
    this.events = [];
  }

  addDrawingEvent(event) {
    this.events.push(event);
  }

  length() {
    return this.events.length;
  }

  getEventDivs() {
    let eventDivs = [];
    let index = 0;
    this.events.forEach(event => {
      eventDivs.push(event.createEventDiv(index++));
    });
    return eventDivs;
  }

  render(p5, lineNum) {
    if (this.length() > 0) {
      for(let i=0;i<=lineNum;i++) {
        let event = this.events[i];
        event.render(p5);
      }
    }
  }

  updateEffectSetting(lineNum, name, value) {
    if(lineNum < this.length()) {
      this.events[lineNum].updateSetting(name, value);
    }
  }

  moveLineUp(lineNum) {
    let newLineNum = 0;
    if(lineNum < this.length() && lineNum > 0) {
        let line = this.events[lineNum];
        this.events.splice(lineNum, 1);
        this.events.splice(lineNum-1, 0, line);
        newLineNum = lineNum - 1;
        // this.markSelected("code-line", "code-line-" + newLineNum);
    }
    return newLineNum;
  }

  moveLineDown(lineNum) {

  }

  deleteLineAt(lineNum) {
    if(lineNum < this.length()) {
      //add to undo/redo here
      this.events.splice(lineNum, 1);
      if(this.length() > 0) {
        if(lineNum > 0 && lineNum < this.length()) {
          markSelectedById("code-line", "code-line-" + lineNum);
        }
        else if(lineNum == 0) {
          markSelectedById("code-line", "code-line-0");
        }
      }
    }
  }

  clear() {
    this.events = []; //TODO: save in case of undo/redo
  }
}

class DrawingEvent {
  constructor(effect, startPosition, time) {
    this.effect = effect;
    this.startTime = time;
    this.line = new DrawnLine(createVector(startPosition.x, startPosition.y), time);
    // this.params["color"] = new DrawingParameterColor("color", "#" + Math.floor(Math.random()*16777215).toString(16)); //random color
    this.settings = effect.settings;
    this.uuid = crypto.randomUUID();
  }

  render(p5) {
    let points = this.pointsByTime(millis());
    this.effect.applyEffect(p5, points, this.settings);
  }
  
  // //create a settings object - just names and values
  // getSettings() {
  //   let settings = {};
  //   for (const [key, value] of Object.entries(this.params)) {
  //     settings[key] = this.params[key].getValue();
  //   }
  //   return settings;
  // }

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
    // this.settings[name] = value;
    // console.log("setting " + name + " to " + value);
  }

  createEventDiv(index) {
    let id = "code-line-" + index;
    let eventDiv = document.createElement('div');
    eventDiv.setAttribute("id", id);
    eventDiv.innerText = this.effect.getName();
    eventDiv.classList.add("code-line");
  
    // eventDiv.addEventListener("click", (e) => {
    //   markSelectedById("code-line", id);
    // });
    for (const name in this.settings) {
      eventDiv.appendChild(this.settings[name].createDiv((e) => {
        this.settings[name].update(e.target.value);
      }));
    }
    return eventDiv;
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

class DrawingParameter {
  constructor(name, value) {
    this.name = name;
    this.value = value;
  }

  createDiv(onClick) {
  }

  getValue() {
    return this.value;
  }

  update(value) {
    this.value = value;
  }

  clone() {
  }
}

class DrawingParameterColor extends DrawingParameter {
  constructor(name, value) {
    super(name, value);
  }

  createDiv(onClick) {
    let param = document.createElement('input');
    param.setAttribute("type", "color");
    param.setAttribute("value", this.value);
    param.classList.add("param");
    param.setAttribute("name", this.name);
    param.addEventListener("input", onClick);
      // param.addEventListener("input", function(e) {
      //   console.log(lineNumToUpdate, e.target.value);
      //   if(lineNumToUpdate !== undefined) { 
      //     updateEffectSetting(lineNumToUpdate, name, e.target.value);
      //   }
      //   e.stopPropagation(); //not working, full line still selected      
      // });
    // }
    return param;
  }

  clone() {
    return new DrawingParameterColor(this.name, this.value);
  }
}

class DrawingParameterRange extends DrawingParameter {
  constructor(name, value, min, max) {
    super(name, value);
    this.min = min;
    this.max = max;
  }

  createDiv(onClick) {
    let param = document.createElement('input');
    param.setAttribute("type", "range");
    param.setAttribute("value", this.value);
    param.setAttribute("min", this.min);
    param.setAttribute("max", this.max);
    param.classList.add("param");
    param.setAttribute("name", this.name);
    param.addEventListener("input", onClick);
    return param;
  }

  clone() {
    return new DrawingParameterRange(this.name, this.value, this.min, this.max);
  }
}

/*
             __      __                    _             
   ___      / _|    / _|   ___     __     | |_     ___   
  / -_)    |  _|   |  _|  / -_)   / _|    |  _|   (_-<   
  \___|   _|_|_   _|_|_   \___|   \__|_   _\__|   /__/_  
_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""| 
"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-' 
*/
class EffectSet {
  constructor() {
    this.effects = {};
  }

  addEffect(name, effect) {
    this.effects[name] = effect;
  }

  getButtonsHTML() {
    let buttons = [];
    Object.values(this.effects).forEach((effect) => {
      buttons.push(effect.getButtonHTML());
    });
    return buttons;
  } 

  getEffectByName(name) {
    return this.effects[name];
  }
}

/* A particular drawing tool */
class Effect {
  constructor(name, applyEffect, settings, category) {
    this.name = name;
    this.applyEffect = applyEffect;
    this.category = category;
    this.settings = settings;
  }

  getButtonHTML() {
    let b = document.createElement("input");
    b.setAttribute("type", "button");
    b.classList.add('effect-button');
    b.setAttribute("value", this.name);
    b.setAttribute("id", this.name);
    return b;
  }

  getName() {
    return this.name;
  }

  cloneSettings() {
    let copy = { };
    for(const name in this.settings) {
      copy[name] = this.settings[name].clone();
    }
    return copy;
  }

  clone() {
    return new Effect(this.name, this.applyEffect, this.cloneSettings(), this.category);
  }

  createEvent(startPosition, time) {
    return new DrawingEvent(this.clone(), startPosition, time);
  }
}

/*
           _        _       _            
  _  _    | |_     (_)     | |     ___   
 | +| |   |  _|    | |     | |    (_-<   
  \_,_|   _\__|   _|_|_   _|_|_   /__/_  
_|"""""|_|"""""|_|"""""|_|"""""|_|"""""| 
"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-' 
*/

function getMaskedImage() {
  let currentStencil = document.getElementById("stencil").value;
  let drawingImage = pGraphicsToPImage(drawingCanvas);
  drawingImage.mask(stencils[currentStencil]);
  return drawingImage;
}

function pGraphicsToPImage(pg) {
  let img = createImage(pg.width, pg.height);
  img.copy(pg, 0, 0, pg.width, pg.height, 0, 0, pg.width, pg.height);
  return img;
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

function markSelectedById(className, id) {
  document.getElementsByClassName(className).forEach(element => {
    element.classList.remove('selected');
  });
  document.getElementById(id).classList.add('selected');
}

/*
   _                 _           
  | |_     ___    __| |    ___   
  |  _|   / _ \  / _` |   / _ \  
  _\__|   \___/  \__,_|   \___/  
_|"""""|_|"""""|_|"""""|_|"""""| 
"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-' 
*/

function getCurrentSettings() {
  let settingsPanel = document.getElementById('current-effect-params');
  // return { "color": settingsPanel.firstChild.value }; //temp
  return { "color": '#ababab'}; //even more temp
}

// function addEffectButtonAndShowSettings(name, settings) {
//   let b = document.createElement("input");
//   b.setAttribute("type", "button");
//     b.classList.add('effect-button');
//     b.setAttribute("value", name);
//     b.setAttribute("id", name);
//     b.addEventListener("click", (e) => {
//       selectedEffect = name;
//       this.markSelected("effect-button", name);
//       showEffectSettings(settings);
//     });
//     document.getElementById('options-bar').appendChild(b);
// }

