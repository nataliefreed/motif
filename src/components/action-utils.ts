import type { Action, Effect, ActionStore } from '../types/types';
import { v4 as uuidv4 } from 'uuid';
import { actionRootID, actionStore, myTools, selectedActionID, selectedEffect, activeCategory, changedActionID, flatActionStore, actionRoot, stagedAction, stagedActionID, currentColor, shouldRandomizeColor } from '../stores/dataStore'
import { saveToHistory } from '../stores/history';
import { get } from 'svelte/store';
import { deepCopy, merge, randomWithinRange, arrayToKeyedObj } from '../utils/utils';
import tinycolor from "tinycolor2";
import { tick } from 'svelte';


/* THESE FUNCTIONS ARE CALLED BY THE UI */
/* note on saving to history: currently thinking about it as saving before doing something
user-initiated that the user expects to be able to undo. Don't save if it doesn't do anything */

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

export function selectAction(id:string) {
  if(id && id !== get(stagedActionID) && id !== get(actionRootID)) {
    selectedActionID.set(id);
  }
}

// remove action initiated from UI
// maybe this should be removeSelectedAction?
export function removeAction(id:string) {
  if(!id || !get(flatActionStore)[id] || id == get(stagedActionID)) return;

  saveToHistory();

  deleteAction(id);
}

export function clearAllActions() {
  let actions = getActionsInRunOrder(); //IDs
  if(!actions || actions == undefined || actions.length < 1) return;

  saveToHistory();

  console.log("actions to clear", actions);

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
      console.log("second to last item", penultimateItem);
      selectAction(penultimateItem);
    // Remove the last element from the array
    const toRemove = actions.pop();
    console.log("removing", toRemove);
    deleteAction(toRemove);
    changedActionID.set(penultimateItem);
    } else {
        // If no more elements except first, clear the interval
        clearInterval(interval);
        selectedActionID.set('');
        if(newStagedActionRoot) {
          stagedActionID.set(newStagedActionRoot);
          appendToActionStoreAsChildOf(newStagedAction, get(actionRoot).uuid);
        }
        changedActionID.set('');
    }
  }, 300); //rate at which to clear actions
}

// set staged action
export function addEffectAsStagedAction(effect: Effect, params: { [key: string]: any }) {
  // let uuid = addEffectToActionStore(effect, params);
  let prevStaged = get(stagedActionID);
  if(prevStaged.length > 0) deleteAction(prevStaged);
  let uuid = addEffectToActionStoreAsChildOf(effect, params, get(actionRoot).uuid);
  if(uuid) stagedActionID.set(uuid);
}

export function addCurrentEffectAsStagedAction() {
  let effect = get(selectedEffect);
  let params = { color: get(currentColor) };
  if(!effect) return;
  addEffectAsStagedAction(effect, params);
}

// take an effect, create an action, and add to action store
// used by keyboard events
export function addEffectToActionStore(effect: Effect, params: { [key: string]: any } = {}) {
  let actions = effectToActions(effect, params);
  if(actions) return appendToActionStore(actions);
}


export function saveActionAsNewTool(action: Action) {
  if(!action) return;

  let newEffect: Effect;

  if (action.type === 'list' && action.params && Array.isArray(action.params.children)) {
    const actions = copyAction(action.uuid);
    newEffect = actionToEffect(actions) as Effect;
  } else {
    // Handle non-nested actions
    newEffect = {
      name: action.effect + "",
      textLabel: action.effect + "",
      category: action.category,
      tags: 'mytools',
      params: deepCopy(action.params)
    };
  }

  if(!newEffect) return;

  myTools.update(storeValue => {
    if(!storeValue) storeValue = [];
    storeValue.push(newEffect);
    console.log("new tool added to my tools", storeValue);
    activeCategory.set('my tools');
    selectedEffect.set(newEffect);
    return storeValue;
  });
}

export function copyStagedActionToActionStore() {
  let stagedID = get(stagedActionID);
  let newActions = copyAction(stagedID);
  let newActionRoot = getRoot(newActions);
  // console.log("root of new actions", newActionRoot);
  if(!stagedID || !newActions || !newActionRoot) {
    return;
  }
    saveToHistory();
    appendToActionStore(newActions);
    insertIdBefore(newActionRoot, stagedID);
    selectAction(newActionRoot);
    changedActionID.set(newActionRoot);
}

export function updateStagedAction(params) {
  updateActionParams(get(stagedActionID), params);
}


export function loopActionAlongPath(id:string) {
  //set selected action as the child of a repeat along path, with the path set to the current point and a shifted point
  let action = get(flatActionStore)[id];
  if (action) {
    let newAction = { ...action };
    // if already along path, add another point
    if(action.effect === "along path") {
      if(action.params && action.params.path.length > 0) {
        newAction.params.path.push([action.params.path[action.params.path.length-1][0]+10, action.params.path[action.params.path.length-1][1]+10]);
      }
    }
    // if doEach, turn into along path with same name
    // if not along path, add as child of along path with current point and a shifted point with "give me a name" as title 


    // const alongPath = $toolStore.find(tool => tool.name === "along path");
    // if(!alongPath) return;
    // const x = (action.params && action.params.position)? action.params.position.x : 0;
    // const y = (action.params && action.params.position)? action.params.position.y : 0;
    // const newActions = effectToActions(alongPath, {children: [action], path: [[x, y], [x+10, y+10]]});
    //replace selected action with new repeat along path action
    // actionStore.update(data => {
    //   if (data && data.children) {
    //     const index = data.children.findIndex(action => action.uuid === id); //get current index
    //     if (index > -1) {
    //       data.children.splice(index, 1, newActions);
    //       selectedActionID.set(newActions.uuid);
    //     }
    //   }
    //   return data;
    // });

    flatActionStore.update(store => {
      store[id] = newAction;
      return store;
    });
  }
  //   actionStore.update(data => {
  //     if (data && data.children) {
  //       const index = data.children.findIndex(action => action.uuid === $selectedActionID); //get current index
  //       if (index > -1) {
  //         let selectedAction = data.children[index];
  //         if(selectedAction.name === "along path") {
  //           //add another point
  //           if(selectedAction.params && selectedAction.params.path.length > 0) {
  //             selectedAction.params.path.push([selectedAction.params.path[selectedAction.params.path.length-1][0]+10, selectedAction.params.path[selectedAction.params.path.length-1][1]+10]);
  //           }
  //         }
  //         else {
  //           const repeatEffect = $toolStore.find(tool => tool.name === "along path");
  //           if(!repeatEffect) return;
  //           const x = (selectedAction.params && selectedAction.params.position)? selectedAction.params.position.x : 0;
  //           const y = (selectedAction.params && selectedAction.params.position)? selectedAction.params.position.y : 0;
  //           const newActions = effectToActions(repeatEffect, {children: [selectedAction], path: [[x, y], [x+10, y+10]]});
  //           //replace selected action with new repeat along path action
  //           data.children.splice(index, 1, newActions);
  //           // data.children.splice(index+1, 0, newAction);
  //           selectedActionID.set(newActions.uuid);
  //         }
  //       }
  //     }
  //     return data;
  //   });
  // }
}


// todo: have changes go through here so we can deal with temp actions, what to save to history etc.
function updateActionParams(uuid: string, params: { [key: string]: any }) {
  if(!uuid) return;
  flatActionStore.update(store => {
    const action = store[uuid];
    if(action) {
      changedActionID.set(uuid);
      return { ...store, [uuid]: { ...action, params: merge(action.params, params) } }; //update the action in the store
    }
    else {
        console.log("Action not found in store");
        return store;
    }
  });
}


/* THESE FUNCTIONS ARE ONLY CALLED INTERNALLY */

function getActionsInRunOrder() {
  let root = get(actionRoot);
  if(!root) return;
  let actionsInRunOrder = getDescendantIDs(get(flatActionStore), root.uuid);
  // console.log("actions in run order", actionsInRunOrder);
  return actionsInRunOrder;
}

function reloadAction(id:string) { //replace action with a new copy of itself in same location
  let newActions = copyAction(id);
  let newActionRoot = getRoot(newActions);
  if(newActionRoot) {
    appendToActionStore(newActions);
    replaceIdWith(id, newActionRoot);
    stagedActionID.set(newActionRoot);
  }
}

function isChildActive(parentEffect, parentParams, childID) {
  //do each and along path might be different, eg. stop after certain iterations along path
}

function addEffectToActionStoreAsChildOf(effect: Effect, params: { [key: string]: any } = {}, uuid: string) {
  let actions = effectToActions(effect, params);
  if(actions) return appendToActionStoreAsChildOf(actions, uuid);
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
      newActions = updateUUIDsPreservingHierarchy(newActions);
      actions = newActions;
    }
  }
  else { // todo: effects could really just be actions without a specific uuid
    let mergedParams = merge(deepCopy(effect.params), deepCopy(params));
    const action: Action = {
      name: effect.name,
      type: "effect" as const,
      category: effect.category,
      effect: effect.name,
      textLabel: effect.textLabel,
      params: mergedParams,
      uuid: uuidv4(),
      pinned: effect.pinnedByDefault
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

// append but don't assign to any parent
function appendToActionStore(actions: { [uuid: string]: Action }) {
  if(!actions) return;
  let root_uuid = getRoot(actions);
  flatActionStore.update(storeValue => {
    let newActions = {...storeValue};
    for(let uuid in actions) {
      newActions[uuid] = actions[uuid];
    }
    // newActions[get(actionRoot).uuid].params.children.push(root_uuid);
    return newActions;
  });
  return root_uuid;
}

// append to action store as child of specified parent
function appendToActionStoreAsChildOf(actions: { [uuid: string]: Action }, uuid:string) {
  if(!actions) return;
  let root_uuid = getRoot(actions);
  flatActionStore.update(storeValue => {
    let newActions = {...storeValue};
    for(let uuid in actions) {
      newActions[uuid] = actions[uuid];
    }
    if(newActions[uuid]) { //add as child to
      newActions[uuid].params.children.push(root_uuid);
    }
    // newActions[get(actionRoot).uuid].params.children.push(root_uuid);
    return newActions;
  });
  return root_uuid;
}

function addActionToActionStore(action: Action, params: { [key: string]: any } = {}) {
  // console.log("adding action to action store");
  let newAction = {...action};
  newAction.uuid = uuidv4();

  selectAction(newAction.uuid); //mark action as selected in the list (most recently added)

  let mergedParams = action.params;
  if(params && action.params) {
    mergedParams = merge(action.params, params);
  }
  newAction.params = mergedParams;

  flatActionStore.update(storeValue => {
    let newActions = {...storeValue};
    newActions[newAction.uuid] = newAction;
    newActions[get(actionRoot).uuid].params.children.push(newAction.uuid); //add child to root
    // console.log("adding action to flat action store", newActions);
    return newActions;
  });

  return newAction.uuid;
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

function deleteAction(id:string) {

  let selected = get(selectedActionID); 
  if((selected === id)) { //which it often will be for deleting
    selected = getNextSelection(id);
  }
  console.log("deleting", id, "selected is now", selected, get(flatActionStore)[selected]);

  flatActionStore.update(store => {
    if(!store[id]) return store;
    
    // Collect all IDs to delete (the action itself and its descendants)
    let idsToDelete = getDescendantIDs(get(flatActionStore), id);
    let newStore = deepCopy(store);

    // Remove all references to these IDs in other actions' children arrays
    for (let uuid in newStore) {
      if (newStore[uuid].params.children) {
        newStore[uuid].params.children = newStore[uuid].params.children.filter(child => !idsToDelete.includes(child));
      }
    }

    console.log("ids to delete", idsToDelete.toString());

    // Delete the actions themselves
    idsToDelete.forEach(actionId => delete newStore[actionId]);
    
    return newStore;
  });

  selectAction(selected);
}

let changeOptions = {
  'color': (value:string) => { return tinycolor.random().toHexString()},
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
  'path': (value:[[number, number]]) => value.map(point => [point[0] + (Math.random() - 0.5) * 10, point[1] + (Math.random() - 0.5) * 10]),
}

  // pick a parameter at random and change it
  export function remixAction(id:string) {
    if(!id || ! get(flatActionStore)[id]) return;

    let action = get(flatActionStore)[id];
    let params = action.params;
    let newParams = { ...params };
    let paramNames = Object.keys(params);
    if(action.effect === 'along path') {
      //remix the path by wiggling each point a bit
      let newPath = changeOptions.path(params.path);
      newParams.path = newPath;
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
    }
    
    //update store
    flatActionStore.update(store => {
      let newStore = { ...store };
      newStore[id].params = newParams;
      return newStore;
    });
  }

  export function redrawAction(id:string) {
    // go "back in time" to before that action, move that action to stagedAction so user can re-record it
    // when mouse released, fast forward to current time

    let prevStaged = get(stagedActionID);
    stagedActionID.set(id);
  }

//includes root
function getDescendantActions(id:string) {
  const currentAction = get(flatActionStore)[id];
  let descendants = [currentAction];

  if (currentAction && currentAction.type === 'list' && currentAction.params.children) {
    currentAction.params.children.forEach(childId => {
      const childDescendants = getDescendantActions(childId);
      console.log("descendants", childDescendants);
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

  // make a copy with new uuid and add immediately after original
  export function duplicateAction(id:string) {
    if (!id || !get(flatActionStore)[id]) return;
    console.log("duplicating", id);
    let newActions = copyAction(id);
    let root = getRoot(newActions);
    // newAction.params.title = newAction.params.title + " copy";
    if(root) {
      appendToActionStore(newActions);
      insertIdAfter(root, id);
      selectedActionID.set(root);
      saveToHistory();
    }
  }

  function insertIdAfter(newId:string, targetId:string) {
    let parent = Object.values(get(flatActionStore)).find(action => action.type === 'list'
                                                          && action.params.children
                                                          && action.params.children.includes(targetId));
    if(!parent) return;

    let newSiblings = [...parent?.params.children];
    let index = newSiblings.indexOf(targetId);
    newSiblings.splice(index+1, 0, newId);

    flatActionStore.update(store => {
      let newStore = { ...store };
      newStore[parent.uuid].params.children = newSiblings;
      return newStore;
    });
  }

  function replaceIdWith(targetId:string, newId:string) { //note arguments are reversed on this one
    let parent = Object.values(get(flatActionStore)).find(action => action.type === 'list'
                                                          && action.params.children
                                                          && action.params.children.includes(targetId));
    if(!parent) return;

    let newSiblings = [...parent?.params.children];
    let index = newSiblings.indexOf(targetId);
    if (index !== -1) {
      newSiblings.splice(index, 1, newId); // Replace targetId with newId
    }

    flatActionStore.update(store => {
      let newStore = { ...store };
      newStore[parent.uuid].params.children = newSiblings;
      return newStore;
    });
  }

  function insertIdBefore(newId:string, targetId:string) {
    let parent = Object.values(get(flatActionStore)).find(action => action.type === 'list'
                                                          && action.params.children
                                                          && action.params.children.includes(targetId));
    if(!parent) return;

    let newSiblings = [...parent?.params.children];
    let index = newSiblings.indexOf(targetId);
    newSiblings.splice(index, 0, newId);

    flatActionStore.update(store => {
      let newStore = { ...store };
      newStore[parent.uuid].params.children = newSiblings;
      return newStore;
    });
  }

  function insertIdAsChildOf(id:string) {
  
  }

  function appendToActionStoreAfter(actions: { [uuid: string]: Action }, uuid:string) {
    if(!actions) return;
    let root_uuid = getRoot(actions);
    flatActionStore.update(storeValue => {
      let newActions = {...storeValue};
      for(let uuid in actions) {
        newActions[uuid] = actions[uuid];
      }
      if(newActions[uuid]) { //add as child to
        newActions[uuid].params.children.push(root_uuid);
      }
      // newActions[get(actionRoot).uuid].params.children.push(root_uuid);
      return newActions;
    });
    return root_uuid;
  }




  
