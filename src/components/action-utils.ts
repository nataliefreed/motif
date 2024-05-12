import type { Action, Effect, ActionStore } from '../types/types';
import { v4 as uuidv4 } from 'uuid';
import { actionRootID, activeIDs, actionStore, myTools, toolStore, selectedActionID, selectedEffect, changedActionID, flatActionStore, actionRoot, stagedAction, stagedActionID, currentColor, shouldRandomizeColor, playheadID, hoveredActionID, renderRequested, isPlaying, renderDelay, currentlyRenderingActionID, playSpeed, firstPlay } from '../stores/dataStore'
import { saveToHistory } from '../stores/history';
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
  updateParams(id: string, params: { [key: string]: any }) {
    this.#modifyActionStore(id, (store) => {
      const action = store[id];
      if (action) {
        action.params = { ...action.params, ...params };
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
    stagedActionID.set(undoState.stagedActionID);
  }

  redo() {
    let redoState = historyStore.redo();
    if (!redoState) return;
    stagedActionID.set(redoState.stagedActionID);
    this.#modifyActionStore(null, (store: ActionStore) => {
      Object.assign(store, redoState.actionStore);
    });
  }

  refresh() {
    // update store to trigger re-render
    this.#modifyActionStore(null, (store) => store);
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

export async function scrollToAction(id: string) {
  await tick(); // Wait for the DOM to update with the new item
  const element = document.getElementById(`${id}`);
  // console.log("scrolling to element:", element);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center', // align the bottom of the new item with the center of the viewport
      inline: 'nearest' // keep the horizontal alignment as it is
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
  // else {
  //   actionManager.insertBefore(stagedID, nextSib); // if it is at the end, move to the beginning
  // }
}

export function stepBackward() {
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
}

// let playInterval: Timeout | null = null;

let firstPlayDone = false;
export function play() {
  if(firstPlayDone) {
    firstPlay.set(true);
  }
  else {
    firstPlayDone = true;
  }
  moveStagedActionToEnd();
  isPlaying.set(true);
  renderDelay.set(1000/get(playSpeed));
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
  isPlaying.set(false);
  renderDelay.set(0);
  // actionManager.refresh();
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
      selectedActionID.set(''); //deselect
    } else {
      selectedActionID.set(id);
    }
  }
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

// remove action initiated from UI
export function removeSelectedAction() {
  let id = get(selectedActionID);
  if(id.length < 1 || !id || !get(flatActionStore)[id] || id == get(stagedActionID)) return;
  //get new selection
  actionManager.delete(id);
  saveToHistory("remove selected action");
  // if deleted, select new selection
}

// gradually clear actions from bottom to top
export function clearAllActions() {
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
        selectedActionID.set('');
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
  updateStagedActionColor(get(currentColor));
}

export function addCurrentEffectAsStagedAction() {
  let effect = get(selectedEffect);
  // let params = { color: get(currentColor) };
  if(!effect) return;
  addEffectAsStagedAction(effect, {});
}

// bubbled up by UI widgets
export function updateActionParams(uuid:string, params:any, save = false) {
  if (!uuid) return;

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

  actionManager.append(newActions);
  actionManager.insertBefore(newActionRoot, stagedID);
  selectAction(newActionRoot);

  // playheadID.set(newActionRoot);

  changedActionID.set(newActionRoot);

  saveToHistory("add action from staged action end");

  moveStagedActionToEnd();
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

export function updateStagedActionColor(color:string) {
  //look for color in params, including children for along path
  let stagedID = get(stagedActionID);
  if(!stagedID) return;
  let params = get(flatActionStore)[stagedID].params;
  if(!params) return;

  if('color' in params) {
    updateStagedAction({ color: color });
  }
  else if('children' in params) {
    let children = params.children;
    for(let childID of children) {
      let child = get(flatActionStore)[childID];
      if('color' in child.params) {
        actionManager.updateParams(childID, { color: color });
        // make color a little different for the next child
        color = tinycolor(color).darken(30).toHexString();
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
  if(!effect) return;
  selectedEffect.set(effect);
}

let changeOptions = {
  'color': (value:string) => { return curatedRandomHexColor() },
  'radius': (value:number) => { return randomWithinRange(value, 5, 300, 20) },
  'r1': (value:number) => randomWithinRange(value, 5, 300, 20),
  'r2': (value:number) => randomWithinRange(value, 5, 200, 20),
  'npoints': (value:number) => randomWithinRange(value, 3, 50, 5),
  'nsides': (value:number) => randomWithinRange(value, 3, 50, 5),
  'width': (value:number) => randomWithinRange(value, 5, 600, 20),
  'height': (value:number) => randomWithinRange(value, 5, 600, 20),
  'angle': (value:number) => randomWithinRange(value, 0, 360, 20),
  'outer': (value:number) => randomWithinRange(value, 5, 300, 20),
  'inner': (value:number) => randomWithinRange(value, 5, 200, 20),
  'position' (value:{x:number, y:number}) { return { x: Math.round(value.x + (Math.random() - 0.5) * 10), y: Math.round(value.y + (Math.random() - 0.5) * 10) } },
  'path': (value:[[number, number]]) => value.map(point => [point[0] + (Math.random() - 0.5) * 10, point[1] + (Math.random() - 0.5) * 10]),
}

export function remixDuplicate(id:string) {
  let newID = duplicateAction(id);
  if(newID) remixAction(newID);
}

// pick a parameter at random and change it
export function remixAction(id:string) {
  saveToHistory("remix action start");
  if(!id || ! get(flatActionStore)[id]) return;

  let action = get(flatActionStore)[id];
  let params = action.params;
  let newParams = { ...params };
  let paramNames = Object.keys(params);

  if(action.effect === 'along path') {
    //remix the path by wiggling each point a bit
    let newPath = changeOptions.path(params.path);
    newParams.path = newPath;
    //todo: change the items in the children array
  }
  else if(action.effect === 'do each') {
    // pick a random child and remix it
    let child = params.children[Math.floor(Math.random() * params.children.length)];
    remixAction(child); // how do we get this update to actionStore?
  }
  else {
    // always change color if it exists
    if ('color' in params) {
      newParams.color = changeOptions.color(params.color);
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
  saveToHistory("remix action end");
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

// put action inside a repeat along path
export function repeatSelectedActionAlongPath() {
  let selected = get(selectedActionID);
  if(selected.length < 1) return;

  let selectedAction = actionManager.getAction(selected);
  if (!selectedAction) return;

  // Check if the selected action is already a repeat along path
  if (selectedAction.effect === 'along path') {
    // If it is, add another point along the path
    // let lastPoint = selectedAction.params.path[selectedAction.params.path.length - 1];
    // selectedAction.params.path.push([lastPoint[0] + 20, lastPoint[1] + 20]);
    // actionManager.updateParams(selected, { path: selectedAction.params.path });
  } else { //todo: make sure it's not a child of an along path
    // If it's not a repeat, create a new "repeat along path" action with the selected action as a child
    let x = selectedAction.params.position ? selectedAction.params.position.x : 0;
    let y = selectedAction.params.position ? selectedAction.params.position.y : 0;
    let newPath = getRandomGridPath(x, y);
    // let newPath = [[x, y], [x + 20, y + 20]];

    // Create a new "repeat along path" action with the selected action as a child
    let newAlongPath = createAlongPathAction([selected], newPath);
    let added = actionManager.append(newAlongPath);

    // Replace the selected action with the new "repeat along path" action
    actionManager.replaceId(selected, added);
    selectedActionID.set(added); // Update the selected action ID
  }

  saveToHistory('Repeat selected action along path');
}

function getRandomGridPath(x:number, y:number) {
  let path = [];
  let w = 500-x; //starting at x, y
  let h = 500-y;
  
  let numRows = Math.ceil(Math.random() * 9);
  let numCols = Math.ceil(Math.random() * 9);

  let rowSpacing = w / numRows;
  let colSpacing = h / numCols;

  for(let i = 0; i < numRows; i++) {
    for(let j = 0; j < numCols; j++) {
      path.push([x + i * rowSpacing, y + j * colSpacing]);
    }
  }

  return path;

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
                     .find(action => action.type === 'list' && action.params.children && action.params.children.includes(id));
  if(parent && parent.effect === 'along path') {
    return true;
  }
  return false;
}


function createAlongPathAction(children: string[], path: number[][]) {
  let action: Action = {
    uuid: uuidv4(),
    name: 'along path',
    type: 'list',
    category: 'control',
    effect: 'along path',
    params: {
      title: "Custom Repeat Along Path",
      children: children,
      path: path,
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
    setCurrentEffect(get(stagedAction).effect); //TODO: make this work for different types of along path effects
    actionManager.appendChild(newAction, get(actionRoot).uuid);
    selectedActionID.set('');
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

export function compileActionsBefore(id: string) {
  let actions = compileActions(get(flatActionStore)[get(actionRootID)]);
  if(!actions) return [];
  let actionIndex = actions.findIndex(action => action.actionID === id);
  let actionsBefore = actions.slice(0, actionIndex);
  return actionsBefore;
}

// Recursive function to compile information about actions for rendering
export function compileActions(action: Action, parentID?: string) {
  // Return empty arrays if the action is undefined or null
  if (!action) return [];

  let actions: CompiledAction[] = [];

  // Skip hidden actions
  if ('hidden' in action && action.hidden) {
    return [];
  }

  // //check if it is in the preview action store
  // if(get(previewAction) != null && action.uuid === get(previewAction).uuid) {
  //   action = get(previewAction);
  // }

  switch (action.effect) {
    case 'do each':
      // For each child action, recursively compile its actions
      for (let childID of action.params.children) {
        const childAction = get(flatActionStore)[childID];
        const childActions = compileActions(childAction, action.uuid);
        actions.push(...childActions);
      }
      break;
    case 'along path':
        actions.push({ // add parent action to the list also, to make sure outer blocks are shown as active 
          actionID: action.uuid,
          parentID: parentID,
          effect: action.effect,
          params: {}
        });
        if(!action.params.children) return;
      // If the action has a path, create a compiled action for each point or line segment along the path
        action.params.path.forEach((point: [number, number], index: number) => {
          const childID = action.params.children[index % action.params.children.length];
          const childAction = get(flatActionStore)[childID];
          if(!childAction) return;

          // Initialize an empty object for modified parameters
          let modifiedParams = {};

          //TODO: do this recursively: if the child action is a repeat, compile its actions with a relative path, ie. start at the parent point
          if ('position' in childAction.params) {
            // If the child action has a position parameter, use the current point
            modifiedParams = {
              ...childAction.params,
              position: { x: point[0], y: point[1] }
            };
          } else if ('start' in childAction.params && 'end' in childAction.params) {
            // If the child action has start and end parameters, use the current and next points
            if (index < action.params.path.length - 1) { // Ensure we don't exceed the path array bounds
              const nextPoint = action.params.path[index + 1];
              modifiedParams = {
                ...childAction.params,
                start: { x: point[0], y: point[1] },
                end: { x: nextPoint[0], y: nextPoint[1] }
              };
            }
            else {
              return; //if at last point, don't add another action
            }
          } else {
            // If the child action has neither position nor start/end, use the original parameters
            modifiedParams = { ...childAction.params };
          }

          // console.log("modified params", modifiedParams);
          // Push the compiled action with the modified parameters
          actions.push({
            actionID: childAction.uuid,
            indexedID: childAction.uuid + `__${index}`,
            parentID: action.uuid,
            effect: childAction.effect,
            params: modifiedParams
          });
        });
      break;
    case 'repeat':
      const repeatCount = action.params.count || 1;
      for (let i = 0; i < repeatCount; i++) {
        action.params.children.forEach((childID: string) => {
          const childAction = get(flatActionStore)[childID];
          actions.push(...compileActions(childAction, action.uuid));
        });
      }
      break;
    default:
      actions.push({
        actionID: action.uuid, //the action's unique ID
        parentID: parentID, //the action it is nested within, eg. do each or repeat
        effect: action.effect,
        params: action.params
      });
  }
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
function actionToEffect(actions: ActionStore) {
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






  
