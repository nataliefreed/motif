// Moving and turning drawings: 2D transforms as [a, b, c, d, e, f], the numbers a canvas's setTransform and
// p5's applyMatrix take, which move a point (x, y) to (a x + c y + e, b x + d y + f).
export type Transform = [number, number, number, number, number, number];
export type Point = { x: number; y: number };

export function translation(x: number, y: number): Transform {
  return [1, 0, 0, 1, x, y];
}

// turning clockwise on the canvas (whose y goes down), like p5's rotate and the angle settings of shapes
export function rotation(degrees: number): Transform {
  const radians = degrees * Math.PI / 180;
  const cos = Math.cos(radians), sin = Math.sin(radians);
  return [cos, sin, -sin, cos, 0, 0];
}

// `first` followed by `second`: moving a point by the result is moving it by `first`, then by `second`
export function followedBy(first: Transform, second: Transform): Transform {
  const [a1, b1, c1, d1, e1, f1] = first;
  const [a2, b2, c2, d2, e2, f2] = second;
  return [
    a2 * a1 + c2 * b1, b2 * a1 + d2 * b1,
    a2 * c1 + c2 * d1, b2 * c1 + d2 * d1,
    a2 * e1 + c2 * f1 + e2, b2 * e1 + d2 * f1 + f2,
  ];
}

export function movePoint([a, b, c, d, e, f]: Transform, { x, y }: Point): Point {
  return { x: a * x + c * y + e, y: b * x + d * y + f };
}

// Turning by `degrees` around `middle`, then moving by `moveBy`
export function turnAndMove(middle: Point, degrees: number, moveBy: Point): Transform {
  return followedBy(followedBy(translation(-middle.x, -middle.y), rotation(degrees)), translation(middle.x + moveBy.x, middle.y + moveBy.y));
}
