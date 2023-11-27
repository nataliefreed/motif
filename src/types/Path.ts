import { Vector2 } from '@amandaghassaei/vector-math';

const { Vector2 } = VECTOR_MATH;

type Point = {
  x: number;
  y: number;
};

export class Path {
  private points: Point[] = [];

  constructor(x: number, y: number) {
    this.addPoint(x, y);
  }

  length(): number {
    return this.points.length;
  }

  addPoint(x: number, y: number): void {
    this.points.push({ x, y });
  }

  getPoints(): Point[] {
    return this.points;
  }

  getPointsAsArray(): number[][] {
    return this.points.map(p => [p.x, p.y]);
  }

  getPoint(index: number): Point {
    return this.points[index];
  }

  getLastPoint(): Point {
    return this.points[this.points.length - 1];
  }

  toString(): string {
    return this.points.flatMap(p => [Math.round(p.x), Math.round(p.y)]).toString();
  }

  makeAntPath(frogPath: Path, stepSize: number): Point[] {
    let antPath: Point[] = [];
    antPath.push(frogPath.getPoint(0));
    let remainingDistance = stepSize;
  
    for (let i = 1; i < frogPath.length(); i++) {
      let previousPoint = frogPath.getPoint(i - 1);
      let currentPoint = frogPath.getPoint(i);
  
      let vectorBetween = new Vector2(currentPoint.x, currentPoint.y).sub(new Vector2(previousPoint.x, previousPoint.y));
      let distanceBetween = vectorBetween.length();
      vectorBetween.normalize();
  
      while (remainingDistance <= distanceBetween) {
        let newPointPos = new Vector2(previousPoint.x, previousPoint.y).add(vectorBetween.multiplyScalar(remainingDistance));
        antPath.push({ x: newPointPos.x, y: newPointPos.y });
  
        distanceBetween -= remainingDistance;
        remainingDistance = stepSize;
        previousPoint = { x: newPointPos.x, y: newPointPos.y };
      }
  
      remainingDistance -= distanceBetween;
    }
    return antPath;
  }
}