import { writable, get } from 'svelte/store';
import type { Action, Effect } from '../types/types';
import { actionStore, myTools, stagedAction } from '../stores/dataStore';
import { deepCopy } from '../utils/utils';

type Storable = {
  actionStore: Action;
  myTools: Effect[];
  stagedAction: Action | null;
};

// Initialize the history store
export const historyStore = createHistoryStore();
let current:Storable;
let initialState:Storable;

initHistoryStore();

// Call after stores are populated with initial data
export function initHistoryStore() {
  initialState = getCurrentState();
  current = deepCopy(initialState);
  console.log('initial state is', current.actionStore.children);
}

function createHistoryStore() {
  const { subscribe, update, set } = writable<Storable[]>([]);

  return {
    subscribe,
    // add a new state to the history
    addState: (newState: Storable) => {
      update(states => {
        // debugger;
        // console.log('start of adding a new state, children in actions is', states[states.length-1].actionStore.children);
        const newStates = [...states, current];
        // const newStates = [...states, current].slice(-10); // keep only the last 10 states
        current = deepCopy(newState);
        return newStates;
      });
    },
    // undo to the previous state
    undo: () => {
      update(states => {
        if (states.length === 0) {
          // nothing to undo
          return states;
        }
        else if (states.length === 1) {
          // undo to the initial state
          applyState(initialState);
          current = deepCopy(initialState);
          console.log(initialState);
          return [];
        }
        // debugger;
        const prevState = states[states.length - 1];
        applyState(prevState); // apply previous state to stores
        current = prevState;
        let newStates = states.slice(0, -1); // keep all but last element
        return newStates;
      });
    },
    // method to reset the undo history
    reset: () => {
      set([]);
    }
  };
}

// Helper function to get the initial state of the stores
function getCurrentState(): Storable {
  return deepCopy({
    actionStore: get(actionStore),
    myTools: get(myTools),
    stagedAction: get(stagedAction),
  });
}

// Helper function to apply a state to the stores
function applyState(state: Storable) {
  actionStore.set(deepCopy(state.actionStore));
  myTools.set(deepCopy(state.myTools));
  // stagedAction.set(state.stagedAction);
}
