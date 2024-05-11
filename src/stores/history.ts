import { writable, get } from 'svelte/store';
import type { Action, ActionStore } from '../types/types';
import { flatActionStore, stagedActionID } from '../stores/dataStore';
import { deepCopy } from '../utils/utils';

import deepEqual from 'deep-equal';

type Storable = {
  note: string;
  actionStore: ActionStore;
  stagedActionID: string; // uuid
};

// Initialize the history store
export const historyStore = createHistoryStore();
let current:Storable;
// let initialState:Storable;
let paused = false;

// Call after stores are populated with initial data
// function initHistoryStore() {
//   initialState = copyCurrentState();
//   current = copyCurrentState();
// }

function createHistoryStore() {
  const { subscribe, update, set } = writable<{ past: Storable[], future: Storable[] }>({ past: [], future: [] });

  return {
    subscribe,
    pause: () => {
      paused = true;
    },
    resume: () => {
      paused = false;
    },
    // add a new state to the history
    push: (newState: Storable) => {
      if(paused) {
        // console.log("history paused");
        return;
      }
      // console.log(`pushing to history: ${newState.note}`);
      // if(!initialState) {
      //   initHistoryStore(); //initialize when first item pushed to history
      //   // console.log("initial state", initialState);
      // }
      update(({ past, future }) => {
        // console.log("action store length", Object.keys(current.actionStore).length);
        //if states are not the same, add to history
        // let stagedActionChanged = !deepEqual(current.actionStore[current.stagedActionID], newState.actionStore[newState.stagedActionID]);
        if (!current) {
          current = deepCopy(newState);
          return { past: [...past], future: [] };
        } else if (differentOtherThanStagedAction(current, newState)) {
          // console.log("different enough to save to history");
          // console.log("saved state", newState);
          const prevState = current;
          current = deepCopy(newState);
          // console.log("past notes", past.map(state => state.note));
          return { past: [...past, prevState], future: [] };
        }
        // console.log("not different enough to save to history");
        return { past, future };
      });
    },
    // pop previous state off the stack:
    // undo and return the new state to be applied
    // save current state to redo stack
    pop: (): Storable | null => {
      let retrievedState: Storable | null = null;
      update(({ past, future }) => {
        if (past.length === 0) {
          // nothing to undo
          console.log("nothing to undo");
          return { past, future };
        }
        // else if (past.length === 1) {
        //   console.log("undo to initial state");
        //   // undo to the initial state
        //   retrievedState = initialState;
        //   current = deepCopy(initialState);
        //   return { past: [], future };
        // }
        const prevState = past[past.length - 1];
        const nextState = current;
        // debugger;
        retrievedState = prevState;
        current = prevState;
        return {
          past: past.slice(0, -1),
          future: [nextState, ...future] 
        }; // remove last element from past, add current to future
      });
      // console.log("popping from history");
      // console.log("action store length", Object.keys(get(flatActionStore)).length);
      // console.log("undo queue length", get(historyStore).past.length);
      // console.log("retrieved state", retrievedState);
      // console.log("retrieved state note:", retrievedState.note);
      return retrievedState;
    },
    redo: (): Storable | null => {
      let retrievedState: Storable | null = null;
      update(({ past, future }) => {
        if (future.length === 0) {
          return { past, future };
        }
        const nextState = future[0];
        const prevState = current;
        retrievedState = nextState;
        current = nextState;
        return { past: [...past, prevState], future: future.slice(1) };
      });
      return retrievedState;
    },
    // reset the undo history
    reset: () => {
      set({ past: [], future: [] });
    }
  };
}

//is staged action not the only change?
function differentOtherThanStagedAction(oldState: Storable, newState: Storable): boolean {
  let oldWithoutStaged = Object.values(oldState.actionStore).filter(action => action.uuid !== oldState.stagedActionID);
  let newWithoutStaged = Object.values(newState.actionStore).filter(action => action.uuid !== newState.stagedActionID);

  return !deepEqual(oldWithoutStaged, newWithoutStaged);
}

export function saveToHistory(note: string) {
  // console.log("saving to history", note);
  historyStore.push(copyCurrentState(note));
  // console.log("action store length", Object.keys(get(flatActionStore)).length);
  // console.log("undo queue:", get(historyStore).past);
  // console.log("undo queue length", get(historyStore).past.length);
}

function copyCurrentState(note:string): Storable {
  return deepCopy({
    note: note,
    actionStore: get(flatActionStore),
    stagedActionID: get(stagedActionID)
  });
}