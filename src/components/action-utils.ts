import type { Action, Effect } from '../types/types';
import { v4 as uuidv4 } from 'uuid';
import { actionStore, stagedAction, myTools } from '../stores/dataStore'
// import { _.merge } from 'lodash';

export function merge(object1:{ [key: string]: any }, object2:{ [key: string]: any }): object {
  let merged:{ [key: string]: any } = {};
  if(object1 && object2) {
    merged = { ...object1 }; // Clone object1
    for (let key in object2) {
        if (object1.hasOwnProperty(key)) {
            merged[key] = object2[key];
        }
    }
  }
  return merged;
}

function effectToAction(effect: Effect, params: { [key: string]: any }) : Action {
  
  // if(randomizeParams && params) {
  //   params.forEach{ (param) =>
    
  //   );
  // }
  
  // merge parameters
  let mergedParams = effect.params;
  if(params && effect.params) {
    mergedParams = merge(effect.params, params);
  }

  // Create a new action based on the effect
  const action: Action = {
    name: effect.name,
    type: 'effect',
    category: effect.category,
    effect: effect.name,
    params: mergedParams,
    uuid: uuidv4(),
  };

  return action;
}

// take an effect, create an action, and add to action store
export function addEffectToActionStore(effect: Effect, params: { [key: string]: any }) {
  let action = effectToAction(effect, params);
  addActionToActionStore(action, {});
}

export function addActionToActionStore(action: Action, params: { [key: string]: any }) {
  let newAction = {...action};
  newAction.uuid = uuidv4();

  let mergedParams = action.params;
  if(params && action.params) {
    mergedParams = merge(action.params, params);
  }

  newAction.params = mergedParams;

  actionStore.update(storeValue => {
    // Assuming children property exists, else initialize it
    storeValue.children = storeValue.children || [];
    storeValue.children.push(newAction);
    console.log("storeValue", storeValue);
    return storeValue;
  });
}

export function saveMyTool(action: Action | null) {
  if(action) {
    let newEffect:Effect = {
      name: action.effect + "",
      dropdownName: action.effect + " (my tool)",
      category: action.category,
      tag: 'mytools',
      params: action.params
    }

    myTools.update(storeValue => {
      if(!storeValue) storeValue = [];
      storeValue.push(newEffect);
      console.log("new tool added to my tools", storeValue);
      return storeValue;
    });
  }
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

// on:effectclicked={e => addEffectToActionsStore(e.detail)