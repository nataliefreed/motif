export class P5Renderer {
  constructor() {
    this.sketch = this.getSketch();
    this.sketch.addFill({color:'#aaaaaa'});
		this.sketch.clear('#aaaaaa');
    return this.sketch;
  }

  clear() {
    this.sketch.clear();
  }

  render() {
    this.sketch.render();
  }

  getSketch() {
    return new p5(p => {
      
      let points = null;
      let activeEffectName = "";
      let strokeColor = 0;
      let strokeWeight = 5;
      let s, t; //p is main sketch, s is static canvas, t is temporary for animations

      let paperdolls = { // paper doll stencils
        outfits: [],
        hairstyles: [],
        dollFill: null
      };

      p.getPreviewCanvas = () => {
        return t;
      }

      p.getStaticCanvas = () => {
        return s;
      }

      p.setup = () => {
        p.createCanvas(600, 600);
        s = p.createGraphics(p.width, p.height);
        t = p.createGraphics(p.width, p.height);
        p.background(255);
        p.setupFinished = true;
        p.noLoop();		
      };
      
      p.draw = () => { //show a preview of brush strokes while actively dragging mouse
        p.image(t, 0, 0);
        // if(points) {
        // 	switch(activeEffectName) {
        // 		case 'rainbow brush':
        // 		  p.addRainbowBrush({ minSize: currentLineWeight, maxSize: currentLineWeight*2, pointsList: points.toString() });
        // 		  break;
        // 		case 'brush':
        // 			p.addBrushStroke({ color:currentColorRGB, lineWeight: currentLineWeight, pointsList: points.toString() });
        // 			break;
        // 		case 'straight line':
        // 			t.clear();
        // 			p.addPreviewLine({ color:currentColorRGB, lineWeight: currentLineWeight, x1: p.getPoint(0).x, y1: p.getPoint(0).y, x2: p.getLastPoint().x, y2: p.getLastPoint().y }, t); 
        // 			break;
        // 		case 'porcupine brush':
        // 			t.clear();
        // 			p.porcupineBrush({ color:currentColorRGB, lineWeight: currentLineWeight, pointsList: points.toString() }, t);
        // 			break;
        // 		case 'lines brush':
        // 			t.clear();
        // 			p.linesBrush({ color:currentColorRGB, lineWeight: currentLineWeight, pointsList: points.toString() }, t);
        // 		// case 'star brush':
        // 		// 	p.metaBrush({
        // 		// 		scale: 100,
        // 		// 		pointsList: points.toString(), 
        // 		// 		shapes:
        // 		// 		[
        // 		// 			(x, y, size, c) => {
        // 		// 				c.star({color: my.data.color, x: x, y: y, r1: size, r2: size/2, npoints: 5});
        // 		// 			},
        // 		// 		],
        // 		// 		sizes: [10, 20, 30, 40, 50, 40, 30, 20],
        // 		// 		colors:
        // 		// 		[
        // 		// 			[255, 165,   0], // Orange
        // 		// 			[255, 215,   0], // Gold
        // 		// 		],
        // 		// 		alpha: 0.75,
        // 		// 	}, t);
        // 			break;
        // 		default: break;
        // 	}
        // }
        // p.image(s, 0, 0);
        
      };

      p.render = () => {
        p.image(s, 0, 0);
      }
    
      p.clear = () => {
        if(!p.setupFinished) return;
        p.background(255);
        s.background(255);
        t.clear();
      }
    
      p.addCircle = (params) => {
        if(!p.setupFinished) return;
        s.fill(params.color);
        s.noStroke();
        s.circle(params.x, params.y, params.r*2);
      }

      p.addSquare = (params) => {
        s.push();
        s.rectMode(s.CENTER);
        s.fill(params.color);
        s.noStroke();
        s.rect(params.x, params.y, params.size, params.size);
        s.pop();
      }
    
      p.addFill = (params) => {
        if(!p.setupFinished) return;
        s.fill(params.color);
        s.noStroke();
        s.rect(0, 0, p.width, p.height);
      }

      p5.prototype.star = function(params) {
        if(!p.setupFinished) return;
        this.push(); // Save current drawing style
        let x = params.x;
        let y = params.y;
        let r1 = params.r1;
        let r2 = params.r2;
        let angle = this.TWO_PI / params.npoints;
        let halfAngle = angle / 2.0;
        this.fill(params.color);
        this.noStroke();
        this.beginShape();
        for (let a = 0; a < s.TWO_PI; a += angle) {
          let sx = x + this.cos(a) * r2;
          let sy = y + this.sin(a) * r2;
          this.vertex(sx, sy);
          sx = x + this.cos(a + halfAngle) * r1;
          sy = y + this.sin(a + halfAngle) * r1;
          this.vertex(sx, sy);
        }
        this.endShape(this.CLOSE);
        this.pop(); // Restore original drawing style
      }

      p.polygon = (params) => {
        if(!p.setupFinished) return;
        let nsides = Math.abs(params.nsides);
        s.fill(params.color);
        s.noStroke();
        let angle = s.TWO_PI / nsides;
        s.beginShape();
        for (let a = 0; a < s.TWO_PI; a += angle) {
          let sx = params.x + s.cos(a) * params.r;
          let sy = params.y + s.sin(a) * params.r;
          s.vertex(sx, sy);
        }
        s.endShape(s.CLOSE);
      }

      p.gradient = (params) => {
        if(!p.setupFinished) return;
        let pcolor1 = s.color(params.color1);
        let pcolor2 = s.color(params.color2);
        s.noFill();
        s.strokeWeight(1);
        for(let i=0;i<p.height;i++) {
          s.stroke(s.lerpColor(pcolor1, pcolor2, i/p.height));
          s.line(0, i, p.width, i);
        }
      }

      p.stripes = (params) => {
        if(!p.setupFinished) return;
        let stripeWidth = params.stripeWidth;
        s.push();
        s.translate(0, stripeWidth/2); //so that top stripe is fully shown
        let pcolor1 = s.color(params.color1);
        let pcolor2 = s.color(params.color2);
        s.noFill();
        s.strokeWeight(stripeWidth);
        for(let i=0;i<p.height;i+=stripeWidth) {
          let c = s.lerpColor(pcolor1, pcolor2, i/(p.height-stripeWidth));
          s.stroke(c);
          s.line(0, i, p.width, i);
        }
        s.pop();
      }

      p.shift = (params) => {
        let lineHeight = params.height;
        let offset = params.offset;
        if(params.orientation == "horizontal") {
          for(let i=0;i<p.height/lineHeight;i++) {
            if(i%2 == 0) {
              s.image(s, offset, i*lineHeight, p.width, lineHeight, 0, i*lineHeight, p.width, lineHeight);
              s.image(s, 0, i*lineHeight, offset, lineHeight, p.width - offset, i*lineHeight, offset, lineHeight); //wrap
            }
          }
        }
        else if(params.orientation == "vertical") {
          for(let i=0;i<p.height/lineHeight;i++) {
            if(i%2 == 0) {
              s.image(s, i*lineHeight, offset, lineHeight, p.height, i*lineHeight, 0, lineHeight, p.height);
              s.image(s, i*lineHeight, 0, lineHeight, offset, i*lineHeight, p.width - offset, lineHeight, offset); //wrap
            }
          }
        }
      }

      // p._convertToVectors = (pointString) => {
      // 	let points = pointString.split(',');
      // 	let vectors = [];
      // 	// Iterate over the point list with a step of 2
      // 	for (let i = 0; i < points.length; i += 2) {
      // 		let x = parseInt(points[i]);
      // 		let y = parseInt(points[i + 1]);
      // 		vectors.push(p.createVector(x, y));
      // 	}
      // 	return vectors;
      // }

      p.metaBrush = (params, c) => {
        s.noStroke();
        let points = params.pointsList;
        for (let i = 0; i < params.colors.length; i++) {
          params.colors[i] = p.color(params.colors[i]);
          params.colors[i].setAlpha(p.map(params.alpha, 0, 1, 0, 255));
        }
          let shapeCount = 0; // Count of shapes drawn

          for (let i = 1; i < points.length; i++) {
            let point = points[i];

            let x = point.x;
            let y = point.y;

            s.fill(params.colors[i % params.colors.length]);
            let size = parseFloat(params.scale) / 100.0 * parseFloat(params.sizes[i % params.sizes.length]);
            params.shapes[i % params.shapes.length].apply(null, [x, y, size, s]);

            shapeCount++;
        }
      }

      p.tile = (params) => {
        let w = params.width;
        let h = params.height;
        let tiling = params.tiling;
        let x = params.x;
        let y = params.y;
      
        let sx = x - w / 2;
        let sy = y - h / 2;

        s.noFill();
        s.stroke(100);

        let snapshot = p.createGraphics(w, h); // for captured rectangle
        snapshot.image(s, 0, 0, w, h, sx, sy, w, h); // w * h rectangle centered at x, y 

        s.stroke(0);
        s.noFill();
      
        switch (tiling) {
          case 'straight grid': // take a and repeat it in a straight grid pattern across the full width and height of the canvas
            for (let dx = 0; dx < s.width; dx += w) {
              for (let dy = 0; dy < s.height; dy += h) {
                s.image(snapshot, dx, dy, w, h, 0, 0, w, h);
                // s.rect(dx, dy, w-5, h-5);
              }
            }
            break;
          case 'brick':
            // every other row should be shifted over by half the width of each unit
            let shiftRow = false;
            for (let dy = 0; dy < p.height; dy += h) {
              let startX = shiftRow ? - w / 2 : 0;
              for (let dx = startX; dx < p.width; dx += w) {
                s.image(snapshot, dx, dy, w, h, 0, 0, w, h);
              }
              shiftRow = !shiftRow;
            }
            break;
          case 'half drop':
            // every other column should be shifted down by half the height of each unit
            let halfColumnHeight = h / 2;
            let shiftColumn = false;
            for (let dx = 0; dx < p.width; dx += w) {
              let startY = shiftColumn ? -halfColumnHeight : 0;
              for (let dy = startY; dy < p.height; dy += h) {
                s.image(snapshot, dx, dy, w, h, 0, 0, w, h);
              }
              shiftColumn = !shiftColumn;
            }
            break;
          case 'checkerboard':
            // only tile every other unit, shift over for the next row like a checkerboard
            for (let dy = 0; dy < p.height; dy += h) {
              let isEvenRow = dy / h % 2 === 0;
              for (let dx = 0; dx < p.width; dx += w) {
                let isEvenColumn = dx / w % 2 === 0;
                if (isEvenRow !== isEvenColumn) {
                  s.image(snapshot, dx, dy, w, h, 0, 0, w, h);
                }
              }
            }
            break;
          default:
            break;
        }
      }

      //heart by Mithru: https://editor.p5js.org/Mithru/sketches/Hk1N1mMQg
      p.heart = (params) => {
        if(!p.setupFinished) return;
        let x = params.x;
        let y = params.y;
        let size = params.size;
        s.push();
        s.translate(0, -size/2);
        s.fill(params.color);
        s.noStroke();
        s.beginShape();
        s.vertex(x, y);
        s.bezierVertex(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
        s.bezierVertex(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
        s.endShape(s.CLOSE);
        s.pop();
      }

      p.applyFilter = (params) => {
        s.filter(s[params.filter.toUpperCase()]);
      }

      p.box = (params) => {
        s.push();
        let l = params.length;
        let w = params.width;
        let h = params.height;
        s.translate(p.width/4-w/2, p.height/4-l/2);
        s.noFill();
        s.stroke(0);
        s.strokeWeight(2);
        const dc = [l, w, l, w];
        const dr = [l, h, l];
        const r = [10];
        const c = [10];
        for(const d of dr) { r.push(r[r.length - 1] + d); }
        for(const d of dc) { c.push(c[c.length - 1] + d); }
        const cut = (r0, c0, r1, c1) => {
          s.stroke(0);
          s.line(r[r0], c[c0], r[r1], c[c1]);
        }
        const fold = (r0, c0, r1, c1) => {
          s.stroke(128);
          s.line(r[r0], c[c0], r[r1], c[c1]);
        }
        const tab = (r0, c0, r1, c1) => {
          s.stroke(0);
          const u = [r[r1] - r[r0], c[c1] - c[c0]];
          const v = [-u[1], u[0]];
          var prev = [0,0]; 
          for(const [du, dv] of [
            [0.1, 0.2],
            [0.9, 0.2],
            [1.0, 0.0]]) {
            s.line(r[r0] + u[0] * prev[0] + v[0] * prev[1],
                c[c0] + u[1] * prev[0] + v[1] * prev[1],
                r[r0] + u[0] * du + v[0] * dv,
                c[c0] + u[1] * du + v[1] * dv);
            prev = [du, dv];						
          }
          fold(r0, c0, r1, c1);
        }
        tab(1,0,1,1);
        cut(1,1,0,1);
        cut(0,1,0,2);
        cut(0,2,1,2);
        tab(1,2,1,3);
        tab(1,3,1,4);
        cut(1,4,2,4);
        tab(2,4,2,3);
        tab(2,3,2,2);
        cut(2,2,3,2);
        cut(3,2,3,1);
        cut(3,1,2,1);
        tab(2,1,2,0);
        tab(2,0,1,0);
        // extra folds that aren't for tabs
        fold(1,1,1,2);
        fold(1,2,2,2);
        fold(2,2,2,1);
        fold(2,1,1,1);
        fold(1,3,2,3);
        s.pop();
      }

      p.loadStencils = () => {
        let outfitNames = ['01'];
        let hairstyleNames = ['01'];
      
        // Load doll fill
        paperdolls.dollFill = p.loadImage(`src/assets/stencils/paper-dolls/outfits/doll-fill.png`);
      
        // Load all outfit and hairstyle files
        for (let name of outfitNames) {
          let outfit = {
            number: parseInt(name),
            outline: p.loadImage(`src/assets/stencils/paper-dolls/outfits/outlines/${name}.png`),
            fill: p.loadImage(`src/assets/stencils/paper-dolls/outfits/fills/${name}.png`)
          };
          paperdolls.outfits.push(outfit);
        }
      
        for (let name of hairstyleNames) {
          let hairstyle = {
            number: parseInt(name),
            outline: p.loadImage(`src/assets/stencils/paper-dolls/hairstyles/outlines/${name}.png`),
            fill: p.loadImage(`src/assets/stencils/paper-dolls/hairstyles/fills/${name}.png`)
          };
          paperdolls.hairstyles.push(hairstyle);
        }

        console.log("loaded images");
      }

      // p.paperdoll = (params) => {
      // 	s.image(paperdolls.dollFill, 0, 0, p.width, p.height);
      // }

      p.paperdoll = (params) => {
        // Get the color value from params.
        let c = s.color(params.skinTone);
        
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
        let dollCanvas = p.createGraphics(p.width, p.height);
        let outfitCanvas = p.createGraphics(p.width, p.height);
        let hairstyleCanvas = p.createGraphics(p.width, p.height);
      
        //Tint and then draw the doll fill
        dollCanvas.tint(c); // Apply the tint for the doll's fill image
        dollCanvas.image(paperdolls.dollFill, 0, 0, p.width, p.height); // Draw the doll's fill image
        dollCanvas.noTint(); // Remove the tint before drawing the other images

        // Prepare the outfit fill as a mask
        outfitCanvas.image(outfit.fill, 0, 0, p.width, p.height);
        outfitCanvas.drawingContext.globalCompositeOperation = 'source-in';
        outfitCanvas.image(s, 0, 0, p.width, p.height);
      
        // Prepare the hairstyle fill as a mask
        hairstyleCanvas.image(hairstyle.fill, 0, 0, p.width, p.height);
        hairstyleCanvas.drawingContext.globalCompositeOperation = 'source-in';
        hairstyleCanvas.image(s, 0, 0, p.width, p.height);
      
        // Lighten the original painting
        s.noStroke();
        s.fill(255, 220);
        s.rect(0, 0, p.width, p.height);

        // Draw the doll fill
        s.image(dollCanvas, 0, 0);

        // Draw the outfit fill
        s.image(outfitCanvas, 0, 0);

        // Draw the outfit outline
        if(outfit.outline){
          s.image(outfit.outline, 0, 0, s.width, s.height);
        }

        // Draw the hair fill
        s.image(hairstyleCanvas, 0, 0);
      
        // Draw the hair outline
        if(hairstyle.outline){
          s.image(hairstyle.outline, 0, 0, s.width, s.height);
        }

        // // s.image(g, 0, 0);
        
        // // Apply the outfit fill as a mask
        // outfitCanvas.image(outfit.fill, 0, 0, p.width, p.height);
        // outfitCanvas.drawingContext.globalCompositeOperation = 'source-in';
        // outfitCanvas.image(s, 0, 0, p.width, p.height);
        
        // // Lighten everything that is not within the mask, then draw the masked image
        // s.noStroke();
        // s.fill(255, 220);
        // s.rect(0, 0, p.width, p.height);
        // s.image(dollCanvas, 0, 0);
        // s.image(outfitCanvas, 0, 0);
      
        // // Draw the outfit's outline image
        // if(outfit.outline){
        //   s.image(outfit.outline, 0, 0, s.width, s.height);
        // }
  }

      
      // p.paperdoll = (params) => {
      // 	let c = s.color(params.color);
        
      // 	// Parse the outfit and hairstyle numbers from params
      // 	let outfitNumber = parseInt(params.outfit);
      // 	let hairstyleNumber = parseInt(params.hairstyle);
      
      // 	// Find the corresponding outfit and hairstyle objects in paperdolls
      // 	let outfit = paperdolls.outfits.find(o => o.number === outfitNumber);
      // 	let hairstyle = paperdolls.hairstyles.find(h => h.number === hairstyleNumber);
      
      // 	if (!outfit || !hairstyle) {
      // 		console.error('Could not find outfit and/or hairstyle:', outfitNumber, hairstyleNumber);
      // 		return;
      // 	}
      
      // 	// Draw the images in the correct order
      // 	s.tint(c); // Apply the tint for the doll's fill image
      // 	s.image(paperdolls.dollFill, 0, 0, p.width, p.height); // Draw the doll's fill image
      // 	s.noTint(); // Remove the tint before drawing the other images
        
      // 	if(outfit.fill){
      // 		s.image(outfit.fill, 0, 0, s.width, s.height); // Draw the outfit's fill image
      // 	}
      
      // 	if(outfit.outline){
      // 		s.image(outfit.outline, 0, 0, s.width, s.height); // Draw the outfit's outline image
      // 	}
        
      // 	if(hairstyle.fill){
      // 		s.tint(255); // Apply white tint to prevent color from previous tint interfering
      // 		s.image(hairstyle.fill, 0, 0, s.width, s.height); // Draw the hairstyle's fill image
      // 		s.noTint(); // Remove the tint before drawing the other images
      // 	}
      
      // 	if(hairstyle.outline){
      // 		s.image(hairstyle.outline, 0, 0, s.width, s.height); // Draw the hairstyle's outline image
      // 	}
      // }
      

      p.addLine = (params) => {
        if(!p.setupFinished) return;
        s.strokeWeight(params.lineWeight);
        s.noFill();
        s.stroke(params.color);
        s.line(params.x1, params.y1, params.x2, params.y2);
      }

      p.addPreviewLine = (params, c) => { //TODO: integrate choosing canvas into all drawing functions
        if(!p.setupFinished) return;
        c.strokeWeight(params.lineWeight);
        c.noFill();
        c.stroke(params.color);
        c.line(params.x1, params.y1, params.x2, params.y2);
      }

      p.addBrushStroke = (params) => {
        if(!p.setupFinished) return;
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
      }

      p.addRainbowBrush = (params) => {
        if(!p.setupFinished) return;
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
      }

      p.porcupineBrush = (params, c) => {
        if(!p.setupFinished) return;
        if(!c) c = s; //if no canvas specified
        c.strokeWeight(params.lineWeight);
        c.strokeWeight(4);
        c.noFill();
        c.stroke(params.color);

        let points = params.pointsList;
        for(let i=0;i<points.length-1;i+=2) {
          c.line(points[0].x, points[0].y, points[i+1].x, points[i+1].y);
        }
      }

      p.linesBrush = (params, c) => {
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
      }

    }, 'drawing-canvas');
  }
}