import { reindex } from '../utils/utils.js';

export class EffectManager {
  constructor(effectList) {
    this.effectList = effectList;
    this.effects = {};
    this.effectList.forEach(e => {
      let type = e.mouseActionType;
      if(type === 'drag') {
        console.log("Adding effect " + e.name);
        this.effects[e.name] = new PathEffect(e); //index by name
      }
      else if(type === 'single-click2') {
        console.log("Adding effect " + e.name);
        this.effects[e.name] = new PointEffect(e);
      }
      else {
        console.warn(`Unknown mouseActionType "${type}" for effect named "${e.name}".`);
      }
    });
  }

  registerEffect(effect) {
    if(effect && effect.name) {
      this.effects[effect.name] = effect;
    }
  }

  getEffects() {
    return this.effects;
  }

  getEffectByName(name) {
    return this.effects[name];
  }
}

export class Effect {
  constructor({name, dropdownName, category, init, cursor, mouseActionType}) { 
    this.name = name;
    this.dropdownName = dropdownName;
    this.category = category;
    this.init = init;
    this.cursor = cursor;
    this.mouseActionType = mouseActionType;
  }

  render(settings, points, canvas) {
    //method that all Effects should have
  }

  getValue(propertyName) { //should I check if property is one of the "approved" ones?
    try {
      return this[propertyName];
    } catch(e) {
      console.log("could not find that property of this effect");
      return undefined;
    }
  }
}

export class PathEffect extends Effect {
  
  constructor({name, dropdownName, category, init, cursor, mouseActionType, config}) { 
    super({name, dropdownName, category, init, cursor, mouseActionType, config});
    console.log(config);
    this.scale = parseFloat(config.scale);
    this.shapes = config.shapes;
    this.sizes = config.sizes;
    this.colors = config.colors;
    this.alpha = config.alpha;
    this.stepSize = config.stepSize;
  }

  //effect knows how to render given set of points, render canvas, and settings
  render(settings, points, canvas) {
    canvas.noStroke();

    let shapeCount = 0; // Count of shapes drawn

    for (let i = 1; i < points.length; i++) {
      let point = points[i];
      let x = point.x;
      let y = point.y;
    
      let color = this.colors[i % this.colors.length].apply(null, [shapeCount, canvas]);
      canvas.fill(color);
      let size = this.scale / 100.0 * this.sizes[i % this.sizes.length];
      this.shapes[i % this.shapes.length].apply(null, [x, y, size, canvas]);

      shapeCount++;
    }
  }
}

export class PointEffect extends Effect {
  // effects with mouse action type 'single-click', only have one point rather than a path
  constructor({name, dropdownName, category, init, cursor, mouseActionType, config}) {
    super({name, dropdownName, category, init, cursor, mouseActionType});
    this.shape = config.shape;
  }
  render(settings, points, canvas) {
    let point = points[0];
    // this.shape.apply(null, [{
    //   color: settings.color,
    //   x: settings.x,
    //   y: settings.y,
    //   r1: settings.r1,
    //   r2: settings.r2,
    //   npoints: settings.npoints
    // }, canvas]);
    this.shape.apply(null, [settings, canvas]);
  }
}

// export let starBrush = new PathEffect({
//   name: "star brush", 
//   dropdownName: "Star Brush",
//   category: "NewBrushes",
//   init: `Star brush in {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}
//   with scale {id: 'scale', type: 'number', min:1, max:600, placeholder: 20}%
//   along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
//   cursor: './assets/cursors/star-solid.svg',
//   mouseActionType: 'drag',
//   scale: 20,
//   shapes: [
//     (x, y, size, c) => {
//       c.star({color: [255, 0, 255], x: x, y: y, r1: size, r2: size/2, npoints: 5});
//     },
//   ],
//   sizes: [10, 20, 30, 40, 50, 40, 30, 20],
//   colors: [
//     [255, 165,   0], // Orange
//     [255, 215,   0], // Gold
//   ],
//   alpha: 0.75,
//   stepSize: 20
// });

// export let mosaicBrush = new PathEffect({
//   name: "mosaic brush",
//   dropdownName: "Mosaic Brush",
//   category: "NewBrushes",
//   init: `Mosaic brush in {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}
//   with scale {id: 'scale', type: 'number', min:1, max:600, placeholder: 20}%
//   along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
//   cursor: './assets/cursors/star-solid.svg',
//   mouseActionType: 'drag',
//   scale: 20,
//   shapes:
//   [
//     (x, y, size, pg) => {
//       pg.ellipse(x, y, size, size);
//     },
//     (x, y, size, pg) => {
//       pg.rect(x, y, size, size);
//     },
//     (x, y, size, pg) => {
//       pg.triangle(
//         x + size / 2,
//         y + size / 2,
//         x - size / 2,
//         y + size / 2,
//         x,
//         y - size / 2
//       );
//     },
//   ],
//   sizes: [10, 20, 15, 8],
//   colors:
//   [
//     [255,   0,   0], // Red
//     [255, 165,   0], // Orange
//     [255, 215,   0], // Gold
//     [128, 128,   0], // Olive
//     [  0, 128,   0], // Green
//     [ 38, 162, 224], // Light blue
//     [  0,   0, 255], // Blue
//     [ 75,   0, 130], // Indigo
//     [128,   0, 128], // Purple
//     [238, 130, 238], // Violet
//     [255, 192, 203], // Pink
//   ],
//   alpha: 0.75,
//   stepSize: 20
// });