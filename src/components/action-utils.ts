import type { Action, Effect } from '../types/types';
import { v4 as uuidv4 } from 'uuid';
import { actionStore, myTools, selectedActionID, selectedEffect, activeCategory, changedActionID, flatActionStore, actionRoot, stagedAction, stagedActionID } from '../stores/dataStore'
import { historyStore } from '../stores/history';
import { get } from 'svelte/store';
import { deepCopy } from '../utils/utils';
import tinycolor from "tinycolor2";
import { tick } from 'svelte';

// export function merge(object1:{ [key: string]: any }, object2:{ [key: string]: any }): object {
//   let merged:{ [key: string]: any } = {};
//   if(object1 && object2) {
//     merged = { ...object1 };
//     for (let key in object2) {
//       if (object1.hasOwnProperty(key)) {
//           merged[key] = object2[key];
//       }
//     }
//   }
//   return merged;
// }

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

function getActionsInRunOrder() {
  let root = get(actionRoot);
  if(!root) return;
  let actionsInRunOrder = getDescendantIDs(root.uuid);
  // console.log("actions in run order", actionsInRunOrder);
  return actionsInRunOrder;
}

export function clearAllActions() {
  let actions = getActionsInRunOrder(); //IDs
  if(!actions || actions == undefined || actions.length < 1) return;

  console.log("actions to clear", actions);

  let lastItem = actions[actions.length - 1];
  if(lastItem) {
    scrollToAction(lastItem);
  }

  const interval = setInterval(() => {
    flatActionStore.update(store => {
      const penultimateItem = actions[actions.length - 2];
      if(penultimateItem) {
        console.log("second to last item", penultimateItem);
        selectedActionID.set(penultimateItem);
      // Remove the last element from the array
      const toRemove = actions.pop();
      deleteAction(toRemove);
      changedActionID.set(penultimateItem);
      } else {
          // If no more elements except first, clear the interval
          clearInterval(interval);
          selectedActionID.set('');
          saveToHistory(); // Call saveToHistory after all elements are removed
      }
      return store;
    });
  }, 300); //rate at which to clear actions
}


export function isChildActive(parentEffect, parentParams, childID) {
  //do each and along path might be different, eg. stop after certain iterations along path
}

export function merge<T extends object, U extends object>(object1: T, object2: U): T & U {
  return { ...object1 || {}, ...object2 || {} };
}

// take an effect, create an action, and add to action store
export function addEffectToActionStore(effect: Effect, params: { [key: string]: any } = {}) {
  let actions = effectToActions(effect, params);
  if(actions) return appendToActionStore(actions);
}

export function addEffectToActionStoreAsChildOf(effect: Effect, params: { [key: string]: any } = {}, uuid: string) {
  let actions = effectToActions(effect, params);
  if(actions) return appendToActionStoreAsChildOf(actions, uuid);
}

export function effectToActions(effect: Effect, params: { [key: string]: any } = {}) {
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

export function addStagedActionToActionStore() {
  selectedActionID.set(get(stagedActionID));
  //animate action being added
  stagedActionID.set('');
  changedActionID.set('');
}

export function animateAction(id) {
  if(!id || !get(flatActionStore)[id]) return;

  // animate action item


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
export function appendToActionStore(actions: { [uuid: string]: Action }) {
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

export function appendToActionStoreAsChildOf(actions: { [uuid: string]: Action }, uuid:string) {
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

export function addActionToActionStore(action: Action, params: { [key: string]: any } = {}) {
  // console.log("adding action to action store");
  let newAction = {...action};
  newAction.uuid = uuidv4();

  selectedActionID.set(newAction.uuid); //mark action as selected in the list (most recently added)

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

  saveToHistory();

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

// set staged action
export function addEffectAsStagedAction(effect: Effect, params: { [key: string]: any }) {
  // todo: remove previous stagedAction from action store if it wasn't used
  // let uuid = addEffectToActionStore(effect, params);
  let prevStaged = get(stagedActionID);
  if(prevStaged) deleteAction(prevStaged);
  let uuid = addEffectToActionStoreAsChildOf(effect, params, get(actionRoot).uuid);
  if(uuid) stagedActionID.set(uuid);



  // flatActionStore.update(store => {
  //   // add staged action to root's children
  //   get(actionRoot).params.children.push(get(stagedActionID));
  //   let newStore = { ...store, [get(stagedActionID)]: get(stagedAction) };
  //   return newStore;
  // });




  // console.log("staged action id", get(stagedActionID));
  // console.log("new action list", get(flatActionStore));
}

  // change stagedAction parameters
// export function updateStagedAction(params) {
//   const staged = get(stagedAction);
//   if(staged) {
//     flatActionStore.update(store => {
//       let updatedStagedAction = { ...staged, params: merge(staged.params, params) };
//       return { ...store, [get(stagedActionID)]: stagedAction };
//     });
//   }
// }

export function updateStagedAction(params) {
  updateActionParams(get(stagedActionID), params);
}

export function updateActionParams(uuid: string, params: { [key: string]: any }) {
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

export function saveToHistory() {

}

//TODO: SAVE TO HISTORY
// export function saveToHistory() {
//   // console.log("saving to history", get(actionStore).children);
//   let actions = get(flatActionStore);
//   let tools = get(myTools);
//   let staged = get(flatActionStore)[get(stagedActionID)];
//   historyStore.addState({
//     actionStore: actions,
//     myTools: tools,
//     stagedAction: staged
//   });
// }

//for now, use selectedActionID
export function makeNamedGroup() {
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

export function deleteAction(id:string) {
  console.log("deleting", id);
  flatActionStore.update(store => {
    if(!store[id]) return store;
    let newStore = { ...store };
    // remove id anywhere it appears in children arrays
    for(let uuid in newStore) {
      if(newStore[uuid].params.children) {
        newStore[uuid].params.children = newStore[uuid].params.children.filter((child:string) => child !== id);
      }
    }
    let children = newStore[id].params.children;
    if(children && children.length > 0) {
      // if action has children, delete them first
      children.forEach((child:string) => deleteAction(child));
    }
    // delete action
    delete newStore.id;
    return newStore;
  });

  saveToHistory();
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

    saveToHistory();
  }

  function randomWithinRange(value, min, max, randomFactor) {
    return Math.round(Math.max(min, Math.min(max, value + (Math.random() - 0.5) * randomFactor)));
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

    saveToHistory();
  }

  export function redrawAction(id:string) {
    // go "back in time" to before that action, move that action to stagedAction so user can re-record it
    // when mouse released, fast forward to current time

    let prevStaged = get(stagedActionID);
    stagedActionID.set(id);
    deleteAction(prevStaged);

    saveToHistory();
  }

  export function saveActionAsNewTool(action: Action | null) {
    if(action) {
      let newEffect:Effect = {
        name: action.effect + "",
        textLabel: action.params.title,
        category: action.category,
        tags: 'mytools',
        params: deepCopy(action.params)
      }
  
      myTools.update(storeValue => {
        if(!storeValue) storeValue = [];
        storeValue.push(newEffect);
        // console.log("new tool added to my tools", storeValue);
        activeCategory.set('my tools');
        selectedEffect.set(newEffect);
        return storeValue;
      });
    }
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
function getDescendantIDs(id:string) {
  const currentAction = get(flatActionStore)[id];
  if (!currentAction) return [];

  let descendants = [currentAction.uuid];

  if (currentAction.type === 'list' && currentAction.params.children) {
    currentAction.params.children.forEach(childId => {
      const childDescendants = getDescendantIDs(childId);
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

  // move to utils
  function arrayToKeyedObj<T extends Record<K, any>, K extends keyof any>(array: T[], key: K): Record<T[K], T> {
    return array.reduce((obj: Record<T[K], T>, item: T) => {
        obj[item[key]] = item;
        return obj;
    }, {} as Record<T[K], T>);
  }

  // function arrayToKeyedObj(actionsArray) {
  //   return actionsArray.reduce((obj, action) => {
  //       obj[action.uuid] = action;
  //       return obj;
  //   }, {});
  // }

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
    }

    saveToHistory();
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
