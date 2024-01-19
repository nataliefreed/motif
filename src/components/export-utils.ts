
import { addMetadataFromBase64DataURI, getMetadata } from 'meta-png';
import { flatActionStore, stagedActionID } from '../stores/dataStore';
import { get } from 'svelte/store';
import type { Action } from '../types/types';
import { deepCopy } from '../utils/utils';
import { getDescendantIDs, addCurrentEffectAsStagedAction } from './action-utils';
import type { ActionStore } from '../types/types';

export function exportCodeWithImage() {
  const canvas = document.getElementById('defaultCanvas0') as HTMLCanvasElement;

// Create store without the 'stagedAction'
  const storeWithoutStagedAction = removeAction(get(flatActionStore), get(stagedActionID));
  // const storeWithoutStagedAction = Object.keys(store).reduce((newStore, key) => {
  //   if (store[key].uuid !== 'stagedAction') {
  //     newStore[key] = store[key];
  //   }
  //   return newStore;
  // }, {} as ActionStore);

  // Convert the store to a JSON string
  const jsonString = JSON.stringify(storeWithoutStagedAction);

  // Convert canvas to Data URI
  if(canvas) {
      const dataURI = canvas.toDataURL('image/png');

    try {
      const modifiedDataURI = addMetadataFromBase64DataURI(dataURI, 'actionStore', jsonString);

      // Create a temporary anchor element to trigger download
      const a = document.createElement('a');
      a.href = modifiedDataURI;
      a.download = 'my design.png';
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
    } catch (error) {
      console.error('Error adding metadata:', error);
    }
  }
}

export function importCodeFromImage() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/png';

  input.onchange = async (e) => {
    let target = e.target as HTMLInputElement;
    if (!target.files) return;
    
    const file = target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = async (e) => {
        let target = e.target as FileReader;
        const result = target.result;

        try {
          const pngUint8Array = new Uint8Array(await file.arrayBuffer());
          const jsonData = getMetadata(pngUint8Array, 'actionStore');
          
          if (jsonData) {
            const data = JSON.parse(jsonData);
            flatActionStore.update(store => { return data; });
            addCurrentEffectAsStagedAction();
          }
        } catch (error) {
          console.error('Error extracting metadata:', error);
        }
      };

      // Read the file as ArrayBuffer
      reader.readAsArrayBuffer(file);
      }
    };

  input.click();
}

export function removeAction(store: ActionStore, id:string) {

  let newStore = deepCopy(store);
  if(!newStore[id]) return newStore;
  
    let idsToDelete = getDescendantIDs(store, id);

    // Remove all references to these IDs in other actions' children arrays
    for (let uuid in newStore) {
      if (newStore[uuid].params.children) {
        newStore[uuid].params.children = newStore[uuid].params.children.filter(child => !idsToDelete.includes(child));
      }
    }

    // Delete the actions themselves
    idsToDelete.forEach(actionId => delete newStore[actionId]);
    
    return newStore;
}

function exportCode() {
  //save action store to file

  // Convert the data to a JSON string
  const jsonString = JSON.stringify($actionStore);

  // Create a blob from the JSON string
  const blob = new Blob([jsonString], { type: 'application/json' });

  // Create a URL for the blob
  const url = URL.createObjectURL(blob);

  // Create a temporary anchor element to trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = 'actionStore.json'; // Name of the file to be downloaded
  document.body.appendChild(a);
  a.click();

  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importCode() {
  //load action store as file (replace existing)

  // Create a file input element
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json'; // Accept only JSON files

  input.onchange = (e) => {
    let target = e.target as HTMLInputElement;
    if(!target.files) return;
    const file = target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => { //runs when file reading complete
        let target = e.target as FileReader;
        const result = target.result;
        try {
          // Parse the file content and update the store
          const data = JSON.parse(result);
          actionStore.set(data);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };
      
      // Read the file as text
      reader.readAsText(file);
    }
  };

  // Trigger the file input
  input.click();
}