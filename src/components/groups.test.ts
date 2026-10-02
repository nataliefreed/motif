import { beforeEach, describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import { flatActionStore, actionRootID } from '../stores/dataStore';
import { compileActions, groupMiddle } from './action-utils';
import { movePoint } from '../utils/transform';

const step = (uuid: string, effect: string, category: string, params: object) => ({ uuid, name: effect, effect, category, type: 'action', params, hidden: false });
const group = (uuid: string, children: string[], moveBy = { x: 0, y: 0 }, angle = 0) =>
  ({ uuid, name: 'do each', effect: 'do each', category: 'control', type: 'list', params: { title: uuid, children, moveBy, angle }, hidden: false });

function recipe(...actions: object[]) {
  flatActionStore.set(Object.fromEntries(actions.map((a: any) => [a.uuid, a])) as any);
  actionRootID.set('root');
}
// where each compiled action that draws ends up placed
function placed(actionID: string) {
  const op = compileActions(get(flatActionStore).root).find(a => a.actionID === actionID)!;
  const where = op.params.position ?? op.params.start;
  return { transform: op.transform, at: where && op.transform ? movePoint(op.transform, where) : where };
}
const close = (p: { x: number; y: number }, x: number, y: number) => { expect(p.x).toBeCloseTo(x); expect(p.y).toBeCloseTo(y); };

describe('groups', () => {
  beforeEach(() => recipe(
    group('root', ['fill', 'flower'], { x: 999, y: 999 }, 45), // the recipe itself never moves
    step('fill', 'fill', 'backgrounds', { color: '#fff' }),
    group('flower', ['left', 'right', 'stripes'], { x: 50, y: 0 }, 90),
    step('left', 'circle', 'shapes', { position: { x: 100, y: 100 }, radius: 10 }),
    step('right', 'circle', 'shapes', { position: { x: 200, y: 100 }, radius: 10 }),
    step('stripes', 'stripes', 'backgrounds', { stripeWidth: 20 }),
  ));

  it('turn what they draw around its middle, then move it', () => {
    expect(groupMiddle(['left', 'right', 'stripes'])).toEqual({ x: 150, y: 100 });
    close(placed('left').at, 200, 50); // left of the middle turns to above it, then moves 50 right
    close(placed('right').at, 200, 150);
  });

  it('move everything inside them, even steps that cover the whole canvas, but the recipe itself never moves', () => {
    expect(placed('stripes').transform).toEqual(placed('left').transform);
    expect(placed('fill').transform).toBeUndefined();
  });

  it('carry groups inside them along, after those groups move', () => {
    recipe(
      group('root', ['outer']),
      group('outer', ['inner', 'dot'], { x: 0, y: 0 }, 180),
      group('inner', ['star'], { x: 0, y: 100 }), // the star moves down to (100, 200) first
      step('star', 'star', 'shapes', { position: { x: 100, y: 100 } }),
      step('dot', 'circle', 'shapes', { position: { x: 300, y: 200 } }),
    );
    // the outer group's middle is between the moved star and the dot: (200, 200); turning half way round swaps them
    close(placed('star').at, 300, 200);
    close(placed('dot').at, 100, 200);
  });

  it('have their middle at a whole pixel, like every position', () => {
    recipe(group('root', ['g']), group('g', ['a', 'b']), step('a', 'circle', 'shapes', { position: { x: 200, y: 10 } }), step('b', 'circle', 'shapes', { position: { x: 207, y: 15 } }));
    expect(groupMiddle(['a', 'b'])).toEqual({ x: 204, y: 13 }); // not (203.5, 12.5)
  });

  it('do nothing until moved or turned', () => {
    recipe(group('root', ['g']), group('g', ['dot']), step('dot', 'circle', 'shapes', { position: { x: 10, y: 20 } }));
    expect(placed('dot').transform).toBeUndefined();
  });
});
