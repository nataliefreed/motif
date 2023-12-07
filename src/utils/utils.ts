import { Vector } from 'ts-matrix';
import P5 from 'p5-svelte';

export function deepCopy(obj: Object) {
  let copy = {};
  if(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
}

/* old version that worked: https://editor.p5js.org/squishynotions/sketches/dhmmKeiuV */

/*
function makeAntPath(frogPath, stepSize) {
  let antPath = new DrawnLine(frogPath.start, frogPath.startTime);
  let remainingDistance = stepSize;

  for (let i = 1; i < frogPath.points.length; i++) {
    let previousPoint = frogPath.points[i - 1].position;
    let currentPoint = frogPath.points[i].position;
    
    let vectorBetween = p5.Vector.sub(currentPoint, previousPoint);
    let distanceBetween = vectorBetween.mag();
    vectorBetween.normalize();

    while (remainingDistance <= distanceBetween) {
      let newPointPos = p5.Vector.add(previousPoint, vectorBetween.copy().mult(remainingDistance));
      antPath.addPoint(newPointPos, frogPath.points[i].time);

      distanceBetween -= remainingDistance;
      remainingDistance = stepSize;
      previousPoint = newPointPos;
    }

    remainingDistance -= distanceBetween;
  }

  return antPath;
}
*/

export function getAntPath(frogPath: [number, number][], stepSize: number = 20): [number, number][] {
  let antPath: [number, number][] = [];
  antPath.push([...frogPath[0]]);
  let remainingDistance = stepSize;

  for (let i = 1; i < frogPath.length; i++) {
    let previousPoint = new Vector(frogPath[i - 1]);
    let currentPoint = new Vector(frogPath[i]);

    let vectorBetween = currentPoint.subtract(previousPoint)
    let distanceBetween = vectorBetween.length();
    vectorBetween = vectorBetween.normalize();

    while (remainingDistance <= distanceBetween) {
      let scaledVector = vectorBetween.scale(remainingDistance);
      let newPointPos = previousPoint.add(scaledVector);
      if(newPointPos.values.length == 2) {
        antPath.push([newPointPos.values[0], newPointPos.values[1]]); //because Typescript
      }

      distanceBetween -= remainingDistance;
      remainingDistance = stepSize;
      previousPoint = new Vector(newPointPos.values);
    }

    remainingDistance -= distanceBetween;
  }

  return antPath;
}


function cloneVector(vector: Vector): Vector {
    // Assuming that the `values` method returns an array of vector components
    return new Vector(vector.values);
}

export function oscillateValue(initialValue:number, amplitudeFunc:Function, updateValueFunc:Function, duration:number, fps = 30) {
  let _timer = 0;
  const _ticker = setInterval(() => {
      _timer += (2 * Math.PI / fps) / duration; // One full oscillation over the specified duration
      let amplitude = amplitudeFunc();
      if(amplitude == 0) amplitude = 1;
      const newValue = updateValueFunc(initialValue, Math.sin(_timer) * amplitude);

      // send preview data

      if (_timer > 2 * Math.PI) clearInterval(_ticker); // One full oscillation done

      return newValue;
  }, 1000 / fps);

  return _ticker;
}




