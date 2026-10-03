import { beforeEach, describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import { flatActionStore, actionRootID } from '../stores/dataStore';
import { compileActions } from './action-utils';
import { updateOldPatterns } from './export-utils';

const store = () => get(flatActionStore) as any;
const step = (uuid: string, effect: string, params: object, hidden = false) => ({ uuid, name: effect, effect, category: 'shapes', type: 'effect', params, hidden });

beforeEach(() => {
  const actions = [
    { uuid: 'root', name: 'do each', effect: 'do each', type: 'list', category: 'control', params: { children: ['board'] } },
    { uuid: 'board', name: 'checkerboard', effect: 'checkerboard', type: 'list', category: 'patterns', params: { columns: 4, rows: 4, children: ['fill', 'dot', 'gone'] } },
    step('fill', 'solid fill', { color: '#ff0000' }),
    step('dot', 'circle', { position: { x: 250, y: 250 }, radius: 100, color: '#0000ff' }),
    step('gone', 'circle', { position: { x: 0, y: 0 }, radius: 10, color: '#00ff00' }, true),
  ];
  flatActionStore.set(Object.fromEntries(actions.map(a => [a.uuid, a])) as any);
  actionRootID.set('root');
});

describe("a checkerboard's squares", () => {
  it('run their own steps, compiled into the checkerboard rather than drawn on their own', () => {
    const compiled = compileActions(store().root);
    expect(compiled.map(a => a.actionID)).toEqual(['root', 'board']);
    const board = compiled.find(a => a.actionID === 'board')!;
    expect(board.params.squares.map((a: any) => a.actionID)).toEqual(['fill', 'dot']); // not the hidden one
  });
});

describe('a checkerboard saved as a kind of tile', () => {
  const oldCheckerboard = (params: object) => ({ old: { uuid: 'old', name: 'tile', effect: 'tile', type: 'effect', category: 'patterns', hidden: false, params } }) as any;

  it('opens as a checkerboard whose squares fill with its color, keeping its palette letter', () => {
    const saved = oldCheckerboard({ tiling: 'checkerboard', columns: 5, rows: 3, color: '#123456', lockedIndex: 2 });
    updateOldPatterns(saved);
    expect(saved.old).toMatchObject({ name: 'checkerboard', effect: 'checkerboard', type: 'list', params: { columns: 5, rows: 3 } });
    expect(saved.old.params).not.toHaveProperty('tiling');
    expect(saved.old.params.children).toHaveLength(1);
    const fill = saved[saved.old.params.children[0]];
    expect(fill).toMatchObject({ effect: 'solid fill', category: 'backgrounds', params: { color: '#123456', lockedIndex: 2 } });
  });

  it('keeps its squares see-through if it had no color, and gets its grid if it was saved with a size', () => {
    const saved = oldCheckerboard({ tiling: 'checkerboard', width: 100, height: 250, position: { x: 0, y: 0 } });
    updateOldPatterns(saved);
    expect(saved.old.params).toMatchObject({ columns: 5, rows: 2 });
    expect(saved[saved.old.params.children[0]].params).toEqual({ color: 'rgba(0, 0, 0, 0)' });
  });
});
