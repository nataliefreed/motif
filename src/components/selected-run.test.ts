import { beforeEach, describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import { flatActionStore, actionRootID, stagedActionID, selectedActionID, selectedRun } from '../stores/dataStore';
import { selectAction, selectRunTo, selectedSteps, wrapSelectedInGroup, duplicateSelected, removeSelectedAction } from './action-utils';

const step = (uuid: string) => ({ uuid, name: 'circle', effect: 'circle', category: 'shapes', type: 'action', params: { position: { x: 10, y: 10 }, radius: 5 }, hidden: false });
const list = (uuid: string, children: string[]) => ({ uuid, name: 'do each', effect: 'do each', category: 'control', type: 'list', params: { title: uuid, children }, hidden: false });
const children = (id: string) => (get(flatActionStore) as any)[id].params.children as string[];

beforeEach(() => {
  // a recipe of a, b, c, the next step's box, then d, and a group holding e
  const actions = [list('root', ['a', 'b', 'c', 'next', 'd', 'g']), step('a'), step('b'), step('c'), step('next'), step('d'), list('g', ['e']), step('e')];
  flatActionStore.set(Object.fromEntries(actions.map(a => [a.uuid, a])) as any);
  actionRootID.set('root');
  stagedActionID.set('next');
  selectedActionID.set('');
});

describe('a run of selected steps', () => {
  it('is the steps from the selected one to a shift-clicked one, in order, without the next step box', () => {
    selectAction('d');
    selectRunTo('b');
    expect(get(selectedRun)).toEqual(['b', 'c', 'd']);
    expect(selectedSteps()).toEqual(['b', 'c', 'd']);
  });

  it('ends when another step is selected, and shift-clicking into another list just selects that step', () => {
    selectAction('a'); selectRunTo('c');
    selectAction('d');
    expect(selectedSteps()).toEqual(['d']);
    selectRunTo('e');
    expect(selectedSteps()).toEqual(['e']);
  });

  it('can be put in a group, in order, where it was', () => {
    selectAction('a'); selectRunTo('c');
    wrapSelectedInGroup();
    const group = get(selectedActionID);
    expect(children('root')).toEqual([group, 'next', 'd', 'g']);
    expect(children(group)).toEqual(['a', 'b', 'c']);
    expect(get(selectedRun)).toEqual([]);
  });

  it('is copied together, right after it, and the copies are selected', () => {
    selectAction('a'); selectRunTo('b');
    const copies = duplicateSelected();
    expect(copies).toHaveLength(2);
    expect(children('root')).toEqual(['a', 'b', ...copies, 'c', 'next', 'd', 'g']);
    expect(selectedSteps()).toEqual(copies);
  });

  it('is deleted together, and the step before it is selected', () => {
    selectAction('b'); selectRunTo('c');
    removeSelectedAction();
    expect(children('root')).toEqual(['a', 'next', 'd', 'g']);
    expect(selectedSteps()).toEqual(['a']);
  });
});
