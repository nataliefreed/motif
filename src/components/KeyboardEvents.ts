import { addEffectToActionStore, deleteSelectedAction } from "./action-utils";
import { toolStore, selectedActionID } from "../stores/dataStore";
import { historyStore } from "../stores/history";
import { get } from "svelte/store";
import type { Effect } from "../types/types";

function deselectAction() {
  selectedActionID.set('');
}

function keydownHandler(event: KeyboardEvent) {
  // console.log(event);
  // console.log(document.activeElement);
  // Check the element in focus to avoid overriding default behavior
  if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.classList.contains('string-widget'))) {
    return;
  }

  switch (event.key) {
    case 'r':
      // get a random effect
      let effectList: Effect[] = get(toolStore);
      if(effectList.length > 0) {
        let randomEffect = effectList[Math.floor(Math.random() * effectList.length)];
        addEffectToActionStore(randomEffect, {});
      }
      break;
    case 'u':
      historyStore.undo();
      break;
    case 'Escape':
      selectedActionID.set('');
      // deselect all lines of code
      // go back to pointer tool in code view
      // set isDragging to false?
      break;
    case 'Backspace':
      deleteSelectedAction();
      break;
  }
}

function keyupHandler(event: KeyboardEvent) {
  // Check the element in focus to avoid overriding default behavior
  if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.classList.contains('string-widget'))) {
    return;
  }

  switch (event.key) {
    case 'a':
      // Handle 'a' key for canvas
      break;
    case 'Escape':
      // deselect all lines of code
      // go back to pointer tool in code view
      // set isDragging to false?
      break;
  }
}


export function setupKeyboardEvents() {
  window.addEventListener('keydown', keydownHandler);
  window.addEventListener('keyup', keyupHandler);
}

export function removeKeyboardEvents() {
  window.removeEventListener('keydown', keydownHandler);
  window.removeEventListener('keyup', keyupHandler);
}