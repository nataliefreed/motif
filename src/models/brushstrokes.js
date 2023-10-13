import { v4 as uuidv4 } from 'uuid';
import { toDegrees, mapValue } from '../utils/utils.js';

export class BrushstrokeManager {
  constructor() {
    this.brushstrokes = [];
  }

  addBrushstroke(brushstroke) {
    this.brushstrokes.push(brushstroke);
    return brushstroke;
  }

  getBrushstrokeById(id) {
    return this.brushstrokes.find(bs => bs.id === id);
  }

  getOnActByID(id) {  //return onAct function
    return (data) => {
      const brushstroke = this.getBrushstrokeById(id);
      if (brushstroke) {
        brushstroke.renderFinal(data);
      }
      else {
        console.log('brushstroke not found');
      }
    }
  }
}

export class Brushstroke {
  constructor(effect, startPoint, color, sketch) {
    this.effect = effect;
    this.path = new Path(startPoint.x, startPoint.y);
    this.color = color;
    this.previewCanvas = sketch.getPreviewCanvas();
    this.finalCanvas = sketch.getStaticCanvas();

    this.id = uuidv4();
  }

  renderPreview(data) {
    // console.log("rendering preview", this.previewCanvas);
    // could be a lower resolution render
    // console.log("brushstroke points: ", this.path.getPoints());
    this.effect.render(data, this.path.getPoints(), this.previewCanvas);
  }

  renderFinal(data) {
    // TODO: if nothing has changed, use cached version
    this.effect.render(data, this.path.getPoints(), this.finalCanvas);
  }

  getPoints() {
    return this.path.getPoints();
  }

  getMouseActionType() {
    return this.effect.mouseActionType;
  }

  getID() {
    return this.id;
  }

  //construct object to pass to Joy - TODO: no longer needed?
  makeJoyEvent() {
    let data = {};
    data.id = this.id;
    data.color = {type: 'color', value: this.color};
    data.x = { type: 'number', value: Math.round(this.path.getPoint(0).x) };
    data.y = { type: 'number', value: Math.round(this.path.getPoint(0).y) };
    data.position = { type: 'coordinate', value: [Math.round(this.path.getPoint(0).x), Math.round(this.path.getPoint(0).y)] };
    data.path = { type: 'path', value: this.path.getPointsAsArray() };

    return [
      this.effect.tag,
      this.effect.tag + "/" + this.effect.name,
      data
    ]
  }

  getPath() {
    return { type: 'path', value: this.path.getPointsAsArray() };
  }

  getFirstAndLastPoints() {
    let data = {};
    let x = Math.round(this.path.getPoint(0).x);
    let y = Math.round(this.path.getPoint(0).y);
    let lastX = Math.round(this.path.getLastPoint().x);
    let lastY = Math.round(this.path.getLastPoint().y);
    data.position = { type: 'coordinate', value: [x, y] };
    data.x = { type: 'numberslider', value: x };
    data.y = { type: 'numberslider', value: y};
    data.firstPoint = { type: 'coordinate', value: [x, y] };
    data.lastPoint = { type: 'coordinate', value: [lastX, lastY] };
    // data.angle = { type: 'numberslider', value: Math.round(toDegrees(Math.atan2(lastY - y, lastX - x))) }; //angle between first and last point

    data.angle = { type: 'numberslider', value:  Math.round(mapValue(lastY, 0, 540, 0, 360)) }; // version of angle that maps along x axis
    data.stripeWidth = { type: 'numberslider', value:  Math.round(mapValue(lastX, 0, 540, 5, 100)) };

    let radius = Math.round(Math.sqrt(Math.pow(lastX - x, 2) + Math.pow(lastY - y, 2)));
    if(radius > 0 || this.path.length() > 1) {
      radius += 5;
      data.radius = { type: 'number', value: radius };
    }
    let width = Math.round(Math.abs(lastX - x));
    if(width > 0 || this.path.length() > 1) {
      width += 5;
      data.width = { type: 'numberslider', value: width*2 };
      data.size = data.width;
      data.r1 = { type:'numberslider', value: width };
      data.r2 = { type:'numberslider', value: width*0.5 };
    }
    let height = Math.round(Math.abs(lastY - y));
    if(height > 0 || this.path.length() > 1) {
      data.height = { type: 'numberslider', value: height*2 + 5};
      data.npoints = { type:'numberslider', value: Math.round(height/10+5) };
      data.nsides = { type:'numberslider', value: Math.round(height/10+3) };
    }

    return data;
  }

  getPathAndPoint() {
    return { path: this.getPath(), ...this.getFirstAndLastPoints() };
  }

  addPoint(point) {
    this.path.addPoint(point.x, point.y);
  }

  makeAntPath(frogPath, stepSize) {
    let antPath = [];
    antPath.push({ position: frogPath.start });
    let remainingDistance = stepSize;

    for (let i = 1; i < frogPath.points.length; i++) {
      let previousPoint = frogPath.points[i - 1].position;
      let currentPoint = frogPath.points[i].position;

      let vectorBetween = p5.Vector.sub(currentPoint, previousPoint);
      let distanceBetween = vectorBetween.mag();
      vectorBetween.normalize();

      while (remainingDistance <= distanceBetween) {
        let newPointPos = p5.Vector.add(
          previousPoint,
          vectorBetween.copy().mult(remainingDistance)
        );
        antPath.push({position: newPointPos});

        distanceBetween -= remainingDistance;
        remainingDistance = stepSize;
        previousPoint = newPointPos;
      }

      remainingDistance -= distanceBetween;
    }
    return antPath;
  }

}

export class Path {
	constructor(x, y) {
		this.points = [];
		this.addPoint(x, y);
	}

  length() {
    return this.points.length;
  }
	
	addPoint(x, y) {
		this.points.push({ x: x, y: y });
	}

  getPoints() {
    return this.points;
  }

  getPointsAsArray() {
    return this.points.map(p => [p.x, p.y]);
  }

  getPoint(index) {
    return this.points[index];
  }

  getLastPoint() {
    return this.points[this.points.length - 1];
  }

	toString() {
		let a = [];
		this.points.forEach(p => {
			a.push(Math.round(p.x));
			a.push(Math.round(p.y));
		});
		return a.toString();
	}
	
	renderPoints(s) {
		s.push();
		s.strokeWeight(5);
		s.noFill();
		s.stroke(0);
		this.points.forEach(p => {
			s.point(p.x, p.y);
		});
		s.pop();
	}

	renderLine(s, strokeColor, strokeWeight) {
		s.push();
		s.strokeWeight(strokeWeight);
		s.stroke(strokeColor);
		s.noFill();
		s.beginShape();
		this.points.forEach(p => {
			s.vertex(p.x, p.y);
		});
		s.endShape();
		s.pop();
	}

  // may not need this, placeholder from when paths were passed as strings
  _stringToList(coordinates_string) {
    const points = coordinates_string.split(",");
    const result = [];
  
    for (let i = 0; i < points.length; i += 2) {
      const x = parseInt(points[i].trim());
      const y = parseInt(points[i + 1].trim());
  
      if (!isNaN(x) && !isNaN(y)) {
        result.push({ x, y });
      }
    }
  
    return result;
  }
}