import { writable } from 'svelte/store';
import type { Action, Effect } from '../types/types'
import { effectList } from '../stores/effectList.js';
import { v4 as uuidv4 } from 'uuid';

export const actionStore = writable<Action>({name:"default", type:'list', category:'none', children:[], uuid:""});
export const toolStore = writable<Effect[]>([]);
export const myTools = writable<Effect[]>([]);

export const activeCategory = writable('');
export const selectedEffect = writable<Effect | null>(null);
export const stagedAction = writable<Action | null>(null);

export function initStores(projectID: string | null) {
  actionStore.set(getDrawingActionData());
  toolStore.set(getToolData());
}

function getToolData() : Effect[] {
  return effectList;
}

function getDrawingActionData() {
  return {
    name: "Top Level",
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
        name: "Display Text",
        type: 'effect' as const,
        category: 'other',
        effect: 'text',
        params: {
          text: 'Hello World!',
          position: { x: 200, y: 250 }
        },
        uuid: uuidv4(),
      },
    ]
  };
}

function getActionData(projectID: string | null) {
  // if (projectID) {
  //   if (projectID === 'test1') {
      return {
        name: "Top Level",
        type: "list" as const,
        uuid: "1234",
        children: [
            {
                name: "Number",
                type: 'number' as const,
                value: 42,
                uuid: uuidv4(),
            },
            {
                name: "Color",
                type: 'color' as const,
                value: "red",
                uuid: uuidv4(),
            },
            {
                name: "String",
                type: 'string' as const,
                value: "Hello"
            },
            {
                name: "Nested List",
                type: 'list' as const,
                children: [
                    {
                        name: "Nested Number",
                        type: "number" as const,
                        value: 7
                    },
                    {
                        name: "String",
                        type: 'string' as const,
                        value: "Hi there"
                    },
                    {
                        name: "Nested Number 2",
                        type: "number" as const,
                        value: 365
                    },
                    {
                        name: "Deeper Nested List",
                        type: 'list' as const,
                        children: [
                            {
                                name: "Nested Number",
                                type: "number" as const,
                                value: 7
                            },
                            {
                                name: "String",
                                type: 'string' as const,
                                value: "Hi there"
                            },
                            {
                                name: "Nested Number 2",
                                type: "number" as const,
                                value: 365
                            },
                        ]
                    }
                ]
            }
          ]
        };
      }
  // }
  // return {name:"default2", type:'list', children:[]};


  // function getDrawingActionData() {
  //   return [
  //     {
  //       "toolName": "star",
  //       "parameters": {
  //         "color": "#a2d16b",
  //         "npoints": 7,
  //         "r1": 20,
  //         "r2": 10,
  //         "position": [100, 200]
  //       },
  //       "mousePath": [
  //         [100, 200], [101, 201], [102, 202], [103, 203], [199, 299]
  //       ]
  //     },
  //     {
  //       "toolName": "star",
  //       "parameters": {
  //         "color": "#ff0000",
  //         "npoints": 5,
  //         "r1": 40,
  //         "r2": 20,
  //         "position": [200, 300]
  //       },
  //       "mousePath": [
  //         [200, 300], [201, 301], [202, 302], [203, 303], [299, 399]
  //       ]
  //     }
  //   ];
  // }
  // }
  //   return {
  //       name: 'star',
  //       dropdownName: 'Star',
  //       category: 'Shapes',
  //       tag: 'motif',
  //       init: `Star with {id:'npoints', type:'numberslider', min:3, max:200, placeholder:7} points, 
  //       outer {id:'r1', type:'numberslider', min:1, max:600, placeholder:20}, 
  //       inner {id:'r2', type:'numberslider', min:1, max:600, placeholder:10} 
  //       in color {id:'color', type:'color', placeholder:'#a2d16b'}  
  //       at {id:'position', type:'coordinate', min:0, max:600, placeholder:[]}`,
  //       cursor: './assets/cursors/star-solid.svg',
  //       mouseActionType: 'drag',
  //       onact: (my) => {
  //         my.target.star({color: my.data.color, x: my.data.position[0], y: my.data.position[1], r1: my.data.r1, r2: my.data.r2, npoints: my.data.npoints});
  //       }
  //     };
  // }

 
    // return [
    //   {
    //     "name": "star",
    //     "category": "Shapes",
    //     "text": "Star in {color} with {npoints} points, outer {r1}, inner {r2} at {position}",
    //     "parameters": [
    //       { "id": "color", "type": "color", "default": "#a2d16b" },
    //       { "id": "npoints", "type": "number", "default": 7 },
    //       { "id": "r1", "type": "number", "default": 20 },
    //       { "id": "r2", "type": "number", "default": 10 },
    //       { "id": "position", "type": "coordinate", "default": [0, 0] }
    //     ],
    //   },
    //   {
    //     "name": "star brush",
    //     "category": "Brushes",
    //     "text": `Along {path}
    //     Star in {color} with {npoints} points, outer {r1}, inner {r2} at {position},
    //     Star in {color} with {npoints} points, outer {r1}, inner {r2} at {position}`,
    //     "parameters": [
    //       { "id": "color", "type": "color", "default": "#a2d16b" },
    //       { "id": "npoints", "type": "number", "default": 7 },
    //       { "id": "r1", "type": "number", "default": 20 },
    //       { "id": "r2", "type": "number", "default": 10 },
    //       { "id": "position", "type": "coordinate", "default": [0, 0] }
    //     ],
    //   },
    // ];

  function getMyTools() {
    return {
      "category": "My Tools",
      "items": [
        {
          "toolName": "star",
          "parameters": {
            "color": "#a2d16b",
            "npoints": 7,
            "r1": 20,
            "r2": 10,
            "position": [100, 200]
          }
        },
        {
          "toolName": "star",
          "parameters": {
            "color": "#ff0000",
            "npoints": 5,
            "r1": 40,
            "r2": 20,
            "position": [200, 300]
          }
        }
      ]
    }
  }

  //types star uses: shape, number, color, coordinate