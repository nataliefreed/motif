export const renderers = {

  //p is pgraphics object

  'solid fill': (p, params, p5) => {
    p.background(params.color);
  },

  'gradient': (p, params, p5) => {
    let color1 = p.color(params.color1);
    let color2 = p.color(params.color2);
    let angle = -p.radians(params.angle);
  
    let len = Math.sqrt(p.width * p.width + p.height * p.height); // diagonal length
  
    p.push();
    p.translate(p.width / 2, p.height / 2); // Move the origin to the center
    p.rotate(angle); // Rotate around the new origin
    p.noFill();
    p.strokeWeight(1);
  
    for (let i = -len / 2; i < len / 2; i++) {
      let percentage = p.map(i, -len / 2, len / 2, 0, 1);
      p.stroke(p.lerpColor(color1, color2, percentage));
      p.line(-len / 2, i, len / 2, i); // Draw from left to right, with i as the y-coordinate
    }
  
    p.pop();
  },

  'stripes': (p, params, p5) => {
    let color1 = p.color(params.color1);
    let color2 = p.color(params.color2);
    let stripeWidth = params.stripeWidth;
    let angle = p.radians(params.angle);
    let len = Math.sqrt(p.width * p.width + p.height * p.height); // diagonal length

    p.push();
    p.translate(p.width / 2, p.height / 2); // Move origin to center
    p.rotate(angle); // Rotate around new origin

    p.noFill();
    p.strokeWeight(stripeWidth);

    for(let i = -len / 2; i < len / 2; i += stripeWidth * 2) { 
      // i += stripeWidth * 2 - accounting for both drawn stripe and gap in between
      let stripeColor = p.lerpColor(color1, color2, (i + len / 2) / len); // Adjust the mapping for color interpolation
      p.stroke(stripeColor);
      p.line(-len / 2, i, len / 2, i); // Line from negative to positive x-axis, with i as the y-coordinate
    }
    p.pop();

  },

  'circle': (p, params, p5) => {
    // debugger;
    let x = params.tempPosition? params.tempPosition.x : params.position.x;
    let y = params.tempPosition?  params.tempPosition.y : params.position.y;
    p.push();
    p.noStroke();
    p.fill(params.color);
    p.circle(x, y, params.radius*2);
    p.pop();
  },

  'square': (p, params, p5) => {
    let x = params.position.x;
    let y = params.position.y;
    let size = params.size;
    p.push();
    p.rectMode(p.CENTER);
    p.noStroke();
    p.fill(params.color);
    p.rect(x, y, size, size);
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
      p.triangle(
          x + w / 2, y + h / 2,
          x - w / 2, y + h / 2,
          x, y - h / 2
      );
      p.pop();
  },

  'rectangle': (p, params, p5) => {
      let x = params.position.x;
      let y = params.position.y;
      let width = params.width;
      let height = params.height;
      p.push();
      p.rectMode(p.CENTER);
      p.noStroke();
      p.fill(params.color);
      p.rect(x, y, width, height);
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
      p.beginShape();
      for (let a = 0; a < p.TWO_PI; a += angle) {
          let sx = x + p.cos(a) * r2;
          let sy = y + p.sin(a) * r2;
          p.vertex(sx, sy);
          sx = x + p.cos(a + halfAngle) * r1;
          sy = y + p.sin(a + halfAngle) * r1;
          p.vertex(sx, sy);
      }
      p.endShape(p.CLOSE);
      p.pop();
  },

  'polygon': (p, params, p5) => {
      let nsides = Math.abs(params.nsides);
      let x = params.position.x;
      let y = params.position.y;
      let angle = p.TWO_PI / nsides;
      p.push();
      p.noStroke();
      p.fill(params.color);
      p.beginShape();
      for (let a = 0; a < p.TWO_PI; a += angle) {
          let sx = x + p.cos(a) * params.radius;
          let sy = y + p.sin(a) * params.radius;
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
    p.translate(0, -size/2);
    p.noStroke();
    p.fill(params.color);
    p.beginShape();
    p.vertex(x, y);
    p.bezierVertex(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
    p.bezierVertex(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
    p.endShape(p.CLOSE);
    p.pop();
  }, 

  // TODO: these probably shouldn't be mutating the params object
  // but I think these aren't triggering as action list change, so it's not reupdating?
  // which is why it's depending on this to pass the path to the positions...
  // todo: add the pathSpacing
  'along path': (p, params, p5) => {
    if(params.children && params.path) {
      params.path.forEach((point, i) => {
        let child = params.children[i%params.children.length];
        child.params.position = {x: point[0], y: point[1]};
        child.params.tempPosition = {x: point[0], y: point[1]};
        renderers[child.name](p, child.params, p5);
      });
    }
  },

  'tile': (p, params, p5) => {
    tile(p, params, p5);
  },

  'straight grid': (p, params, p5) => {
    tile(p, {...params, tiling: 'straight grid'}, p5);
  },
  'brick': (p, params, p5) => {
    tile(p, {...params, tiling: 'brick'}, p5);
  },
  'half drop': (p, params, p5) => {
    tile(p, {...params, tiling: 'half drop'}, p5);
  },
  'checkerboard': (p, params, p5) => {
    tile(p, {...params, tiling: 'checkerboard'}, p5);
  },
  'radial': (p, params, p5) => {
    tile(p, {...params, tiling: 'radial'}, p5);
  },

  'grow': (p, params, p5) => {
    scaleRect(p, params, p5);
  },

  'shrink': (p, params, p5) => {
    scaleRect(p, params, p5);
  },

  'shift': (p, params, p5) => {
    let lineHeight = params.height;
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
    if(p !== p5.getHoverCanvas()) {
      p.push();
      p.strokeWeight(params.lineWeight);
      p.noFill();
      p.stroke(params.color);
      p.line(params.start.x, params.start.y, params.end.x, params.end.y);
      p.pop();
    }
  },

  'copy cutout': (p, params, p5) => {
    p.push();

    let w = params.width;
    let h = params.height;
    let x1 = params.position.x;
    let y1 = params.position.y;
    let x2 = params.end.x;
    let y2 = params.end.y;

    let snapshot = p5.createGraphics(w, h); // for captured rectangle
    p.imageMode(p.CENTER);

    snapshot.image(p, 0, 0, w, h, x1 - w/2, y1 - h/2, w, h);

    // if(p===p) snapshot.image(p, 0, 0, w, h, x1 - w/2, y1 - h/2, w, h); // w * h rectangle centered at x1, y1 from static canvas
    // else snapshot.image(s, 0, 0, w, h, x1 - w/2, y1 - h/2, w, h);
    
    //TODO: if you use p, it will capture the cleared canvas when released, but if you use s, it will not add the cutouts in a cumulative way

    //TODO: other way to check if temp canvas?
    if(p === p5.getHoverCanvas) { //if temp canvas, draw a border
      snapshot.stroke(0);
      snapshot.noFill();
      snapshot.strokeWeight(2);
      snapshot.rect(0, 0, w, h);
    }
    p.image(snapshot, x2, y2, w, h, 0, 0, w, h); // draw the moved rectangle onto the active canvas

    snapshot.remove();

    p.pop();
  },

  'smooth brush': (p, params, p5) => {
    s.push();
    s.noFill();
    s.strokeWeight(params.lineWeight);
    s.stroke(params.color);
    s.strokeJoin(s.ROUND);
    
    let points = params.pointsList;
    s.beginShape();
    for(let i=0;i<points.length;i++) {
      s.vertex(points[i].x, points[i].y);
    }
    s.endShape();
    s.pop();
  },

  'rainbox brush': (p, params, p5) => {

  },

  'lines brush': (p, params, p5) => {

  },

  'line': (p, params, p5) => {

  },

  'copy cutout': (p, params, p5) => {

  },

  //TODO: figure out hover/drag behavior
  'invert': (p, params, p5) => {
    applyFilter(p, {...params, filter: 'INVERT'}, p5);
  },

  'grayscale': (p, params, p5) => {
    applyFilter(p, {...params, filter: 'GRAY'}, p5);
  },

  'threshold': (p, params, p5) => {
    applyFilter(p, {...params, filter: 'THRESHOLD'}, p5);
  },

  'foldable box stencil': (p, params, p5) => {
    this.push();
    const { length: l, width: w, height: h } = params;

    // Calculate centering offsets
    const offsetX = (this.width - (2 * l + h)) / 2; // symmetrical so no tab calculation
    const offsetY = (this.height - (2 * l + 2 * w) + 0.2 * h) / 2;

    this.translate(offsetX, offsetY);

    this.noFill();
    this.stroke(50);
    this.strokeWeight(2);

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
      this.stroke(50);
      this.line(r[r0], c[c0], r[r1], c[c1]);
    }

    const fold = (r0, c0, r1, c1) => {
      this.stroke(120);
      this.line(r[r0], c[c0], r[r1], c[c1]);
    }

    const tab = (r0, c0, r1, c1) => {
      this.stroke(50);
      const u = [r[r1] - r[r0], c[c1] - c[c0]];
      const v = [-u[1], u[0]];
      let prev = [0, 0]; 

      for (const [du, dv] of [
        [0.1, 0.2],
        [0.9, 0.2],
        [1.0, 0.0]
      ]) {
        this.line(r[r0] + u[0] * prev[0] + v[0] * prev[1],
          c[c0] + u[1] * prev[0] + v[1] * prev[1],
          r[r0] + u[0] * du + v[0] * dv,
          c[c0] + u[1] * du + v[1] * dv
        );
        prev = [du, dv];
      }
      
      fold(r0, c0, r1, c1);
    }

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

    // Extra folds that aren't for tabs
    fold(1, 1, 1, 2);  // Back face left fold
    fold(1, 2, 2, 2);  // Back face bottom fold
    fold(2, 2, 2, 1);  // Back face right fold
    fold(2, 1, 1, 1);  // Back face top fold (lid hinge)
    fold(1, 3, 2, 3);  // Front face to bottom face fold

    this.pop();
  },

  'paperdoll': (p, params, p5) => {

  }
};








// let paperdolls = { // paper doll stencils
//   outfits: [],
//   hairstyles: [],
// };

// p.loadStencils = () => {
//   let outfitNames = ['01', '02'];
//   let hairstyleNames = ['01', '02', '03'];

//   // Load doll fill
//   paperdolls.dollFill = p.loadImage(`src/assets/stencils/paper-dolls/outfits/doll-fill.png`);
//   paperdolls.underlayerFill = p.loadImage('src/assets/stencils/paper-dolls/outfits/underlayer-fill.png');

//   // Load all outfit and hairstyle files
//   for (let name of outfitNames) {
//     let outfit = {
//       number: parseInt(name),
//       outline: p.loadImage(`src/assets/stencils/paper-dolls/outfits/outlines/${name}.png`),
//       fill: p.loadImage(`src/assets/stencils/paper-dolls/outfits/fills/${name}.png`)
//     };
//     paperdolls.outfits.push(outfit);
//   }

//   for (let name of hairstyleNames) {
//     let hairstyle = {
//       number: parseInt(name),
//       outline: p.loadImage(`src/assets/stencils/paper-dolls/hairstyles/outlines/${name}.png`),
//       fill: p.loadImage(`src/assets/stencils/paper-dolls/hairstyles/fills/${name}.png`)
//     };
//     paperdolls.hairstyles.push(hairstyle);
//   }
// }

// p5.prototype.paperdoll = function(params) {

//   // Get the color value from params.
//   let skinTone = p.color(params.skinTone);
  
//   // Parse the outfit and hairstyle numbers from params
//   let outfitNumber = parseInt(params.outfit);
//   let hairstyleNumber = parseInt(params.hairstyle);

//   // Find the corresponding outfit and hairstyle objects in paperdolls
//   let outfit = paperdolls.outfits.find(o => o.number === outfitNumber);
//   let hairstyle = paperdolls.hairstyles.find(h => h.number === hairstyleNumber);

//   if (!outfit || !hairstyle) {
//     console.error('Could not find outfit and/or hairstyle:', outfitNumber, hairstyleNumber);
//     return;
//   }

//   // Create a new graphics object to draw the paper doll and its outfit and hairstyle fills
//   let dollCanvas = p5.createGraphics(p.width, p.height);
//   var outfitCanvas = p5.createGraphics(p.width, p.height);
//   var hairstyleCanvas = p5.createGraphics(p.width, p.height);

//   //Tint and then draw the doll fill
//   // dollCanvas.tint(skinTone);
//   // dollCanvas.image(paperdolls.dollFill, 0, 0, p.width, p.height);
//   // dollCanvas.noTint();
//   // dollCanvas.image(paperdolls.underlayerFill, 0, 0, p.width, p.height);


//   // Use doll fill as a mask for the skin tone
//   dollCanvas.image(paperdolls.dollFill, 0, 0, p.width, p.height);
//   dollCanvas.drawingContext.globalCompositeOperation = 'source-in';
//   let skinToneCanvas = p.createGraphics(p.width, p.height);
//   skinToneCanvas.background(skinTone);
//   dollCanvas.image(skinToneCanvas, 0, 0);

//   // Prepare the outfit fill as a mask
//   outfitCanvas.image(outfit.fill, 0, 0, p.width, p.height);
//   outfitCanvas.image(paperdolls.underlayerFill, 0, 0, p.width, p.height); // underwear!
//   outfitCanvas.drawingContext.globalCompositeOperation = 'source-in';
//   outfitCanvas.image(this, 0, 0, p.width, p.height);

//   // Prepare the hairstyle fill as a mask
//   hairstyleCanvas.image(hairstyle.fill, 0, 0, p.width, p.height);
//   hairstyleCanvas.drawingContext.globalCompositeOperation = 'source-in';
//   hairstyleCanvas.image(this, 0, 0, p.width, p.height);

//   // Lighten the original painting
//   this.noStroke();
//   this.fill(255, 220);
//   this.rect(0, 0, p.width, p.height);

//   // Draw the doll fill
//   this.image(dollCanvas, 0, 0);

//   // Draw the outfit fill
//   this.image(outfitCanvas, 0, 0);

//   // Draw the outfit outline
//   if(outfit.outline){
//     this.image(outfit.outline, 0, 0, this.width, this.height);
//   }

//   // Draw the hair fill
//   this.image(hairstyleCanvas, 0, 0);

//   // Draw the hair outline
//   if(hairstyle.outline){
//     this.image(hairstyle.outline, 0, 0, this.width, this.height);
//   }

//   dollCanvas.remove();
//   outfitCanvas.remove();
//   hairstyleCanvas.remove();
//   skinToneCanvas.remove();
// }









function applyFilter(p, params, p5) {
  // 2nd param to filter false: don't use WebGL in P2D mode, Svelte P5 doesn't seem to support it
  p.filter(p5[params.filter], false);
}

// Tile
function tile(p, params, p5) {  
  p.push();
  let x = params.position.x;
  let y = params.position.y;
  let w = params.width;
  let h = params.height;
  let tiling = params.tiling;
  let numRings = params.numRings || p.map(x, 0, p.width, 1, 5);

  let sx = x - w / 2;
  let sy = y - h / 2;

  p.noFill();
  p.stroke(100);


  // else {
    let snapshot = p5.createGraphics(w, h); // for captured rectangle
    snapshot.image(p5.getStaticCanvas(), 0, 0, w, h, sx, sy, w, h); // w * h rectangle centered at x, y 

    if(p===p5.getHoverCanvas()) {
      p.tint(255, 100);
    }

    switch (tiling) {
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
        checkerboard(p, snapshot, w, h);
        break;
      case 'radial':
        radial(p, snapshot, w, h, numRings);
        break;
      default:
        break;
    }

    snapshot.remove();

    if(p===p5.getHoverCanvas() || p===p5.getDragCanvas()) {
      p.push();
      p.rectMode(p.CENTER);
      p.stroke(100);
      p.noFill();
      p.rect(x, y, w, h);
      p.pop();
    }
    p.pop();
}

function straightGrid(p, snapshot, w, h) {
  for (let dx = 0; dx < p.width; dx += w) {
    for (let dy = 0; dy < p.height; dy += h) {
      p.image(snapshot, dx, dy, w, h, 0, 0, w, h);
    }
  }
}

function brick(p, snapshot, w, h) {
  let shiftRow = false;
  for (let dy = 0; dy < p.height; dy += h) {
    let startX = shiftRow ? - w / 2 : 0;
    for (let dx = startX; dx < p.width; dx += w) {
      p.image(snapshot, dx, dy, w, h, 0, 0, w, h);
    }
    shiftRow = !shiftRow;
  }
}

function halfDrop(p, snapshot, w, h) {
  let halfColumnHeight = h / 2;
  let shiftColumn = false;
  for (let dx = 0; dx < p.width; dx += w) {
    let startY = shiftColumn ? -halfColumnHeight : 0;
    for (let dy = startY; dy < p.height; dy += h) {
      p.image(snapshot, dx, dy, w, h, 0, 0, w, h);
    }
    shiftColumn = !shiftColumn;
  }
}

function checkerboard(p, snapshot, w, h) {
  for (let dy = 0; dy < p.height; dy += h) {
    let isEvenRow = dy / h % 2 === 0;
    for (let dx = 0; dx < p.width; dx += w) {
      let isEvenColumn = dx / w % 2 === 0;
      if (isEvenRow !== isEvenColumn) {
        p.image(snapshot, dx, dy, w, h, 0, 0, w, h);
      }
    }
  }
}

function radial(p, snapshot, w, h, numRings) {
  let centerX = p.width / 2;
  let centerY = p.height / 2;

  for (let ring = 0; ring < numRings; ring++) {
      // Calculate circumference for the current ring
      let radius = (ring + 1) * h;
      let circumference = 2 * Math.PI * radius;
      let numTiles = Math.floor(circumference / w);

      for (let i = 0; i < numTiles; i++) {
          let angle = (i / numTiles) * 2 * Math.PI;
          let dx = centerX + radius * Math.cos(angle) - w / 2;
          let dy = centerY + radius * Math.sin(angle) - h / 2;
          p.image(snapshot, dx, dy, w, h, 0, 0, w, h);
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

  p.noFill();
  p.stroke(100);

  let snapshot = p5.createGraphics(w, h);
  snapshot.image(p5.getStaticCanvas(), 0, 0, w, h, sx, sy, w, h);

  let scaledWidth = w * scaleFactor;
  let scaledHeight = h * scaleFactor;

  let dx = x - scaledWidth / 2;
  let dy = y - scaledHeight / 2;

  if(p === p5.getHoverCanvas()) {
    p.tint(255, 100); // semi-transparent
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
}


