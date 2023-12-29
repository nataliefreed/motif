// this file goes with components/actions and widgets/effects (how each effect is displayed - was: init)
// and with components/canvas/renderer.ts (how each effect is rendered with P5 - was: onact)

export const effectList = [
  {
    name: 'spiro',
    dropdownName: 'Spiro',
    category: 'shapes',
    tags: 'drawing',
    cursor: './assets/cursors/spiro-cursor.svg',
    thumbnail: 'spiro.jpg',
    mouseActionType: 'drag',
    params: {
      outer: 50,
      inner: 24,
      d: 20,
      color: '#FF0000',
      position: {x: 100, y: 100}
    },
  },
  {
    name: 'circle',
    dropdownName: 'Circle',
    category: 'shapes',
    tags: 'drawing',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'circle.jpg',
    mouseActionType: 'drag',
    params: {
      radius: 20,
      color: '#1B54B1',
      position: {x: 100, y: 100}
    },
  },
  {
    name: 'square',
    dropdownName: 'Square',
    category: 'shapes',
    tags: 'drawing',
    thumbnail: 'square.jpg',
    mouseActionType: 'drag',
    params: {
      size: 40,
      color: '#D55601',
      position: {x: 100, y: 100}
    }
  },
  {
    name: 'polygon',
    dropdownName: 'Polygon',
    category: 'shapes',
    tags: 'drawing',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'polygon.jpeg',
    mouseActionType: 'drag',
    params: {
      nsides: 6,
      radius: 20,
      color: '#9c83e1',
      position: {x: 100, y: 100}
    }
  },
  {
    name: 'star',
    dropdownName: 'Star',
    category: 'shapes',
    tags: 'drawing',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'star.jpg',
    mouseActionType: 'drag',
    params: {
      npoints: 7,
      r1: 20,
      r2: 10,
      color: '#a2d16b',
      position: {x: 100, y: 100}
    }
  },
  {
    name: 'heart',
    dropdownName: 'Heart',
    category: 'shapes',
    tags: 'drawing',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'heart.jpg',
    mouseActionType: 'drag',
    params: {
      size: 40,
      color: '#da6bb1',
      position: {x: 100, y: 100}
    }
  },
  {
    name: 'rectangle',
    dropdownName: 'Rectangle',
    category: 'shapes',
    tags: 'drawing',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'rectangle.jpeg',
    mouseActionType: 'drag',
    params: {
      width: 50,  
      height: 30,
      color: '#52bf67',
      position: {x: 100, y: 100}
    }
  },
  {
    name: 'triangle',
    dropdownName: 'Triangle',
    category: 'shapes',
    tags: 'drawing',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'triangle.jpeg',
    mouseActionType: 'drag',
    params: {
      width: 40,
      height: 40,
      color: '#62aed2',
      position: {x: 100, y: 100}
    }
  },
  {
    name: 'stripes',
    dropdownName: 'Stripes',
    category: 'backgrounds',
    tags: 'drawing',
    cursor: '/assets/cursors/fill-drip-solid.svg',
    thumbnail: 'stripes.jpg',
    mouseActionType: 'drag',
    params: {
      stripeWidth: 20,
      color: '#a8d863',
      color2: '#d967a7',
      angle: 0
    }
  },
  {
    name: 'gradient',
    dropdownName: 'Gradient',
    category: 'backgrounds',
    tags: 'drawing',
    cursor: '/assets/cursors/fill-drip-solid.svg',
    thumbnail: 'gradient.jpeg',
    mouseActionType: 'drag',
    params: {
      color: '#79C2D7',
      color2: '#E869A3',
      angle: 0
    }
  },
  {
    name: 'solid fill', //TODO: rename name and dropdownName and also the effect name in actions. dropdown name is button name, name is type of effect (eg. tile which has subtypes in params)
    dropdownName: 'Solid Fill',
    category: 'backgrounds',
    tags: 'drawing',
    cursor: '/assets/cursors/fill-drip-solid.svg',
    thumbnail: 'solid_fill.jpg',
    mouseActionType: 'drag',
    params: {
      color: '#bbaa00'
    }
  },
  {
    name: 'noise',
    dropdownName: 'Noise',
    category: 'backgrounds',
    tags: 'drawing',
    cursor: '/assets/cursors/fill-drip-solid.svg',
    thumbnail: 'noise.jpg',
    mouseActionType: 'drag',
    params: {
      color: '#bbaa00'
    }
  },

  {
    name: 'along path',
    dropdownName: 'Repeat',
    category: 'brushes',
    tags: 'drawing',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'dot_brush.jpeg',
    mouseActionType: 'drag-path',
    params: {
      path: [],
      pathSpacing: 10,
      children: []
    },
  },

  {
    name: 'along path',
    dropdownName: 'Dot brush',
    category: 'brushes',
    tags: 'drawing',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'dot_brush.jpeg',
    mouseActionType: 'drag-path',
    params: {
      path: [],
      pathSpacing: 10,
      children: [
        {
          name: 'circle',
          type: 'effect',
          category: 'shapes',
          effect: 'circle',
          params: {
            radius: 3,
            color: '#80babd',
            position: {x: 0, y: 0}
          }
        },
        {
          name: 'circle',
          type: 'effect',
          category: 'shapes',
          effect: 'circle',
          params: {
            radius: 3,
            color: '#19518a',
            position: {x: 0, y: 0}
          }
        }
      ]
    },
  },

  {
    name: 'along path',
    dropdownName: 'Mosaic Brush',
    category: 'brushes',
    tags: 'drawing',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'mosaic_brush.jpg',
    mouseActionType: 'drag-path',
    params: {
      path: [],
      pathSpacing: 15,
      children: [
        {
          name: 'circle',
          type: 'effect',
          category: 'shapes',
          effect: 'circle',
          params: {color: 'rgb(255, 0, 0)', position: {x: 0, y: 0}, radius: 5} // Red
        },
        {
          name: 'triangle',
          type: 'effect',
          category: 'shapes',
          effect: 'triangle',
          params: {color: 'rgb(255, 165, 0)', position: {x: 0, y: 0}, width: 20, height: 20} // Orange
        },
        {
          name: 'rectangle',
          type: 'effect',
          category: 'shapes',
          effect: 'rectangle',
          params: {color: 'rgb(255, 215, 0)', position: {x: 0, y: 0}, width: 15, height: 22.5} // Gold
        },
        {
          name: 'circle',
          type: 'effect',
          category: 'shapes',
          effect: 'circle',
          params: {color: 'rgb(128, 128, 0)', position: {x: 0, y: 0}, radius: 10} // Olive
        },
        {
          name: 'triangle',
          type: 'effect',
          category: 'shapes',
          effect: 'triangle',
          params: {color: 'rgb(0, 128, 0)', position: {x: 0, y: 0}, width: 15, height: 15} // Green
        },
        {
          name: 'rectangle',
          type: 'effect',
          category: 'shapes',
          effect: 'rectangle',
          params: {color: 'rgb(38, 162, 224)', position: {x: 0, y: 0}, width: 8, height: 12} // Light blue
        },
        {
          name: 'circle',
          type: 'effect',
          category: 'shapes',
          effect: 'circle',
          params: {color: 'rgb(0, 0, 255)', position: {x: 0, y: 0}, radius: 8} // Blue
        },
        {
          name: 'triangle',
          type: 'effect',
          category: 'shapes',
          effect: 'triangle',
          params: {color: 'rgb(75, 0, 130)', position: {x: 0, y: 0}, width: 10, height: 10} // Indigo
        },
        {
          name: 'rectangle',
          type: 'effect',
          category: 'shapes',
          effect: 'rectangle',
          params: {color: 'rgb(128, 0, 128)', position: {x: 0, y: 0}, width: 20, height: 30} // Purple
        },
        {
          name: 'circle',
          type: 'effect',
          category: 'shapes',
          effect: 'circle',
          params: {color: 'rgb(238, 130, 238)', position: {x: 0, y: 0}, radius: 10} // Violet
        },
        {
          name: 'triangle',
          type: 'effect',
          category: 'shapes',
          effect: 'triangle',
          params: {color: 'rgb(255, 192, 203)', position: {x: 0, y: 0}, width: 12, height: 12} // Pink
        }
      ]
    }
  }, 

  {
    name: 'along path',
    dropdownName: 'Heart brush',
    category: 'brushes',
    tags: 'drawing',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'heart_brush.jpeg',
    mouseActionType: 'drag-path',
    params: {
      path: [],
      pathSpacing: 15,
      children: [
        {
          name: 'heart',
          type: 'effect',
          category: 'shapes',
          effect: 'heart',
          params: {
            size: 16,
            color: '#f35b04',
            position: {x: 0, y: 0}
          }
        },
        {
          name: 'heart',
          type: 'effect',
          category: 'shapes',
          effect: 'heart',
          params: {
            size: 10,
            color: '#f18701',
            position: {x: 100, y: 100}
          }
        }
      ]
    },
  },

  {
    name: 'along path',
    dropdownName: 'Star Brush',
    category: 'brushes',
    tags: 'drawing',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'star_brush.png',
    mouseActionType: 'drag-path',
    params: {
      path: [],
      pathSpacing: 20,
      children: [
        {
          name: 'star',
          type: 'effect',
          category: 'shapes',
          effect: 'star',
          params: {color: '#F72585', position: {x: 0, y: 0}, r1: 10, r2: 7, npoints: 5}
        },
        {
          name: 'star',
          type: 'effect',
          category: 'shapes',
          effect: 'star',
          params: {color: '#7209B7', position: {x: 0, y: 0}, r1: 12, r2: 6, npoints: 7}
        },
        {
          name: 'star',
          type: 'effect',
          category: 'shapes',
          effect: 'star',
          params: {color: '#3A0CA3', position: {x: 0, y: 0}, r1: 12, r2: 5, npoints: 15}
        },
        {
          name: 'star',
          type: 'effect',
          category: 'shapes',
          effect: 'star',
          params: {color: '#4361EE', position: {x: 0, y: 0}, r1: 10, r2: 4, npoints: 4}
        },
        {
          name: 'star',
          type: 'effect',
          category: 'shapes',
          effect: 'star',
          params: {color: '#4CC9F0', position: {x: 0, y: 0}, r1: 11, r2: 3, npoints: 15}
        }
      ]
    }
  },

  {
    name: 'bounce',
    dropdownName: 'bounce',
    category: 'brushes',
    tags: 'drawing',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'straight_line.jpeg',
    mouseActionType: 'drag',
    params: {
      position: {x:100, y:100},
      duration: 1000,
      angle: 0,
      spacing: 1,
      color: '#f57f7e'
    }
  },
  {
    name: 'straight line',
    dropdownName: 'straight line',
    category: 'brushes',
    tags: 'drawing',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'straight_line.jpeg',
    mouseActionType: 'drag',
    params: {
      start: {x:100, y:100},
      end: {x:300, y:300},
      color: '#f57f7e',
      lineWeight: 5
    }
  },
  {
    name: 'tile',
    dropdownName: 'Straight Grid',
    category: 'patterns',
    tags: 'drawing',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'straight_grid.jpg',
    mouseActionType: 'drag',
    params: {
      tiling: 'straight grid',
      width: 100,
      height: 100,
      position: {x: 150, y: 150}
    }
  },
  {
    name: 'tile',
    dropdownName: 'Brick',
    category: 'patterns',
    tags: 'drawing',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'brick.jpg',
    mouseActionType: 'single-click',
    params: {
      tiling: 'brick',
      width: 100,
      height: 40,
      position: {x: 150, y: 150}
    }
  },
  {
    name: 'tile',
    dropdownName: 'Half Drop',
    category: 'patterns',
    tags: 'drawing',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'half_drop.jpg',
    mouseActionType: 'single-click',
    params: {
      tiling: 'half drop',
      width: 150,
      height: 250,
      position: {x: 150, y: 150}
    }
  },
  {
    name: 'tile',
    dropdownName: 'Checkerboard',
    category: 'patterns',
    tags: 'drawing',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'checkerboard.jpg',
    mouseActionType: 'single-click',
    params: {
      tiling: 'checkerboard',
      width: 50,
      height: 50,
      position: {x: 150, y: 150}
    }
  },
  {
    name: 'tile',
    dropdownName: 'Radial',
    category: 'patterns',
    tags: 'drawing',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'radial.jpg',
    mouseActionType: 'drag',
    params: {
      tiling: 'radial',
      width: 50,
      height: 50,
      numTiles: 5,
      numRings: 3,
      position: {x: 150, y: 150}
    }
  },
  {
    name: 'invert',
    dropdownName: 'Invert',
    category: 'effects',
    tags: 'drawing',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'invert.jpg',
    mouseActionType: 'single-click',
    params: {
      filter: 'invert'
    }
  },
  {
    name: 'grayscale',
    dropdownName: 'Grayscale',
    category: 'effects',
    tags: 'drawing',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'grayscale.jpg',
    mouseActionType: 'single-click',
    params: {
      filter: 'gray'
    }
  },
  {
    name: 'threshold',
    dropdownName: 'Threshold',
    category: 'effects',
    tags: 'drawing',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'threshold.jpg',
    mouseActionType: 'single-click',
    params: {
      filter: 'threshold'
    }
  },
  {
    name: 'grow',
    dropdownName: 'Grow',
    category: 'effects',
    tags: 'drawing',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'grow.jpg',
    mouseActionType: 'drag',
    params: {
      scaleBy: 300,
      width: 100,
      height: 100,
      position: {x: 150, y: 150}
    }
  },
  {
    name: 'shrink',
    dropdownName: 'Shrink',
    category: 'effects',
    tags: 'drawing',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'shrink.jpg',
    mouseActionType: 'drag',
    params: {
      scaleBy: 50,
      width: 100,
      height: 100,
      position: {x: 150, y: 150}
    }
  },
  {
    name: 'shift',
    dropdownName: 'Shift',
    category: 'effects',
    tags: 'drawing',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'shift.jpeg',
    mouseActionType: 'drag',
    params: {
      orientation: 'vertical',
      height: 50,
      offset: 20
    }
  },
  // {
  //   name: 'copy cutout',
  //   dropdownName: 'Copy Shape',
  //   category: 'shapes',
  //   tags: 'drawing',
  //   cursor: './assets/cursors/star-solid.svg',
  //   thumbnail: 'copy.jpg',
  //   mouseActionType: 'drag-with-hover-preview',
  //   params: {
  //     width: 50,
  //     height: 100,
  //     shape: 'rectangle',
  //     start: {x:100, y:100},
  //     end: {x:300, y:300},
  //   }
  // },
  /*'circle', 'square', 'triangle', 'star', 'heart',*/
  // {
  //   name: 'snapshot',
  //   dropdownName: 'Take Snapshot',
  //   category: 'Effects',
  //   tags: 'drawing',
  //   init: `Snapshot {id:'snapshot', type:'image'}`,
  //   cursor: './assets/cursors/star-solid.svg',
  //   mouseActionType: 'single-click',
  //   onact: (my) => {
  //     my.target.snapshot(my.data.image);
  //   }
  // },
  
  // {
  //   name: 'mosaic brush',
  //   dropdownName: 'mosaic brush',
  //   category: 'Brushes',
  //   tags: 'drawing',
  //   init: function() {
  //     let listname = 'mosaic';
  //     let configString = `{id:'alongpath', type:'sequences/alongpath',
  //       pathData: '[[]]',
  //       listname: '${listname}'}`;
  //     let parseResult = this.parseActorMarkup(configString);

  //     let colors = [
  //       'rgb(255,   0,   0)', // Red
  //       'rgb(255, 165,   0)', // Orange
  //       'rgb(255, 215,   0)', // Gold
  //       'rgb(128, 128,   0)', // Olive
  //       'rgb(  0, 128,   0)', // Green
  //       'rgb( 38, 162, 224)', // Light blue
  //       'rgb(  0,   0, 255)', // Blue
  //       'rgb( 75,   0, 130)', // Indigo
  //       'rgb(128,   0, 128)', // Purple
  //       'rgb(238, 130, 238)', // Violet
  //       'rgb(255, 192, 203)' // Pink
  //     ];

  //     let initActions = [];

  //     let shapes =
  //     [
  //       "motif/circle",
  //       "motif/triangle",
  //       "motif/rectangle",
  //     ];

  //     let sizes = [10, 20, 15, 8];

  //     for(let i=0;i<colors.length;i++) {
  //       let size = sizes[i%sizes.length];
  //       let shape = shapes[i%shapes.length];
  //       let width = size;
  //       let height = size*1.5;
  //       let radius = size / 2;
  //       let color = colors[i];
  //       initActions.push(toJoyDataFormat(shape, {color: color, x: 0, y: 0, size: size, width: width, height: height, radius: radius }));
  //     }
      
  //     // let initActions = [
  //     //   toJoyDataFormat('motif/star', {color: [200, 0.8, 1], x: 0, y: 0, r1: 10, r2: 7, npoints: 5}),
  //     //   toJoyDataFormat('motif/star', {color: [50, 0.8, 1], x: 0, y: 0, r1: 12, r2: 6, npoints: 7}),
  //     //   toJoyDataFormat('motif/star', {color: [100, 0.8, 1], x: 0, y: 0, r1: 12, r2: 5, npoints: 15})];        
      
  //     let alongpathOption = parseResult.actorOptions.find(obj  => obj.id === 'alongpath');
  //     if(alongpathOption) {
  //       alongpathOption.initActions = initActions; //pass in the starter actions
  //     }
  //     this.initializeDOM(parseResult);
  //   },
  //   cursor: './assets/cursors/star-solid.svg',
  //   mouseActionType: 'drag-path',
  //   onact: (my) => {
  //     my.actor.alongpath.act(my.target);
  //   }
  // },
  {
    name: 'box',
    dropdownName: 'Box',
    category: 'stencils',
    tags: 'stencils',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'box.jpg',
    mouseActionType: 'drag',
    params: {
      length: 100,
      width: 100,
      height: 100
    }
  },
  {
    name: 'envelope',
    dropdownName: 'Envelope',
    category: 'stencils',
    tags: 'stencils',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'envelope.jpg',
    mouseActionType: 'drag',
    params: {
      width: 200,
      height: 100
    }
  },
  // {
  //   name: 'paper doll',
  //   dropdownName: 'Doll',
  //   category: 'stencils',
  //   tag: 'stencils',
  //   cursor: './assets/cursors/star-solid.svg',
  //   thumbnail: 'doll.jpg',
  //   mouseActionType: 'single-click',
  //   params: {
  //     skinTone: '#F3D7C2',
  //     hairstyle: '1',
  //     outfit: '2'
  //   }
  // },
  // {
  //   name: 'paper doll',
  //   dropdownName: 'Doll',
  //   category: 'Stencils',
  //   tag: 'stencils',
  //   init: `Paper doll with skin tone 
  //   {id:'skinTone', type:'color',
  //   colorOptions: [
  //     '#552E1F','#60311F','#A16F4C','#BB815C','#BC8F68','#CA9978',
  //     '#DCBA9E','#F3D7C2','#653728','#B77E53','#D6A98A','#F0CBB0',
  //     '#A6734A','#422E29','#4E2E2A','#683F38','#7A4943','#492F29',
  //     '#51342C','#643E31','#774D3D','#4A3123','#543626','#61402E',
  //     '#331707','#462008','#58280A','#7A370F','#DFBDA2','#E4C9B6',
  //     '#3E2C1E','#5F442C','#7E573B','#060403','#8A5414','#B57033',
  //     '#744D36','#FDF0D5','#FADCA9','#EDB178','#DF9D56','#D38C45',
  //     '#F6D4B9','#DEBA96','#DAB08C','#CD865A','#B37858','#96624D'],
  //     formatToggle: false,
  //     swatchesOnly: true,
  //     alphaEnabled: false},
  //   hairstyle {id:'hairstyle', type:'choose', options:['1', '2', '3'], placeholder:'1'},
  //   outfit set {id:'outfit', type:'choose', options:['1', '2'], placeholder:'2'}`,
  //   cursor: './assets/cursors/star-solid.svg',
  //   mouseActionType: 'single-click',
  //   onact: `(my) => {
  //     my.target.paperdoll({ skinTone: my.data.skinTone, hairstyle: my.data.hairstyle, outfit: my.data.outfit});
  //   }`
  // },
];

// let templates = [];

// function getTemplateByType(type) {

// }


// function toJoyDataFormat(type, data) {
//   // console.log("trying to get joy data format for ", type, "with data", data);
//   const template = Joy.getTemplateByType(type);

//   if (!template) {
//     throw new Error(`No template found for type ${type}`);
//   }

//   const initString = template.init;
//   const regex = /{id:'(.*?)', type:'(.*?)'/g;
//   let matches;
//   const idTypeMapping = {};

//   // Create a mapping of id to type from the init string
//   while ((matches = regex.exec(initString)) !== null) {
//     idTypeMapping[matches[1]] = matches[2];
//   }

//   const result = { type };

//   // Loop through the data and convert it to the required format
//   for (let key in data) {
//     if (idTypeMapping[key]) {
//       result[key] = {
//         type: idTypeMapping[key],
//         value: data[key]
//       };
//     }
//   }

//   return result;
// }