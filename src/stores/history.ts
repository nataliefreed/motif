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
  const { subscribe, update, set } = writable<{ past: Storable[], future: Storable[] }>({ past: [], future: [] });

  return {
    subscribe,
    // add a new state to the history
    push: (newState: Storable) => {
      if(!initialState) {
        initHistoryStore(); //initialize when first item pushed to history
        // console.log("initial state", initialState);
      }
      update(({ past, future }) => {
        if (!deepEqual(current, newState)) {
          current = deepCopy(newState);
          return { past: [...past, current], future: [] };
        }
        return { past, future };
      });
    },
    // pop previous state off the stack:
    // undo and return the new state to be applied
    // save current state to redo stack
    pop: (): Storable | null => {
      console.log("popping from history");
      let retrievedState: Storable | null = null;
      update(({ past, future }) => {
        if (past.length === 0) {
          // nothing to undo
          return { past, future };
        }
        else if (past.length === 1) {
          // undo to the initial state
          retrievedState = initialState;
          current = deepCopy(initialState);
          return { past: [], future };
        }
        const prevState = past[past.length - 1];
        retrievedState = prevState;
        current = prevState;
        return { past: past.slice(0, -1), future: [current, ...future] }; // remove last element from past, add current to future
      });
      return retrievedState;
    },
    redo: (): Storable | null => {
      let retrievedState: Storable | null = null;
      update(({ past, future }) => {
        if (future.length === 0) {
          return { past, future };
        }
        const nextState = future[0];
        retrievedState = nextState;
        current = nextState;
        return { past: [...past, nextState], future: future.slice(1) };
      });
      return retrievedState;
    },
    // reset the undo history
    reset: () => {
      set({ past: [], future: [] });
    }
  };
}

// function createHistoryStore() {
//   const { subscribe, update, set } = writable<{ past: Storable[], future: Storable[] }>({ past: [], future: [] });

//   return {
//     subscribe,
//     push: (newState: Storable) => {
//       update(({ past, future }) => {
//         if (!deepEqual(current, newState)) {
//           current = deepCopy(newState);
//           return { past: [...past, current], future: [] };
//         }
//         return { past, future };
//       });
//     },
//     pop: (): Storable | null => {
//       let retrievedState: Storable | null = null;
//       update(({ past, future }) => {
//         if (past.length === 0) {
//           return { past, future };
//         } else if (past.length === 1) {
//           retrievedState = initialState;
//           current = deepCopy(initialState);
//           return { past: [], future };
//         }
//         const prevState = past[past.length - 1];
//         retrievedState = prevState;
//         current = prevState;
//         return { past: past.slice(0, -1), future: [current, ...future] };
//       });
//       return retrievedState;
//     },
//     redo: (): Storable | null => {
//       let retrievedState: Storable | null = null;
//       update(({ past, future }) => {
//         if (future.length === 0) {
//           return { past, future };
//         }
//         const nextState = future[0];
//         retrievedState = nextState;
//         current = nextState;
//         return { past: [...past, nextState], future: future.slice(1) };
//       });
//       return retrievedState;
//     },
//     reset: () => {
//       set({ past: [], future: [] });
//     }
//   };
// }



export function saveToHistory(note: string) {
  // console.log("saving to history", note);
  historyStore.push(copyCurrentState());
}

function copyCurrentState(): Storable {
  return deepCopy({
    actionStore: get(flatActionStore),
    stagedActionID: get(stagedActionID)
  });
}