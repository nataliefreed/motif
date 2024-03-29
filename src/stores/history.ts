import { writable, get } from 'svelte/store';
import type { Action, ActionStore } from '../types/types';
import { flatActionStore, stagedActionID } from '../stores/dataStore';
import { deepCopy } from '../utils/utils';

import deepEqual from 'deep-equal';

type Storable = {
  actionStore: ActionStore;
  stagedActionID: string; // uuid
};

// Initialize the history store
export const historyStore = createHistoryStore();
let current:Storable;
let initialState:Storable;

// Call after stores are populated with initial data
function initHistoryStore() {
  initialState = copyCurrentState();
  current = copyCurrentState();
}

function createHistoryStore() {
  const { subscribe, update, set } = writable<Storable[]>([]);

  return {
    subscribe,
    // add a new state to the history
    push: (newState: Storable) => {
      if(!initialState) {
        initHistoryStore(); //initialize when first item pushed to history
        console.log("initial state", initialState);
      }
      update(store => {
        if(!deepEqual(current, newState)) { //compare to last state and only add if different
          const newStore = [...store, current]; //add current
          current = deepCopy(newState); //update current
          return newStore;
        }
        else return store;
      });
    },
    // pop previous state off the stack (undo and return the new state to be applied)
    pop: () => {
      console.log("popping from history");
      let retrievedState: Storable | null = null;
      update(store => {
        if (store.length === 0) {
          // nothing to undo
          return store;
        }
        else if (store.length === 1) {
          // undo to the initial state
          retrievedState = initialState;
          current = deepCopy(initialState);
          return [];
        }
        const prevState = store[store.length - 1];
        retrievedState = prevState;
        current = prevState;
        let newStore = store.slice(0, -1); // remove last element
        return newStore;
      });
      return retrievedState;
    },
    // reset the undo history
    reset: () => {
      set([]);
    }
  };
}

export function saveToHistory(note: string) {
  console.log("saving to history", note);
  historyStore.push(copyCurrentState());
}

function copyCurrentState(): Storable {
  return deepCopy({
    actionStore: get(flatActionStore),
    stagedActionID: get(stagedActionID)
  });
}