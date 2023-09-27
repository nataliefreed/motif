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
    init: `Circle of radius {id:'radius', type:'numberslider', min:1, max:600, placeholder:20}
    in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
    at {id:'position', type:'coordinate', placeholder:[200, 200]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
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
    in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[200, 200]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
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
    in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[200, 200]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
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
    in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[200, 200]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
    onact: (my) => {
      my.target.star({color: my.data.color, x: my.data.position[0], y: my.data.position[1], r1: my.data.r1, r2: my.data.r2, npoints: my.data.npoints});
    }
  },
  {
    name: 'heart',
    dropdownName: 'Heart',
    category: 'Shapes',
    tag: 'motif',
    init: `Heart of size {id:'size', type:'numberslider', min:-600, max:600, placeholder:40} 
    in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[200, 200]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
    onact: (my) => {
      console.log("heart");
      my.target.heart({ color: my.data.color, x: my.data.position[0], y: my.data.position[1], size: my.data.size });
    }
  },
  {
    name: 'heart brush',
    dropdownName: 'heart brush',
    category: 'Brushes',
    tag: 'motif',
    init: `Along path {id:'path', type:'path', placeholder:[[20,50],[600,250]]} 
    Heart of size {id:'size', type:'numberslider', min:-600, max:600, placeholder:10} 
    in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}  
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[200, 200]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag',
    onact: (my) => {
      /*if(hover) {

      }
      else if(preview) {

      }*/
      for(let i=0;i<my.data.path.length;i++) {
        //offset experiment // my.target.heart({ color: my.data.color, x: my.data.path[i][0]+my.data.position.x-my.data.path[0][0], y: my.data.path[i][1]+my.data.position.y-my.data.path[0][1], size: my.data.size });
        my.target.heart({ color: my.data.color, x: my.data.path[i][0], y: my.data.path[i][1], size: my.data.size });
      }
    }
  },
  {
    name: 'star brush',
    dropdownName: 'star brush',
    category: 'Brushes',
    tag: 'motif',
    init: function() {
      let listname = 'stars';
      let configString = `{id:'alongpath', type:'sequences/alongpath',
                         pathData: '[[30,30],[40,40],[100,40],[100,100],[600,250]]',
                         listname: '${listname}'}`;
      
      let parseResult = this.parseActorMarkup(configString);
      let initActions = [
        {type:'motif/star', data: {color: [255, 0, 255], x: 0, y: 0, r1: 20, r2: 10, npoints: 5}},
        {type:'motif/circle', data: {color: [0, 0, 255], x: 50, y: 100, r1: 20, r2: 10, npoints: 5}}
      ];
      let alongpathOption = parseResult.actorOptions.find(obj => obj.id === 'alongpath');
      if(alongpathOption) {
        alongpathOption.initActions = initActions; //pass in the starter actions
      }
      this.initializeDOM(parseResult);


      // console.assert(parseResult.actorOptions[0].id == 'alongpath');
      // console.log("actor options", parseResult.actorOptions);
      // console.log("html", parseResult.html);
      // parseResult.actorOptions[0].initActions = initActions;
      // debugger;
      // for(let action in initActions) {
      //    this.alongpath.actions.addAction(action.type, undefined, action.data);
      // }
      // debugger;

      // // debugger;
      // console.log("star brush actions addAction", this.alongpath.actions.addAction);
      // console.log("star brush actions", this.alongpath.actions);
    },
    postInit: function() {
      // let initActions = [
      //   {type:'motif/star', data: {color: [255, 0, 255], x: 0, y: 0, r1: 20, r2: 10, npoints: 5}},
      //   {type:'motif/star', data: {color: [0, 0, 255], x: 0, y: 0, r1: 20, r2: 10, npoints: 5}}
      // ];
      // console.log("actions in alongpath", this.alongpath.actions);
      
      // for(let action in initActions) {
      //    this.alongpath.actions.addAction(action.type, undefined, action.data);
      // }
      // debugger;
    },


    // init: function() {
    //   this.doNormalInit();
    //   // let actionConfig = {
    //   for(action in starBrushTemplateActions) {
    //     this.actions.addChild(actionConfig);
    //   }
    //   let args = {};
    //   args.id = 'alongpath';
    //   args.type = 'sequences/alongpath';
    //   args.listname = 'star brush';
    //   args.path = '[[500,50],[600,250]]';
    //   args.startActions = [
    //     {type:'motif/star', data:{color: [255, 0, 255], x: 0, y: 0, r1: 20, r2: 10, npoints: 5}},
    //   ];
    //   return JSON.stringify(args);
    // }(), // immediately call this function to get the string
    // this.alongpath.actions.actions.addAction('motif/star', undefined, {color: [255, 0, 255], x: 0, y: 0, r1: 20, r2: 10, npoints: 5});
    
    // init: {
    //   id: "alongpath",
    //   type: "sequences/alongpath",
    //   listname: "stars",
    //   path: [[0, 0], [10, 20]],
    //   startActions: [
    //     {type:'motif/star', data: {color: [255, 0, 255], x: 0, y: 0, r1: 20, r2: 10, npoints: 5}},
    //     {type:'motif/star', data: {color: [0, 0, 255], x: 0, y: 0, r1: 20, r2: 10, npoints: 5}}
    //   ]
    // },
  //   init: `{id:'alongpath', type:'sequences/alongpath'}
  //   Star with {id:'npoints', type:'numberslider', min:3, max:60, placeholder:5} points, 
  //   outer {id:'r1', type:'numberslider', min:1, max:600, placeholder:20}, 
  //   inner {id:'r2', type:'numberslider', min:1, max:600, placeholder:10} 
  //   in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag',
    onact: (my) => {
      console.log(my);
      my.actor.alongpath.act(my.target);
      // my.target.star({color: my.data.color, x: my.data.path[0][0], y: my.data.path[0][1], r1: my.data.r1, r2: my.data.r2, npoints: my.data.npoints});
      // for(let i=0;i<my.data.path.length;i++) {
      //   my.target.star({color: my.data.color, x: my.data.path[i][0], y: my.data.path[i][1], r1: my.data.r1, r2: my.data.r2, npoints: my.data.npoints});
      //   console.log({color: my.data.color, x: my.data.path[i][0], y: my.data.path[i][1], r1: my.data.r1, r2: my.data.r2, npoints: my.data.npoints});
      // }
    }
  },
  {
    name: 'straight line',
    dropdownName: 'straight line',
    category: 'Brushes',
    tag: 'motif',
    init: `Straight line from ({id:'x1', type:'numberslider', min:0, max:600, placeholder:100}, 
    {id:'y1', type:'numberslider', min:0, max:600, placeholder:100})
    to ({id:'x2', type:'numberslider', min:0, max:600, placeholder:200}, 
    {id:'y2', type:'numberslider', min:0, max:600, placeholder:200})
    in color {id:'color', type:'color', placeholder:[20, 0.8, 1.0]}
    with width {id: 'lineWeight', type: 'numberslider', min:1, max:600, placeholder: 5}`,
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
    with width {id: 'lineWeight', type: 'numberslider', min:1, max:600, placeholder: 8} 
    along path {id:'pointsList', type:'path', placeholder:'20,50,200,250'}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'drag1',
    onact: (my) => {
      my.target.addBrushStroke({ color: my.data.color, lineWeight: my.data.lineWeight, pointsList: my.data.pointsList });
    }
  },
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
  {
    name: 'mosaic brush',
    dropdownName: 'Mosaic Brush',
    category: 'Brushes',
    tag: 'motif',
    init: `Mosaic brush with scale {id: 'scale', type: 'numberslider', min:25, max:600, placeholder: 100} 
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
    category: 'Brushes',
    tag: 'motif',
    init: `Stripe brush with scale {id: 'scale', type: 'numberslider', min:25, max:600, placeholder: 100} 
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
    init: `Rainbow brush in size {id: 'minSize', type: 'numberslider', min:1, max:600, placeholder: 4} 
    to {id: 'maxSize', type: 'numberslider', min:1, max:600, placeholder: 10} 
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
    init: `Blob brush in size {id: 'minSize', type: 'numberslider', min:1, max:600, placeholder: 4} 
    to {id: 'maxSize', type: 'numberslider', min:1, max:600, placeholder: 10} 
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
    with width {id: 'lineWeight', type: 'numberslider', min:1, max:600, placeholder: 8} 
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
    with width {id: 'lineWeight', type: 'numberslider', min:1, max:600, placeholder: 8} 
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
    category: 'Effects',
    tag: 'motif',
    init: `{id:'tiling', type:'choose', options:['straight grid', 'brick', 'half drop', 'checkerboard'], placeholder:'straight grid'} 
    with width {id:'width', type:'numberslider', min:1, max:600, placeholder:100} 
    and height {id:'height', type:'numberslider', min:1, max:600, placeholder:100}
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[200, 200]}`,
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
    name: 'grow',
    dropdownName: 'Grow',
    category: 'Effects',
    tag: 'motif',
    init: `Scale by {id:'scaleBy', type:'numberslider', min:0, max:600, placeholder:300}%
    width {id:'width', type:'numberslider', min:1, max:600, placeholder:100} 
    and height {id:'height', type:'numberslider', min:1, max:600, placeholder:100}
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[200, 200]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
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
    at {id:'position', type:'coordinate', min:0, max:600, placeholder:[200, 200]}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
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
    category: 'Patterns',
    tag: 'motif',
    init: `{id:'orientation', type:'choose', options:['vertical','horizontal'], placeholder:'vertical'} shift 
    with height {id:'height', type:'numberslider', min:1, max:600, placeholder:50} 
    and offset {id:'offset', type:'numberslider', min:1, max:600, placeholder:20}`,
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
    {id:'length', type:'numberslider', placeholder:120, min:20}, 
    width {id:'width', type:'numberslider', placeholder:120, min:20}, 
    height {id:'height', type:'numberslider', placeholder:120, min:20}`,
    cursor: './assets/cursors/star-solid.svg',
    mouseActionType: 'single-click',
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
