import { writable, get } from 'svelte/store';
import type { ActionStore } from '../types/types';
import { flatActionStore, stagedActionID } from '../stores/dataStore';
import { deepCopy } from '../utils/utils';
import { activePalette, currentIndexedColor } from '../stores/colorStore';

import deepEqual from 'deep-equal';

// Undo and redo go back and forth between snapshots of the drawing and the brush, each taken when someone
// finishes a change (see saveToHistory).
//
// The brush is the step being set up (the staged action, with any steps inside it): the next thing drawn,
// with the chosen tool. Changing its settings or its color can be undone, but picking up another tool's brush
// can't: undo and redo leave the brush held now as it is, and skip changes to one that's been put down.
export type Snapshot = {
  note: string; // what was done, for debugging
  steps: ActionStore; // every action but the brush's, and no list lists the brush
  brush: Brush | null;
  palette: string[];
};
type Brush = {
  id: string; // the staged action's
  place: Place | null; // where it sat among the steps, which is where the drawing stops
  settings: ActionStore; // it and the steps inside it, without what the mouse sets (see mouseParams)
  color: { color: string; index: number }; // the color chosen to draw with (index is its palette letter, or -1)
};
type Place = { parent: string; index: number }; // the index-th child of the list `parent`

// What the canvas sets on the brush as the mouse moves over it, draws with it and finishes drawing: where and
// how far, not how it draws. Moving the mouse isn't a change to undo.
const mouseParams = ['position', 'start', 'end', 'path', 'progress', 'lastChanged'];

export const historyStore = writable<{ past: Snapshot[]; future: Snapshot[] }>({ past: [], future: [] });
let current: Snapshot | null = null; // the latest snapshot: the drawing as it is, as far as undo knows

// Takes a snapshot, which is a new undo step if it looks different from the last one (see changed)
export function saveToHistory(note: string) {
  const snapshot = snapshotOf(get(flatActionStore), get(stagedActionID), get(activePalette), get(currentIndexedColor), note);
  const previous = current;
  if (previous && changed(previous, snapshot)) {
    historyStore.update(({ past }) => ({ past: [...past, previous], future: [] }));
  }
  current = snapshot; // even when only the brush moved or was put down, so redo comes back to how it is now
}

// The latest snapshot before now that looks different from now, or null if there's none. A change not saved
// yet is the one undone.
export function undoSnapshot(): Snapshot | null {
  saveToHistory('before undo');
  const now = current;
  if (!now) return null;
  const past = [...get(historyStore).past], future = [...get(historyStore).future]; // snapshots themselves never change
  let shown = now;
  while (past.length > 0) {
    const previous = past.pop()!;
    future.unshift(shown);
    shown = previous;
    if (changed(previous, now)) {
      historyStore.set({ past, future });
      current = previous;
      return previous;
    }
  }
  return null;
}

// The next snapshot after now that looks different from now, or null if there's none. (A change not saved yet
// starts a new history, with nothing to redo.)
export function redoSnapshot(): Snapshot | null {
  saveToHistory('before redo');
  const now = current;
  if (!now) return null;
  const past = [...get(historyStore).past], future = [...get(historyStore).future]; // snapshots themselves never change
  let shown = now;
  while (future.length > 0) {
    const next = future.shift()!;
    past.push(shown);
    shown = next;
    if (changed(now, next)) {
      historyStore.set({ past, future });
      current = next;
      return next;
    }
  }
  return null;
}

// Whether two snapshots look different: in the drawing, the palette, or the settings or color of the same
// brush. (Two different brushes don't: one was put down and the other picked up, and undo leaves the brush
// held as it is.)
function changed(before: Snapshot, after: Snapshot) {
  const brushChanged = !!before.brush && !!after.brush && before.brush.id === after.brush.id
    && (!deepEqual(before.brush.settings, after.brush.settings) || !deepEqual(before.brush.color, after.brush.color));
  return brushChanged || !deepEqual(before.steps, after.steps) || !deepEqual(before.palette, after.palette);
}

// The drawing's steps, and the brush apart from them
export function snapshotOf(store: ActionStore, stagedID: string, palette: string[], color: Brush['color'], note = ''): Snapshot {
  const steps: ActionStore = deepCopy(store);
  let brush: Brush | null = null;
  if (steps[stagedID]) {
    const settings: ActionStore = {};
    for (const id of stepsOf(steps, stagedID)) {
      settings[id] = steps[id];
      delete steps[id];
    }
    for (const key of mouseParams) delete settings[stagedID].params[key];
    let place: Place | null = null;
    for (const action of Object.values(steps)) {
      const index = action.type === 'list' ? action.params.children.indexOf(stagedID) : -1;
      if (index >= 0) {
        place = { parent: action.uuid, index };
        action.params.children.splice(index, 1);
      }
    }
    brush = { id: stagedID, place, settings, color: { ...color } };
  }
  return { note, steps, brush, palette: [...palette] };
}

// The drawing a snapshot holds, with the brush held now back where the brush sat (or at the end of the recipe,
// `rootID`). If it's the same brush, it has its settings from then, wherever the mouse is now. If it's been
// picked up since, it stays as it is, except that steps inside it that were in the drawing then (dragged into
// it since) go back to their places, so no step is in two places.
export function drawingWithBrush(snapshot: Snapshot, store: ActionStore, stagedID: string, rootID: string): ActionStore {
  const drawing: ActionStore = deepCopy(snapshot.steps);
  const held = store[stagedID];
  if (!held) return drawing;
  if (snapshot.brush?.id === stagedID) {
    Object.assign(drawing, deepCopy(snapshot.brush.settings));
    for (const key of mouseParams) {
      if (key in held.params) drawing[stagedID].params[key] = deepCopy(held.params[key]);
    }
  } else {
    for (const id of stepsOf(store, stagedID).filter(id => !(id in snapshot.steps))) {
      const action = deepCopy(store[id]);
      if (action.type === 'list') action.params.children = action.params.children.filter((child: string) => !(child in snapshot.steps));
      drawing[id] = action;
    }
  }
  const place = snapshot.brush?.place ?? { parent: rootID, index: drawing[rootID].params.children.length };
  drawing[place.parent].params.children.splice(place.index, 0, stagedID);
  return drawing;
}

// an action and the steps inside it
function stepsOf(store: ActionStore, id: string): string[] {
  const action = store[id];
  if (!action) return [];
  return [id, ...(action.type === 'list' ? action.params.children.flatMap((child: string) => stepsOf(store, child)) : [])];
}
