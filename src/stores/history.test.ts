import { beforeEach, describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import { flatActionStore, stagedActionID, actionRootID } from './dataStore';
import { currentIndexedColor, setCurrentColor } from './colorStore';
import { saveToHistory, historyStore, snapshotOf, drawingWithBrush } from './history';
import { undo, redo, updateActionParams } from '../components/action-utils';

const shape = (uuid: string, effect: string, params: object = {}) => ({ uuid, name: effect, effect, category: 'shapes', type: 'effect', params, hidden: false });
const list = (uuid: string, effect: string, children: string[], params: object = {}) => ({ uuid, name: effect, effect, category: 'control', type: 'list', params: { ...params, children }, hidden: false });
const storeOf = (...actions: any[]) => Object.fromEntries(actions.map(a => [a.uuid, a])) as any;
const store = () => get(flatActionStore) as any;
const recipe = () => store().root.params.children;
const black = { color: '#000000', index: -1 };

describe('a snapshot', () => {
  it('keeps the brush apart from the drawing, with where it sat, and leaves out what the mouse sets on it', () => {
    const drawing = storeOf(list('root', 'do each', ['circle', 'brush', 'star']), shape('circle', 'circle'),
      list('brush', 'along path', ['dot'], { title: 'dots', path: [[1, 2]], progress: 3 }), shape('dot', 'circle'), shape('star', 'star'));
    const snapshot = snapshotOf(drawing, 'brush', ['#fff'], black);
    expect(Object.keys(snapshot.steps).sort()).toEqual(['circle', 'root', 'star']);
    expect(snapshot.steps.root.params.children).toEqual(['circle', 'star']);
    expect(snapshot.brush!.place).toEqual({ parent: 'root', index: 1 });
    expect(Object.keys(snapshot.brush!.settings).sort()).toEqual(['brush', 'dot']);
    expect(snapshot.brush!.settings.brush.params).toEqual({ title: 'dots', children: ['dot'] });
    expect(drawing.root.params.children).toEqual(['circle', 'brush', 'star']); // the drawing itself is untouched
  });

  it('comes back with the same brush as it was then, wherever the mouse is now', () => {
    const then = snapshotOf(storeOf(list('root', 'do each', ['brush']), list('brush', 'along path', ['dot'], { title: 'dots' }), shape('dot', 'circle', { radius: 5 })), 'brush', [], black);
    const now = storeOf(list('root', 'do each', ['circle', 'brush']), shape('circle', 'circle'),
      list('brush', 'along path', ['dot', 'star'], { title: 'stars', path: [[9, 9]] }), shape('dot', 'circle', { radius: 50 }), shape('star', 'star'));
    const drawing = drawingWithBrush(then, now, 'brush', 'root');
    expect(Object.keys(drawing).sort()).toEqual(['brush', 'dot', 'root']);
    expect(drawing.brush.params).toEqual({ title: 'dots', children: ['dot'], path: [[9, 9]] });
    expect(drawing.dot.params.radius).toBe(5);
  });

  it('comes back with a brush picked up since as it is now, where the brush sat', () => {
    const then = snapshotOf(storeOf(list('root', 'do each', ['circle', 'old']), shape('circle', 'circle'), shape('old', 'circle')), 'old', [], black);
    const now = storeOf(list('root', 'do each', ['circle', 'square', 'brush']), shape('circle', 'circle'), shape('square', 'square'), list('brush', 'along path', ['dot']), shape('dot', 'star'));
    const drawing = drawingWithBrush(then, now, 'brush', 'root');
    expect(Object.keys(drawing).sort()).toEqual(['brush', 'circle', 'dot', 'root']);
    expect(drawing.root.params.children).toEqual(['circle', 'brush']);
    expect(drawing.dot.effect).toBe('star');
  });

  it("puts a step dragged into a brush picked up since back in its place, so it is in only one", () => {
    const then = snapshotOf(storeOf(list('root', 'do each', ['circle', 'old']), shape('circle', 'circle'), shape('old', 'circle')), 'old', [], black);
    const now = storeOf(list('root', 'do each', ['brush']), list('brush', 'along path', ['dot', 'circle']), shape('dot', 'circle'), shape('circle', 'circle'));
    const drawing = drawingWithBrush(then, now, 'brush', 'root');
    expect(drawing.root.params.children).toEqual(['circle', 'brush']);
    expect(drawing.brush.params.children).toEqual(['dot']);
  });
});

describe('undo and redo', () => {
  beforeEach(() => {
    historyStore.set({ past: [], future: [] });
    flatActionStore.set(storeOf(list('root', 'do each', ['circle', 'next']), shape('circle', 'circle', { radius: 10 }), shape('next', 'circle', { radius: 20 })));
    actionRootID.set('root');
    stagedActionID.set('next');
    setCurrentColor('#000000', -1);
    saveToHistory('start');
  });

  it("leave a brush picked up since as it is", () => {
    flatActionStore.update(s => storeOf(list('root', 'do each', ['circle', 'star', 'brush']), s.circle, shape('star', 'star'), list('brush', 'along path', ['dot']), shape('dot', 'star')));
    stagedActionID.set('brush'); // another tool was chosen, then a star drawn with it
    saveToHistory('drew a star');
    undo();
    expect(recipe()).toEqual(['circle', 'brush']);
    expect(store().next).toBeUndefined();
    expect(get(stagedActionID)).toBe('brush');
    expect(store().dot.effect).toBe('star');
    redo();
    expect(recipe()).toEqual(['circle', 'star', 'brush']);
  });

  it('undo a change that was not saved yet, and can redo it', () => {
    updateActionParams('circle', { radius: 50 });
    undo();
    expect(store().circle.params.radius).toBe(10);
    redo();
    expect(store().circle.params.radius).toBe(50);
  });

  it("undo changes to the brush's settings, but not where the mouse has moved it", () => {
    updateActionParams('next', { radius: 99 });
    saveToHistory('changed the brush');
    updateActionParams('next', { position: { x: 1, y: 2 } });
    undo();
    expect(store().next.params).toEqual({ radius: 20, position: { x: 1, y: 2 } });
    redo();
    expect(store().next.params.radius).toBe(99);
  });

  it('undo picking a color, putting back the color chosen and the brush with it', () => {
    setCurrentColor('#ff0000', 3);
    updateActionParams('next', { color: '#ff0000', lockedIndex: 3 });
    saveToHistory('picked a color');
    undo();
    expect(get(currentIndexedColor)).toEqual(black);
    expect(store().next.params).toEqual({ radius: 20 });
  });

  it("don't count moving the brush, or the mouse moving it, as changes", () => {
    const undoSteps = get(historyStore).past.length;
    updateActionParams('next', { path: [[3, 4]], lastChanged: 5 });
    flatActionStore.update(s => ({ ...s, root: { ...s.root, params: { children: ['next', 'circle'] } } }));
    saveToHistory('moved the next step');
    expect(get(historyStore).past).toHaveLength(undoSteps);
  });

  it('skip changes to a brush that has been put down', () => {
    updateActionParams('circle', { radius: 30 });
    saveToHistory('changed the circle');
    updateActionParams('next', { radius: 99 });
    saveToHistory('changed the brush');
    flatActionStore.update(s => storeOf(s.root, s.circle, shape('star', 'star')));
    flatActionStore.update(s => ({ ...s, root: { ...s.root, params: { children: ['circle', 'star'] } } }));
    stagedActionID.set('star'); // another tool
    undo(); // the brush change can't be undone on the star, so this undoes the circle's
    expect(store().circle.params.radius).toBe(10);
    expect(get(stagedActionID)).toBe('star');
    expect(recipe()).toEqual(['circle', 'star']);
  });
});
