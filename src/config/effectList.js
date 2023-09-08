import { HSVtoRGB } from '../utils/color-utils.js';
export const effectList = [
  {
    name: 'solid fill',
    dropdownName: 'Solid Fill',
    category: 'Backgrounds',
    tag: 'motif',
    init: "Fill with {id:'color', type:'color', placeholder:[50, 0.8, 1.0]}",
    cursor: './assets/cursors/fill-drip-solid.svg',
    mouseActionType: 'single-click',
    onact: (my) => {
      my.target.addFill({color: my.data.color});
    }
  },
  {
    name: 'gradient',
    dropdownName: 'Gradient',
    category: 'Backgrounds',
    tag: 'motif',
    init: "Gradient from {id:'color1', type:'color', placeholder:[50, 0.8, 1.0]} to {id:'color2', type:'color', placeholder:[100, 0.8, 1.0]}",
    cursor: './assets/cursors/fill-drip-solid.svg',
    mouseActionType: 'single-click',
    onact: (my) => {
      my.target.gradient({ color1: my.data.color1, color2: my.data.color2 });
    }
  },
  {
    name: 'stripes',
    dropdownName: 'Stripes',
    category: 'Backgrounds',
    tag: 'motif',
    init: `Stripes of width {id:'stripeWidth', type:'numberslider', min:1, max:300, placeholder:50}
      from {id:'color1', type:'color', placeholder:[0, 0.7, 0.8]} 
      to {id:'color2', type:'color', placeholder:[200, 0.7, 0.9]}`,
    cursor: './assets/cursors/fill-drip-solid.svg',
    mouseActionType: 'single-click',
    onact: (my) => {
      my.target.stripes({ stripeWidth: my.data.stripeWidth, color1: my.data.color1, color2: my.data.color2 });
    }
  },
  {
    name: 'circle',
    dropdownName: 'Circle',
    category: 'Shapes',
    tag: 'motif',
    init: `Circle of radius {id:'radius', type:'number', min:1, max:600, placeholder:20}
    in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
    at ({id:'x', type:'number', min:0, max:600, placeholder:200},
    {id:'y', type:'number', min:0, max:600, placeholder:200})`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
    onact: (my) => {
      my.target.addCircle({ color: my.data.color, x: my.data.x, y: my.data.y, r: my.data.radius });
    }
  },
  {
    name: 'square',
    dropdownName: 'Square',
    category: 'Shapes',
    tag: 'motif',
    init: `Square of size {id:'size', type:'number', min:1, max:600, placeholder:40}
    in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
    at ({id:'x', type:'number', min:0, max:600, placeholder:200},
    {id:'y', type:'number', min:0, max:600, placeholder:200})`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
    onact: (my) => {
      my.target.addSquare({ color: my.data.color, x: my.data.x, y: my.data.y, size: my.data.size });
    }
  },
  {
    name: 'polygon',
    dropdownName: 'Polygon',
    category: 'Shapes',
    tag: 'motif',
    init: `Polygon with {id:'nsides', type:'number', min:3, max:50, placeholder:6} sides 
    and radius {id:'radius', type:'number', min:1, max:600, placeholder:20} 
    in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
    at ({id:'x', type:'number', min:0, max:600, placeholder:200},
    {id:'y', type:'number', min:0, max:600, placeholder:200})`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
    onact: (my) => {
      my.target.polygon({ color: my.data.color, x: my.data.x, y: my.data.y, r: my.data.radius, nsides: my.data.nsides });
    }
  },
  {
    name: 'star',
    dropdownName: 'Star',
    category: 'Shapes',
    tag: 'motif',
    init: `Star with {id:'npoints', type:'number', min:3, max:200, placeholder:7} points, 
    outer {id:'r1', type:'number', min:1, max:600, placeholder:20}, 
    inner {id:'r2', type:'number', min:1, max:600, placeholder:10} 
    in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
    at ({id:'x', type:'number', min:0, max:600, placeholder:200}, 
    {id:'y', type:'number', min:0, max:600, placeholder:200})`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
    onact: (my) => {
      my.target.star({color: my.data.color, x: my.data.x, y: my.data.y, r1: my.data.r1, r2: my.data.r2, npoints: my.data.npoints});
    },
    config:
    {
      shape: (data, canvas) => {
        canvas.star({color: data.color, x: data.x, y: data.y, r1: data.r1, r2: data.r2, npoints: data.npoints});
      }
    }
  },
  {
    name: 'heart',
    dropdownName: 'Heart',
    category: 'Shapes',
    tag: 'motif',
    init: `Heart of size {id:'size', type:'number', min:-600, max:600, placeholder:40} 
    in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
    at ({id:'x', type:'number', min:0, max:600, placeholder:200}, 
    {id:'y', type:'number', min:0, max:600, placeholder:200})`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
    onact: (my) => {
      my.target.heart({ color: my.data.color, x: my.data.x, y: my.data.y, size: my.data.size });
    }
  },
  {
    name: 'straight line',
    dropdownName: 'straight line',
    category: 'Brushes',
    tag: 'motif',
    init: `Straight line from ({id:'x1', type:'number', min:0, max:600, placeholder:100}, 
    {id:'y1', type:'number', min:0, max:600, placeholder:100})
    to ({id:'x2', type:'number', min:0, max:600, placeholder:200}, 
    {id:'y2', type:'number', min:0, max:600, placeholder:200})
    in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}
    with width {id: 'lineWeight', type: 'number', min:1, max:600, placeholder: 5}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag1',
    onact: (my) => {
      my.target.addLine({ color: my.data.color, lineWeight: my.data.lineWeight, x1: my.data.x1, y1: my.data.y1, x2: my.data.x2, y2: my.data.y2});
    }
  },
  {
    name: 'brush',
    dropdownName: 'Brush',
    category: 'Brushes',
    tag: 'motif',
    init: `Brush in {id:'color', type:'color', placeholder:[20, 0.8, 1.0]} 
    with width {id: 'lineWeight', type: 'number', min:1, max:600, placeholder: 8} 
    along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag1',
    onact: (my) => {
      my.target.addBrushStroke({ color: my.data.color, lineWeight: my.data.lineWeight, pointsList: my.data.pointsList });
    }
  },
  {
    name: 'star brush',
    dropdownName: 'Star Brush',
    category: 'NewBrushes',
    tag: 'motif',
    init: `Star brush in {id:'color', type:'color', placeholder:[20, 0.8, 1.0]} 
    with scale {id: 'scale', type: 'number', min:1, max:600, placeholder: 20}% 
    along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag',
    onact: (my) => {

    },
    config: {
      scale: 20,
      shapes: [
        (x, y, size, c) => {
          c.star({color: [255, 0, 255], x: x, y: y, r1: size, r2: size/2, npoints: 5});
        },
      ],
      sizes: [10, 20, 30, 40, 50, 40, 30, 20],
      colors: [
        (i) => { return [255, 165,   0]; }, // Orange
        (i) => { return [255, 215,   0]; }, // Gold
      ],
      alpha: 0.75,
      stepSize: 20
    },
    render: (settings) => {
      return renderPath(settings, config);
    }
  },
  {
    name: 'mosaic brush',
    dropdownName: 'Mosaic Brush',
    category: 'NewBrushes',
    tag: 'motif',
    init: `Mosaic brush with scale {id: 'scale', type: 'number', min:25, max:600, placeholder: 100} 
    % along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag',
    config: {
      scale: 50,
      shapes:
      [
        (x, y, size, pg) => {
          pg.ellipse(x, y, size, size);
        },
        (x, y, size, pg) => {
          pg.rect(x, y, size, size);
        },
        (x, y, size, pg) => {
          pg.triangle(
            x + size / 2,
            y + size / 2,
            x - size / 2,
            y + size / 2,
            x,
            y - size / 2
          );
        },
      ],
      sizes: [10, 20, 15, 8],
      colors: [
        (i) => { return [255,   0,   0]; }, // Red
        (i) => { return [255, 165,   0]; }, // Orange
        (i) => { return [255, 215,   0]; }, // Gold
        (i) => { return [128, 128,   0]; }, // Olive
        (i) => { return [  0, 128,   0]; }, // Green
        (i) => { return [ 38, 162, 224]; }, // Light blue
        (i) => { return [  0,   0, 255]; }, // Blue
        (i) => { return [ 75,   0, 130]; }, // Indigo
        (i) => { return [128,   0, 128]; }, // Purple
        (i) => { return [238, 130, 238]; }, // Violet
        (i) => { return [255, 192, 203]; }, // Pink
      ],
      alpha: 0.75,
    },
  },
  {
    name: 'stripe brush',
    dropdownName: 'Stripe Brush',
    category: 'NewBrushes',
    tag: 'motif',
    init: `Stripe brush with scale {id: 'scale', type: 'number', min:25, max:600, placeholder: 100} 
    % along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag',
    config: {
      scale: 100,
      shapes:
      [
        (x, y, size, pg) => {
          pg.noStroke();
          pg.rect(x, y, Math.abs(size), size*5);
        }
      ],
      sizes: [10, -20, 15, -8, 4, -20, 15, -10, 9, -12, 8, -15, 20],
      colors:
      [
        (i) => { return [255,   0,   0] }, // Red
        (i) => { return [255, 165,   0] }, // Orange
        (i) => { return [128,   0, 128] }, // Purple
        (i) => { return [238, 130, 238] }, // Violet
        (i) => { return [255, 192, 203] }, // Pink
      ],
      alpha: 0.75,
    }
  },
  {
    name: 'rainbow brush',
    dropdownName: 'Rainbow Brush',
    category: 'Brushes',
    tag: 'motif',
    init: `Rainbow brush in size {id: 'minSize', type: 'number', min:1, max:600, placeholder: 4} 
    to {id: 'maxSize', type: 'number', min:1, max:600, placeholder: 10} 
    along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag',
    config: {
      scale: 100,
      shapes:
      [
        (x, y, size, pg) => {
          pg.ellipse(x, y, size, size);
        }
      ],
      sizes: (() => {
        let sizes = [];
        for(let i=10;i<50;i+=0.5) {
          sizes.push(i);
        }
        for(let i=50;i>10;i-=0.5) {
          sizes.push(i);
        }
        return sizes;
      })(),
      colors:
      [
        (i) => {
          let hue = i*10%360;
          let rgb = HSVtoRGB(hue, 1, 1);
          return rgb;
        }
      ]
    }
    // onact: (my) => {
    //   // my.target.addRainbowBrush({ minSize: my.data.minSize, maxSize: my.data.maxSize, pointsList: my.data.pointsList });
    // }
  },
  {
    name: 'blob brush',
    dropdownName: 'Blob Brush',
    category: 'Brushes',
    tag: 'motif',
    init: `Blob brush in size {id: 'minSize', type: 'number', min:1, max:600, placeholder: 4} 
    to {id: 'maxSize', type: 'number', min:1, max:600, placeholder: 10} 
    along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag',
    config: {
      scale: 100,
      shapes:
      [
        (x, y, size, pg) => {
          pg.ellipse(x, y, size, size);
        },
        (x, y, size, pg) => {
          pg.ellipse(x, y, size*2, size*2);
        },
        (x, y, size, pg) => {
          pg.ellipse(x, y, size*3, size*3);
        },
      ],
      sizes: (() => {
        let sizes = [];
        for (let i = 0; i < 100; i++) {
          sizes.push(Math.random() * 10);
        }
        return sizes;
      })(),
      colors:
      [
        (i) => {
          return HSVtoRGB(i/100, 1, 1);
        }
      ]
    }
    // onact: (my) => {
    //   // my.target.addRainbowBrush({ minSize: my.data.minSize, maxSize: my.data.maxSize, pointsList: my.data.pointsList });
    // }
  },
  {
    name: 'porcupine brush',
    dropdownName: 'Porcupine Brush',
    category: 'Brushes',
    tag: 'motif',
    init: `Porcupine brush in {id:'color', type:'color', placeholder:[20, 0.8, 1.0]} 
    with width {id: 'lineWeight', type: 'number', min:1, max:600, placeholder: 8} 
    along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag1',
    onact: (my) => {
      my.target.porcupineBrush({ color: my.data.color, lineWeight: my.data.lineWeight, pointsList: my.data.pointsList });
    }
  },
  {
    name: 'lines brush',
    dropdownName: 'Lines Brush',
    category: 'Brushes',
    tag: 'motif',
    init: `Lines brush in {id:'color', type:'color', placeholder:[20, 0.8, 1.0]} 
    with width {id: 'lineWeight', type: 'number', min:1, max:600, placeholder: 8} 
    along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag1',
    onact: (my) => {
      my.target.linesBrush({ color: my.data.color, lineWeight: my.data.lineWeight, pointsList: my.data.pointsList });
    }
  },
  {
    name: 'tile',
    dropdownName: 'Tile',
    category: 'Patterns',
    tag: 'motif',
    init: `{id:'tiling', type:'choose', options:['straight grid', 'brick', 'half drop', 'checkerboard'], placeholder:'straight grid'} 
    with width {id:'width', type:'number', min:1, max:600, placeholder:100} 
    and height {id:'height', type:'number', min:1, max:600, placeholder:100}
    at ({id:'x', type:'number', min:0, max:600, placeholder:200}, 
    {id:'y', type:'number', min:0, max:600, placeholder:200})`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
    onact: (my) => {
      my.target.tile({ width: my.data.width, height: my.data.height, tiling: my.data.tiling, x: my.data.x, y: my.data.y });
    }
  },
  {
    name: 'shift',
    dropdownName: 'Shift',
    category: 'Patterns',
    tag: 'motif',
    init: `{id:'orientation', type:'choose', options:['vertical','horizontal'], placeholder:'vertical'} shift 
    with height {id:'height', type:'number', min:1, max:600, placeholder:50} 
    and offset {id:'offset', type:'number', min:1, max:600, placeholder:20}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
    onact: (my) => {
      my.target.shift({ height: my.data.height, offset: my.data.offset, orientation: my.data.orientation });
    }
  },
  {
    name: 'invert',
    dropdownName: 'Invert',
    category: 'Effects',
    tag: 'motif',
    init: `Color shift of type {id:'filter', type:'choose', options:['invert','threshold', 'gray', 'dilate', 'blur'], placeholder:'invert'}`,
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
    init: `Color shift of type {id:'filter', type:'choose', options:['invert','threshold', 'gray', 'dilate', 'blur'], placeholder:'gray'}`,
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
    init: `Color shift of type {id:'filter', type:'choose', options:['invert','threshold', 'gray', 'dilate', 'blur'], placeholder:'threshold'}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
    onact: (my) => {
      my.target.applyFilter({ filter: my.data.filter });
    }
  },
  {
    name: 'box',
    dropdownName: 'Box',
    category: 'Stencils',
    tag: 'stencils',
    init: `Box with length 
    {id:'length', type:'number', placeholder:120, min:20}, 
    width {id:'width', type:'number', placeholder:120, min:20}, 
    height {id:'height', type:'number', placeholder:120, min:20}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
    onact: (my) => {
      my.target.box({ length: my.data.length, width: my.data.width, height: my.data.height });
    }
  },
  {
    name: 'paper doll',
    dropdownName: 'Doll',
    category: 'Stencils',
    tag: 'stencils',
    init: `Paper doll with skin tone 
    {id:'skinTone', type:'colorpalette', placeholder:'#552E1F',
    colorOptions: [
      '#552E1F','#60311F','#A16F4C','#BB815C','#BC8F68','#CA9978',
      '#DCBA9E','#F3D7C2','#653728','#B77E53','#D6A98A','#F0CBB0',
      '#A6734A','#422E29','#4E2E2A','#683F38','#7A4943','#492F29',
      '#51342C','#643E31','#774D3D','#4A3123','#543626','#61402E',
      '#331707','#462008','#58280A','#7A370F','#DFBDA2','#E4C9B6',
      '#3E2C1E','#5F442C','#7E573B','#060403','#8A5414','#B57033',
      '#744D36','#FDF0D5','#FADCA9','#EDB178','#DF9D56','#D38C45',
      '#F6D4B9','#DEBA96','#DAB08C','#CD865A','#B37858','#96624D']},
    hairstyle {id:'hairstyle', type:'choose', options:['1', '2'], placeholder:'1'},
    outfit set {id:'outfit', type:'choose', options:['1'], placeholder:'1'}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
    onact: (my) => {
      my.target.paperdoll({ skinTone: my.data.skinTone, hairstyle: my.data.hairstyle, outfit: my.data.outfit});
    }
  },
];
