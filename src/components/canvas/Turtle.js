import { writable } from 'svelte/store';
import { degreesToRadians } from '../../utils/utils.ts';

class Turtle {

  constructor(x, y, heading) {
    this.x = writable(x);
    this.y = writable(y);
    this.heading = writable(heading);
    this.pen = writable(false);
    this.penColor = writable('rgb(20, 50, 100)');
    this.penWidth = writable(10);
    this.penHeight = writable(20);
  }

  // draw a turtle "cursor"
  render(p) {
    p.push();
    p.translate(this.x, this.y);
    p.rotate(p.radians(-this.heading));

    p.stroke(50);
    p.fill(255);
    if (this.pen) {
      p.fill(0, 100);
    } else {
      p.fill(255);
    }
    p.ellipse(3, 5, 2, 2);
    p.ellipse(3, -5, 2, 2);
    p.ellipse(-3, 5, 2, 2);
    p.ellipse(-3, -5, 2, 2);
    p.ellipse(8, 0, 4, 4); // head
    p.ellipse(0, 0, 12, 10); // body
    p.pop();
  }

  moveTo(x, y) {
    this.x = x;
    this.y = y;
  }

  forward(distance) {
    let x = distance * Math.cos(degreesToRadians(this.heading));
    let y = distance * Math.sin(degreesToRadians(this.heading));
    // if (this.pen) {
      // this.p.line(this.x, this.y, this.x + x, this.y + y);
    // }
    this.x += x;
    this.y += y;
  }

  back(distance) {
    this.forward(-distance);
  }

  left(angle) {
    this.heading -= angle;
  }

  right(angle) {
    this.heading += angle;
  }

  penup() {
    this.pen = false;
  }

  pendown() {
    this.pen = true;
  }

  setPenColor(color) {
    this.penColor = color;
  }

  setPenWidth(width) {
    this.penWidth = width;
  }

  setPenHeight(height) {
    this.penHeight = height;
  }

  setPenSize(width, height) {
    this.penWidth(width);
    this.penHeight(height);
  }
}

export const turtle = new Turtle(300, 300, 0);