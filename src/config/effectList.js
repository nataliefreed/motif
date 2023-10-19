import { parse } from 'uuid';
import { HSVtoRGB, RGBtoHSV } from '../utils/color-utils.js';
import { Joy } from '../libraries/joy/joy.js';
export const effectList = [
  {
    name: 'solid fill',
    dropdownName: 'Solid Fill',
    category: 'Backgrounds',
    tag: 'motif',
    init: "Fill with {id:'color', type:'color', placeholder:'#ffaa00f2'}",
    cursor: './assets/cursors/fill-drip-solid.svg',
    thumbnail: './assets/effect-thumbnails/solid-fill.png',
    mouseActionType: 'drag',
    onact: (my) => {
      my.target.addFill({color: my.data.color});
    }
  },
  {
    name: 'gradient',
    dropdownName: 'Gradient',
    category: 'Backgrounds',
    tag: 'motif',
    init: "Gradient from {id:'color1', type:'color', placeholder:'#79C2D7'} to {id:'color2', type:'color', placeholder:'#E869A3'} at angle {id:'angle', type:'numberslider', min:0, max:360, placeholder:0}&deg",
    cursor: './assets/cursors/fill-drip-solid.svg',
    mouseActionType: 'drag',
    onact: (my) => {
      my.target.gradient({ color1: my.data.color1, color2: my.data.color2 , angle: my.data.angle});
    }
  },
  {
    name: 'stripes',
    dropdownName: 'Stripes',
    category: 'Backgrounds',
    tag: 'motif',
    init: `Stripes of width {id:'stripeWidth', type:'numberslider', min:1, max:300, placeholder:50}
      from {id:'color1', type:'color', placeholder:'#a8d863'} 
      to {id:'color2', type:'color', placeholder:'#d967a7'}
      at angle {id:'angle', type:'numberslider', min:0, max:360, placeholder:0}&deg`,
    cursor: './assets/cursors/fill-drip-solid.svg',
    mouseActionType: 'drag',
    onact: (my) => {
      my.target.stripes({ stripeWidth: my.data.stripeWidth, color1: my.data.color1, color2: my.data.color2 , angle: my.data.angle });
    }
  },
  {
    name: 'circle',
    dropdownName: 'Circle',
    category: 'Shapes',
    tag: 'motif',
    init: `Circle of radius {id:'radius', type:'numberslider', min:1, max:600, placeholder:20}
    in color {id:'color', type:'color', placeholder:'#FFA76B'}  
    at {id:'position', type:'coordinate', placeholder:[]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag',
    onact: (my) => {
      my.target.addCircle({ color: my.data.color, x: my.data.position[0], y: my.data.position[1], r: my.data.radius });
    }
  },
  {
    name: 'square',
    dropdownName: 'Square',
    category: 'Shapes',
    tag: 'motif',
    init: `Square of size {id:'size', type:'numberslider', min:1, max:600, placeholder:40}
    in color {id:'color', type:'color', placeholder:'#FFA76B'}  
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag',
    onact: (my) => {
      my.target.addSquare({ color: my.data.color, x: my.data.position[0], y: my.data.position[1], size: my.data.size });
    }
  },
  {
    name: 'polygon',
    dropdownName: 'Polygon',
    category: 'Shapes',
    tag: 'motif',
    init: `Polygon with {id:'nsides', type:'numberslider', min:3, max:50, placeholder:6} sides 
    and radius {id:'radius', type:'numberslider', min:1, max:600, placeholder:20} 
    in color {id:'color', type:'color', placeholder:'#9c83e1'}  
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag',
    onact: (my) => {
      my.target.polygon({ color: my.data.color, x: my.data.position[0], y: my.data.position[1], r: my.data.radius, nsides: my.data.nsides });
    }
  },
  {
    name: 'star',
    dropdownName: 'Star',
    category: 'Shapes',
    tag: 'motif',
    init: `Star with {id:'npoints', type:'numberslider', min:3, max:200, placeholder:7} points, 
    outer {id:'r1', type:'numberslider', min:1, max:600, placeholder:20}, 
    inner {id:'r2', type:'numberslider', min:1, max:600, placeholder:10} 
    in color {id:'color', type:'color', placeholder:'#a2d16b'}  
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag',
    onact: (my) => {
      my.target.star({color: my.data.color, x: my.data.position[0], y: my.data.position[1], r1: my.data.r1, r2: my.data.r2, npoints: my.data.npoints});
    }
  },
  {
    name: 'heart',
    dropdownName: 'Heart',
    category: 'Shapes',
    tag: 'motif',
    init: `Heart of size {id:'size', type:'numberslider', min:1, max:600, placeholder:40} 
    in color {id:'color', type:'color', placeholder:'#da6bb1'}  
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag',
    onact: (my) => {
      my.target.heart({ color: my.data.color, x: my.data.position[0], y: my.data.position[1], size: my.data.size });
    }
  },
  {
    name: 'rectangle',
    dropdownName: 'Rectangle',
    category: 'Shapes',
    tag: 'motif',
    init: `Rectangle of width {id:'width', type:'numberslider', min:1, max:600, placeholder:50}
     and height {id:'height', type:'numberslider', min:1, max:600, placeholder:30}
    in color {id:'color', type:'color', placeholder:'#52bf67'}
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag',
    onact: (my) => {
      my.target.addRectangle({ color: my.data.color, x: my.data.position[0], y: my.data.position[1], width: my.data.width, height: my.data.height});
    }
  },
  {
    name: 'triangle',
    dropdownName: 'Triangle',
    category: 'Shapes',
    tag: 'motif',
    init: `Triangle of width {id:'width', type:'numberslider', min:1, max:600, placeholder:40} 
    and height {id:'height', type:'numberslider', min:1, max:600, placeholder:40} 
    in color {id:'color', type:'color', placeholder:'#62aed2'}  
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag',
    onact: (my) => {
      my.target.addTriangle({ color: my.data.color, x: my.data.position[0], y: my.data.position[1], width: my.data.width, height: my.data.height });
    }
  },
  {
    name: 'straight line',  //TODO: make sure this gets a first and last point when it's added
    dropdownName: 'straight line',
    category: 'Brushes',
    tag: 'motif',
    init: `Straight line
    from {id:'firstPoint', type:'coordinate', min:0, max:600, placeholder:[100, 100]}
    to {id:'lastPoint', type:'coordinate', min:0, max:600, placeholder:[300, 300]}
    in color {id:'color', type:'color', placeholder:'#f57f7e'}
    in width {id: 'lineWeight', type: 'numberslider', min:1, max:600, placeholder: 5}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag',
    onact: (my) => {
      my.target.addLine({ color: my.data.color, lineWeight: my.data.lineWeight, x1: my.data.firstPoint[0], y1: my.data.firstPoint[1], x2: my.data.lastPoint[0], y2: my.data.lastPoint[1]});
    }
  },
  // {
  //   name: 'brush',
  //   dropdownName: 'Brush',
  //   category: 'Brushes',
  //   tag: 'motif',
  //   init: `Brush in {id:'color', type:'color', placeholder:[20, 0.8, 1.0]} 
  //   with width {id: 'lineWeight', type: 'numberslider', min:1, max:600, placeholder: 8} 
  //   along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
  //   cursor: './assets/cursors/star-solid.svg',
  //   mouseActionType: 'drag',
  //   onact: (my) => {
  //     my.target.addBrushStroke({ color: my.data.color, lineWeight: my.data.lineWeight, pointsList: my.data.pointsList });
  //   }
  // },
  {
    name: 'straight grid',
    dropdownName: 'Straight Grid',
    category: 'Patterns',
    tag: 'motif',
    init: `{id:'tiling', type:'choose', options:['straight grid', 'brick', 'half drop', 'checkerboard', 'radial'], placeholder:'straight grid'} 
    with width {id:'width', type:'numberslider', min:5, max:600, placeholder:100} 
    and height {id:'height', type:'numberslider', min:5, max:600, placeholder:100}
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag',
    onact: (my) => {
      my.target.tile({
        width: my.data.width,
        height: my.data.height,
        tiling: my.data.tiling,
        x: my.data.position[0],
        y: my.data.position[1] });
    }
  },
  {
    name: 'brick',
    dropdownName: 'Brick',
    category: 'Patterns',
    tag: 'motif',
    init: `{id:'tiling', type:'choose', options:['straight grid', 'brick', 'half drop', 'checkerboard', 'radial'], placeholder:'brick'} 
    with width {id:'width', type:'numberslider', min:5, max:600, placeholder:100} 
    and height {id:'height', type:'numberslider', min:5, max:600, placeholder:40}
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
    onact: (my) => {
      my.target.tile({
        width: my.data.width,
        height: my.data.height,
        tiling: my.data.tiling,
        x: my.data.position[0],
        y: my.data.position[1] });
    }
  },
  {
    name: 'half drop',
    dropdownName: 'Half Drop',
    category: 'Patterns',
    tag: 'motif',
    init: `{id:'tiling', type:'choose', options:['straight grid', 'brick', 'half drop', 'checkerboard', 'radial'], placeholder:'half drop'} 
    with width {id:'width', type:'numberslider', min:5, max:600, placeholder:150} 
    and height {id:'height', type:'numberslider', min:5, max:600, placeholder:250}
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
    onact: (my) => {
      my.target.tile({
        width: my.data.width,
        height: my.data.height,
        tiling: my.data.tiling,
        x: my.data.position[0],
        y: my.data.position[1] });
    }
  },
  {
    name: 'checkerboard',
    dropdownName: 'Checkerboard',
    category: 'Patterns',
    tag: 'motif',
    init: `{id:'tiling', type:'choose', options:['straight grid', 'brick', 'half drop', 'checkerboard', 'radial'], placeholder:'checkerboard'} 
    with width {id:'width', type:'numberslider', min:5, max:600, placeholder:50} 
    and height {id:'height', type:'numberslider', min:5, max:600, placeholder:50}
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
    onact: (my) => {
      my.target.tile({
        width: my.data.width,
        height: my.data.height,
        tiling: my.data.tiling,
        x: my.data.position[0],
        y: my.data.position[1] });
    }
  },
  {
    name: 'radial',
    dropdownName: 'Radial',
    category: 'Patterns',
    tag: 'motif',
    init: `{id:'tiling', type:'choose', options:['straight grid', 'brick', 'half drop', 'checkerboard', 'radial'], placeholder:'radial'} 
    with width {id:'width', type:'numberslider', min:5, max:600, placeholder:50} 
    and height {id:'height', type:'numberslider', min:5, max:600, placeholder:50}
    at angle {id:'angle', type:'numberslider', min:0, max:360, placeholder:0}&deg
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag',
    onact: (my) => {
      my.target.tile({
        width: my.data.width,
        height: my.data.height,
        tiling: my.data.tiling,
        x: my.data.position[0],
        y: my.data.position[1],
        numRings: my.data.angle / 10 });
    }
  },
  {
    name: 'grow',
    dropdownName: 'Grow',
    category: 'Effects',
    tag: 'motif',
    init: `Scale by {id:'scaleBy', type:'numberslider', min:0, max:600, placeholder:300}%
    width {id:'width', type:'numberslider', min:1, max:600, placeholder:100} 
    and height {id:'height', type:'numberslider', min:1, max:600, placeholder:100}
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag',
    onact: (my) => {
      my.target.grow({ 
        width: my.data.width, 
        height: my.data.height, 
        scaleBy: my.data.scaleBy, 
        x: my.data.position[0], 
        y: my.data.position[1] 
      });
    }
  },
  {
    name: 'shrink',
    dropdownName: 'Shrink',
    category: 'Effects',
    tag: 'motif',
    init: `Scale by {id:'scaleBy', type:'numberslider', min:0, max:600, placeholder:50}%
    width {id:'width', type:'numberslider', min:1, max:600, placeholder:100} 
    and height {id:'height', type:'numberslider', min:1, max:600, placeholder:100}
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag',
    onact: (my) => {
      my.target.grow({ 
        width: my.data.width, 
        height: my.data.height, 
        scaleBy: my.data.scaleBy, 
        x: my.data.position[0], 
        y: my.data.position[1] 
      });
    }
  },
  {
    name: 'shift',
    dropdownName: 'Shift',
    category: 'Effects',
    tag: 'motif',
    init: `{id:'orientation', type:'choose', options:['vertical','horizontal'], placeholder:'vertical'} shift 
    with height {id:'height', type:'numberslider', min:1, max:600, placeholder:50} 
    and offset {id:'offset', type:'numberslider', min:1, max:600, placeholder:20}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag',
    onact: (my) => {
      my.target.shift({ height: my.data.height, offset: my.data.offset, orientation: my.data.orientation });
    }
  },
  {
    name: 'invert',
    dropdownName: 'Invert',
    category: 'Effects',
    tag: 'motif',
    init: `Color shift of type {id:'filter', type:'choose', options:['invert','threshold', 'gray'], placeholder:'invert'}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
    onact: (my) => {
      my.target.applyFilter({ filter: my.data.filter });
    }
  },
  {
    name: 'grayscale',
    dropdownName: 'Grayscale',
    category: 'Effects',
    tag: 'motif',
    init: `Color shift of type {id:'filter', type:'choose', options:['invert','threshold', 'gray'], placeholder:'gray'}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
    onact: (my) => {
      my.target.applyFilter({ filter: my.data.filter });
    }
  },
  {
    name: 'threshold',
    dropdownName: 'Threshold',
    category: 'Effects',
    tag: 'motif',
    init: `Color shift of type {id:'filter', type:'choose', options:['invert','threshold', 'gray'], placeholder:'threshold'}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
    onact: (my) => {
      my.target.applyFilter({ filter: my.data.filter });
    }
  },
  {
    name: 'copy',
    dropdownName: 'Copy Shape',
    category: 'Shapes',
    tag: 'motif',
    init: `Copy
    {id: 'width', type: 'numberslider', min:1, max:600, placeholder: 50} x
    {id: 'height', type: 'numberslider', min:1, max:600, placeholder: 50}
    {id:'shape', type: 'choose', options:['rectangle'], placeholder: 'rectangle'} 
    from {id:'firstPoint', type:'coordinate', min:0, max:600, placeholder:[]}
    to {id:'lastPoint', type:'coordinate', min:0, max:600, placeholder:[]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag-with-hover-preview',
    onact: (my) => {
      my.target.copyCutout({ width: my.data.width, height: my.data.height, shape: my.data.shape, x1: my.data.firstPoint[0], y1: my.data.firstPoint[1], x2: my.data.lastPoint[0], y2: my.data.lastPoint[1]});
    },
    hoverPreview: (my) => { //TODO
      my.target.dashedOutlineRect({ x: my.data.x, y: my.data.y, width: my.data.width, height: my.data.height });
    }
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

  {
    name: 'heart brush',
    dropdownName: 'Heart brush',
    category: 'Brushes',
    tag: 'motif',
    init: function() {
      let listname = 'heart brush';
      let configString = `{id:'alongpath', type:'sequences/alongpath',
        pathData: '[]',
        listname: '${listname}'}`;
      let parseResult = this.parseActorMarkup(configString);
      let initActions = [
        Joy.toJoyDataFormat('motif/heart', {color: '#f35b04', x: 0, y: 0, size: 7}), //todo: how to pass in color here?
        Joy.toJoyDataFormat('motif/heart', {color: '#f18701', x: 0, y: 0, size: 10})];        
      let alongpathOption = parseResult.actorOptions.find(obj  => obj.id === 'alongpath');
      if(alongpathOption) {
        alongpathOption.initActions = initActions; //pass in the starter actions
      }
      this.initializeDOM(parseResult);
    },
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag-path',
    onact: (my) => {
      // console.log(my.data);
      my.actor.alongpath.act(my.target);
    }
  },
  {
    name: 'star brush',
    dropdownName: 'star brush',
    category: 'Brushes',
    tag: 'motif',
    init: function() {
      let listname = 'star brush';
      let configString = `{id:'alongpath', type:'sequences/alongpath',
        pathData: '[[30,30],[40,40],[100,40],[100,100],[600,250]]',
        listname: '${listname}'}`;

      let parseResult = this.parseActorMarkup(configString);
      let initActions = [
        Joy.toJoyDataFormat('motif/star', {color: '#F72585', x: 0, y: 0, r1: 10, r2: 7, npoints: 5}),
        Joy.toJoyDataFormat('motif/star', {color: '#7209B7', x: 0, y: 0, r1: 12, r2: 6, npoints: 7}),
        Joy.toJoyDataFormat('motif/star', {color: '#3A0CA3', x: 0, y: 0, r1: 12, r2: 5, npoints: 15}),
        Joy.toJoyDataFormat('motif/star', {color: '#4361EE', x: 0, y: 0, r1: 10, r2: 4, npoints: 4}),
        Joy.toJoyDataFormat('motif/star', {color: '#4CC9F0', x: 0, y: 0, r1: 11, r2: 3, npoints: 15}),
      
      ];        
      let alongpathOption = parseResult.actorOptions.find(obj  => obj.id === 'alongpath');
      if(alongpathOption) {
        alongpathOption.initActions = initActions; //pass in the starter actions
      }
      this.initializeDOM(parseResult);
    },
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag-path',
    onact: (my) => {
      my.actor.alongpath.act(my.target);
    }
  },
  {
    name: 'mosaic brush',
    dropdownName: 'mosaic brush',
    category: 'Brushes',
    tag: 'motif',
    init: function() {
      let listname = 'mosaic';
      let configString = `{id:'alongpath', type:'sequences/alongpath',
        pathData: '[[]]',
        listname: '${listname}'}`;
      let parseResult = this.parseActorMarkup(configString);

      let colors = [
        'rgb(255,   0,   0)', // Red
        'rgb(255, 165,   0)', // Orange
        'rgb(255, 215,   0)', // Gold
        'rgb(128, 128,   0)', // Olive
        'rgb(  0, 128,   0)', // Green
        'rgb( 38, 162, 224)', // Light blue
        'rgb(  0,   0, 255)', // Blue
        'rgb( 75,   0, 130)', // Indigo
        'rgb(128,   0, 128)', // Purple
        'rgb(238, 130, 238)', // Violet
        'rgb(255, 192, 203)' // Pink
      ];

      let initActions = [];

      let shapes =
      [
        "motif/circle",
        "motif/triangle",
        "motif/rectangle",
      ];

      let sizes = [10, 20, 15, 8];

      for(let i=0;i<colors.length;i++) {
        let size = sizes[i%sizes.length];
        let shape = shapes[i%shapes.length];
        let width = size;
        let height = size*1.5;
        let radius = size / 2;
        let color = colors[i];
        initActions.push(Joy.toJoyDataFormat(shape, {color: color, x: 0, y: 0, size: size, width: width, height: height, radius: radius }));
      }
      
      // let initActions = [
      //   Joy.toJoyDataFormat('motif/star', {color: [200, 0.8, 1], x: 0, y: 0, r1: 10, r2: 7, npoints: 5}),
      //   Joy.toJoyDataFormat('motif/star', {color: [50, 0.8, 1], x: 0, y: 0, r1: 12, r2: 6, npoints: 7}),
      //   Joy.toJoyDataFormat('motif/star', {color: [100, 0.8, 1], x: 0, y: 0, r1: 12, r2: 5, npoints: 15})];        
      
      let alongpathOption = parseResult.actorOptions.find(obj  => obj.id === 'alongpath');
      if(alongpathOption) {
        alongpathOption.initActions = initActions; //pass in the starter actions
      }
      this.initializeDOM(parseResult);
    },
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag-path',
    onact: (my) => {
      my.actor.alongpath.act(my.target);
    }
  },
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
    onact: (my) => {
      my.target.foldableBoxStencil({ length: my.data.length, width: my.data.width, height: my.data.height });
    }
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
    onact: (my) => {
      my.target.paperdoll({ skinTone: my.data.skinTone, hairstyle: my.data.hairstyle, outfit: my.data.outfit});
    }
  },
];

// {
  //   name: 'star brush',
  //   dropdownName: 'Star Brush',
  //   category: 'NewBrushes',
  //   tag: 'motif',
  //   init: `Star brush in {id:'color', type:'color', placeholder:[20, 0.8, 1.0]} 
  //   with scale {id: 'scale', type: 'numberslider', min:1, max:600, placeholder: 20}% 
  //   along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
  //   cursor: './assets/cursors/star-solid.svg',
  //   mouseActionType: 'drag',
  //   onact: (my) => {

  //   },
  //   config: {
  //     scale: 20,
  //     shapes: [
  //       (x, y, size, c) => {
  //         c.star({color: [255, 0, 255], x: x, y: y, r1: size, r2: size/2, npoints: 5});
  //       },
  //     ],
  //     sizes: [10, 20, 30, 40, 50, 40, 30, 20],
  //     colors: [
  //       (i) => { return [255, 165,   0]; }, // Orange
  //       (i) => { return [255, 215,   0]; }, // Gold
  //     ],
  //     alpha: 0.75,
  //     stepSize: 20
  //   },
  //   render: (settings) => {
  //     return renderPath(settings, config);
  //   }
  // },
  // {
  //   name: 'mosaic brush',
  //   dropdownName: 'Mosaic Brush',
  //   category: 'Brushes',
  //   tag: 'motif',
  //   init: `Mosaic brush with scale {id: 'scale', type: 'numberslider', min:25, max:600, placeholder: 100} 
  //   % along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
  //   cursor: './assets/cursors/star-solid.svg',
  //   mouseActionType: 'drag',
  //   config: {
  //     scale: 50,
  //     shapes:
  //     [
  //       (x, y, size, pg) => {
  //         pg.ellipse(x, y, size, size);
  //       },
  //       (x, y, size, pg) => {
  //         pg.rect(x, y, size, size);
  //       },
  //       (x, y, size, pg) => {
  //         pg.triangle(
  //           x + size / 2,
  //           y + size / 2,
  //           x - size / 2,
  //           y + size / 2,
  //           x,
  //           y - size / 2
  //         );
  //       },
  //     ],
  //     sizes: [10, 20, 15, 8],
  //     colors: [
  //       (i) => { return [255,   0,   0]; }, // Red
  //       (i) => { return [255, 165,   0]; }, // Orange
  //       (i) => { return [255, 215,   0]; }, // Gold
  //       (i) => { return [128, 128,   0]; }, // Olive
  //       (i) => { return [  0, 128,   0]; }, // Green
  //       (i) => { return [ 38, 162, 224]; }, // Light blue
  //       (i) => { return [  0,   0, 255]; }, // Blue
  //       (i) => { return [ 75,   0, 130]; }, // Indigo
  //       (i) => { return [128,   0, 128]; }, // Purple
  //       (i) => { return [238, 130, 238]; }, // Violet
  //       (i) => { return [255, 192, 203]; }, // Pink
  //     ],
  //     alpha: 0.75,
  //   },
  // },
  // {
  //   name: 'stripe brush',
  //   dropdownName: 'Stripe Brush',
  //   category: 'Brushes',
  //   tag: 'motif',
  //   init: `Stripe brush with scale {id: 'scale', type: 'numberslider', min:25, max:600, placeholder: 100} 
  //   % along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
  //   cursor: './assets/cursors/star-solid.svg',
  //   mouseActionType: 'drag',
  //   config: {
  //     scale: 100,
  //     shapes:
  //     [
  //       (x, y, size, pg) => {
  //         pg.noStroke();
  //         pg.rect(x, y, Math.abs(size), size*5);
  //       }
  //     ],
  //     sizes: [10, -20, 15, -8, 4, -20, 15, -10, 9, -12, 8, -15, 20],
  //     colors:
  //     [
  //       (i) => { return [255,   0,   0] }, // Red
  //       (i) => { return [255, 165,   0] }, // Orange
  //       (i) => { return [128,   0, 128] }, // Purple
  //       (i) => { return [238, 130, 238] }, // Violet
  //       (i) => { return [255, 192, 203] }, // Pink
  //     ],
  //     alpha: 0.75,
  //   }
  // },
  // {
  //   name: 'rainbow brush',
  //   dropdownName: 'Rainbow Brush',
  //   category: 'Brushes',
  //   tag: 'motif',
  //   init: `Rainbow brush in size {id: 'minSize', type: 'numberslider', min:1, max:600, placeholder: 4} 
  //   to {id: 'maxSize', type: 'numberslider', min:1, max:600, placeholder: 10} 
  //   along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
  //   cursor: './assets/cursors/star-solid.svg',
  //   mouseActionType: 'drag',
  //   config: {
  //     scale: 100,
  //     shapes:
  //     [
  //       (x, y, size, pg) => {
  //         pg.ellipse(x, y, size, size);
  //       }
  //     ],
  //     sizes: (() => {
  //       let sizes = [];
  //       for(let i=10;i<50;i+=0.5) {
  //         sizes.push(i);
  //       }
  //       for(let i=50;i>10;i-=0.5) {
  //         sizes.push(i);
  //       }
  //       return sizes;
  //     })(),
  //     colors:
  //     [
  //       (i) => {
  //         let hue = i*10%360;
  //         let rgb = HSVtoRGB(hue, 1, 1);
  //         return rgb;
  //       }
  //     ]
  //   }
    // onact: (my) => {
    //   // my.target.addRainbowBrush({ minSize: my.data.minSize, maxSize: my.data.maxSize, pointsList: my.data.pointsList });
    // }
  // },
  // {
  //   name: 'blob brush',
  //   dropdownName: 'Blob Brush',
  //   category: 'Brushes',
  //   tag: 'motif',
  //   init: `Blob brush in size {id: 'minSize', type: 'numberslider', min:1, max:600, placeholder: 4} 
  //   to {id: 'maxSize', type: 'numberslider', min:1, max:600, placeholder: 10} 
  //   along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
  //   cursor: './assets/cursors/star-solid.svg',
  //   mouseActionType: 'drag',
  //   config: {
  //     scale: 100,
  //     shapes:
  //     [
  //       (x, y, size, pg) => {
  //         pg.ellipse(x, y, size, size);
  //       },
  //       (x, y, size, pg) => {
  //         pg.ellipse(x, y, size*2, size*2);
  //       },
  //       (x, y, size, pg) => {
  //         pg.ellipse(x, y, size*3, size*3);
  //       },
  //     ],
  //     sizes: (() => {
  //       let sizes = [];
  //       for (let i = 0; i < 100; i++) {
  //         sizes.push(Math.random() * 10);
  //       }
  //       return sizes;
  //     })(),
  //     colors:
  //     [
  //       (i) => {
  //         return HSVtoRGB(i/100, 1, 1);
  //       }
  //     ]
  //   }
  //   // onact: (my) => {
  //   //   // my.target.addRainbowBrush({ minSize: my.data.minSize, maxSize: my.data.maxSize, pointsList: my.data.pointsList });
  //   // }
  // },
  // {
  //   name: 'porcupine brush',
  //   dropdownName: 'Porcupine Brush',
  //   category: 'Brushes',
  //   tag: 'motif',
  //   init: `Porcupine brush in {id:'color', type:'color', placeholder:[20, 0.8, 1.0]} 
  //   with width {id: 'lineWeight', type: 'numberslider', min:1, max:600, placeholder: 8} 
  //   along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
  //   cursor: './assets/cursors/star-solid.svg',
  //   mouseActionType: 'drag1',
  //   onact: (my) => {
  //     my.target.porcupineBrush({ color: my.data.color, lineWeight: my.data.lineWeight, pointsList: my.data.pointsList });
  //   }
  // },
  // {
  //   name: 'lines brush',
  //   dropdownName: 'Lines Brush',
  //   category: 'Brushes',
  //   tag: 'motif',
  //   init: `Lines brush in {id:'color', type:'color', placeholder:[20, 0.8, 1.0]} 
  //   with width {id: 'lineWeight', type: 'numberslider', min:1, max:600, placeholder: 8} 
  //   along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
  //   cursor: './assets/cursors/star-solid.svg',
  //   mouseActionType: 'drag1',
  //   onact: (my) => {
  //     my.target.linesBrush({ color: my.data.color, lineWeight: my.data.lineWeight, pointsList: my.data.pointsList });
  //   }
  // },

//   const swatchColors  =
// ;

// const defaultColorPalette = (id, placeholder) => {
//   return `{id:'${id}',
//   type:'colorpalette',
//   placeholder:'${placeholder}',
//     colorOptions: [
//       '#FF0000', // Red
//       '#FFA500', // Orange
//       '#FFD700', // Gold
//       '#808000', // Olive
//       '#008000', // Green
//       '#26A2E0', // Light blue
//       '#0000FF', // Blue
//       '#4B0082', // Indigo
//       '#800080', // Purple
//       '#EE82EE', // Violet
//       '#FFC0CB', // Pink
//       '#808080', // Gray
//       '#FFFFFF', // White
//       '#000000', // Black
//       '#5E2109', // Brown
//       '#D2B48C'  // Tan
//     ],
//     formatToggle: false,
//     swatchesOnly: true,
//     alphaEnabled: false
// }`};
