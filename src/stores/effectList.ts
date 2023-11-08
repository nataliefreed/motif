export const effectList = [
  {
    name: 'solid fill',
    dropdownName: 'Solid Fill',
    category: 'backgrounds',
    tag: 'motif',
    cursor: './assets/cursors/fill-drip-solid.svg',
    thumbnail: 'solid-fill.jpg',
    mouseActionType: 'drag',
    params: {
      color: '#bbaa00'
    }
  },
  {
    name: 'gradient',
    dropdownName: 'Gradient',
    category: 'backgrounds',
    tag: 'motif',
    cursor: './assets/cursors/fill-drip-solid.svg',
    mouseActionType: 'drag',
    params: {
      color1: '#79C2D7',
      color2: '#E869A3',
      angle: 0
    }
  },
  {
    name: 'stripes',
    dropdownName: 'Stripes',
    category: 'backgrounds',
    tag: 'motif',
    cursor: './assets/cursors/fill-drip-solid.svg',
    thumbnail: 'stripes.jpg',
    mouseActionType: 'drag',
    params: {
      stripeWidth: 50,
      color1: '#a8d863',
      color2: '#d967a7',
      angle: 0
    }
  },
  {
    name: 'circle',
    dropdownName: 'Circle',
    category: 'shapes',
    tag: 'motif',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'circle.jpg',
    mouseActionType: 'drag',
    params: {
      radius: 20,
      color: '#1B54B1',
      position: {x: 100, y: 100}
    }
  },
  {
    name: 'square',
    dropdownName: 'Square',
    category: 'shapes',
    tag: 'motif',
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
    tag: 'motif',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'polygon.jpg',
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
    tag: 'motif',
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
    tag: 'motif',
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
    tag: 'motif',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'rectangle.jpg',
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
    tag: 'motif',
    cursor: './assets/cursors/star-solid.svg',
    thumbnail: 'triangle.jpg',
    mouseActionType: 'drag',
    params: {
      width: 40,
      height: 40,
      color: '#62aed2',
      position: {x: 100, y: 100}
    }
  },
  {
    name: "straight line",
    dropdownName: "Straight Line",
    category: "brushes",
    tag: "motif",
    cursor: "./assets/cursors/star-solid.svg",
    thumbnail: "straight_line.jpg", // Placeholder for thumbnail
    mouseActionType: "drag",
    params: {
      firstPoint: { "x": 100, "y": 100 },
      lastPoint: { "x": 300, "y": 300 },
      color: "#f57f7e",
      lineWeight: 5
    }
  },  
  {
    name: 'straight grid',
    dropdownName: 'Straight Grid',
    category: 'patterns',
    tag: 'motif',
    init: `{id:'tiling', type:'choose', options:['straight grid', 'brick', 'half drop', 'checkerboard', 'radial'], placeholder:'straight grid'} 
    with width {id:'width', type:'numberslider', min:5, max:600, placeholder:100} 
    and height {id:'height', type:'numberslider', min:5, max:600, placeholder:100}
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag',
    onact: `(my) => {
      my.target.tile({
        width: my.data.width,
        height: my.data.height,
        tiling: my.data.tiling,
        x: my.data.position[0],
        y: my.data.position[1] });
    }`
  },
  {
    name: 'brick',
    dropdownName: 'Brick',
    category: 'patterns',
    tag: 'motif',
    init: `{id:'tiling', type:'choose', options:['straight grid', 'brick', 'half drop', 'checkerboard', 'radial'], placeholder:'brick'} 
    with width {id:'width', type:'numberslider', min:5, max:600, placeholder:100} 
    and height {id:'height', type:'numberslider', min:5, max:600, placeholder:40}
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
    onact: `(my) => {
      my.target.tile({
        width: my.data.width,
        height: my.data.height,
        tiling: my.data.tiling,
        x: my.data.position[0],
        y: my.data.position[1] });
    }`
  },
  {
    name: 'half drop',
    dropdownName: 'Half Drop',
    category: 'patterns',
    tag: 'motif',
    init: `{id:'tiling', type:'choose', options:['straight grid', 'brick', 'half drop', 'checkerboard', 'radial'], placeholder:'half drop'} 
    with width {id:'width', type:'numberslider', min:5, max:600, placeholder:150} 
    and height {id:'height', type:'numberslider', min:5, max:600, placeholder:250}
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
    onact: `(my) => {
      my.target.tile({
        width: my.data.width,
        height: my.data.height,
        tiling: my.data.tiling,
        x: my.data.position[0],
        y: my.data.position[1] });
    }`
  },
  {
    name: 'checkerboard',
    dropdownName: 'Checkerboard',
    category: 'patterns',
    tag: 'motif',
    init: `{id:'tiling', type:'choose', options:['straight grid', 'brick', 'half drop', 'checkerboard', 'radial'], placeholder:'checkerboard'} 
    with width {id:'width', type:'numberslider', min:5, max:600, placeholder:50} 
    and height {id:'height', type:'numberslider', min:5, max:600, placeholder:50}
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
    onact: `(my) => {
      my.target.tile({
        width: my.data.width,
        height: my.data.height,
        tiling: my.data.tiling,
        x: my.data.position[0],
        y: my.data.position[1] });
    }`
  },
  {
    name: 'radial',
    dropdownName: 'Radial',
    category: 'patterns',
    tag: 'motif',
    init: `{id:'tiling', type:'choose', options:['straight grid', 'brick', 'half drop', 'checkerboard', 'radial'], placeholder:'radial'} 
    with width {id:'width', type:'numberslider', min:5, max:600, placeholder:50} 
    and height {id:'height', type:'numberslider', min:5, max:600, placeholder:50}
    at angle {id:'angle', type:'numberslider', min:0, max:360, placeholder:0}&deg
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag',
    onact: `(my) => {
      my.target.tile({
        width: my.data.width,
        height: my.data.height,
        tiling: my.data.tiling,
        x: my.data.position[0],
        y: my.data.position[1],
        numRings: my.data.angle / 10 });
    }`
  },
  {
    name: 'grow',
    dropdownName: 'Grow',
    category: 'effects',
    tag: 'motif',
    init: `Scale by {id:'scaleBy', type:'numberslider', min:0, max:600, placeholder:300}%
    width {id:'width', type:'numberslider', min:1, max:600, placeholder:100} 
    and height {id:'height', type:'numberslider', min:1, max:600, placeholder:100}
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag',
    onact: `(my) => {
      my.target.grow({ 
        width: my.data.width, 
        height: my.data.height, 
        scaleBy: my.data.scaleBy, 
        x: my.data.position[0], 
        y: my.data.position[1] 
      });
    }`
  },
  {
    name: 'shrink',
    dropdownName: 'Shrink',
    category: 'effects',
    tag: 'motif',
    init: `Scale by {id:'scaleBy', type:'numberslider', min:0, max:600, placeholder:50}%
    width {id:'width', type:'numberslider', min:1, max:600, placeholder:100} 
    and height {id:'height', type:'numberslider', min:1, max:600, placeholder:100}
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag',
    onact: `(my) => {
      my.target.grow({ 
        width: my.data.width, 
        height: my.data.height, 
        scaleBy: my.data.scaleBy, 
        x: my.data.position[0], 
        y: my.data.position[1] 
      });
    }`
  },
  {
    name: 'shift',
    dropdownName: 'Shift',
    category: 'effects',
    tag: 'motif',
    init: `{id:'orientation', type:'choose', options:['vertical','horizontal'], placeholder:'vertical'} shift 
    with height {id:'height', type:'numberslider', min:1, max:600, placeholder:50} 
    and offset {id:'offset', type:'numberslider', min:1, max:600, placeholder:20}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag',
    onact: `(my) => {
      my.target.shift({ height: my.data.height, offset: my.data.offset, orientation: my.data.orientation });
    }`
  },
  {
    name: 'invert',
    dropdownName: 'Invert',
    category: 'effects',
    tag: 'motif',
    init: `Color shift of type {id:'filter', type:'choose', options:['invert','threshold', 'gray'], placeholder:'invert'}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
    onact: `(my) => {
      my.target.applyFilter({ filter: my.data.filter });
    }`
  },
  {
    name: 'grayscale',
    dropdownName: 'Grayscale',
    category: 'effects',
    tag: 'motif',
    init: `Color shift of type {id:'filter', type:'choose', options:['invert','threshold', 'gray'], placeholder:'gray'}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
    onact: `(my) => {
      my.target.applyFilter({ filter: my.data.filter });
    }`
  },
  {
    name: 'threshold',
    dropdownName: 'Threshold',
    category: 'effects',
    tag: 'motif',
    init: `Color shift of type {id:'filter', type:'choose', options:['invert','threshold', 'gray'], placeholder:'threshold'}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
    onact: `(my) => {
      my.target.applyFilter({ filter: my.data.filter });
    }`
  },
  {
    name: 'copy',
    dropdownName: 'Copy Shape',
    category: 'shapes',
    tag: 'motif',
    init: `Copy
    {id: 'width', type: 'numberslider', min:1, max:600, placeholder: 50} x
    {id: 'height', type: 'numberslider', min:1, max:600, placeholder: 50}
    {id:'shape', type: 'choose', options:['rectangle'], placeholder: 'rectangle'} 
    from {id:'firstPoint', type:'coordinate', min:0, max:600, placeholder:[]}
    to {id:'lastPoint', type:'coordinate', min:0, max:600, placeholder:[]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag-with-hover-preview',
    onact: `(my) => {
      my.target.copyCutout({ width: my.data.width, height: my.data.height, shape: my.data.shape, x1: my.data.firstPoint[0], y1: my.data.firstPoint[1], x2: my.data.lastPoint[0], y2: my.data.lastPoint[1]});
    },
    hoverPreview: (my) => { //TODO
      my.target.dashedOutlineRect({ x: my.data.x, y: my.data.y, width: my.data.width, height: my.data.height });
    }`
  },
  /*'circle', 'square', 'triangle', 'star', 'heart',*/
  // {
  //   name: 'snapshot',
  //   dropdownName: 'Take Snapshot',
  //   category: 'Effects',
  //   tag: 'motif',
  //   init: `Snapshot {id:'snapshot', type:'image'}`,
  //   cursor: './assets/cursors/star-solid.svg',
  //   mouseActionType: 'single-click',
  //   onact: (my) => {
  //     my.target.snapshot(my.data.image);
  //   }
  // },

  // {
  //   name: 'heart brush',
  //   dropdownName: 'Heart brush',
  //   category: 'Brushes',
  //   tag: 'motif',
  //   init: function() {
  //     let listname = 'heart brush';
  //     let configString = `{id:'alongpath', type:'sequences/alongpath',
  //       pathData: '[]',
  //       listname: '${listname}'}`;
  //     let parseResult = this.parseActorMarkup(configString);
  //     let initActions = [
  //       toJoyDataFormat('motif/heart', {color: '#f35b04', x: 0, y: 0, size: 7}), //todo: how to pass in color here?
  //       toJoyDataFormat('motif/heart', {color: '#f18701', x: 0, y: 0, size: 10})];        
  //     let alongpathOption = parseResult.actorOptions.find(obj  => obj.id === 'alongpath');
  //     if(alongpathOption) {
  //       alongpathOption.initActions = initActions; //pass in the starter actions
  //     }
  //     this.initializeDOM(parseResult);
  //   },
  //   cursor: './assets/cursors/star-solid.svg',
  //   mouseActionType: 'drag-path',
  //   onact: (my) => {
  //     // console.log(my.data);
  //     my.actor.alongpath.act(my.target);
  //   }
  // },
  // {
  //   name: 'star brush',
  //   dropdownName: 'star brush',
  //   category: 'Brushes',
  //   tag: 'motif',
  //   init: function() {
  //     let listname = 'star brush';
  //     let configString = `{id:'alongpath', type:'sequences/alongpath',
  //       pathData: '[[30,30],[40,40],[100,40],[100,100],[600,250]]',
  //       listname: '${listname}'}`;

  //     let parseResult = this.parseActorMarkup(configString);
  //     let initActions = [
  //       toJoyDataFormat('motif/star', {color: '#F72585', x: 0, y: 0, r1: 10, r2: 7, npoints: 5}),
  //       toJoyDataFormat('motif/star', {color: '#7209B7', x: 0, y: 0, r1: 12, r2: 6, npoints: 7}),
  //       toJoyDataFormat('motif/star', {color: '#3A0CA3', x: 0, y: 0, r1: 12, r2: 5, npoints: 15}),
  //       toJoyDataFormat('motif/star', {color: '#4361EE', x: 0, y: 0, r1: 10, r2: 4, npoints: 4}),
  //       toJoyDataFormat('motif/star', {color: '#4CC9F0', x: 0, y: 0, r1: 11, r2: 3, npoints: 15}),
      
  //     ];        
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
  // {
  //   name: 'mosaic brush',
  //   dropdownName: 'mosaic brush',
  //   category: 'Brushes',
  //   tag: 'motif',
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
    category: 'Stencils',
    tag: 'stencils',
    init: `Box with length 
    {id:'length', type:'numberslider', placeholder:120, min:20}, 
    width {id:'width', type:'numberslider', placeholder:120, min:20}, 
    height {id:'height', type:'numberslider', placeholder:120, min:20}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag',
    onact: `(my) => {
      my.target.foldableBoxStencil({ length: my.data.length, width: my.data.width, height: my.data.height });
    }`
  },
  {
    name: 'paper doll',
    dropdownName: 'Doll',
    category: 'Stencils',
    tag: 'stencils',
    init: `Paper doll with skin tone 
    {id:'skinTone', type:'color',
    colorOptions: [
      '#552E1F','#60311F','#A16F4C','#BB815C','#BC8F68','#CA9978',
      '#DCBA9E','#F3D7C2','#653728','#B77E53','#D6A98A','#F0CBB0',
      '#A6734A','#422E29','#4E2E2A','#683F38','#7A4943','#492F29',
      '#51342C','#643E31','#774D3D','#4A3123','#543626','#61402E',
      '#331707','#462008','#58280A','#7A370F','#DFBDA2','#E4C9B6',
      '#3E2C1E','#5F442C','#7E573B','#060403','#8A5414','#B57033',
      '#744D36','#FDF0D5','#FADCA9','#EDB178','#DF9D56','#D38C45',
      '#F6D4B9','#DEBA96','#DAB08C','#CD865A','#B37858','#96624D'],
      formatToggle: false,
      swatchesOnly: true,
      alphaEnabled: false},
    hairstyle {id:'hairstyle', type:'choose', options:['1', '2', '3'], placeholder:'1'},
    outfit set {id:'outfit', type:'choose', options:['1', '2'], placeholder:'2'}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
    onact: `(my) => {
      my.target.paperdoll({ skinTone: my.data.skinTone, hairstyle: my.data.hairstyle, outfit: my.data.outfit});
    }`
  },
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