import { writable, get } from 'svelte/store';
import type { Action, ActionStore } from '../types/types';
import { flatActionStore, stagedActionID } from '../stores/dataStore';
import { deepCopy } from '../utils/utils';

type Storable = {
  actionStore: ActionStore;
  stagedActionID: string; // uuid
};

// Initialize the history store
export const historyStore = createHistoryStore();
let current:Storable;
let initialState:Storable;

// Call after stores are populated with initial data
export function initHistoryStore() {
  initialState = copyCurrentState();
  current = copyCurrentState();
}

function createHistoryStore() {
  const { subscribe, update, set } = writable<Storable[]>([]);

  return {
    subscribe,
    // add a new state to the history
    addState: (newState: Storable) => {
      update(store => {
        const newStore = [...store, current]; //add current
        current = deepCopy(newState); //update current
        return newStore;
      });
    },
    // undo to the previous state
    undo: () => {
      update(store => {
        if (store.length === 0) {
          // nothing to undo
          return store;
        }
        else if (store.length === 1) {
          // undo to the initial state
          applyState(initialState);
          current = deepCopy(initialState);
          return [];
        }
        const prevState = store[store.length - 1];
        applyState(prevState); // apply previous state to stores
        current = prevState;
        let newStore = store.slice(0, -1); // remove last element
        return newStore;
      });
    },
    // reset the undo history
    reset: () => {
      set([]);
    }
  };
}

export function saveToHistory() {
  // console.log("saving to history", get(flatActionStore));
  historyStore.addState(copyCurrentState());
}

function copyCurrentState(): Storable {
  return deepCopy({
    actionStore: get(flatActionStore),
    stagedActionID: get(stagedActionID),
  });
}

function applyState(state: Storable) {
  flatActionStore.set(state.actionStore);
  stagedActionID.set(state.stagedActionID);
}