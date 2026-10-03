import type { Action, Effect, ActionStore } from '../types/types';
import { v4 as uuidv4 } from 'uuid';
import { followedBy, movePoint, turnAndMove, type Point, type Transform } from '../utils/transform';
import { randomPattern, type PatternKind } from '../utils/random-patterns';
import { t, entry, displayTitle } from '../i18n';
import { actionRootID, activeIDs, actionStore, myTools, toolStore, selectedActionID, selectedRun, selectedEffect, changedActionID, flatActionStore, actionRoot, stagedAction, stagedActionID, shouldRandomizeColor, playheadID, hoveredActionID, renderRequested, isPlaying, renderDelay, currentlyRenderingActionID, playSpeed, hasPlayed } from '../stores/dataStore'
import { currentColor, currentIndexedColor, randomColorFromPalette, activePalette, replaceActivePalette } from '../stores/colorStore';
import { saveToHistory } from '../stores/history';
import { p5CanvasSize } from '../stores/canvasStore';
import { get } from 'svelte/store';
import { deepCopy, merge, randomWithinRange, arrayToKeyedObj } from '../utils/utils';
import { tick } from 'svelte';
import { curatedRandomHexColor } from '../utils/color-utils';
import { historyStore } from '../stores/history';
import tinycolor from "tinycolor2";
import { getSpiroPoints, getSpecklesPoints } from './canvas/Renderer.js'

class ActionManager {
  #store = flatActionStore;

  constructor() {}

  // Get an action from the store by its ID
  getAction(id: string) {
    if (!id || id.length < 1) return null;
    const action = get(this.#store)[id];
    if (!action) {
      console.log("No action found with id", id);
      return null;
    }
    return action;
  }

  // Update the parameters of an action in the store by its ID
  updateParams(id: string, params: { [key: string]: any | ((currentValue: any) => any) }) {
    this.#modifyActionStore(id, (store) => {
      const action = store[id];
      if (action) {
        // Update each parameter individually
        for (const [key, value] of Object.entries(params)) {
          if (typeof value === "function") {
            // If function provided, update based on the current value
            if (key in action.params) {
              action.params[key] = value(action.params[key]);
            }
          } else {
            // Otherwise, directly set the new value
            action.params[key] = value;
          }
        }
      }
    });
  }
  

  // Detach an action from its parent list by its ID
  detach(id: string) {
    this.#modifyActionStore(null, (store) => {
      // Find the parent action
      const parent = Object.values(store).find(action =>
        action.type === 'list' &&
        action.params.children &&
        action.params.children.includes(id)
      );
  
      if (!parent) return;
  
      // Remove the action's ID from the parent's children array
      parent.params.children = parent.params.children.filter(childId => childId !== id);
    });
  }

  // Delete an action and its descendants by its ID
  delete(id: string) {
    
    let selected = get(selectedActionID); 
    if((selected === id)) { //which it often will be for deleting
      selected = getNextSelection(id);
    }

    if (!id) return;
    this.#modifyActionStore(id, (store) => {
      // Collect all IDs to delete (the action itself and its descendants)
      let idsToDelete = getDescendantIDs(store, id);

      // Remove all references to these IDs in other actions' children arrays
      for (let actionId in store) {
        const action = store[actionId];
        if (action.params.children) {
          action.params.children = action.params.children.filter(childId => !idsToDelete.includes(childId));
        }
      }

      // Delete the actions themselves
      idsToDelete.forEach(actionId => delete store[actionId]);
    });

    selectAction(selected);
  }

  toggleHidden(id: string) {
    let action = this.getAction(id);
    if (!action) return;

    if(action.hidden) {
      this.show(id);
    } else {
      this.hide(id);
    }
  }

  hide(id: string) {
    if (!id || !get(this.#store)[id]) return;
    this.#modifyActionStore(id, (store) => {
      store[id].hidden = true;
    });
  }

  show(id: string) {
    if (!id || !get(this.#store)[id]) return;
    this.#modifyActionStore(id, (store) => {
      store[id].hidden = false;
    });
  }

  showAll() {
    this.#modifyActionStore(null, (store) => {
      for (let uuid in store) {
        store[uuid].hidden = false;
      }
    });
  }

  // Add a single action to the store by its ID, don't assign to any parent
  add(action: Action) {
    if (!action || !action.uuid) return;
    this.#modifyActionStore(action.uuid, (store) => {
      store[action.uuid] = action;
    });
    return action.uuid;
  }

  // Append multiple actions to the store, don't assign to any parent
  append(actions: { [uuid: string]: Action }) {
    if (!actions) return;
    let root_uuid = getRoot(actions);
    this.#modifyActionStore(root_uuid, (store) => {
      for (let uuid in actions) {
        store[uuid] = actions[uuid];
      }
    });
    return root_uuid;
  }

  // refreshID(original: string) {
  //   let newID = uuidv4(); 
  //   this.#modifyActionStore(null, (store) => {
  //     let action = store[original];
  //     if(action) {
  //       action.uuid = newID;
  //     }
  //   });
  //   actionManager.replaceId(original, newID); //in the parent's children array
  //   return newID;
  // }

  // change out the ID in the parent's children array for another ID - does not modify the action at either ID, just swaps out the parent's reference to it
  // TODO: don't call as separate modification
  replaceId(targetId: string, newId: string) {
    this.#modifyActionStore(null, (store) => {
      const parent = Object.values(store).find(action =>
        action.type === 'list' &&
        action.params.children &&
        action.params.children.includes(targetId)
      );

      if (!parent) return;

      const newSiblings = [...parent.params.children];
      const index = newSiblings.indexOf(targetId);
      if (index !== -1) {
        newSiblings[index] = newId;
      }

      store[parent.uuid].params.children = newSiblings;
    });
  }

// Make a copy of an action, insert after original, delete the original action, return the ID of the copy
// TODO: does not handle nested actions
replaceWithCopy(id: string) {
  let action = this.getAction(id);
  if (!action) return null;

  let copy = copyAction(id);
  let copyID = Object.keys(copy)[0];

  if(!copyID) return;

  this.#modifyActionStore(null, (store) => {
    // Add the copy to the store
    store[copyID] = copy[copyID];

    // Find the parent of the original action
    const parent = Object.values(store).find(action =>
      action.params.children &&
      action.params.children.includes(id)
    );

    if (parent) {
      // Insert the copy as a sibling after the original
      const index = parent.params.children.indexOf(id);
      parent.params.children.splice(index + 1, 0, copyID);
    }

    // Collect all IDs to delete (the action itself and its descendants)
    let idsToDelete = getDescendantIDs(store, id);

    // Remove all references to these IDs in other actions' children arrays
    for (let actionID in store) {
      const action = store[actionID];
      if (action.params.children) {
        action.params.children = action.params.children.filter(childId => !idsToDelete.includes(childId));
      }
    }

    // Delete the actions themselves
    idsToDelete.forEach(actionId => delete store[actionId]);
  });

  return copyID;
}
  
  // insert ID of an action into parent's children array after specified sibling
  insertAfter(newId: string, targetId: string) {
    this.#modifyActionStore(null, (store) => {
      const parent = Object.values(store).find(action =>
        action.type === 'list' &&
        action.params.children &&
        action.params.children.includes(targetId)
      );

      if (!parent) return;

      const newSiblings = [...parent.params.children];
      const index = newSiblings.indexOf(targetId);
      newSiblings.splice(index + 1, 0, newId);

      store[parent.uuid].params.children = newSiblings;
    });
  }

  // Move the action with ID newId to be after the action with ID targetId
  moveAfter(newId: string, targetId: string) {
    this.#modifyActionStore(null, (store) => {
      // Find the current parent of the action to be moved
      const currentParent = Object.values(store).find(action =>
        action.type === 'list' &&
        action.params.children &&
        action.params.children.includes(newId)
      );

      // Find the target parent where the action should be moved to
      const targetParent = Object.values(store).find(action =>
        action.type === 'list' &&
        action.params.children &&
        action.params.children.includes(targetId)
      );

      // If either the current parent or the target parent is not found, do nothing
      if (!currentParent || !targetParent) return;

      // Remove the action from its current parent's children
      const currentIndex = currentParent.params.children.indexOf(newId);
      if (currentIndex !== -1) {
        currentParent.params.children.splice(currentIndex, 1);
      }

      // Insert the action after the target in the target parent's children
      const targetIndex = targetParent.params.children.indexOf(targetId);
      if (targetIndex !== -1) {
        targetParent.params.children.splice(targetIndex + 1, 0, newId);
      }
    });
  }

  // before sibling
  // insert ID of an action into parent's children array before specified sibling
  insertBefore(newId: string, targetId: string) {
    this.#modifyActionStore(null, (store) => {
      const parent = Object.values(store).find(action =>
        action.type === 'list' &&
        action.params.children &&
        action.params.children.includes(targetId)
      );

      if (!parent) return;

      const newSiblings = [...parent.params.children];
      const index = newSiblings.indexOf(targetId);
      newSiblings.splice(index, 0, newId);

      store[parent.uuid].params.children = newSiblings;
    });
  }

  // insert ID of an action as child of specified parent
  appendChildByID(childID: string, parentID: string) {
    this.#modifyActionStore(parentID, (store) => {
      const parent = store[parentID];
      if (!parent || !parent.params.children) return;

      parent.params.children.push(childID);
    });
  }

  // Move the action with ID newId before the action with ID targetId
  moveBefore(newId: string, targetId: string) {
    this.#modifyActionStore(null, (store) => {
      // Find the current parent of the action to be moved
      const currentParent = Object.values(store).find(action =>
        action.type === 'list' &&
        action.params.children &&
        action.params.children.includes(newId)
      );

      // Find the target parent where the action should be moved to
      const targetParent = Object.values(store).find(action =>
        action.type === 'list' &&
        action.params.children &&
        action.params.children.includes(targetId)
      );

      // If either the current parent or the target parent is not found, do nothing
      if (!currentParent || !targetParent) return;

      // Remove the action from its current parent's children
      const currentIndex = currentParent.params.children.indexOf(newId);
      if (currentIndex !== -1) {
        currentParent.params.children.splice(currentIndex, 1);
      }

      // Insert the action before the target in the target parent's children
      const targetIndex = targetParent.params.children.indexOf(targetId);
      if (targetIndex !== -1) {
        targetParent.params.children.splice(targetIndex, 0, newId);
      }
    });
  }


  // Append actions to action store as child of specified parent
  appendChild(actions: { [uuid: string]: Action }, uuid: string) {
    if (!actions) return;
    let root_uuid = getRoot(actions);
    this.#modifyActionStore(uuid, (store) => {
      for (let actionUuid in actions) {
        store[actionUuid] = actions[actionUuid];
      }
      if (store[uuid]) {  // Add as child to the parent action
        store[uuid].params.children.push(root_uuid);
      }
    });
    return root_uuid;
  }

  undo() {
    let undoState = historyStore.pop();
    if(!undoState) return;
    this.#modifyActionStore(null, (store) => {
      Object.assign(store, undoState.actionStore);
    });
    replaceActivePalette(undoState.colorPalette);
    stagedActionID.set(undoState.stagedActionID);
  }

  redo() {
    let redoState = historyStore.redo();
    if (!redoState) return;
    stagedActionID.set(redoState.stagedActionID);
    this.#modifyActionStore(null, (store: ActionStore) => {
      Object.assign(store, redoState.actionStore);
    });
    replaceActivePalette(redoState.colorPalette);
  }

  refresh() {
    // update store to trigger re-render
    this.#modifyActionStore(null, (store) => store);
  }

  clearAllFrom(id:string) {
    if(!id) return;
    this.#modifyActionStore(id, (store) => {

      // Collect all IDs to delete (the action itself and its descendants)
      let idsToDelete = getDescendantIDs(store, id);
      // Take the action itself out of the list
      idsToDelete = idsToDelete.filter(actionId => actionId !== id);
      // Take out the staged action and its children
      let stagedActionAndChildren = getDescendantIDs(store, get(stagedActionID));
      idsToDelete = idsToDelete.filter(actionId => !stagedActionAndChildren.includes(actionId));

      // Remove all references to these IDs in other actions' children arrays
      for (let actionId in store) {
        const action = store[actionId];
        if (action.params.children) {
          action.params.children = action.params.children.filter(childId => !idsToDelete.includes(childId));
        }
      }

      // Delete the actions themselves
      idsToDelete.forEach(actionId => delete store[actionId]);
    });
  }

  // Pass in a function to change the store
  #modifyActionStore(uuid: string | null, modifyFunction: (store: { [key: string]: Action }, uuid?: string | null) => void) {
    this.#updateActionStore((store) => {
      const updatedStore = { ...store };
      modifyFunction(updatedStore, uuid);

      if (uuid) {
        changedActionID.set(uuid);
      }
      else {
        let root_uuid = getRoot(store);
        if(root_uuid) {
          changedActionID.set(root_uuid);
        }
      }

      return updatedStore;
    });
  }

  // IMPORTANT! Only this method should mutate the store
  #updateActionStore(updateFunction: (store: { [key: string]: Action }) => { [key: string]: Action }) {
    this.#store.update((store) => {
      const newStore = updateFunction(deepCopy(store)); // Deep copy of store
      return newStore;
    });
  }
}
const actionManager = new ActionManager();









/* THESE FUNCTIONS ARE CALLED BY THE UI */
/* note on saving to history: currently thinking about it as saving before doing something user-initiated 
   that the user expects to be able to undo. Don't save if it doesn't do anything.
*/

export async function scrollToAction(id: string, scrollBehavior: ScrollBehavior = 'smooth') {
  await tick(); // Wait for the DOM to update with the new item
  const element = document.getElementById(`${id}`);
  // console.log("scrolling to element:", element);
  if (element) {
    element.scrollIntoView({
      behavior: scrollBehavior,
      block: 'center',
      inline: 'nearest'
    });
  }
}

export function undo() {
  stopPlaying();
  actionManager.undo();
}

export function redo() {
  stopPlaying();
  actionManager.redo();
}

export function rewindToBeginning() {
  stopPlaying();
  //move staged action to start
  let stagedID = get(stagedActionID);
  if(stagedID.length < 1) return;
  let rootChildren = get(actionRoot).params.children;
  if(rootChildren && rootChildren.length > 0) {
    actionManager.detach(stagedID);
    actionManager.insertBefore(stagedID, rootChildren[0]);
  }
}

export function fastForwardToEnd() {
  stopPlaying();
  //move staged action to end
  moveStagedActionToEnd();
}

export function stepForward() {
  stopPlaying(); // stop a replay fully, so the steps before the new spot are drawn
  let stagedID = get(stagedActionID);
  if (!stagedID) return;

  let sibs = getSiblings(stagedID);
  let numSibs = sibs.length;
  if (numSibs < 2) return;

  let index = sibs.indexOf(stagedID);
  if(index >= numSibs - 1) return; //if at end, do nothing
  let nextIndex = (index + 1) % (numSibs);
  let nextSib = sibs[nextIndex];
  // selectedActionID.set(nextSib);
  // debugger;
  actionManager.detach(stagedID);

  if(index < numSibs - 1) {
    actionManager.insertAfter(stagedID, nextSib);
  }

  scrollToAction(nextSib);
  // else {
  //   actionManager.insertBefore(stagedID, nextSib); // if it is at the end, move to the beginning
  // }
}

export function stepBackward() {
  stopPlaying(); // stop a replay fully, so the steps before the new spot are drawn
  let stagedID = get(stagedActionID);
  if(!stagedID) return;

  let sibs = getSiblings(stagedID);
  let numSibs = sibs.length;
  if (numSibs < 2) return;

  let index = sibs.indexOf(stagedID);
  if(index <= 0) return; //if at beginning, do nothing
  let prevIndex = index - 1;
  let prevSib = sibs[prevIndex < 0 ? numSibs - 1 : prevIndex];
  // selectedActionID.set(prevSib);
  actionManager.detach(stagedID);
  actionManager.insertBefore(stagedID, prevSib);
  let prevPrevSib = sibs[prevIndex < 0 ? numSibs - 2 : prevIndex - 1];
  if(prevPrevSib) { scrollToAction(prevPrevSib); }
  else { scrollToAction(prevSib); }
}

// let playInterval: Timeout | null = null;

export function play() {
  hasPlayed.set(true);
  moveStagedActionToEnd();
  scrollToTop();
  
  setTimeout(() => {
    renderDelay.set(1000/get(playSpeed));
    isPlaying.set(true); 
    renderRequested.set(true);
    }, 500); //wait a second for scroll to top before starting
  // console.log("render delay", get(renderDelay));
}

function scrollToTop() {
  const list = document.querySelector('.main-right');
  if(list == null) return;
  list.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

export function pause() {
  renderDelay.set(0);
  isPlaying.set(false);
  let currentlyRendering = actionManager.getAction(get(currentlyRenderingActionID));
  if(currentlyRendering) {
    actionManager.moveBefore(get(stagedActionID), get(currentlyRenderingActionID));
  }


  // isPlaying.set(false);
  //   let currentlyRendering = actionManager.getAction(get(currentlyRenderingActionID));
  //   if(currentlyRendering) {
  //     actionManager.detach(get(stagedActionID));
  //     actionManager.insertAfter(get(stagedActionID), get(currentlyRenderingActionID));
  //   }
  // renderDelay.set(0);
  // actionManager.refresh();
}

export function togglePlay() {
  if(get(isPlaying)) {
    pause();
  } else {
    play();
  }
}

export function stopPlaying() {
  // stop the delayed render
  // leave staged action where it is
  // clearInterval(playInterval);
  const wasPlaying = get(isPlaying);
  isPlaying.set(false);
  renderDelay.set(0);
  // a step the replay was still waiting to draw is dropped once it stops, so draw everything before the
  // staged action again
  if (wasPlaying) actionManager.refresh();
}

export function toggleHidden(id: string) {
  actionManager.toggleHidden(id);
  saveToHistory("hide action");
}

export function hideAction(id: string) {
  actionManager.hide(id);
  saveToHistory("hide action");
}

export function showAction(id: string) {
  actionManager.show(id);
  saveToHistory("show action");
}

export function hideSelectedAction() {
  actionManager.hide(get(selectedActionID));
  saveToHistory("hide selected action");
}

export function selectAction(id:string) {
  if(id && id !== get(actionRootID)) {
    if(id == get(stagedActionID)) {
      deselect(); //deselect
    } else {
      selectedActionID.set(id);
    }
  }
  // console.log("selecting action", id);
}

// The selected steps: a run selected with shift-click, or the one selected step, or none
export function selectedSteps(): string[] {
  const run = get(selectedRun);
  if (run.length > 1) return run;
  const id = get(selectedActionID);
  return id ? [id] : [];
}

// Shift-click: selects the steps from the selected one to `id`, if they're in the same list (otherwise just
// `id`). The next step's box can be among them, but it's never part of the run.
export function selectRunTo(id: string) {
  const anchor = get(selectedActionID);
  const siblings = anchor ? getSiblings(anchor) : undefined;
  if (!siblings || !siblings.includes(id) || id === anchor) return selectAction(id);
  const [from, to] = [siblings.indexOf(anchor), siblings.indexOf(id)].sort((a, b) => a - b);
  selectedRun.set(siblings.slice(from, to + 1).filter(step => step !== get(stagedActionID)));
}

export function deselect() {
  selectedActionID.set('');
  // console.log("deselect");
}

export function selectActionByIndex(index:number) {
  let actions = getActionsInRunOrder();
  if(!actions || index >= actions.length) return;
  selectAction(actions[index]);
  // console.log("selecting action by index", actions[index]);
}

export function hoverAction(id:string) {
  if(id && id !== get(actionRootID)) {
    hoveredActionID.set(id);
    //set shifted params based on timestamp

  }
  else {
    hoveredActionID.set('');
    //reset params to original
  }
}

// remove the selected steps, initiated from UI
export function removeSelectedAction() {
  const steps = selectedSteps().filter(id => get(flatActionStore)[id] && id !== get(stagedActionID));
  if (steps.length < 1) return;
  selectedActionID.set(steps[0]); // so the selection moves to the step before them
  for (const id of steps) actionManager.delete(id);
  saveToHistory("remove selected action");
}

export function clearAllActions() {
  saveToHistory("clear all actions start");
  actionManager.clearAllFrom(get(actionRootID));
  saveToHistory("clear all actions end");
}

// gradually clear actions from bottom to top
export function clearAllActionsGradually() {
  saveToHistory("clear all actions start");

  let actions = getActionsInRunOrder(); //IDs
  if(!actions || actions == undefined || actions.length < 1) return;

  // console.log("actions to clear", actions);

  // save copy of staged action
  let newStagedAction = copyAction(get(stagedActionID));
  let newStagedActionRoot = getRoot(newStagedAction);

  let lastItem = actions[actions.length - 1];
  if(lastItem) {
    scrollToAction(lastItem);
  }

  const interval = setInterval(() => {
    const penultimateItem = actions[actions.length - 2];
    if(penultimateItem) {
      // console.log("second to last item", penultimateItem);
      selectAction(penultimateItem);
    // Remove the last element from the array
    const toRemove = actions.pop() as string;
    // console.log("removing", toRemove);
    actionManager.delete(toRemove);
    changedActionID.set(penultimateItem);
    } else {
        // If no more elements except first, clear the interval
        clearInterval(interval);
        deselect();
        if(newStagedActionRoot) {
          stagedActionID.set(newStagedActionRoot);
          actionManager.appendChild(newStagedAction, get(actionRoot).uuid);
        }
        changedActionID.set(get(actionRoot).uuid);
        saveToHistory("clear all actions end");
    }
  }, 10); //rate at which to clear actions
}

// set staged action
export function addEffectAsStagedAction(effect: Effect, params: { [key: string]: any }) {
  // let uuid = addEffectToActionStore(effect, params);
  let prevStaged = get(stagedActionID);
  if(prevStaged.length > 0) actionManager.delete(prevStaged);
  let uuid = addEffectToActionStoreAsChildOf(effect, params, get(actionRoot).uuid);
  if(uuid) stagedActionID.set(uuid);
  updateStagedAction({ lastChanged: Date.now() });
  updateStagedActionColor(get(currentIndexedColor).color, get(currentIndexedColor).index);
}

export function addCurrentEffectAsStagedAction() {
  let effect = get(selectedEffect);
  // let params = { color: get(currentColor) };
  if(!effect) return;
  addEffectAsStagedAction(effect, {});
}

// bubbled up by UI widgets
export function updateActionParams(uuid:string, params: { [key: string]: any | ((currentValue: any) => any) }) {
  if (!uuid) return;

  // Note: this does not save to undo/redo history, this needs to be handled by user-level events
  actionManager.updateParams(uuid, params);

  // if (save) {
  //   saveToHistory("save changed params"); // Add to undo queue
  //   // console.log("saving to history");
  // }
}

// make a copy with new uuid and add immediately after original
export function duplicateAction(id:string) {
  if (!id || !get(flatActionStore)[id]) return;
  // console.log("duplicating", id);
  let newActions = copyAction(id);
  let root = getRoot(newActions);
  // newAction.params.title = newAction.params.title + " copy";
  if(root) {
    actionManager.append(newActions);
    actionManager.insertAfter(root, id);
    selectedActionID.set(root);
    saveToHistory("duplicate action");
  }
  return root;
}

// export function saveActionAsNewTool(action: Action) {
//   if(!action) return;

//   let newEffect: Effect;

//   if (action.type === 'list' && action.params && Array.isArray(action.params.children)) {
//     const actions = copyAction(action.uuid);
//     newEffect = actionToEffect(actions) as Effect;
//   } else {
//     // Handle non-nested actions
//     newEffect = {
//       name: action.effect + "",
//       textLabel: action.effect + "",
//       category: action.category,
//       tags: 'mytools',
//       params: deepCopy(action.params)
//     };
//   }

//   if(!newEffect) return;

//   myTools.update(storeValue => {
//     if(!storeValue) storeValue = [];
//     storeValue.push(newEffect);
//     console.log("new tool added to my tools", storeValue);
//     activeCategory.set('my tools');
//     selectedEffect.set(newEffect);
//     return storeValue;
//   });
// }

export function copyStagedActionToActionStore() {
  let stagedID = get(stagedActionID);
  let newActions = copyAction(stagedID);
  // newActions.hidden = false;
  let newActionRoot = getRoot(newActions);
  // console.log("root of new actions", newActionRoot);
  if(!stagedID || !newActions || !newActionRoot) {
    return;
  }

  // saveToHistory("add action from staged action start");

  // add to action store without assigning to parent
  actionManager.append(newActions);
  // insert ID of an action into parent's children array before specified sibling
  actionManager.insertBefore(newActionRoot, stagedID);
  selectAction(newActionRoot);

  // playheadID.set(newActionRoot);

  changedActionID.set(newActionRoot);

  saveToHistory("add action from staged action end");

  actionManager.updateParams(stagedID, { lastChanged: Date.now() });

  // moveStagedActionToEnd();
}

//move staged action ID back to end of list
export function moveStagedActionToEnd() {
  //TODO: if it's already at the end, do nothing
  let stagedID = get(stagedActionID);
  if(!stagedID) return;
  actionManager.detach(stagedID);
  actionManager.appendChildByID(stagedID, get(actionRoot).uuid);
}

// take an effect, create an action, and add to action store
// used by keyboard events
export function addEffectToActionStore(effect: Effect, params: { [key: string]: any } = {}) {
  let actions = effectToActions(effect, params);
  if(actions) {
    let newActionRoot = actionManager.append(actions);
    if(!newActionRoot) return;
    actionManager.insertBefore(newActionRoot, get(stagedActionID));
    saveToHistory("add effect to action store");
  }
}

export function updateStagedAction(params: { [key: string]: any } = {} ) {
  // if('progress' in params) {
    // console.log("saving progress", params);
  // }
  // historyStore.pause();
  updateActionParams(get(stagedActionID), params);
  // historyStore.resume();
}

export function updateSelectedAction(params: { [key: string]: any | ((currentValue: any) => any) }) {
  let id = get(selectedActionID);
  if(!id) return;
  updateActionParams(id, params);
}

export function updateStagedActionColor(color:string, index: number = -1) {
  //look for color in params, including children for along path
  let stagedID = get(stagedActionID);
  if(!stagedID) return;
  let params = get(flatActionStore)[stagedID].params;
  if(!params) return;

  // console.log("updating staged action color", color, index);

  const activePaletteLength = get(activePalette).length;
  if('color' in params) {
    updateStagedAction({ color: color, lockedIndex: index});
  }
  else if('children' in params) { //if it's an along path action without a parent color
    let children = params.children;
    for(let childID of children) {
      let child = get(flatActionStore)[childID];
      if('color' in child.params) {
        actionManager.updateParams(childID, { color: color, lockedIndex: index});
        if(index >= 0 && index < activePaletteLength) {
          //increment index
          index = (index + 1) % activePaletteLength;
        }
        else {
          // make color a little different for the next child
          color = tinycolor(color).darken(10).toHexString();
        }
      }
    }
  }
}

export function resetSpecialStagedActionParams() {
  if('path' in get(stagedAction).params) {
    updateStagedAction({ path: []});
  }
  if('progress' in get(stagedAction).params) {
    updateStagedAction({ progress: 2});
  }
}

export function setCurrentEffect(name: string) {
  let effect = get(toolStore).find(tool => tool.name === name);
  // console.log("setting current effect", effect);
  if(!effect) return;
  selectedEffect.set(effect);
  
}

let changeOptions = {
  'color': (value:string) => { return curatedRandomHexColor(); },
  'radius': (value:number) => { return randomWithinRange(value, 5, 300, 20) },
  'r1': (value:number) => randomWithinRange(value, 5, 300, 20),
  'r2': (value:number) => randomWithinRange(value, 5, 200, 20),
  'npoints': (value:number) => randomWithinRange(value, 3, 50, 5),
  'nsides': (value:number) => randomWithinRange(value, 3, 50, 5),
  'width': (value:number) => randomWithinRange(value, 5, 600, 20),
  'height': (value:number) => randomWithinRange(value, 5, 600, 20),
  'columns': (value:number) => randomWithinRange(value, 1, 20, 3),
  'rows': (value:number) => randomWithinRange(value, 1, 20, 3),
  'rings': (value:number) => randomWithinRange(value, 1, 6, 1),
  'angle': (value:number) => randomWithinRange(value, 0, 360, 20),
  'outer': (value:number) => randomWithinRange(value, 5, 300, 20),
  'inner': (value:number) => randomWithinRange(value, 5, 200, 20),
  'position' (value:{x:number, y:number}) { return { x: Math.round(value.x + (Math.random() - 0.5) * 10), y: Math.round(value.y + (Math.random() - 0.5) * 10) } },
  'path': (value:[[number, number]]) => value.map(point => [point[0] + (Math.random() - 0.5) * 10, point[1] + (Math.random() - 0.5) * 10]),
}

export function remixDuplicate(id:string) {
  saveToHistory("duplicate action start");
  let newID = duplicateAction(id);
  if(newID) remixAction(newID);
  saveToHistory("duplicate action end");
}

// Copies the selected steps, together and in order, right after them; the copies become the selection.
export function duplicateSelected(): string[] {
  const steps = selectedSteps().filter(id => get(flatActionStore)[id]);
  let after = steps[steps.length - 1];
  const copies: string[] = [];
  for (const id of steps) {
    const newActions = copyAction(id);
    const root = getRoot(newActions);
    if (!root) continue;
    actionManager.append(newActions);
    actionManager.insertAfter(root, after);
    after = root;
    copies.push(root);
  }
  if (copies.length > 0) {
    selectedActionID.set(copies[0]);
    selectedRun.set(copies.length > 1 ? copies : []);
    saveToHistory("duplicate action");
  }
  return copies;
}

export function remixSelected() {
  saveToHistory("remix action start");
  for (const id of selectedSteps()) remixActionWithoutHistory(id);
  saveToHistory("remix action end");
}

export function remixDuplicateSelected() {
  saveToHistory("duplicate action start");
  for (const id of duplicateSelected()) remixActionWithoutHistory(id);
  saveToHistory("duplicate action end");
}

// pick a parameter at random and change it
export function remixAction(id:string) {
  saveToHistory("remix action start");
  remixActionWithoutHistory(id);
  saveToHistory("remix action end");
}

function remixActionWithoutHistory(id:string) {
  
  if(!id || ! get(flatActionStore)[id]) return;

  let action = get(flatActionStore)[id];
  let params = action.params;
  let newParams = { ...params };
  let paramNames = Object.keys(params);

  if(action.effect === 'along path') {
    //remix the path by wiggling each point a bit
    // let newPath = changeOptions.path(params.path);
    // newParams.path = newPath;
    //todo: change the items in the children array
    if(params.children.length < 1) return;
    let child = params.children[Math.floor(Math.random() * params.children.length)];
    remixAction(child);
  }
  else if(action.effect === 'do each') {
    // pick a random child and remix it
    if(params.children.length < 1) return;
    let child = params.children[Math.floor(Math.random() * params.children.length)];
    remixAction(child); // how do we get this update to actionStore?
  }
  else {
    // always change color if it exists
    if ('color' in params) {
      if('lockedIndex' in params) {
        let indexedColor = randomColorFromPalette();
        newParams.lockedIndex = indexedColor.lockedIndex;
        newParams.color = indexedColor.color;
      }
      else {
        newParams.color = changeOptions.color(params.color); //right now doesn't use existing color
      }
    }
    // then change whichever of these exist: radius, r1, r2, npoints, nsides, path, width, height, angle, outer, inner
    Object.keys(changeOptions).forEach(key => {
      if (key in params) {
        newParams[key] = changeOptions[key](params[key]);
      }
    });
    // then change position a little bit
    // if('position' in params) {
    //   newParams.position = { x: params.position.x + (Math.random() - 0.5) * 10, y: params.position.y + (Math.random() - 0.5) * 10 };
    // }
  }
  
  actionManager.updateParams(id, newParams);
}

export function convertSelectedAction() {
  let selected = get(selectedActionID);
  if(selected.length < 1) return;

  let selectedAction = actionManager.getAction(selected);
  if (!selectedAction) return;

  let newAction = convertToPathType([selectedAction]);
  if(newAction === null) return;
  let added = actionManager.append(newAction);
  actionManager.replaceId(selected, added);
  selectedActionID.set(added);
}

// wiggle parameters of action
export function wiggleAction(id:string) {
  // //get the action from the store
  // let action = get(flatActionStore)[id];
  // //make a copy of it
  // let previewAction = deepCopy(action);
  // //change the parameters
  // let params = previewAction.params;
  // previewAction.params.color = changeOptions.color(params.color);
}

// put the selected steps inside a group / do each
export function wrapSelectedInGroup() {
  const steps = selectedSteps().filter(id => get(flatActionStore)[id]);
  if (steps.length < 1) return;
  selectedActionID.set(wrapInGroup(steps));
  saveToHistory('Group selected action');
}

// What steps are called, for naming something made from them: a group or brush by its own name, any other
// step by its tool's name, and several steps by their names joined: "circle & square", "circle, square & star".
function nameOf(steps: string[]): string {
  const store = get(flatActionStore);
  if (steps.length === 1 && store[steps[0]]?.type === 'list') return store[steps[0]].params.title;
  const names = [...new Set(steps.map(id => store[id]).filter(Boolean).map(action =>
    action.type === 'list' ? get(displayTitle)(action.params.title) : toolName(action)))];
  return names.length < 2 ? names[0] ?? '' : `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}

// the name of the tool that made a step, in the interface's language: "circle", "straight grid"
function toolName(action: Action): string {
  const tool = get(toolStore).find(tool => tool.name === action.name && (!tool.params?.tiling || tool.params.tiling === action.params.tiling));
  return (tool ? entry(get(t).tools, tool.textLabel)?.label ?? tool.textLabel : action.name).toLowerCase();
}

// Puts steps of one list into a new group, in order, where the first of them was; returns the group's ID.
// The group starts empty, so each step is only ever in one list while they move.
function wrapInGroup(steps: string[], title?: string): string {
  const group = actionManager.append(createGroupAction([], title))!;
  actionManager.replaceId(steps[0], group);
  for (const id of steps.slice(1)) actionManager.detach(id);
  actionManager.updateParams(group, { children: steps });
  return group;
}

function createGroupAction(children: string[], title = "untitled") {
  let action: Action = {
    uuid: uuidv4(),
    name: 'do each',
    type: 'list' as const,
    category: 'control',
    effect: 'do each',
    params: {
      title,
      children: children,
      moveBy: { x: 0, y: 0 }, // a group can be moved and turned (see moveWithGroup)
      angle: 0
    },
    hidden: false,
  };
  return { [action.uuid]: action };
}

// "random pattern": repeats the selected steps in a random pattern (sprinkles, a grid, a ring, a spiral...)
// starting where they are; several steps are grouped first, so they repeat together. Choosing it again on a
// pattern made this way gives it a different pattern instead.
export function randomPatternForSelected() {
  const steps = selectedSteps().filter(id => get(flatActionStore)[id]);
  if (steps.length < 1) return;
  const first = actionManager.getAction(steps[0]);
  if (steps.length === 1 && first?.effect === 'along path' && first.params.pattern) {
    const [x, y] = first.params.path[0];
    const { kind, path } = randomPattern({ x, y }, get(p5CanvasSize), first.params.pattern);
    actionManager.updateParams(steps[0], { pattern: kind, path });
  } else {
    const name = nameOf(steps);
    const selected = steps.length > 1 ? wrapInGroup(steps, name) : steps[0];
    const selectedAction = actionManager.getAction(selected);
    if (!selectedAction) return;
    const { kind, path } = randomPattern(getOrigin(selectedAction) ?? { x: 0, y: 0 }, get(p5CanvasSize));
    const added = actionManager.append(createAlongPathAction([selected], path, 0, { pattern: kind, title: name }))!;
    actionManager.replaceId(selected, added);
    selectedActionID.set(added);
  }
  saveToHistory('Random pattern');
}

//this is a weird but awesome one
//"find the pattern" button, sort of
function convertToPathType(actions: Action[]) {
  let convertedActions: { [uuid: string]: Action } = {};
  let path = [];
  let children: { [uuid: string]: Action } = {};

  if(actions.length < 1) return;
  else if(actions.length === 1) {
    let action = actions[0];
    // If it's already a path type or is inside a path type, do nothing
    if (action.name === 'along path' || isChildOfAlongPath(action.uuid)) {
      return;
    } else if(action.name === 'spiro') {
      path = getSpiroPoints(action.params);
      let line = effectNameToActions('straight line', { start: path[0], end: path[path.length - 1], color: action.params.color, lineWeight: 2 });
      if (line) {
        children = line;
      }
    }
    else if(action.name === 'speckles') {
      path = getSpecklesPoints(action.params);
      let circle = effectNameToActions('circle', { radius: 1, color: action.params.color });
      if(circle) {
        children = circle;
      }
    }
  }
  else if(actions.length > 1) {
    //make sure none are along path actions, or inside an along path
    //look for coordinate types in the params (position, start, end)
    //if there are at least 2, collect the positions and create a path
  }

  if(path.length > 0 && Object.keys(children).length > 0) {
    let alongPath = createAlongPathAction(Object.keys(children), path);
    convertedActions = { ...alongPath, ...children };
  }

  return Object.keys(convertedActions).length > 0 ? convertedActions : null; //just for now return null if we didn't do anything to the action

  //if it's already a path type, do nothing
  //if it contains a path type or is inside a path type, do nothing
  //if(action.name === 'along path' || isChildOfAlongPath(action.uuid)))

  //else if it is a single object:
    //if it is a type that has computed points, get those points and convert to path type
    //these include speckles and spiro
    // action.name === 'spiro'
    // action.name == 'speckles'
    //create a new along path type
    //create a small circle for speckles, and a line for spiro and place inside along path

  //else if it is one or more objects and they have at least two coordinates
    //create a new path type
    //get the coordinates and populate the path
    //put all the objects inside the along path
}

//like the reverse of convert to path type
function explode(action: Action) {
  //if it's an along path, unroll it and convert to individual actions
}

export function isChildOfAlongPath(id:string) {
  let parent = Object.values(get(flatActionStore))
                     .find(action => action.type === 'list' && action.effect === 'along path' && action.params.children && action.params.children.includes(id));
  if(parent) {
    return true;
  }
  return false;
}

export function isChildOfDoEach(id:string) {
  let parent = Object.values(get(flatActionStore))
                    .find(action => action.type === 'list' && action.effect === 'do each' && action.params.children && action.params.children.includes(id));
  if(parent) {
    return true;
  }
  return false
}


// `pattern`: the kind of random pattern its path is, if it's one (see randomPatternForSelected)
function createAlongPathAction(children: string[], path: number[][], angle: number = 0, { pattern, title }: { pattern?: PatternKind, title?: string } = {}) {
  let action: Action = {
    uuid: uuidv4(),
    name: 'along path',
    type: 'list' as const,
    category: 'control',
    effect: 'along path',
    params: {
      title: title || "untitled",
      children: children,
      path: path,
      angle: angle,
      ...(pattern ? { pattern } : {})
    },
    hidden: false,
  };
  return { [action.uuid]: action };
}

// make a copy of the action to be able to draw with it
export function redrawSelectedAction() {
  saveToHistory("start redraw");
  let selected = get(selectedActionID);
  if(selected.length < 1) return;

  // let newAction = actionManager.replaceWithCopy(selected);
  let newAction = copyAction(selected);
  let id = getRoot(newAction);
  if(newAction && id && id.length > 0) {
    setCurrentEffect(newAction[id].effect);

    actionManager.appendChild(newAction, get(actionRoot).uuid);
    // selectedActionID.set('');
    actionManager.delete(get(stagedActionID));
    stagedActionID.set(id);
    // console.log("staged action", get(stagedAction));
  }
  renderRequested.set(true);
}



/* THESE ONLY RETURN VALUES */

function getActionsInRunOrder() {
  let root = get(actionRoot);
  if(!root) return;
  let actionsInRunOrder = getDescendantIDs(get(flatActionStore), root.uuid);
  // console.log("actions in run order", actionsInRunOrder);
  return actionsInRunOrder;
}

type CompiledAction = {
  actionID: string;
  indexedID?: string; // action id with loop index appended
  parentID?: string; // parent control structure id eg. do each or repeat
  parentEffect?: string; // parent control structure effect
  stroke?: string; // the brush stroke ('along path') it's drawn along, if any
  transform?: Transform; // how the groups it's in move and turn it
  effect: string;
  params: { [key: string]: any };
};


// export function getActionsBefore(action: Action, stopActionID?: string): string[] {
//   if (!action || action.hidden) return [];

//   // Stop at the specified action
//   if (action.uuid === stopActionID) return [];

//   let actionIDs: string[] = [action.uuid];

//   if (action.children) {
//     for (let child of action.children) {
//       actionIDs.push(...getActionsBefore(child, stopActionID));
//     }
//   }

//   return actionIDs;
// }

export function updateActiveActions(active:string[]): null {
  // console.log("updating active actions", active);
  let unique = [...new Set(active)]; //eliminate duplicates
  activeIDs.set(unique);
  // console.log("active actions", unique.map(action => action.substring(0, 6) + "..."));
  return null;
}

export function addToActiveActions(id:string): null {
  let active = get(activeIDs);
  active.push(id);
  updateActiveActions(active);
  return null;
}

export function compileActionsBeforeStaged() {
  return compileActionsBefore(get(stagedActionID));
}

let renderAll = false; //for debugging - set to true to render all actions, not just until staged action
export function compileActionsBefore(id: string) {
  let actions = compileActions(get(flatActionStore)[get(actionRootID)]);
  if(!actions) return [];
  if(renderAll) return actions;
  let actionIndex = actions.findIndex(action => action.actionID === id);
  let actionsBefore = actions.slice(0, actionIndex);
  return actionsBefore;
}


type OverrideParams = {
  offset?: { x: number, y: number },
  nextOffset?: { x: number, y: number }|null,
  stroke?: string, // the brush stroke whose path the actions are drawn along
};

function add(point1: { x: number, y: number }, point2: { x: number, y: number }) {
  return { 
    x: point1.x + point2.x, 
    y: point1.y + point2.y 
  };
}

function subtract(point1: { x: number, y: number }, point2: { x: number, y: number }) {
  return { 
    x: point1.x - point2.x, 
    y: point1.y - point2.y 
  };
}

function getOrigin(action: Action): { x: number; y: number } | null {

  switch(action.effect) {
    case 'along path':
      // console.log("along path, getting origin", action.params.path[0]);
      if(action.params.path.length > 0 && action.params.path[0].length > 1) {
        return { 
          x: action.params.path[0][0],
          y: action.params.path[0][1] 
        };
      }
    // iterate over children, call get origin param on each child until something returned
    case 'do each':
      let children = action.params.children;
      if (children.length > 0) {
        for (let i = 0; i < children.length; i++) {
          let childAction = get(flatActionStore)[children[i]];
          let origin = getOrigin(childAction);
          if (origin !== null) {
            // console.log("found origin in child", origin);
            return origin;
          }
        }
      }
      break;
      
      // otherwise, does it have a path widget / location?
      default:
        // debugger;
        if(action.params.path) {
          // console.log("there's a path here", action.params.path[0]);
          return {
            x: action.params.path[0][0],
            y: action.params.path[0][1]
          };
        }
        else if('position' in action.params) {
          // console.log("position found", action.params.position);
          return { ...action.params.position };
        } else if('start' in action.params && 'end' in action.params) {
          return { ...action.params.start };
        }
        break;
    }
  return null;
}

// A group (made with "label") can be moved and turned, carrying everything drawn inside it along. (A solid
// fill still covers the whole canvas, since p5's background() isn't moved.)

// The points that place what an action draws (its position, line ends and path points), moved by any groups
// it's in
function placingPoints(action: CompiledAction): Point[] {
  const { position, start, end, path } = action.params;
  const points: Point[] = [position, start, end].filter(point => point && typeof point.x === 'number');
  if (Array.isArray(path)) points.push(...path.map(([x, y]: [number, number]) => ({ x, y })));
  return action.transform ? points.map(point => movePoint(action.transform!, point)) : points;
}

// The middle of what a group draws: the middle of the box around its placing points, to the nearest pixel
// (like every position setting), or null if none of its steps is placed anywhere (a fill, say). A group
// turns around it.
function contentsMiddle(actions: CompiledAction[]): Point | null {
  const points = actions.flatMap(placingPoints);
  if (points.length === 0) return null;
  const xs = points.map(p => p.x), ys = points.map(p => p.y);
  return { x: Math.round((Math.min(...xs) + Math.max(...xs)) / 2), y: Math.round((Math.min(...ys) + Math.max(...ys)) / 2) };
}

// Where the middle of a group's steps is before the group moves; its position setting shows it moved.
export function groupMiddle(children: string[]): Point {
  const actions = children.flatMap(id => compileActions(get(flatActionStore)[id]));
  const { width, height } = get(p5CanvasSize);
  return contentsMiddle(actions) ?? { x: width / 2, y: height / 2 };
}

// Moves and turns the actions drawn in a group by its `moveBy` and `angle`, around their middle
function moveWithGroup(actions: CompiledAction[], params: { moveBy?: Point, angle?: number }) {
  const moveBy = params.moveBy ?? { x: 0, y: 0 };
  const angle = params.angle ?? 0;
  if (!moveBy.x && !moveBy.y && !angle) return;
  const { width, height } = get(p5CanvasSize);
  const middle = contentsMiddle(actions) ?? { x: width / 2, y: height / 2 };
  const transform = turnAndMove(middle, angle, moveBy);
  for (const action of actions) {
    action.transform = action.transform ? followedBy(action.transform, transform) : transform;
  }
}

// Recursively compile information about actions for rendering
export function compileActions(action: Action, parentID?: string, overrides:OverrideParams = {}): CompiledAction[] {
  // Return empty arrays if the action is undefined or null
  if (!action) return [];

  let actions: CompiledAction[] = [];

  // Skip hidden actions
  if ('hidden' in action && action.hidden) {
    return [];
  }

  switch (action.effect) {
    case 'do each': {
      actions.push({ // add parent action to the list also, to make sure outer blocks are shown as active 
        actionID: action.uuid,
        parentID: parentID,
        effect: action.effect,
        params: {}
      });
      // For each child action, recursively compile its actions
      const childActions: CompiledAction[] = [];
      for (let childID of action.params.children) {
        const childAction = get(flatActionStore)[childID];
        childActions.push(...compileActions(childAction, action.uuid, overrides));
      }
      if (action.uuid !== get(actionRootID)) moveWithGroup(childActions, action.params); // not the recipe itself
      actions.push(...childActions);
      break;
    }
      
    case 'along path':
        actions.push({ // add parent action to the list also, to make sure outer blocks are shown as active 
          actionID: action.uuid,
          parentID: parentID,
          effect: action.effect,
          params: {},
        });

        // We want basePoint for the first action in the path to be the basePoint passed in in overrides
        // override.basePoint = offset + path[0]
        // offset = override.basePoint - path[0]
        // for each point in the path add offset

        //for each child action, after the params are modified, getOrigin should return the path point

          // let firstPoint = action.params.path[0];
          // let offset = { x: 0, y: 0 };

        // override.basePoint = offset + path[0]
        // so offset = override.basePoint - path[0]

        // If the action has a path, create a compiled action for each point or line segment along the path
        action.params.path.forEach((point: [number, number], index: number) => {
          // Determine the child ID based on the current index and wrap around if necessary
          const childID = action.params.children[index % action.params.children.length];
          // Retrieve the corresponding action
          const childAction = get(flatActionStore)[childID];
          if(!childAction) return;
          let childOrigin = getOrigin(childAction) ?? { x: 0, y: 0 };
          // console.log(index, "retrieved child origin", getOrigin(childAction));
          
          let childOffset = subtract(overrides.offset?? {x: 0, y: 0}, childOrigin);
          let nextOffset = null;

          // Initialize currPoint with the current point's coordinates
          let currPoint = { x: point[0], y: point[1] };
          let nextPoint;

          // If there's only one point in the path, use the same point as nextPoint
          if (action.params.path.length == 1) {
            nextPoint = currPoint;
          }
          // If not the last point, set nextPoint to the coordinates of the next point in the path
          else if (index < action.params.path.length - 1) {
            nextPoint = { x: action.params.path[(index + 1)][0], y: action.params.path[(index + 1)][1] };
            // debugger;
          }
          // If it's the last point, set nextPoint to null
          else {
            nextPoint = null;
          }

          let currOffset = add(currPoint, childOffset);
          if(nextPoint) {
            nextOffset = add(nextPoint, childOffset);
          }
          
          // if(nextPoint && overrides.nextOffset) {
          //   nextPoint = add(nextPoint, overrides.nextOffset);
          // }

          // Merge the basePoint and nextPoint with the existing overrides
          let modifiedOverrides = {...overrides, offset: currOffset, nextOffset: nextOffset, stroke: action.uuid};

          // Compile the actions for the child action with the modified overrides
          actions.push(...compileActions(childAction, action.uuid, modifiedOverrides));
        });
      break;

    case 'repeat':
      const repeatCount = action.params.count || 1;
      for (let i = 0; i < repeatCount; i++) {
        action.params.children.forEach((childID: string) => {
          const childAction = get(flatActionStore)[childID];
          actions.push(...compileActions(childAction, action.uuid, overrides));
        });
      }
      break;
    default:
      // Initialize an empty object for modified parameters
      let modifiedParams = {...action.params};
      let skipAction = false;

      if(overrides.offset) {
        if ('position' in action.params) {
          // If the child action has a position parameter, use the current point
          modifiedParams.position = add(action.params.position, overrides.offset);
           // If the child action has start and end parameters, use the current and next points
        } else if ('start' in action.params && 'end' in action.params) {
          if(overrides.nextOffset !== null && overrides.nextOffset !== undefined) {
            // debugger;
            modifiedParams.start = add(action.params.start, overrides.offset);
            // WARNING: The end is computed by adding the next offset to the start not the end
            //   this is because we want the end to be at start of next action
            modifiedParams.end = add(action.params.start, overrides.nextOffset);
          } else {
            skipAction = true;
          }
        }
      }

      // console.log("modified params", modifiedParams);
      // Push the compiled action with the modified parameters
      if(!skipAction) {
        actions.push({
          actionID: action.uuid,
          // indexedID: action.uuid, // TODO: + `__${index}`,
          parentID: action.uuid,
          // parentEffect: action.effect,
          stroke: overrides.stroke,
          effect: action.effect,
          params: modifiedParams
        });
      }
  }
  // debugger;
  return actions;
}


// //recursive function to get info about all actions to render
// export function compileActions(action: Action, parentID?: string): CompiledAction[] {

//   // Return an empty array if the action is undefined or null
//   if(!action) return [];

//   let actions: CompiledAction[] = [];

//   // Skip hidden actions, except for the staged action
//   if ('hidden' in action && action.hidden && action.uuid != get(stagedActionID)) { // Skip hidden actions, except staged action
//     return [];
//   }

//   switch (action.effect) {
//     case 'do each':
//       // For each child action, recursively compile its actions
//       action.params.children.forEach((childID: string) => {
//         const childAction = get(flatActionStore)[childID];
//         actions.push(...compileActions(childAction, action.uuid));
//       });
//       break;
//     case 'along path':
//       if (action.params.path) {
//         // If the action has a path, create a compiled action for each point along the path
//         action.params.path.forEach((point: [number, number], index: number) => {
//           // Use modulo operator to cycle through children for each point
//           const childID = action.params.children[index % action.params.children.length];
//           const childAction = get(flatActionStore)[childID];
    
//           // Set position of each render action to current point along the path
//           const modifiedParams = {
//             ...childAction.params,
//             position: { x: point[0], y: point[1] } // Use the current point for position
//           };
    
//           // Add the modified action to the list with a loop index appended to parent ID
//           actions.push({
//             actionID: childAction.uuid + `_${index}`, // Unique ID for each compiled action along the path
//             parentID: action.uuid, // Set parentID to current action's UUID
//             effect: childAction.effect,
//             params: modifiedParams
//           });
//         });
//       }
//       break;
//     case 'repeat':
//       // Repeat the child actions a specified number of times (unroll the loop)
//       // no loop index saved to ID currently
//       const repeatCount = action.params.count || 1;
//       for (let i = 0; i < repeatCount; i++) {
//         action.params.children.forEach((childID: string) => {
//           const childAction = get(flatActionStore)[childID];
//           actions.push(...compileActions(childAction, action.uuid));
//         });
//       }
//       break;
//     default:
//       actions.push({
//         actionID: action.uuid,
//         parentID: parentID, // Include parentID if this action is nested
//         effect: action.effect,
//         params: action.params
//       });
//   }
//   return actions;
// }








/* THESE FUNCTIONS ARE ONLY CALLED INTERNALLY */


// function reloadAction(id:string) { //replace action with a new copy of itself in same location
//   let newActions = copyAction(id);
//   let newActionRoot = getRoot(newActions);
//   if(newActionRoot) {
//     // showAction(newActionRoot);
//     appendToActionStore(newActions);
//     replaceIdWith(id, newActionRoot);
//     stagedActionID.set(newActionRoot);
//   }
// }

function isChildActive(parentEffect, parentParams, childID) {
  //do each and along path might be different, eg. stop after certain iterations along path
}

function closeAllModals() {

}

function addEffectToActionStoreAsChildOf(effect: Effect, params: { [key: string]: any } = {}, uuid: string) {
  let actions = effectToActions(effect, params);
  if(actions) return actionManager.appendChild(actions, uuid);
}

function effectNameToActions(name: string, params: { [key: string]: any } = {}) {
  let effect = get(toolStore).find(tool => tool.name === name);
  if(!effect) return;
  return effectToActions(effect, params);
}

function effectToActions(effect: Effect, params: { [key: string]: any } = {}) {
  let actions: { [uuid: string]: Action } = {};

  if(!effect) return;

  // nested types
  if(effect.name === 'along path' || effect.name === 'do each') {
    if(effect.nestedActions) {
      let mergedParams = merge(deepCopy(effect.nestedActions['uuid_parent'].params), deepCopy(params)); // just top level action params
      let newActions = deepCopy(effect.nestedActions);
      newActions['uuid_parent'].params = mergedParams;

      newActions['uuid_parent'].textLabel = effect.textLabel;
      newActions['uuid_parent'].hidden = false;
      newActions['uuid_parent'].mouseActionType = effect.mouseActionType;

      newActions = updateUUIDsPreservingHierarchy(newActions);
      actions = newActions;
    }
  }
  else {  // TODO: actions could just be effects with a UUID to make this all less confusing
    let mergedParams = merge(deepCopy(effect.params), deepCopy(params));
    const action: Action = {
      name: effect.name,
      type: "effect" as const,
      category: effect.category,
      effect: effect.name,
      textLabel: effect.textLabel,
      params: mergedParams,
      uuid: uuidv4(),
      pinned: effect.pinnedByDefault,
      hidden: false,
      mouseActionType: effect.mouseActionType,
    };
    actions[action.uuid] = action;
  }
  return actions;
}

// if action has children, put them into nestedActions form
// todo: it would be better to just have actions and effects be the same type!
export function actionToEffect(actions: ActionStore) {
  if (!actions || Object.keys(actions).length === 0) return;

  const parentUuids = Object.keys(actions).filter(uuid => {
    const action = actions[uuid];
    return action.type === 'list' && action.params && Array.isArray(action.params.children);
  });

  if (parentUuids.length === 0) return;

  const parentAction = actions[parentUuids[0]];
  let nestedActions = {} as ActionStore;

  parentAction.params.children.forEach(childUuid => {
    nestedActions[childUuid] = actions[childUuid];
  });

  return {
    name: parentAction.name,
    textLabel: parentAction.params.title,
    category: parentAction.category,
    nestedActions: nestedActions,
    tags: 'mytools'
  };
}












//take a flat list of actions, change all uuids to new ones but preserve hierarchy
function updateUUIDsPreservingHierarchy(actions: { [uuid: string]: Action }): { [uuid: string]: Action } {
    // A mapping of old UUIDs to new UUIDs
    const uuidMap: { [uuid: string]: string } = {};

    // Create a new UUID for each action and store it in the map
    for (const uuid in actions) {
        uuidMap[uuid] = uuidv4();
    }

    // Clone the actions object and update the UUIDs
    const updatedActions: { [uuid: string]: Action } = {};
    for (const oldUuid in actions) {
        const newUuid = uuidMap[oldUuid];
        const action = actions[oldUuid];
        
        // Clone the action with a new UUID
        const updatedAction: Action = {
            ...action,
            uuid: newUuid,
            params: { ...action.params }
        };

        // If the action has children, update their UUIDs
        if (action.type === 'list' && action.params.children) {
           updatedAction.params.children = action.params.children.map((childUuid: string) => uuidMap[childUuid]);
        }

        updatedActions[newUuid] = updatedAction;
    }

    return updatedActions;
}

function getRoot(actions: { [uuid: string]: Action }) : string | null {
  for (let uuid in actions) {
    let isChild = Object.values(actions).some(item => item.params.children?.includes(uuid));
    if (!isChild) {
      return uuid;
    }
  }
  return null; // Return null if no root action is found
}

function getSiblings(id:string) {
  let parent = Object.values(get(flatActionStore)).find(action => action.type === 'list'
                                                        && action.params.children
                                                        && action.params.children.includes(id));

  if(!parent) return;

  let siblings = parent.params.children;
  return siblings;
}

function getNextSelection(id:string) {
  let parent = Object.values(get(flatActionStore)).find(action => action.type === 'list'
                                                        && action.params.children
                                                        && action.params.children.includes(id));

  if (!parent || (parent.uuid === get(actionRootID) && parent.params.children.length <= 1)) return '';

  let siblings = parent.params.children;
  if (siblings === undefined) return;

  let index = siblings.indexOf(id);

  if (index === -1) return ''; // Return if the item is not found

  // Return previous sibling if it exists
  if (index > 0) {
    return siblings[index - 1];
  } 
  // Return next sibling if there's no previous one and it's not the last item
  else if (index < siblings.length - 1) {
    return siblings[index + 1];
  } 
  // Return parent if it's not the root and there are no valid siblings
  else if (parent.uuid !== get(actionRootID)) {
    return parent.uuid;
  }
}



//includes root
function getDescendantActions(id:string) {
  const currentAction = get(flatActionStore)[id];
  let descendants = [currentAction];

  if (currentAction && currentAction.type === 'list' && currentAction.params.children) {
    currentAction.params.children.forEach(childId => {
      const childDescendants = getDescendantActions(childId);
      // console.log("descendants", childDescendants);
      descendants = descendants.concat(childDescendants);
    });
  }
  return descendants;
}

//includes root
export function getDescendantIDs(store:ActionStore, id:string) {
  const currentAction = store[id];
  if (!currentAction) return [];

  let descendants = [currentAction.uuid];

  if (currentAction.type === 'list' && currentAction.params.children) {
    currentAction.params.children.forEach(childId => {
      const childDescendants = getDescendantIDs(store, childId);
      descendants = descendants.concat(childDescendants); // Concatenates the UUIDs
    });
  }

  return descendants;
}

  // make a copy with new uuids
  function copyAction(id:string) {
    if (!id || !get(flatActionStore)[id]) return;

    let descendants = arrayToKeyedObj(getDescendantActions(id), 'uuid');
    let newActions = deepCopy(descendants);

    newActions = updateUUIDsPreservingHierarchy(newActions);
    return newActions;
  }


// function addActionToActionStore(action: Action, params: { [key: string]: any } = {}) {
//   // console.log("adding action to action store");
//   let newAction = {...action};
//   newAction.uuid = uuidv4();

//   selectAction(newAction.uuid); //mark action as selected in the list (most recently added)

//   let mergedParams = action.params;
//   if(params && action.params) {
//     mergedParams = merge(action.params, params);
//   }
//   newAction.params = mergedParams;





//   flatActionStore.update(storeValue => {
//     let newActions = {...storeValue};
//     newActions[newAction.uuid] = newAction;
//     newActions[get(actionRoot).uuid].params.children.push(newAction.uuid); //add child to root
//     // console.log("adding action to flat action store", newActions);
//     return newActions;
//   });





//   return newAction.uuid;
// }

    // if (action.category === 'backgrounds') {
    //   // Insert backgrounds before the first item in the list that is not a background
    //   const firstNonBackgroundIndex = storeValue.children.findIndex(child => child.category !== 'backgrounds');
    //   if (firstNonBackgroundIndex === -1) {
    //     storeValue.children.push(newAction);
    //   } else {
    //     storeValue.children.splice(firstNonBackgroundIndex, 0, newAction);
    //   }
    // } else if 
    // if(action.category === 'stencils') {
      // Insert stencils at the end of the list
    // } else {
      // For other types, insert after the last item in the list that is not a background or stencil
      // const lastSpecialIndex = storeValue.children.reduce((lastIndex, child, index) => {
      //   return (child.category !== 'backgrounds' && child.category !== 'stencils') ? index : lastIndex;
      // }, -1);
      // storeValue.children.splice(lastSpecialIndex + 1, 0, newAction);
    // }


// to delete from flat action store:
// remove uuid from parent's children array
// then delete action from flat action store

// export function deleteSelectedAction() {
//   let actions = get(actionStore);
//   if(actions && actions.children) {
//     let action = actions.children.find(action => action.uuid === get(selectedActionID));
//     if(action) {
//       deleteActionFromActionStore(action);
//     }
//   }
// }

// export function deleteActionFromActionStore(actionToDelete: Action) {
//   actionStore.update(storeValue => {
//     if (storeValue.children) {
//       // Filter out the action to delete by comparing the uuid
//       storeValue.children = storeValue.children.filter(action => action.uuid !== actionToDelete.uuid);
//     }
//     return storeValue;
//   });

//   saveToHistory();
// }



//for now, use selectedActionID
function makeNamedGroup() {
  //get selected action
  let actions = get(actionStore);
  if(actions && actions.children) {
    let action = actions.children.find(action => action.uuid === get(selectedActionID));
  }

  //make a new action that is a named group
  //add selected action as child of new group (this should work the same as dragging an action into a group)
  //select text of new group so user can type a name
}


  // let action = effectToAction(effect, params);
  // console.log("the action", action);

  //TODO: save previous staged action in undo / revert queue
  // if(action) {
  //   stagedAction.set(action.uuid);
  // }

// to do: for re-record? sample?
// export function copySelectedActionToStagedAction() {
//   let actions = get(actionStore);
//   if(actions && actions.children) {
//     let action = actions.children.find(action => action.uuid === get(selectedActionID));
//     if(action) {
//       stagedAction.set(action);
//     }
//   }
// }

// export function setActionThumbnail(action:Action, thumbnail:string) {
//   actionStore.update(storeValue => {
//     // storeValue.children = storeValue.children || [];
//     // let index = storeValue.children.indexOf(action);
//     // storeValue.children[index].thumbnail = thumbnail;
//     return storeValue;
//   });
// }






  
