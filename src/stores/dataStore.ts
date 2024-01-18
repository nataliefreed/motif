import { writable, get, derived } from 'svelte/store';
import type { Action, Effect } from '../types/types';
import { effectList } from '../stores/effectList.js';
import { v4 as uuidv4 } from 'uuid';

export const actionStore = writable<Action>({name:"default", type:'list', category:'none', children:[], uuid:""});
// object storing actions by UUID
export const flatActionStore = writable<{ [key: string]: Action }>({});
// export const stagedAction = writable<Action | null>(null);
export const stagedActionID = writable('');
export const changedActionID = writable('');

export const toolStore = writable<Effect[]>([]);
export const myTools = writable<Effect[]>([]);
export const codeTools = writable<Effect[]>([]);

export const activeCategory = writable('');
export const selectedEffect = writable<Effect | null>(null);

export const selectedCodeEffect = writable('point');

export const selectedActionID = writable('');

export const currentColor = writable('#000000');
export const shouldRandomizeColor = writable(true);

export const renderStopIndex = writable('');

export const stagedAction = derived(
  [flatActionStore, stagedActionID], 
  ([$flatActionStore, $stagedActionID]) => $flatActionStore[$stagedActionID]
);

// only the "active" actions in the action store
export const activeActionStore = derived

// Derived store to create a nested structure from the flat store
// export const nestedActionStore = derived(flatActionStore, $flatActionStore => buildNestedStructure($flatActionStore));

// find first action that is not a child of another action
// export const actionRoot = derived(flatActionStore, $flatActionStore => {
//   for (let uuid in $flatActionStore) {
//     let isChild = Object.values($flatActionStore).some(item => item.params.children?.includes(uuid));
//     if (!isChild) {
//       // Return the root action
//       return $flatActionStore[uuid];
//     }
//   }
//   return null; // Return null if no root action is found
// });

export const actionRootID = writable('uuid_1');
export const actionRoot = derived([flatActionStore, actionRootID],([$flatActionStore, $actionRootID]) => $flatActionStore[$actionRootID]);

function buildNestedStructure(flatStore) {
  const buildTree = (uuid, store) => ({
    uuid,
    name: store[uuid].name,
    children: store[uuid].params.children?.map(childUuid => buildTree(childUuid, store)) || []
  });

  // Find root(s) and build the tree
  let roots = [];
  for (let uuid in flatStore) {
    let isChild = Object.values(flatStore).some(item => item.params.children?.includes(uuid));
    if (!isChild) roots.push(buildTree(uuid, flatStore));
  }
  return roots;
}

export function initStores(projectID: string | null) {
  actionStore.set(getInitialActions());
  toolStore.set(effectList);
  flatActionStore.set(getFlatActionStore());
  printNestedListAndCheckIssues(get(flatActionStore));
}

// function flattenActionStore() {
//   let flatStore:{ [key: string]: Action } = {};
//   let actions = get(actionStore);
//   if(!actions.children) return flatStore;
//   actions.children.forEach((action: Action) => {
//     let newAction = deepCopy(action);
//     newAction.parent = actions.uuid;
//     flatStore[action.uuid] = newAction;
//     if(newAction.type === 'list' && newAction.params && newAction.params.children) {
//       newAction.params.children.forEach((child: Action) => {
//         flatStore[child.uuid] = child;
//         child.parent = newAction.uuid;
//       });
//     }
//   });
//   return flatStore;
// }

// like a lookup table for actions by UUID
function getFlatActionStore() {
  return {
    'uuid_1': {
      uuid: 'uuid_1',
      name: 'do each',
      effect: 'do each',
      type: 'list' as const,
      category: 'control',
      params: {
        title: 'My Design',
        children: ['uuid_2', 'uuid_3', 'uuid_5', 'uuid_8', 'uuid_10']
      }
    },
    'uuid_2': {
      uuid: 'uuid_2',
      name: 'solid fill',
      type: 'effect' as const,
      category: 'backgrounds',
      effect: 'solid fill',
      params: {
        color: '#f5a8e3'
      }
    },
    'uuid_3': {
      uuid: 'uuid_3',
      name: 'circle',
      type: 'effect' as const,
      category: 'shapes',
      effect: 'circle',
      params: {
        color: '#2C1976',
        radius: 50,
        position: { x: 150, y: 150 }
      }
    },
    'uuid_5': {
      uuid: 'uuid_5',
      name: 'do each',
      effect: 'do each',
      type: 'list' as const,
      category: 'control',
      params: {
        title: "circle and star",
        children: ['uuid_6', 'uuid_7']
      }
    },
    'uuid_6': {
      uuid: 'uuid_6',
      name: 'circle',
      type: 'effect' as const,
      category: 'shapes',
      effect: 'circle',
      params: {
        color: '#2C5076',
        radius: 40,
        position: { x: 50, y: 150 }
      }
    },
    'uuid_7': {
      uuid: 'uuid_7',
      name: 'star',
      type: 'effect' as const,
      category: 'shapes',
      effect: 'star',
      params: {
        color: '#112233',
        r1: 40,
        r2: 15,
        npoints: 5,
        position: { x: 100, y: 350 }
      }
    },
    'uuid_8': {
      uuid: 'uuid_8',
      name: 'along path',
      type: 'list' as const,
      category: 'control',
      effect: 'along path',
      params: {
        title: "circle brush",
        children: ['uuid_9'],
        path: [
          [0, 1], [20, 22], [100, 200], [15, 74], [49, 82], [16, 21], [78, 284],
          [184, 203], [200, 119], [294, 226], [265, 116], [221, 144], [185, 245],
          [263, 152], [216, 57], [25, 34], [247, 56], [199, 210], [232, 225],
          [178, 249], [224, 57], [156, 210], [9, 128], [34, 202], [44, 288],
          [259, 137], [230, 122], [193, 299], [94, 191], [205, 113], [175, 234],
          [153, 288], [99, 127], [156, 47], [154, 66], [97, 266], [113, 54],
          [175, 235], [63, 215], [35, 90], [11, 227], [271, 224], [112, 102],
          [141, 76], [212, 135], [91, 117], [94, 180], [77, 91], [199, 130],
          [173, 285], [149, 117], [51, 300], [254, 267], [87, 65], [94, 110],
          [92, 167], [89, 29], [252, 203], [173, 154], [103, 276], [94, 2],
          [50, 215], [114, 300], [213, 208], [71, 101], [24, 287], [98, 34],
          [62, 270], [182, 116], [117, 161], [258, 46], [177, 149], [150, 184],
          [171, 201], [57, 103], [37, 254], [297, 112], [266, 75], [65, 168],
          [25, 140], [196, 130], [292, 264], [52, 88], [263, 218], [119, 268],
          [278, 185], [188, 216], [1, 82], [220, 100], [159, 154], [110, 176],
          [213, 291], [144, 46], [80, 217], [18, 268], [244, 47], [185, 105],
          [10, 60], [91, 249], [236, 67], [131, 205], [10, 285], [19, 156]
        ]
      }
    },
    'uuid_9': {
      uuid: 'uuid_9',
      name: 'circle',
      type: 'effect' as const,
      category: 'shapes',
      effect: 'circle',
      params: {
        color: '#2C5abb',
        radius: 10,
        position: { x: 20, y: 150 }
      }
    },
    'uuid_10': {
      uuid: 'uuid_10',
      name: 'bounce',
      type: 'effect' as const,
      category: 'brushes',
      effect: 'bounce',
      params: {
        start: { x: 10, y: 10 },
        end: { x: 40, y: 20 },
        duration: 500
      }
    },
  };
}

function printNestedListAndCheckIssues(flatStore:any) {
  let issues = [];
  let childToParentMap = {};

  // Build a map of child UUID to parent UUID
  for (let uuid in flatStore) {
      let children = flatStore[uuid].params.children || [];
      children.forEach(childUuid => {
          if (childToParentMap[childUuid]) {
              issues.push(`${childUuid} appears as the child of both ${childToParentMap[childUuid]} and ${uuid}`);
          } else {
              childToParentMap[childUuid] = uuid;
          }
      });
  }

  // Function to recursively print the structure
  function printChildren(uuid, indent = 0) {
      let item = flatStore[uuid];
      if (!item) {
          issues.push(`Missing item for UUID: ${uuid}`);
          return;
      }

      console.log(' '.repeat(indent * 4) + uuid + ' ' + item.name);

      // Recursive call for children
      let children = item.params.children || [];
      children.forEach(childUuid => {
          printChildren(childUuid, indent + 1);
      });
  }

  // Find and print root items (items with no identified parent)
  for (let uuid in flatStore) {
      if (!childToParentMap[uuid]) {
          printChildren(uuid);
      }
  }

  // Print issues
  if (issues.length > 0) {
      console.log("\nIssues found:");
      issues.forEach(issue => console.log(issue));
  } else {
      console.log("\nNo issues found.");
  }
}

function getInitialActions() {
  return {
    name: "My Design",
    type: "list" as const,
    category: 'top-level-list',
    uuid: uuidv4(),
    children: [
      {
        name: "solid fill",
        type: 'effect' as const,
        category: 'backgrounds',
        effect: 'solid fill',
        params: {
          color: '#ffaa00'
        },
        uuid: uuidv4(),
      },
        {
          name: "circle",
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
          name: "star",
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
        {
          name: "named list",
          type: 'list' as const,
          category: 'group',
          effect: 'named list',
          uuid: uuidv4(),
          params: {
            title: "name this tool",
            children:
            [
              {
                name: "circle",
                type: 'effect' as const,
                category: 'shapes',
                effect: 'circle',
                params: {
                  color: '#2C5076',
                  radius: 40,
                  position: { x: 50, y: 150 }
                },
                uuid: uuidv4(),
              },
              {
                name: "star",
                type: 'effect' as const,
                category: 'shapes',
                effect: 'star',
                params: {
                  color: '#112233',
                  r1: 40,
                  r2: 15,
                  npoints: 5,
                  position: { x: 100, y: 350 }
                },
                uuid: uuidv4(),
              }
            ]
          }
        },
      ]
  };
}