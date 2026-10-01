
import { addMetadataFromBase64DataURI, getMetadata } from 'meta-png';
import { flatActionStore, stagedActionID, drawingLocked } from '../stores/dataStore';
import { get } from 'svelte/store';
import type { Action } from '../types/types';
import { deepCopy } from '../utils/utils';
import { getDescendantIDs, addCurrentEffectAsStagedAction } from './action-utils';
import type { ActionStore } from '../types/types';
import { palettes } from '../stores/colorStore';
import { mostCommonColors } from '../utils/color-utils';
import { t } from '../i18n';

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

  
  //add saved colors
  const savedColors = get(palettes)['myPalette'];
  const exportData = {
    store: storeWithoutStagedAction,
    colors: savedColors
  };

  // Convert canvas to Data URI
  if(canvas) {
      const dataURI = canvas.toDataURL('image/png');

    try {
      const modifiedDataURI = addMetadataFromBase64DataURI(dataURI, 'exportData', JSON.stringify(exportData));
      downloadDataURI(modifiedDataURI, `${get(t).files.design}.png`);
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
          const jsonData = getMetadata(pngUint8Array, 'exportData');
          
          if (jsonData) {
            const data = JSON.parse(jsonData);
            // console.log('imported data:', data);
            if(data) { drawingLocked.set(false); }; //importing a design can be set to start in parameter setting mode
            if(data.store) {
              // console.log('imported data:', data.store);
              flatActionStore.update(store => { return data.store; });
              addCurrentEffectAsStagedAction();
            }
            if (data.colors) {
              // console.log('imported data:', data.colors);
              palettes.update(store => {
                store['myPalette'] = data.colors;
                return store;
              });
            }
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

// export function downloadSVG() {
//   const canvas = document.getElementById('defaultCanvas0') as HTMLCanvasElement;

//   if (canvas) {
//     canvas.toBlob((blob) => {
//       if (!blob) {
//         console.error('Error creating blob from canvas.');
//         return;
//       }

//       const reader = new FileReader();

//       reader.onload = (event) => {
//         if (!event.target) return;

//         const binaryData = new Uint8Array(event.target.result as ArrayBuffer);

//         // Trace the image using Potrace
//         trace(binaryData, { threshold: 128 }, (err, svg) => {
//           if (err) {
//             console.error('Error tracing image:', err);
//             return;
//           }

//           // Create a temporary anchor element to trigger download
//           const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
//           const url = URL.createObjectURL(svgBlob);
//           const a = document.createElement('a');
//           a.href = url;
//           a.download = 'trace.svg';
//           document.body.appendChild(a);
//           a.click();
//           document.body.removeChild(a);
//           URL.revokeObjectURL(url);
//         });
//       };

//       reader.readAsArrayBuffer(blob);
//     }, 'image/png');
//   }
// }



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
function downloadDataURI(dataURI: string, fileName: string) {
  const a = document.createElement('a');
  a.href = dataURI;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// A palette file is a picture of the palette's colors: equal tiles in letter order, a to l, with nothing
// else in it, so opening it with importPalette gives back the same colors for the same letters.
export function exportPalette(colors: string[]) {
  const tile = 60, columns = 6;
  const canvas = document.createElement('canvas');
  canvas.width = columns * tile;
  canvas.height = Math.ceil(colors.length / columns) * tile;
  const g = canvas.getContext('2d')!;
  colors.forEach((color, i) => {
    g.fillStyle = color;
    g.fillRect((i % columns) * tile, Math.floor(i / columns) * tile, tile, tile);
  });
  downloadDataURI(canvas.toDataURL('image/png'), `${get(t).files.palette}.png`);
}

// Asks for any picture and passes on its most common colors, one for each palette letter,
// or calls `noColors` if it can't be read or has no visible pixels.
export function importPalette(paletteSize: number, useColors: (colors: string[]) => void, noColors: () => void) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const image = await createImageBitmap(file);
      const scale = Math.min(1, 400 / Math.max(image.width, image.height)); // big photos: fewer pixels to count, same colors
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const g = canvas.getContext('2d')!;
      g.drawImage(image, 0, 0, canvas.width, canvas.height);
      const colors = mostCommonColors(g.getImageData(0, 0, canvas.width, canvas.height).data, paletteSize);
      if (colors.length > 0) useColors(colors);
      else noColors();
    } catch {
      noColors(); // not a picture the browser can read
    }
  };
  input.click();
}
