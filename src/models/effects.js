import { reindex } from '../utils/utils.js';

export class EffectManager {
  constructor(effectList) {
    this.effectList = effectList;
    this.effects = {};
    this.effectList.forEach(e => {
      let type = e.mouseActionType;
      if(type === 'drag') {
        // console.log("Adding effect " + e.name);
        // this.effects[e.name] = new PathEffect(e); //index by name
      }
      else if(type === 'single-click') {
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
  constructor({name, dropdownName, category, tag, init, cursor, mouseActionType, onact}) { 
    this.name = name;
    this.dropdownName = dropdownName;
    this.category = category;
    this.tag = tag;
    this.init = init;
    this.cursor = cursor;
    this.mouseActionType = mouseActionType;
    this.onact = onact;
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
  
  constructor({name, dropdownName, category, tag, init, cursor, mouseActionType, config}) { 
    super({name, dropdownName, category, tag, init, cursor, mouseActionType, config});
    console.log(config);
    this.scale = parseFloat(config.scale);
    this.shapes = config.shapes;
    this.sizes = config.sizes;
    this.colors = config.colors;
    this.alpha = config.alpha;
    this.stepSize = config.stepSize;
  }

  //effect knows how to render given set of points, render canvas, and settings
  render(data, points, canvas) {
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
  constructor({name, dropdownName, category, tag, init, cursor, mouseActionType, onact}) {
    super({name, dropdownName, category, tag, init, cursor, mouseActionType, onact});
  }
  render(data, points, canvas) {
    let point = points[0];
    // data.x = point.x;
    // data.y = point.y;
    data.x = { type: 'number', value: Math.round(point.x) };
    data.y = { type: 'number', value: Math.round(point.y) };
    // this.shape.apply(null, [{
    //   color: settings.color,
    //   x: settings.x,
    //   y: settings.y,
    //   r1: settings.r1,
    //   r2: settings.r2,
    //   npoints: settings.npoints
    // }, canvas]);
    this.onact.apply(null, [data, canvas]);
  }
}