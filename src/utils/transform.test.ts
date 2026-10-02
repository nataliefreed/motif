import { describe, expect, it } from 'vitest';
import { followedBy, movePoint, rotation, translation, turnAndMove } from './transform';

const close = (p: { x: number; y: number }, q: { x: number; y: number }) => { expect(p.x).toBeCloseTo(q.x); expect(p.y).toBeCloseTo(q.y); };

describe('transforms', () => {
  it('turn clockwise on the canvas, whose y goes down', () => {
    close(movePoint(rotation(90), { x: 10, y: 0 }), { x: 0, y: 10 }); // right turns to down
  });

  it('combine in order: `followedBy` moves by the first, then by the second', () => {
    const turnThenMove = followedBy(rotation(90), translation(100, 0));
    close(movePoint(turnThenMove, { x: 10, y: 0 }), { x: 100, y: 10 });
    const moveThenTurn = followedBy(translation(100, 0), rotation(90));
    close(movePoint(moveThenTurn, { x: 10, y: 0 }), { x: 0, y: 110 });
  });

  it('turn around a middle, which then moves by `moveBy`', () => {
    const middle = { x: 200, y: 200 };
    const t = turnAndMove(middle, 90, { x: 50, y: -20 });
    close(movePoint(t, middle), { x: 250, y: 180 }); // the middle only moves
    close(movePoint(t, { x: 230, y: 200 }), { x: 250, y: 210 }); // 30 right of it turns to 30 below it
    close(movePoint(turnAndMove(middle, 0, { x: 0, y: 0 }), { x: 7, y: 9 }), { x: 7, y: 9 });
  });
});
