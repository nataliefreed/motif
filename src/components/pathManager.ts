import { flatActionStore } from '../stores/dataStore';
import { writable, get } from 'svelte/store';
// import { actionManager } from './action-utils';

let paths = [];

let starterPaths = [ // patterns
  [[50, 50], [100, 100], [150, 50], [200, 100], [250, 50]], // Zigzag path
  [[50, 100], [100, 50], [150, 100], [200, 50], [250, 100]], // Inverted zigzag
  [[50, 50], [250, 100], [50, 150], [250, 200]], // Wavy path
  [[100, 50], [200, 50], [200, 150], [100, 150], [100, 50]] // Square path
];

export function getPaths() {
  for (const id in get(flatActionStore)) {
    let action = get(flatActionStore)[id];
    if ('path' in action.params && action.params.path.length > 0) {
      let path = action.params.path; // todo: make sure this is a copy if editable from this component
      paths.push(path);
    }
    // else if() { // get the paths for noise and spiro
    
    // }
  }
}

