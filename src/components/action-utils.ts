import type { Action, Effect } from '../types/types';
import { v4 as uuidv4 } from 'uuid';
import { actionStore, stagedAction, myTools, selectedActionID, selectedEffect, activeCategory, changedActionID } from '../stores/dataStore'
import { historyStore } from '../stores/history';
import { get } from 'svelte/store';
import { deepCopy } from '../utils/utils';

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

export function merge<T extends object, U extends object>(object1: T, object2: U): T & U {
  return { ...object1, ...object2 };
}

export function effectToAction(effect: Effect, params: { [key: string]: any }) : Action {
  
  let type: "list" | "effect" = "effect";

  if(effect) {
  // merge parameters
    let mergedParams = merge(deepCopy(effect.params), deepCopy(params));

    if(mergedParams && mergedParams.children) {
      type = "list";
      mergedParams.children.forEach((child:Action) => {
        child.uuid = uuidv4();
      });
    }

    // Create a new action based on the effect
    const action: Action = {
      name: effect.name,
      type: type,
      category: effect.category,
      effect: effect.name,
      textLabel: effect.textLabel,
      params: mergedParams,
      uuid: uuidv4(),
      pinned: effect.pinnedByDefault
    };

    return action;
  }
}

// take an effect, create an action, and add to action store
export function addEffectToActionStore(effect: Effect, params: { [key: string]: any }) {
  let action = effectToAction(effect, params);
  addActionToActionStore(action, {});
}

export function addActionToActionStore(action: Action, params: { [key: string]: any }) {
  console.log("adding action to action store");
  let newAction = {...action};
  newAction.uuid = uuidv4();

  selectedActionID.set(newAction.uuid); //mark action as selected in the list (most recently added)

  let mergedParams = action.params;
  if(params && action.params) {
    mergedParams = merge(action.params, params);
  }
  newAction.params = mergedParams;

  actionStore.update(storeValue => {
    if(!storeValue.children) storeValue.children = [];
    let newActions = [...storeValue.children]; //shallow copy
    newActions.push(newAction);
    // set this action as most recently changed
    changedActionID.set(newAction.uuid);
    
    return {...storeValue, children: newActions};

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
  });

  saveToHistory();
}

export function deleteSelectedAction() {
  let actions = get(actionStore);
  if(actions && actions.children) {
    let action = actions.children.find(action => action.uuid === get(selectedActionID));
    if(action) {
      deleteActionFromActionStore(action);
    }
  }
}

export function deleteActionFromActionStore(actionToDelete: Action) {
  actionStore.update(storeValue => {
    if (storeValue.children) {
      // Filter out the action to delete by comparing the uuid
      storeValue.children = storeValue.children.filter(action => action.uuid !== actionToDelete.uuid);
    }
    return storeValue;
  });

  saveToHistory();
}

export function saveToHistory() {
  // console.log("saving to history", get(actionStore).children);
  let actions = get(actionStore);
  let tools = get(myTools);
  let staged = get(stagedAction);
  historyStore.addState({
    actionStore: actions,
    myTools: tools,
    stagedAction: staged
  });
}

export function saveActionAsNewTool(action: Action | null) {
  if(action) {
    let newEffect:Effect = {
      name: action.effect + "",
      textLabel: action.params.title,
      category: action.category,
      tags: 'mytools',
      params: action.params
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

// set staged action
export function addEffectAsStagedAction(effect: Effect, params: { [key: string]: any }) {

  let action = effectToAction(effect, params);
  // console.log("the action", action);

  //TODO: save previous staged action in undo / revert queue
  if(action) {
    stagedAction.set(action);
  }
}

export function copySelectedActionToStagedAction() {
  let actions = get(actionStore);
  if(actions && actions.children) {
    let action = actions.children.find(action => action.uuid === get(selectedActionID));
    if(action) {
      stagedAction.set(action);
    }
  }
}

// export function setActionThumbnail(action:Action, thumbnail:string) {
//   actionStore.update(storeValue => {
//     // storeValue.children = storeValue.children || [];
//     // let index = storeValue.children.indexOf(action);
//     // storeValue.children[index].thumbnail = thumbnail;
//     return storeValue;
//   });
// }