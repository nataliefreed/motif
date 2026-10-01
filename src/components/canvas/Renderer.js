import { get } from 'svelte/store';
import { flatActionStore, playheadID, stagedActionID } from '../../stores/dataStore.ts';
import { filter } from 'lodash';
let paperdolls = null;
import { noise } from '../../utils/noise.js'
let font = null;

// export const unroll = {
//     // do each
//     // render before stop index / only if active
//     'do each': (p, params, p5) => {
//       if(params.children) {
//         let activeChildren = params.children.filter(uuid => uuid !== get(stagedActionID)); //all except staged action
//         activeChildren.forEach(uuid => {
//           let child = get(flatActionStore)[uuid];
//           if(renderers[child.name]) renderers[child.name](p, child.params, p5); // console.log("trying to render", child.name);
//         });
//       }
//     },

//   // todo: add the pathSpacing
//   'along path': (p, params, p5) => {
//     if(!params.path) return;

//     if(params.children && params.children.length > 0) { // list has children
//       params.path.forEach((point, i) => {
//         let uuid = params.children[i%params.children.length];

//         let child = get(flatActionStore)[uuid];

//         // child.params.position = {x: point[0], y: point[1]};
//         // child.params.tempPosition = {x: point[0], y: point[1]};
//         // console.log("trying to render", child.name);
//         renderers[child.name](p, { ...child.params, position: { x: point[0], y: point[1] } }, p5);
//       });
//     }
//   },
// }

export const renderers = {
  //p is pgraphics object, which could be the main p5 instance or one of the pgraphics instances
  'clear': (p, params, p5, turtle) => {
    p.clear();
    p.fill(255);
    // console.log('cleared');
  },

  'move to': (p, params, p5, turtle) => {
    turtle.moveTo(params.position.x, params.position.y);
    turtle.render(p);
  },

  'move': (p, params, p5, turtle) => {
    if(params.direction == "forward") {
      turtle.forward(params.distance);
    }
    else if(params.direction == "back") {
      turtle.back(params.distance);
    }
    turtle.render(p);
  },

  'stamp': (p, params, p5, turtle) => {
    p.push();
    p.noStroke();
    p.fill(turtle.penColor);
    p.ellipse(turtle.x, turtle.y, turtle.penWidth, turtle.penHeight);
    p.pop();
  },

  'ellipse': (p, params, p5, turtle) => {
    p.push();
    p.noStroke();
    p.fill(turtle.penColor);
    p.ellipse(turtle.x, turtle.y, turtle.penWidth, turtle.penHeight);
    p.pop();
  },

  'solid fill': (p, params, p5) => {
    p.background(params.color);
  },

  'gradient': (p, params, p5) => {
    let color1 = p.color(params.color);
    let color2 = p.color(params.color2);
    let angle = p.radians(params.angle);
    // let progress = params.progress + 10;
    let progress = 100;
  
    let len = Math.sqrt(p.width * p.width + p.height * p.height); // diagonal length
  
    p.push();
    p.translate(p.width / 2, p.height / 2); // Move the origin to the center
    p.rotate(angle); // Rotate around the new origin
    p.noFill();
    p.strokeWeight(1);

    // Calculate the end position based on progress
    let endPos = p.map(progress, 0, 100, -len / 2, len / 2);

    for (let i = -len / 2; i < endPos; i++) {
      let percentage = p.map(i, -len / 2, len / 2, 0, 1);
      p.stroke(p.lerpColor(color1, color2, percentage));
      p.line(-len / 2, i, len / 2, i);
    }
  
    p.pop();
  },

  'speckles': (p, params, p5) => {
    let c = params.color;
    let path = getSpecklesPoints(params, p.width, p.height);
  
    p.push();
    p.noStroke();
    p.fill(c);
    // p.translate(-p.width/2, -p.height/2);
  
    for (let i = 0; i < path.length; i++) {
      p.ellipse(path[i][0], path[i][1], 2, 2);
    }
  
    p.pop();
  },

  // 'gradient': function* (p, params, p5, allAtOnce=true) {
  //   let color1 = p.color(params.color);
  //   let color2 = p.color(params.color2);
  //   let angle = -p.radians(params.angle);
  //   let yieldEvery = params.yieldEvery || 10; // Number of lines to draw before yielding
  
  //   let len = Math.sqrt(p.width * p.width + p.height * p.height); // diagonal length
  
  //   p.push();
  //   p.translate(p.width / 2, p.height / 2); // Move the origin to the center
  //   p.translate(100, 100); // placeholder: some time lost drawing off canvas esp when lines are straight
  //   p.rotate(angle); // Rotate around the new origin
  //   p.noFill();
  //   p.strokeWeight(1);
  
  //   for (let i = -len / 2, count = 0; i < len / 2; i++, count++) {
  //     let percentage = p.map(i, -len / 2, len / 2, 0, 1);
  //     p.stroke(p.lerpColor(color1, color2, percentage));
  //     p.line(-len / 2, i, len / 2, i);
  
  //     if(allAtOnce) continue;
  //     if (count >= yieldEvery) {
  //       yield; // Yield every 'yieldEvery' iterations
  //       count = 0; // Reset the counter after yielding
  //     }
  //   }
  //   p.pop();
  //   p.reset();
  // },

  // 'gradient': (p, params, p5) => {
  //   let color1 = p.color(params.color1);
  //   let color2 = p.color(params.color2);
  //   let angle = -p.radians(params.angle);
  //   let progress = params.progress;
  
  //   let len = Math.sqrt(p.width * p.width + p.height * p.height); // diagonal length
  
  //   p.push();
  //   p.translate(p.width / 2, p.height / 2); // Move the origin to the center
  //   p.rotate(angle); // Rotate around the new origin
  //   p.noFill();
  //   p.strokeWeight(1);
  
  //   for (let i = -len / 2; i < len / 2; i++) {
  //     let percentage = p.map(i, -len / 2, len / 2, 0, 1);
  //     p.stroke(p.lerpColor(color1, color2, percentage));
  //     p.line(-len / 2, i, len / 2, i); // Draw from left to right, with i as the y-coordinate
  //   }
  
  //   p.pop();
  // },

  'stripes': (p, params, p5, progress) => {
    let color = p.color(params.color);
    let stripeWidth = params.stripeWidth;
    let angle = p.radians(params.angle);
    let len = Math.sqrt(p.width * p.width + p.height * p.height); // diagonal length

    p.push();
    p.translate(p.width / 2, p.height / 2); // Move origin to center
    p.rotate(angle); // Rotate around new origin

    p.noFill();
    p.strokeWeight(stripeWidth);
    p.stroke(color);

    for(let i = -len / 2; i < len / 2; i += stripeWidth * 2) { 
      // i += stripeWidth * 2 - accounting for both drawn stripe and gap in between
      p.line(-len / 2, i, len / 2, i); // Line from negative to positive x-axis, with i as the y-coordinate
    }
    p.pop();
  },

  'spiro': (p, params, p5) => {
    let spiroColor = p.color(params.color);
    let x = params.position.x;
    let y = params.position.y;
    let path = getSpiroPoints(params);
  
    p.push();
    // p.translate(x, y);
    p.stroke(spiroColor);
    p.strokeWeight(params.lineWeight);
  
    for (let i = 0; i < path.length - 1; i++) {
      p.line(path[i][0], path[i][1], path[i + 1][0], path[i + 1][1]);
    }
  
    p.pop();
  },

  'shape': (p, params, p5, turtle) => {
    p.push();
    p.noStroke();
    debugger;
    p.fill(turtle.penColor);
    switch(params.shape) {
      case 'ellipse':
        p.ellipse(turtle.x, turtle.y, turtle.penWidth, turtle.penHeight);
        break;
      case 'rectangle':
        p.rect(turtle.x, turtle.y, turtle.penWidth, turtle.penHeight);
        break;
      case 'triangle':
        p.triangle(turtle.x, turtle.y, turtle.x + turtle.penWidth, turtle.y, turtle.x + turtle.penWidth / 2, turtle.y - turtle.penHeight);
        break;
      default: break;
    }
    p.pop();
  },

  'text': (p, params, p5) => {
    let x = params.position.x;
    let y = params.position.y;
    p.textSize(params.size+4);
    if(font) {
      p.textFont(font);
    } else {
      p.textFont('sans-serif');
    }
    p.textAlign(p.RIGHT, p.BASELINE);
    p.push();
    p.noStroke();
    p.fill(params.color);
    p.translate(x, y);
    p.rotate(p5.radians(params.angle));
    p.text(params.text, 0, 0);
    p.pop();
  },
  
  'circle': (p, params, p5) => {
    let x = params.tempPosition? params.tempPosition.x : params.position.x;
    let y = params.tempPosition?  params.tempPosition.y : params.position.y;
    p.push();
    p.noStroke();
    p.fill(params.color);
    p.circle(x, y, params.radius*2);
    p.pop();
  },

  'square': (p, params, p5, turtle) => {
    let x = params.position.x;
    let y = params.position.y;
    let size = params.size;
    p.push();
    p.translate(x, y);
    p.rotate(p5.radians(params.angle));
    p.rectMode(p.CENTER);
    p.noStroke();
    p.fill(params.color);
    p.rect(0, 0, size, size);
    p.pop();
  },

  'triangle': (p, params, p5) => {
      let x = params.position.x;
      let y = params.position.y;
      let w = params.width;
      let h = params.height;
      p.push();
      p.noStroke();
      p.fill(params.color);
      p.translate(x, y);
      p.rotate(p5.radians(params.angle));
      p.triangle(
          w / 2, h / 2,
          - w / 2, h / 2,
          0, - h / 2
      );
      p.pop();
  },

  'rectangle': (p, params, p5) => {
      let x = params.position.x;
      let y = params.position.y;
      let width = params.width;
      let height = params.height;
      p.push();
      p.translate(x, y);
      p.rotate(p5.radians(params.angle));
      p.rectMode(p.CENTER);
      p.noStroke();
      p.fill(params.color);
      p.rect(0, 0, width, height);
      p.pop();
  },

  'star': (p, params, p5) => {
      let x = params.position.x;
      let y = params.position.y;
      let r1 = params.r1;
      let r2 = params.r2;
      let angle = p.TWO_PI / params.npoints;
      let halfAngle = angle / 2.0;
      p.push();
      p.noStroke();
      p.fill(params.color);
      p.translate(x, y);
      p.rotate(p5.radians(params.angle));
      p.beginShape();
      for (let a = 0; a < p.TWO_PI; a += angle) {
          let sx = p.cos(a) * r2;
          let sy = p.sin(a) * r2;
          p.vertex(sx, sy);
          sx = p.cos(a + halfAngle) * r1;
          sy = p.sin(a + halfAngle) * r1;
          p.vertex(sx, sy);
      }
      p.endShape(p.CLOSE);
      p.pop();
  },

  'polygon': (p, params, p5) => {
      let nsides = Math.abs(params.nsides);
      let x = params.position.x;
      let y = params.position.y;
      let rotationAngle = p5.radians(params.angle);
      let angle = p.TWO_PI / nsides;
      p.push();
      p.translate(x, y);
      p.rotate(rotationAngle);
      p.noStroke();
      p.fill(params.color);
      p.beginShape();
      for (let a = 0; a < p.TWO_PI; a += angle) { //centered at (0, 0) to make rotation angle work
        let sx = p.cos(a) * params.radius;
        let sy = p.sin(a) * params.radius;
        p.vertex(sx, sy);
      }
      p.endShape(p.CLOSE);
      p.pop();
  },

  'heart': (p, params, p5) => {
    let x = params.position.x;
    let y = params.position.y;
    let size = params.size;
    p.push();
    p.translate(x, y);
    p.rotate(p5.radians(params.angle));
    p.noStroke();
    p.fill(params.color);
    p.beginShape();
    p.vertex(0, 0);
    p.bezierVertex(-size / 2, -size / 2, -size, size / 3, 0, size);
    p.bezierVertex(size, size / 3, size / 2, -size / 2, 0, 0);
    p.endShape(p.CLOSE);
    p.pop();
  }, 

  'tile': (p, params, p5) => {
    tile(p, params, p5);
  },

  // 'straight grid': (p, params, p5) => {
  //   tile(p, {...params, tiling: 'straight grid'}, p5);
  // },
  // 'brick': (p, params, p5) => {
  //   tile(p, {...params, tiling: 'brick'}, p5);
  // },
  // 'half drop': (p, params, p5) => {
  //   tile(p, {...params, tiling: 'half drop'}, p5);
  // },
  // 'checkerboard': (p, params, p5) => {
  //   tile(p, {...params, tiling: 'checkerboard'}, p5);
  // },
  // 'radial': (p, params, p5) => {
  //   tile(p, {...params, tiling: 'radial'}, p5);
  // },

  'move cutout': (p, params, p5) => { //drag rectangular region
    moveRectangularRegion(p, params, p5);
  },

  'grow': (p, params, p5) => {
    scaleRect(p, params, p5);
  },

  'shrink': (p, params, p5) => {
    scaleRect(p, params, p5);
  },

  'shift': (p, params, p5) => {

      // preview on hover
    if(p === p5.getHoverCanvas() || p === p5.getDragCanvas()) {
      p.image(p5.getStaticCanvas(), 0, 0); //so that hover canvas has something to shift
    }

    let lineHeight = params.stripeWidth;
    let offset = params.offset;
    if(params.orientation === "horizontal") {
      for(let i = 0; i < p.height / lineHeight; i++) {
        if(i % 2 === 0) {
          p.image(p, offset, i * lineHeight, p.width, lineHeight, 0, i * lineHeight, p.width, lineHeight);
          p.image(p, 0, i * lineHeight, offset, lineHeight, p.width - offset, i * lineHeight, offset, lineHeight); //wrap
        }
      }
    } else if(params.orientation === "vertical") {
      for(let i = 0; i < p.width / lineHeight; i++) {
        if(i % 2 === 0) {
          p.image(p, i * lineHeight, offset, lineHeight, p.height, i * lineHeight, 0, lineHeight, p.height);
          p.image(p, i * lineHeight, 0, lineHeight, offset, i * lineHeight, p.height - offset, lineHeight, offset); //wrap
        }
      }
    }
  },

  'porcupine brush': (p, params, p5) => {
    if(!c) c = s; //if no canvas specified
    c.strokeWeight(params.lineWeight);
    c.strokeWeight(4);
    c.noFill();
    c.stroke(params.color);

    let points = params.pointsList;
    for(let i=0;i<points.length-1;i+=2) {
      c.line(points[0].x, points[0].y, points[i+1].x, points[i+1].y);
    }
  },

  'rainbow brush': (p, params, p5) => {
    s.push();
    s.noStroke();
    s.strokeWeight(params.minSize);
    s.colorMode(s.HSB);
    s.strokeJoin(s.ROUND);
  
    let hue = 0;
    let size = params.minSize;
    let hueIncrement = 10;
    let sizeIncrement = 1;
    
    let points = params.pointsList; //structure of this string is x1,y1,x2,y2,...
    for(let i=0;i<points.length;i++) {
      s.fill(hue, 150, 100);
      s.circle(points[i].x, points[i].y, size);
      hue += hueIncrement;
      size += sizeIncrement;
      if(hue > 255 || hue < 0) {
        hueIncrement *= -1;
      }
      if(size > params.maxSize || size < params.minSize) {
        sizeIncrement *= -1;
      }
    }
    s.pop();
  },

  'lines brush': (p, params, p5) => {
    if(!p.setupFinished) return;
    if(!c) c = s; //if no canvas specified
    c.strokeWeight(params.lineWeight);
    c.noFill();
    let strokeColor = c.color(params.color);
  
    let points = params.pointsList;
    let n = 100;
    for(let i=0;i<points.length-1;i+=2) {
      strokeColor.setAlpha(c.map(c.noise(n), 0, 1, 10, 200));
      c.stroke(strokeColor);
      c.line(points[i], 0, points[i+1], p.height);
    }
  },

  'straight line': (p, params, p5) => {
    // debugger;
    // if(p !== p5.getHoverCanvas()) {

      p.push();
      p.strokeWeight(params.lineWeight);
      p.noFill();
      p.stroke(params.color);
      p.line(params.start.x, params.start.y, params.end.x, params.end.y);
      p.pop();
    // }
  },

  'bounce': (p, params, p5) => {
    let startPos = p.createVector(params.start.x, params.start.y);
    let endPos = p.createVector(params.end.x, params.end.y);
    let numSteps = params.progress * 3 + 1;
    let direction = p5.Vector.sub(endPos, startPos);
    let spacing = direction.mag(); // distance between start and position2
    direction.normalize(); // normalize to unit vector

    // console.log('bounce', startPos, endPos, numSteps, direction, spacing);

    p.push();
    p.colorMode(p5.HSB, 100);
    let hue = 0;
    p.noStroke();
    let radius = 10;

    let currentPos = startPos.copy();
    for (let i = 0; i < numSteps; i++) {
        p.fill(hue, 80, 80);
        hue = (hue + 1) % 100;

        p.circle(currentPos.x, currentPos.y, radius*2);
        // console.log('currentPos', currentPos.x, currentPos.y);

        // Move to next position
        let move = p5.Vector.mult(direction, spacing);
        currentPos.add(move);

        // Check for canvas boundary collisions and bounce if necessary
        if (currentPos.x <= 0 || currentPos.x >= p.width) {
            direction.x *= -1;
            currentPos.x = p.constrain(currentPos.x, 0+radius, p.width-radius);
        }
        if (currentPos.y <= 0 || currentPos.y >= p.height) {
            direction.y *= -1;
            currentPos.y = p.constrain(currentPos.y, 0+radius, p.height-radius);
        }
    }
    if(p === p5.getDragCanvas() || p === p5.getHoverCanvas()) {
      p.colorMode(p5.RGB);
      p.fill(255);
      p.circle(startPos.x, startPos.y, 5);
      p.circle(endPos.x, endPos.y, 5);
    }
    p.pop();
  },

  'rotate': (p, params, p5) => {
    p.translate(p.width/2, p.height/2);
    p.rotate(p.radians(params.angle));
  },

  // 'trace': (p, params, p5) => {
  //     // preview on hover
  //   if(p === p5.getHoverCanvas()) {
  //     p.image(p5.getStaticCanvas(), 0, 0);
  //   }
  //   // p.filter(p5.INVERT);
  //   p.filter(p5.GRAY);
  //   p.filter(p5.THRESHOLD, 0.5);  
  // },


  // 'copy cutout': (p, params, p5) => {
  //   p.push();

  //   let w = params.width;
  //   let h = params.height;
  //   let x1 = params.position.x;
  //   let y1 = params.position.y;
  //   let x2 = params.end.x;
  //   let y2 = params.end.y;

  //   let snapshot = p5.createGraphics(w, h); // for captured rectangle
  //   // p.imageMode(p.CENTER);

  //   snapshot.image(p, 0, 0, w, h, x1 - w/2, y1 - h/2, w, h);

  //   // if(p===p) snapshot.image(p, 0, 0, w, h, x1 - w/2, y1 - h/2, w, h); // w * h rectangle centered at x1, y1 from static canvas
  //   // else snapshot.image(s, 0, 0, w, h, x1 - w/2, y1 - h/2, w, h);
    
  //   //TODO: if you use p, it will capture the cleared canvas when released, but if you use s, it will not add the cutouts in a cumulative way

  //   //TODO: other way to check if temp canvas?
  //   // if(p === p5.getHoverCanvas) { //if temp canvas, draw a border
  //   //   snapshot.stroke(0);
  //   //   snapshot.noFill();
  //   //   snapshot.strokeWeight(2);
  //   //   snapshot.rect(0, 0, w, h);
  //   // }
  //   // p.image(snapshot, x2, y2, w, h, 0, 0, w, h); // draw the moved rectangle onto the active canvas

  //   snapshot.remove();

  //   p.pop();
  // },

  // 'smooth brush': (p, params, p5) => {
  //   s.push();
  //   s.noFill();
  //   s.strokeWeight(params.lineWeight);
  //   s.stroke(params.color);
  //   s.strokeJoin(s.ROUND);
    
  //   let points = params.pointsList;
  //   s.beginShape();
  //   for(let i=0;i<points.length;i++) {
  //     s.vertex(points[i].x, points[i].y);
  //   }
  //   s.endShape();
  //   s.pop();
  // },

  'rainbox brush': (p, params, p5) => {

  },

  'lines brush': (p, params, p5) => {

  },

  'line': (p, params, p5) => {

  },

  'copy cutout': (p, params, p5) => {

  },

  //TODO: figure out hover/drag behavior
  'filter': (p, params, p5) => {
    applyFilter(p, params, p5);
  },

  'box': (p, params, p5) => {
    p.push();
    const { length: l, width: w, height: h } = params;

    // Calculate centering offsets
    // const offsetX = (p.width - (2 * l + h)) / 2; // symmetrical so no tab calculation
    // const offsetY = (p.height - (2 * l + 2 * w) + 0.2 * h) / 2;

    p.translate(params.position.x, params.position.y);

    // let maskCanvas = p.createGraphics(p.width, p.height)

    p.noFill();
    p.stroke(50);
    p.strokeWeight(2);

    const calculatePoints = (initial, dimensions) => {
      const points = [initial];
      for (const d of dimensions) {
        points.push(points[points.length - 1] + d);
      }
      return points;
    }

    const r = calculatePoints(0, [l, h, l]);
    const c = calculatePoints(0, [l, w, l, w]);
    
    const cut = (r0, c0, r1, c1) => {
      p.stroke(50);
      p.vertex(r[r0], c[c0]);
      p.vertex(r[r1], c[c1]);
      p.line(r[r0], c[c0], r[r1], c[c1]);
    }

    const fold = (r0, c0, r1, c1) => {
      p.stroke(120);
      p.line(r[r0], c[c0], r[r1], c[c1]);
    }

    const tab = (r0, c0, r1, c1) => {
      p.stroke(50);
      const u = [r[r1] - r[r0], c[c1] - c[c0]];
      const v = [-u[1], u[0]];
      let prev = [0, 0]; 

      for (const [du, dv] of [
        [0.1, 0.2],
        [0.9, 0.2],
        [1.0, 0.0]
      ]) {
        // p.line(r[r0] + u[0] * prev[0] + v[0] * prev[1],
        //   c[c0] + u[1] * prev[0] + v[1] * prev[1],
        //   r[r0] + u[0] * du + v[0] * dv,
        //   c[c0] + u[1] * du + v[1] * dv
        // );
        p.vertex(r[r0] + u[0] * prev[0] + v[0] * prev[1],
             c[c0] + u[1] * prev[0] + v[1] * prev[1]);
        p.vertex(r[r0] + u[0] * du + v[0] * dv,
            c[c0] + u[1] * du + v[1] * dv);
        prev = [du, dv];
      }
    
      // fold(r0, c0, r1, c1);
    }
    // p.fill(params.color);
    p.beginShape();
    // Proceeds counterclockwise from top left corner
    cut(1, 0, 1, 1);   // Top face's left edge

    tab(1, 1, 0, 1);   // Left face's top edge
    tab(0, 1, 0, 2);   // Left face's left edge
    tab(0, 2, 1, 2);   // Left face's bottom edge

    cut(1, 2, 1, 3);   // Bottom face's left edge

    cut(1, 3, 1, 4);   // Front face's left edge
    cut(1, 4, 2, 4);   // Front face's bottom edge
    cut(2, 4, 2, 3);   // Front face's right edge

    cut(2, 3, 2, 2);   // Bottom face's right edge

    tab(2, 2, 3, 2);   // Right face's bottom edge
    tab(3, 2, 3, 1);   // Right face's right edge
    tab(3, 1, 2, 1);   // Right face's top edge

    cut(2, 1, 2, 0);   // Top face's right edge
    tab(2, 0, 1, 0);   // Top face's top edge

    p.endShape(p5.CLOSE);

    // Extra folds that aren't for tabs
    fold(1, 1, 1, 2);  // Back face left fold
    fold(1, 2, 2, 2);  // Back face bottom fold
    fold(2, 2, 2, 1);  // Back face right fold
    fold(2, 1, 1, 1);  // Back face top fold (lid hinge)
    fold(1, 3, 2, 3);  // Front face to bottom face fold

    p.pop();
  },

  'paper doll': (p, params, p5) => {
    p.push();
    // Get the color value from params.
    let skinTone = p.color(params.skintone);
    // console.log("skin tone", skinTone);
    
    // Parse the outfit and hairstyle numbers from params
    let outfitNumber = parseInt(params.outfit);
    let hairstyleNumber = parseInt(params.hairstyle);

    // Find the corresponding outfit and hairstyle objects in paperdolls
    let outfit = paperdolls.outfits.find(o => o.number === outfitNumber);
    let hairstyle = paperdolls.hairstyles.find(h => h.number === hairstyleNumber);

    if (!outfit || !hairstyle) {
      console.error('Could not find outfit and/or hairstyle:', outfitNumber, hairstyleNumber);
      return;
    }

    // Create a new graphics object to draw the paper doll and its outfit and hairstyle fills
    let dollCanvas = p5.createGraphics(p.width, p.height);
    let outfitCanvas = p5.createGraphics(p.width, p.height);
    let hairstyleCanvas = p5.createGraphics(p.width, p.height);

      //Tint and then draw the doll fill
      // dollCanvas.tint(skinTone);
      // dollCanvas.image(paperdolls.dollFill, 0, 0, p.width, p.height);
      // dollCanvas.noTint();
      // dollCanvas.image(paperdolls.underlayerFill, 0, 0, p.width, p.height);

      if(p===p5.getHoverCanvas()) {
        p.tint(255, 190);
      }

      // Use doll fill as a mask for the skin tone
      dollCanvas.image(paperdolls.dollFill, 0, 0, p.width, p.height);
      dollCanvas.drawingContext.globalCompositeOperation = 'source-in';
      let skinToneCanvas = p5.createGraphics(p.width, p.height);
      skinToneCanvas.background(skinTone);
      dollCanvas.image(skinToneCanvas, 0, 0);

      // Prepare the outfit fill as a mask
      outfitCanvas.image(outfit.fill, 0, 0, p.width, p.height);
      outfitCanvas.image(paperdolls.underlayerFill, 0, 0, p.width, p.height); // underwear!
      outfitCanvas.drawingContext.globalCompositeOperation = 'source-in';
      outfitCanvas.image(p5.getStaticCanvas(), 0, 0, p.width, p.height);

      // Prepare the hairstyle fill as a mask
      hairstyleCanvas.image(hairstyle.fill, 0, 0, p.width, p.height);
      hairstyleCanvas.drawingContext.globalCompositeOperation = 'source-in';
      hairstyleCanvas.image(p5.getStaticCanvas(), 0, 0, p.width, p.height);

      // Lighten the original painting
      p.noStroke();
      p.fill(255, 220);
      p.rect(0, 0, p.width, p.height);

      // Draw the doll fill
      p.image(dollCanvas, 0, 0);

      // Draw the outfit fill
      p.image(outfitCanvas, 0, 0);

      // Draw the outfit outline
      if(outfit.outline){
        p.image(outfit.outline, 0, 0, p.width, p.height);
      }

      // Draw the hair fill
      p.image(hairstyleCanvas, 0, 0);

      // Draw the hair outline
      if(hairstyle.outline){
        p.image(hairstyle.outline, 0, 0, p.width, p.height);
      }

      dollCanvas.remove();
      outfitCanvas.remove();
      hairstyleCanvas.remove();
      skinToneCanvas.remove();

      p.pop();
    }
  };

export function loadFonts(p) {
  font = p.loadFont('/assets/arialroundedmtbold.ttf');
}

export function loadStencils(p) {
  paperdolls = { // paper doll stencils
    outfits: [],
    hairstyles: [],
  }

  let outfitNames = ['01', '02'];
  let hairstyleNames = ['01', '02', '03'];

  // Load doll fill
  paperdolls.dollFill = p.loadImage(`/assets/stencils/paper-dolls/outfits/doll-fill.png`);
  paperdolls.underlayerFill = p.loadImage(`/assets/stencils/paper-dolls/outfits/underlayer-fill.png`);

  // Load all outfit and hairstyle files
  for (let name of outfitNames) {
    let outfit = {
      number: parseInt(name),
      outline: p.loadImage(`/assets/stencils/paper-dolls/outfits/outlines/${name}.png`),
      fill: p.loadImage(`/assets/stencils/paper-dolls/outfits/fills/${name}.png`)
    };
    paperdolls.outfits.push(outfit);
  }

  for (let name of hairstyleNames) {
    let hairstyle = {
      number: parseInt(name),
      outline: p.loadImage(`/assets/stencils/paper-dolls/hairstyles/outlines/${name}.png`),
      fill: p.loadImage(`/assets/stencils/paper-dolls/hairstyles/fills/${name}.png`)
    };
    paperdolls.hairstyles.push(hairstyle);
  }
}

function applyFilter(p, params, p5) {

  let filterName = '';
  switch(params.filter) {
    case 'threshold': filterName = 'THRESHOLD'; break;
    case 'gray': filterName = 'GRAY'; break;
    case 'invert': filterName = 'INVERT'; break;
    default: filterName = 'INVERT'; break;
  }
  // preview on hover
  if(p === p5.getHoverCanvas()) {
    p.image(p5.getStaticCanvas(), 0, 0);
  }

  // 2nd param to filter false: don't use WebGL in P2D mode, Svelte P5 doesn't seem to support it
  p.filter(p5[filterName], false);
}

function moveRectangularRegion(p, params, p5) {
  let startX = params.start.x;
  let startY = params.start.y;
  let endX = params.end.x;
  let endY = params.end.y;
  let w = params.w;
  let h = params.h;
  // let w = params.width;
  // let h = params.height;

  p.push();

  if(p!==p5.getHoverCanvas()) {
    let sx = startX - w / 2;
    let sy = startY - h / 2;
    let dx = endX - w / 2;
    let dy = endY - h / 2;

    let snapshot = p5.createGraphics(w, h); // to store captured rectangle
    snapshot.image(p5.getStaticCanvas(), 0, 0, w, h, sx, sy, w, h); // w * h rectangle centered at x, y 
    
    p.image(snapshot, dx, dy, w, h, 0, 0, w, h);
    snapshot.remove();
    
    if(p===p5.getStaticCanvas() && params.mode == 'move') {
      p.erase();
      p.fill(255);
      p.rectMode(p5.CENTER);
      p.rect(startX, startY, w, h);
      p.noErase();
    }
  }

  if(p===p5.getHoverCanvas() || p===p5.getDragCanvas()) {
    // outline drag region
    p.push();

    p.rectMode(p.CENTER);
    p.stroke(0);
    p.noFill();
    if(p===p5.getHoverCanvas()) {
      p.rect(startX, startY, w, h);
    } else { //drag canvas
      p.stroke(0);
      p.rect(endX, endY, w, h);
      
      // // empty white space left behind
      if(params.mode == 'move') {
        // p.erase();
        // p.fill(255);
        // p.rect(startX, startY, w, h);
        // p.noErase();

        p5.rectMode(p5.CENTER);
        p5.erase();
        p5.fill(255);
        p5.rect(startX, startY, w, h);
        p5.noErase();
      }
    }
    p.pop();
  }
  p.pop();
}

function rotateRegion(p, params, p5) {
  let angle = params.angle;
}

// One reusable buffer holding a copy of the canvas for patterns to repeat, since they draw onto the canvas
// they copy. (Making and removing a p5 graphics buffer for every repeat doesn't work: in p5 1.11, removing
// one throws before it is cleaned up.)
let canvasCopyBuffer, canvasCopyOwner;
function canvasCopy(p5) {
  if (canvasCopyOwner !== p5) {
    canvasCopyBuffer = p5.createGraphics(p5.width, p5.height);
    canvasCopyOwner = p5;
  }
  canvasCopyBuffer.clear();
  canvasCopyBuffer.image(p5.getStaticCanvas(), 0, 0);
  return canvasCopyBuffer;
}

// The cell at (x, y), w by h, with its edges rounded to whole pixels, so neighboring cells meet exactly and
// nothing underneath shows through between them.
function cellRect(x, y, w, h) {
  const left = Math.round(x), top = Math.round(y);
  return { left, top, width: Math.round(x + w) - left, height: Math.round(y + h) - top };
}

// Draws the whole copy of the canvas, shrunk, into a cell.
function drawCell(p, snapshot, x, y, w, h) {
  const cell = cellRect(x, y, w, h);
  p.image(snapshot, cell.left, cell.top, cell.width, cell.height);
}

// Tile: the whole canvas, shrunk and repeated. Radial repeats it in rings around a copy in the middle;
// the other layouts shrink it into the cells of a grid `columns` wide and `rows` high. (Patterns saved
// before kept the size of a piece of the canvas instead; they become the grid that size makes.)
function tile(p, params, p5) {
  const snapshot = canvasCopy(p5);
  p.push();
  const color = params.color ?? 'rgba(0, 0, 0, 0)'; // see-through, as checkerboards were before they had a color
  if (params.tiling === 'radial') {
    radial(p, snapshot, params.around ?? 8, params.rings ?? params.numRings ?? 3, color);
  } else {
    const columns = params.columns ?? (params.width ? Math.max(1, Math.round(p.width / params.width)) : 4);
    const rows = params.rows ?? (params.height ? Math.max(1, Math.round(p.height / params.height)) : 4);
    const w = p.width / columns;
    const h = p.height / rows;
    switch (params.tiling) {
      case 'straight grid':
        straightGrid(p, snapshot, w, h);
        break;
      case 'brick':
        brick(p, snapshot, w, h);
        break;
      case 'half drop':
        halfDrop(p, snapshot, w, h);
        break;
      case 'checkerboard':
        checkerboard(p, snapshot, w, h, color);
        break;
      case 'mirror':
        mirrorGrid(p, snapshot, w, h);
        break;
      default:
        break;
    }
  }
  p.pop();
}

// The layouts fill the canvas with cells w by h; w and h need not be whole numbers, so cells are counted.
function straightGrid(p, snapshot, w, h) {
  for (let row = 0; row * h < p.height - 0.5; row++) {
    for (let column = 0; column * w < p.width - 0.5; column++) {
      drawCell(p, snapshot, column * w, row * h, w, h);
    }
  }
}

// every other row shifted left by half a cell
function brick(p, snapshot, w, h) {
  for (let row = 0; row * h < p.height - 0.5; row++) {
    const shift = row % 2 === 1 ? -w / 2 : 0;
    for (let column = 0; shift + column * w < p.width - 0.5; column++) {
      drawCell(p, snapshot, shift + column * w, row * h, w, h);
    }
  }
}

// every other column shifted up by half a cell
function halfDrop(p, snapshot, w, h) {
  for (let column = 0; column * w < p.width - 0.5; column++) {
    const shift = column % 2 === 1 ? -h / 2 : 0;
    for (let row = 0; shift + row * h < p.height - 0.5; row++) {
      drawCell(p, snapshot, column * w, shift + row * h, w, h);
    }
  }
}

// copies in every other cell, and `color` in the cells between
function checkerboard(p, snapshot, w, h, color) {
  p.noStroke();
  p.fill(color);
  for (let row = 0; row * h < p.height - 0.5; row++) {
    for (let column = 0; column * w < p.width - 0.5; column++) {
      if ((row + column) % 2 === 1) {
        drawCell(p, snapshot, column * w, row * h, w, h);
      } else {
        const cell = cellRect(column * w, row * h, w, h);
        p.rect(cell.left, cell.top, cell.width, cell.height);
      }
    }
  }
}

// function radial(p, snapshot, w, h, numTiles, numRings) {
//   let centerX = p.width / 2;
//   let centerY = p.height / 2;

//   for (let ring = 0; ring < numRings; ring++) {
//       // Calculate circumference for the current ring
//       let radius = (ring + 1) * 1.5 * h;
//       let circumference = 2 * Math.PI * radius;
//       let numTiles = Math.floor(circumference / w);

//       for (let i = 0; i < numTiles; i++) {
//           let angle = (i / numTiles) * 2 * Math.PI;
//           let dx = centerX + radius * Math.cos(angle) - w / 2;
//           let dy = centerY + radius * Math.sin(angle) - h / 2;
//           p.image(snapshot, dx, dy, w, h, 0, 0, w, h);
//       }
//   }
// }

// a rosette on `color`: one copy in the middle, then rings of copies turned to face outward. Each copy is
// cut to a circle, so copies in a ring and neighboring rings meet without covering each other.
function radial(p, snapshot, around, rings, color) {
  p.noStroke();
  p.fill(color);
  p.rect(0, 0, p.width, p.height);
  const context = p.drawingContext;
  for (const copy of radialCopies(around, rings, p.width)) {
    p.push();
    p.translate(copy.x, copy.y);
    p.rotate(copy.angle);
    context.save();
    context.beginPath();
    context.arc(0, 0, copy.size / 2, 0, 2 * Math.PI);
    context.clip();
    p.image(snapshot, -copy.size / 2, -copy.size / 2, copy.size, copy.size);
    context.restore();
    p.pop();
  }
}

// Where a rosette's copies go on a square canvas `size` wide: one in the middle, then `rings` rings of
// `around` round copies each (at least 3), every other ring turned half a step. A ring's copies nearly fill
// its circle without overlapping, so each ring's copies are bigger than the last ring's; each ring touches
// the next, and the whole
// rosette is scaled so the outermost ring reaches the corners. Copies are { x, y, size, angle }: centered
// at (x, y), turned by `angle` radians so their tops face outward, and listed outermost first, so inner
// rings are drawn on top.
export function radialCopies(around, rings, size) {
  const sizeOverRadius = Math.min(1, (2 * Math.PI / around) * 0.9);
  const growth = (1 + sizeOverRadius / 2) / (1 - sizeOverRadius / 2); // touching rings: r - s/2 = r' + s'/2
  const radii = Array.from({ length: rings }, (_, i) => growth ** i); // in units of the first ring's radius
  const outermost = radii[rings - 1] * (1 + sizeOverRadius / 2);
  const scale = (size / 2) * Math.SQRT2 / outermost;
  const center = size / 2;

  const copies = [];
  for (let ring = rings - 1; ring >= 0; ring--) {
    const radius = radii[ring] * scale;
    for (let i = 0; i < around; i++) {
      const angle = (i + (ring % 2) / 2) * 2 * Math.PI / around;
      copies.push({ x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle), size: sizeOverRadius * radius, angle: angle + Math.PI / 2 });
    }
  }
  copies.push({ x: center, y: center, size: (2 - sizeOverRadius) * scale, angle: 0 }); // the middle fills the first ring's hole
  return copies;
}




// a grid where every other column is flipped sideways and every other row upside down,
// so each copy is the mirror image of its neighbors
function mirrorGrid(p, snapshot, w, h) {
  for (let row = 0; row * h < p.height - 0.5; row++) {
    for (let column = 0; column * w < p.width - 0.5; column++) {
      const cell = cellRect(column * w, row * h, w, h);
      const flipX = column % 2 === 1, flipY = row % 2 === 1;
      p.push();
      p.translate(flipX ? cell.left + cell.width : cell.left, flipY ? cell.top + cell.height : cell.top);
      p.scale(flipX ? -1 : 1, flipY ? -1 : 1);
      p.image(snapshot, 0, 0, cell.width, cell.height);
      p.pop();
    }
  }
}

  


function scaleRect(p, params, p5) {
  let x = params.position.x;
  let y = params.position.y;

  let w = params.width;
  let h = params.height;
  let scaleFactor = params.scaleBy / 100;

  let sx = x - w / 2;
  let sy = y - h / 2;

  p.push();
  p.noFill();
  p.stroke(100);

  let snapshot = p5.createGraphics(w, h);
  snapshot.image(p5.getStaticCanvas(), 0, 0, w, h, sx, sy, w, h);

  let scaledWidth = w * scaleFactor;
  let scaledHeight = h * scaleFactor;

  let dx = x - scaledWidth / 2;
  let dy = y - scaledHeight / 2;

  if(p === p5.getHoverCanvas()) {
    // p.tint(255, 100); // semi-transparent
    p.image(snapshot, dx, dy, scaledWidth, scaledHeight, 0, 0, w, h);
  } else {
    p.image(snapshot, dx, dy, scaledWidth, scaledHeight, 0, 0, w, h);
  }

  snapshot.remove();

  // Draw the outline if it's on the hover or drag canvas
  if(p === p5.getHoverCanvas() || p === p5.getDragCanvas()) {
    p.push();
    p.stroke(100);
    p.noFill();
    p.rectMode(p.CENTER);
    p.rect(x, y, w, h);
    p.pop();
  }
  p.pop();
}

export function getSpiroPoints(params) {
  let R = params.outer || 30;
  let r = params.inner || 24;
  let d = params.d;
  let steps = 360;
  let k = (R - r) / r;
  let spacing = Math.PI / 15.0;
  let theta = 0;
  let path = [];

  let offsetX = params.position.x;
  let offsetY = params.position.y;

  for (let i = 0; i < steps; i++) {
    let x = (R - r) * Math.cos(theta) + d * Math.cos(k * theta);
    let y = (R - r) * Math.sin(theta) - d * Math.sin(k * theta);
    path.push([x+offsetX, y+offsetY]);
    theta += spacing;
  }
  return path;
}

export function getSpecklesPoints(params, w=500, h=500) {
  let progress = params.progress;
  let n = params.position.x * params.position.y;
  let path = [];

  //put more and more speckles on the screen
  //progress does 2 things: density of speckles (more over time) and where in the Perlin noise function you are
  //(so the speckles change every refresh, it's not just adding more over time to the existing ones)
  for (let i = 0; i < progress * 100; i++) {
    let x = noise(n + i * 0.01) * w * 2;
    let y = noise(2 * n + i * 0.01) * h * 2;
    path.push([x - w/2, y - h/2]);
  }

  return path;
}


