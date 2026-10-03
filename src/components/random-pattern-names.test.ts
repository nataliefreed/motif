import { beforeEach, describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import { flatActionStore, actionRootID, stagedActionID, selectedActionID, toolStore } from '../stores/dataStore';
import { selectAction, selectRunTo, randomPatternForSelected } from './action-utils';

const step = (uuid: string, name: string) => ({ uuid, name, effect: name, category: 'shapes', type: 'action', params: { position: { x: 100, y: 100 } }, hidden: false });
const list = (uuid: string, children: string[], title = uuid) => ({ uuid, name: 'do each', effect: 'do each', category: 'control', type: 'list', params: { title, children }, hidden: false });
const store = () => get(flatActionStore) as any;
const selected = () => store()[get(selectedActionID)];

beforeEach(() => {
  const actions = [list('root', ['a', 'b', 'c', 'd', 'g', 'next']), step('a', 'circle'), step('b', 'square'), step('c', 'circle'), step('d', 'star'),
    list('g', ['e'], 'my flower'), step('e', 'heart'), step('next', 'circle')];
  flatActionStore.set(Object.fromEntries(actions.map(a => [a.uuid, a])) as any);
  actionRootID.set('root');
  stagedActionID.set('next');
  toolStore.set([{ name: 'circle', textLabel: 'Circle' }, { name: 'square', textLabel: 'Square' }, { name: 'star', textLabel: 'Star' }] as any);
  selectedActionID.set('');
});

describe('random patterns are named after what they repeat', () => {
  it('one step: its tool', () => {
    selectAction('a');
    randomPatternForSelected();
    expect(selected().effect).toBe('along path');
    expect(selected().params.title).toBe('circle');
  });

  it('several steps: their tools, joined, and the group made for them gets the same name', () => {
    selectAction('a'); selectRunTo('b');
    randomPatternForSelected();
    expect(selected().params.title).toBe('circle & square');
    expect(store()[selected().params.children[0]].params.title).toBe('circle & square');
  });

  it('each tool once, the last joined with &', () => {
    selectAction('a'); selectRunTo('d');
    randomPatternForSelected();
    expect(selected().params.title).toBe('circle, square & star');
  });

  it('a group: its own name', () => {
    selectAction('g');
    randomPatternForSelected();
    expect(selected().params.title).toBe('my flower');
  });

  it('keeps its name when it gets a different pattern', () => {
    selectAction('a');
    randomPatternForSelected();
    const { pattern, path } = selected().params;
    randomPatternForSelected();
    expect(selected().params.title).toBe('circle');
    expect(selected().params.pattern).not.toBe(pattern);
    expect(selected().params.path[0]).toEqual(path[0]);
  });
});
