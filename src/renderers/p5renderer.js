export class P5Renderer {
  constructor(w, h) {
    this.sketch = this.getSketch(w, h);
    this.sketch.addFill({color:'#aaaaaa'});
		this.sketch.clear('#aaaaaa');
    this.sketch.loadStencils();
    return this.sketch;
  }

  getSketch(w, h) {
    return new p5(p => {
      
      let points = null;
      let activeEffectName = "";
      let strokeColor = 0;
      let strokeWeight = 5;
      let s, t, tt; //p is main sketch, s is static canvas, t is temporary for animations

      p.getPreviewCanvas = () => {
        return t;
      }

      p.getStaticCanvas = () => {
        return s;
      }

      p.setup = () => {
        p.createCanvas(w, h);
        s = p.createGraphics(p.width, p.height);
        t = p.createGraphics(p.width, p.height);
        tt = p.createGraphics(p.width, p.height);
        p.background(255);
        p.setupFinished = true;
        p.noLoop();
      };
      
      p.draw = () => {

      };

      p.mouseDragged = () => { //show a preview while actively dragging mouse 
        p.image(s, 0, 0);
        p.image(t, 0, 0);
        t.clear();
      }

      // p.mouseMoved = () => {
      //   p.image(s, 0, 0);
      //   p.circle(p.mouseX, p.mouseY, 10);
      // }

      p.render = () => {
        p.image(s, 0, 0);
      };
    
      p.clearAllCanvases = () => {
        p.background(255);
        s.background(255);
        t.clear();
      };

      p5.prototype.flippedMouseY = function() {
        return this.flipY(this.mouseY);
      }

      p5.prototype.flipY = function(y) {
        return this.height - y;
      }
    
      p5.prototype.addCircle = function(params) {
        this.fill(params.color);
        this.noStroke();
        this.circle(params.x, this.flipY(params.y), params.r*2);
      };
    
      p5.prototype.addSquare = function(params) {
          this.push();
          this.rectMode(this.CENTER);
          this.fill(params.color);
          this.noStroke();
          this.rect(params.x, this.flipY(params.y), params.size, params.size);
          this.pop();
      };
          
      p5.prototype.addTriangle = function(params) {
        let x = params.x;
        let y = this.flipY(params.y);
        let size = params.size;
        this.fill(params.color);
        this.noStroke();
        this.push();
        this.triangle(
          x + size / 2,
          y + size / 2,
          x - size / 2,
          y + size / 2,
          x,
          y - size / 2
        );
        this.pop();
      };

      p5.prototype.addRectangle = function(params) {
        let x = params.x;
        let y = this.flipY(params.y);
        this.push();
        this.rectMode(this.CENTER);
        this.fill(params.color);
        this.noStroke();
        this.rect(x, y, params.w, params.h);
        this.pop();
    };
      
      p5.prototype.addFill = function(params) {
        this.push();
        this.rectMode(this.CORNER);
        // console.log("the color", params.color);
        this.fill(params.color);
        this.noStroke();
        this.rect(0, 0, this.width, this.height);
        this.pop();
      };

      p5.prototype.star = function(params) {
        this.push(); // Save current drawing style
        let x = params.x;
        let y = this.flipY(params.y);
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

      p5.prototype.polygon = function(params) {
        let nsides = Math.abs(params.nsides);
        let x = params.x;
        let y = this.flipY(params.y);
        this.fill(params.color);
        this.noStroke();
        let angle = this.TWO_PI / nsides;
        this.beginShape();
        for (let a = 0; a < this.TWO_PI; a += angle) {
            let sx = x + this.cos(a) * params.r;
            let sy = y + this.sin(a) * params.r;
            this.vertex(sx, sy);
        }
        this.endShape(this.CLOSE);
      };
    
      p5.prototype.gradient = function(params) {
        let pcolor1 = this.color(params.color1);
        let pcolor2 = this.color(params.color2);
        this.noFill();
        this.strokeWeight(1);
        for(let i = 0; i < this.height; i++) {
          this.stroke(this.lerpColor(pcolor1, pcolor2, i / this.height));
          this.line(0, i, this.width, i);
        }
      };
      
      p5.prototype.stripes = function(params) {
        let stripeWidth = params.stripeWidth;
        this.push();
        this.translate(0, stripeWidth / 2); //so that top stripe is fully shown
        let pcolor1 = this.color(params.color1);
        let pcolor2 = this.color(params.color2);
        this.noFill();
        this.strokeWeight(stripeWidth);
        for(let i = 0; i < this.height; i += stripeWidth) {
          let c = this.lerpColor(pcolor1, pcolor2, i / (this.height - stripeWidth));
          this.stroke(c);
          this.line(0, i, this.width, i);
        }
        this.pop();
      };
      
      p5.prototype.shift = function(params) {
        let lineHeight = params.height;
        let offset = params.offset;
        if(params.orientation === "horizontal") {
          for(let i = 0; i < this.height / lineHeight; i++) {
            if(i % 2 === 0) {
              this.image(this, offset, i * lineHeight, this.width, lineHeight, 0, i * lineHeight, this.width, lineHeight);
              this.image(this, 0, i * lineHeight, offset, lineHeight, this.width - offset, i * lineHeight, offset, lineHeight); //wrap
            }
          }
        } else if(params.orientation === "vertical") {
          for(let i = 0; i < this.width / lineHeight; i++) {
            if(i % 2 === 0) {
              this.image(this, i * lineHeight, offset, lineHeight, this.height, i * lineHeight, 0, lineHeight, this.height);
              this.image(this, i * lineHeight, 0, lineHeight, offset, i * lineHeight, this.height - offset, lineHeight, offset); //wrap
            }
          }
        }
      };
    

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

      //heart by Mithru: https://editor.p5js.org/Mithru/sketches/Hk1N1mMQg
      p5.prototype.heart = function(params) {
        let x = params.x;
        let y = this.flipY(params.y);
        let size = params.size;
        this.push();
        this.translate(0, -size/2);
        this.fill(params.color);
        this.noStroke();
        this.beginShape();
        this.vertex(x, y);
        this.bezierVertex(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
        this.bezierVertex(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
        this.endShape(this.CLOSE);
        this.pop();
      };

      p5.prototype.tile = function(params) {
        let w = params.width;
        let h = params.height;
        let tiling = params.tiling;
        let x = params.x;
        let y = this.flipY(params.y);
      
        let sx = x - w / 2;
        let sy = y - h / 2;
      
        this.noFill();
        this.stroke(100);
      
        let snapshot = p.createGraphics(w, h); // for captured rectangle
        snapshot.image(this, 0, 0, w, h, sx, sy, w, h); // w * h rectangle centered at x, y 
      
        this.stroke(0);
        this.noFill();
      
        switch (tiling) {
          case 'straight grid':
            for (let dx = 0; dx < this.width; dx += w) {
              for (let dy = 0; dy < this.height; dy += h) {
                this.image(snapshot, dx, dy, w, h, 0, 0, w, h);
              }
            }
            break;
          case 'brick':
            let shiftRow = false;
            for (let dy = 0; dy < this.height; dy += h) {
              let startX = shiftRow ? - w / 2 : 0;
              for (let dx = startX; dx < this.width; dx += w) {
                this.image(snapshot, dx, dy, w, h, 0, 0, w, h);
              }
              shiftRow = !shiftRow;
            }
            break;
          case 'half drop':
            let halfColumnHeight = h / 2;
            let shiftColumn = false;
            for (let dx = 0; dx < this.width; dx += w) {
              let startY = shiftColumn ? -halfColumnHeight : 0;
              for (let dy = startY; dy < this.height; dy += h) {
                this.image(snapshot, dx, dy, w, h, 0, 0, w, h);
              }
              shiftColumn = !shiftColumn;
            }
            break;
          case 'checkerboard':
            for (let dy = 0; dy < this.height; dy += h) {
              let isEvenRow = dy / h % 2 === 0;
              for (let dx = 0; dx < this.width; dx += w) {
                let isEvenColumn = dx / w % 2 === 0;
                if (isEvenRow !== isEvenColumn) {
                  this.image(snapshot, dx, dy, w, h, 0, 0, w, h);
                }
              }
            }
            break;
          default:
            break;
        }
      }
      
      p5.prototype.grow = function(params) {
        let w = params.width;
        let h = params.height;
        let scaleBy = params.scaleBy / 100; // Convert the percentage to a decimal
        
        let sx = params.x - w / 2;
        let sy = this.flipY(params.y) - h / 2;
      
        let snapshot = p.createGraphics(w, h);
        snapshot.image(this, 0, 0, w, h, sx, sy, w, h);
      
        let enlargedWidth = w * scaleBy;
        let enlargedHeight = h * scaleBy;
        
        let dx = params.x - enlargedWidth / 2;
        let dy = this.flipY(params.y) - enlargedHeight / 2;
        
        this.image(snapshot, dx, dy, enlargedWidth, enlargedHeight, 0, 0, w, h);
      }
      

      p5.prototype.applyFilter = function(params) {
        this.filter(this[params.filter.toUpperCase()]);
      }

      p5.prototype.foldableBoxStencil = function(params) {
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
      }
      

      let paperdolls = { // paper doll stencils
        outfits: [],
        hairstyles: [],
      };

      p.loadStencils = () => {
        let outfitNames = ['01'];
        let hairstyleNames = ['01', '02'];
      
        // Load doll fill
        paperdolls.dollFill = p.loadImage(`src/assets/stencils/paper-dolls/outfits/doll-fill.png`);
        paperdolls.underlayerFill = p.loadImage('src/assets/stencils/paper-dolls/outfits/underlayer-fill.png');
      
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
      }

      p5.prototype.paperdoll = function(params) {
  
        // Get the color value from params.
        let skinTone = p.color(params.skinTone);
        
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
        var outfitCanvas = p.createGraphics(p.width, p.height);
        var hairstyleCanvas = p.createGraphics(p.width, p.height);
      
        //Tint and then draw the doll fill
        // dollCanvas.tint(skinTone);
        // dollCanvas.image(paperdolls.dollFill, 0, 0, p.width, p.height);
        // dollCanvas.noTint();
        // dollCanvas.image(paperdolls.underlayerFill, 0, 0, p.width, p.height);


        // Use doll fill as a mask for the skin tone
        dollCanvas.image(paperdolls.dollFill, 0, 0, p.width, p.height);
        dollCanvas.drawingContext.globalCompositeOperation = 'source-in';
        let skinToneCanvas = p.createGraphics(p.width, p.height);
        skinToneCanvas.background(skinTone);
        dollCanvas.image(skinToneCanvas, 0, 0);
      
        // Prepare the outfit fill as a mask
        outfitCanvas.image(outfit.fill, 0, 0, p.width, p.height);
        outfitCanvas.image(paperdolls.underlayerFill, 0, 0, p.width, p.height); // underwear!
        outfitCanvas.drawingContext.globalCompositeOperation = 'source-in';
        outfitCanvas.image(this, 0, 0, p.width, p.height);
      
        // Prepare the hairstyle fill as a mask
        hairstyleCanvas.image(hairstyle.fill, 0, 0, p.width, p.height);
        hairstyleCanvas.drawingContext.globalCompositeOperation = 'source-in';
        hairstyleCanvas.image(this, 0, 0, p.width, p.height);
      
        // Lighten the original painting
        this.noStroke();
        this.fill(255, 220);
        this.rect(0, 0, p.width, p.height);
      
        // Draw the doll fill
        this.image(dollCanvas, 0, 0);
      
        // Draw the outfit fill
        this.image(outfitCanvas, 0, 0);
      
        // Draw the outfit outline
        if(outfit.outline){
          this.image(outfit.outline, 0, 0, this.width, this.height);
        }
      
        // Draw the hair fill
        this.image(hairstyleCanvas, 0, 0);
      
        // Draw the hair outline
        if(hairstyle.outline){
          this.image(hairstyle.outline, 0, 0, this.width, this.height);
        }
      }

      p5.prototype.copyCutout = function(params) {
        this.push();

        let w = params.width;
        let h = params.height;
        let x1 = params.x1;
        let y1 = this.flipY(params.y1);
        let x2 = params.x2;
        let y2 = this.flipY(params.y2);

        let snapshot = p.createGraphics(w, h); // for captured rectangle
        this.imageMode(p.CENTER);

        if(this===p) snapshot.image(this, 0, 0, w, h, x1 - w/2, y1 - h/2, w, h); // w * h rectangle centered at x1, y1 from static canvas
        else snapshot.image(s, 0, 0, w, h, x1 - w/2, y1 - h/2, w, h);
        
        //TODO: if you use p, it will capture the cleared canvas when released, but if you use s, it will not add the cutouts in a cumulative way

        if(this === t) { //if temp canvas, draw a border
          snapshot.stroke(0);
          snapshot.noFill();
          snapshot.strokeWeight(2);
          snapshot.rect(0, 0, w, h);
        }
        this.image(snapshot, x2, y2, w, h, 0, 0, w, h); // draw the moved rectangle onto the active canvas

        this.pop();
      }
      
      p5.prototype.addLine = function(params) {
        this.push();
        this.strokeWeight(params.lineWeight);
        this.noFill();
        this.stroke(params.color);
        this.line(params.x1, this.flipY(params.y1), params.x2, this.flipY(params.y2));
        this.pop();
      };

      p.addBrushStroke = (params) => {
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