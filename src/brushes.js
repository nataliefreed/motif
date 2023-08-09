import { v4 as uuidv4 } from 'uuid';

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
    return (settings) => {
      const brushstroke = this.getBrushstrokeById(id);
      if (brushstroke) {
        brushstroke.renderFinal(settings);
      }
      else {
        console.log('brushstroke not found');
      }
    }
  }
}


export class PathBrush {
  constructor({name, dropdownName, category, init, cursor, mouseActionType, scale, shapes, sizes, colors, alpha, stepSize}) { 
    this.name = name;
    this.dropdownName = dropdownName;
    this.category = category;
    this.init = init;
    this.cursor = cursor;
    this.mouseActionType = mouseActionType;
    this.scale = parseFloat(scale);
    this.shapes = shapes;
    this.sizes = sizes;
    this.colors = colors;
    this.alpha = alpha;
    this.stepSize = stepSize;

    this.setAlpha();
  }

  setAlpha() {
    // set alpha
    // for (let i = 0; i < this.colors.length; i++) {
    //   this.colors[i].setAlpha(map(this.alpha, 0, 1, 0, 255));
    // }
  }

  //brush knows how to render given set of points, render canvas, and settings
  render(settings, points, canvas) {

    let shapeCount = 0; // Count of shapes drawn

    for (let i = 1; i < points.length; i++) {
      let point = points[i];
      let x = point.x;
      let y = point.y;
    
      canvas.fill(this.colors[i % this.colors.length]);
      let size = this.scale / 100.0 * this.sizes[i % this.sizes.length];
      this.shapes[i % this.shapes.length].apply(null, [x, y, size, canvas]);

      shapeCount++;
    }
  }
}

//pass around instead of "data" object to make sure everything is there
//can also use for initial settings for each brush
export class BrushSettings {
  constructor({color, size, alpha}) {

  }
}

export class Brushstroke {
  constructor(brush, point, color, sketch) {
    this.id = uuidv4();
    this.brush = brush;
    this.path = new Path(point.x, point.y);
    this.color = color;
    this.previewCanvas = sketch.getPreviewCanvas();
    this.finalCanvas = sketch.getStaticCanvas();
    this.pathComplete = false;
  }

  renderPreview(settings) {
    console.log("rendering preview");
    // could be a lower resolution render
    this.brush.render(settings, this.path.getPoints(), this.previewCanvas);
  }

  renderFinal(settings) {
    console.log("rendering final");
    // TODO: if nothing has changed, use cached version
    this.brush.render(settings, this.path.getPoints(), this.finalCanvas);
  }

  getPoints() {
    // let points = [ this.path.getPoint(0) ];
    // if(this.pathComplete) {
    //   points = this.path.getPoints();
    //   console.log("getting points!");
    // }
    // return points;
    return this.path.getPoints();
  }

  getID() {
    return this.id;
  }

  addPoint(point) {
    this.path.addPoint(point.x, point.y);
  }

  finalizePath() {
    this.pathComplete = true;
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
	
	addPoint(x, y) {
		this.points.push({ x: x, y: y });
	}

  getPoints() {
    return this.points;
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

export let starBrush = new PathBrush({
  name: "star brush", 
  dropdownName: "Star Brush",
  category: "NewBrushes",
  init: `Star brush in {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}
  with scale {id: 'scale', type: 'number', min:1, max:600, placeholder: 20}%
  along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
  cursor: './assets/cursors/star-solid.svg',
  mouseActionType: 'drag',
  scale: 20,
  shapes: [
    (x, y, size, c) => {
      c.star({color: [255, 0, 255], x: x, y: y, r1: size, r2: size/2, npoints: 5});
    },
  ],
  sizes: [10, 20, 30, 40, 50, 40, 30, 20],
  colors: [
    [255, 165,   0], // Orange
    [255, 215,   0], // Gold
  ],
  alpha: 0.75,
  stepSize: 20
});

export let mosaicBrush = new PathBrush({
  name: "mosaic brush",
  dropdownName: "Mosaic Brush",
  category: "NewBrushes",
  init: `Mosaic brush in {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}
  with scale {id: 'scale', type: 'number', min:1, max:600, placeholder: 20}%
  along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
  cursor: './assets/cursors/star-solid.svg',
  mouseActionType: 'drag',
  scale: 20,
  shapes:
  [
    (x, y, size, pg) => {
      pg.ellipse(x, y, size, size);
    },
    (x, y, size, pg) => {
      pg.rect(x, y, size, size);
    },
    (x, y, size, pg) => {
      pg.triangle(
        x + size / 2,
        y + size / 2,
        x - size / 2,
        y + size / 2,
        x,
        y - size / 2
      );
    },
  ],
  sizes: [10, 20, 15, 8],
  colors:
  [
    [255,   0,   0], // Red
    [255, 165,   0], // Orange
    [255, 215,   0], // Gold
    [128, 128,   0], // Olive
    [  0, 128,   0], // Green
    [ 38, 162, 224], // Light blue
    [  0,   0, 255], // Blue
    [ 75,   0, 130], // Indigo
    [128,   0, 128], // Purple
    [238, 130, 238], // Violet
    [255, 192, 203], // Pink
  ],
  alpha: 0.75,
  stepSize: 20
});  

// {
//   name: 'star brush',
//   dropdownName: 'Star Brush',
//   category: 'NewBrushes',
//   init: `Star brush in {id:'color', type:'color', placeholder:[20, 0.8, 1.0]} 
//   with scale {id: 'scale', type: 'number', min:1, max:600, placeholder: 20}% 
//   along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
//   cursor: './assets/cursors/star-solid.svg',
//   mouseActionType: 'drag',
//   onact: (my) => {



//     my.target.metaBrush({
//       scale: my.data.scale,
//       pointsList: my.data.pointsList, 
//       shapes:
//       [
//         (x, y, size, c) => {
//           c.star({color: my.data.color, x: x, y: y, r1: size, r2: size/2, npoints: 5});
//         },
//       ],
//       sizes: [10, 20, 30, 40, 50, 40, 30, 20],
//       colors:
//       [
//         [255, 165,   0], // Orange
//         [255, 215,   0], // Gold
//       ],
//       alpha: 0.75,
//     }, my.target.s);
//   }
// },