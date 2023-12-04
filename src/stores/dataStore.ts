import { writable } from 'svelte/store';
import type { Action, Effect } from '../types/types';
import { effectList } from '../stores/effectList.js';
import { v4 as uuidv4 } from 'uuid';

export const actionStore = writable<Action>({name:"default", type:'list', category:'none', children:[], uuid:""});
export const toolStore = writable<Effect[]>([]);
export const myTools = writable<Effect[]>([]);
export const codeTools = writable<Effect[]>([]);

export const activeCategory = writable('');
export const selectedEffect = writable<Effect | null>(null);
export const stagedAction = writable<Action | null>(null);

export const selectedCodeEffect = writable('point');

export const selectedActionID = writable('');

export function initStores(projectID: string | null) {
  actionStore.set(getInitialActions());
  toolStore.set(effectList);
}

function getInitialActions() {
  return {
    name: "My Design",
    type: "list" as const,
    category: 'top-level-list',
    uuid: uuidv4(),
    children: [
      // {
      //   name: "solid fill",
      //   type: 'effect' as const,
      //   category: 'backgrounds',
      //   effect: 'solid fill',
      //   params: {
      //     color: '#ffaa00'
      //   },
      //   uuid: uuidv4(),
      // },
      {
        name: "Draw Circle",
        type: 'effect' as const,
        category: 'shapes',
        effect: 'circle',
        params: {
          color: '#2C1976',
          radius: 50,
          position: { x: 150, y: 150 }
        },
        uuid: uuidv4(),
      },
      {
        name: "draw star",
        type: 'effect' as const,
        category: 'shapes',
        effect: 'star',
        params: {
          color: '#bbaaff',
          r1: 50,
          r2: 25,
          npoints: 5,
          position: { x: 300, y: 350 }
        },
        uuid: uuidv4(),
      },
    ]
  };
}