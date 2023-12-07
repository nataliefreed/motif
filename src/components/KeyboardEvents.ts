import { addEffectToActionStore } from "./action-utils";
import { toolStore } from "../stores/dataStore";
import { get } from "svelte/store";
import type { Effect } from "../types/types";


function keydownHandler(event: KeyboardEvent) {
  console.log(event);
  // Check the element in focus to avoid overriding default behavior
  if (document.activeElement && document.activeElement.tagName === 'INPUT') {
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
    case 'Escape':
      // deselect all lines of code
      // go back to pointer tool in code view
      // set isDragging to false?
      break;
  }
}

function keyupHandler(event: KeyboardEvent) {
  // Check the element in focus to avoid overriding default behavior
  if (document.activeElement && document.activeElement.tagName === 'INPUT') {
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