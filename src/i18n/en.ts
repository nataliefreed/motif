// English text for the MOTIF interface.
// Each language has a file like this one with the same keys (es.ts is Spanish, fr.ts is French); to add a language,
// copy this file, translate the text, and list the language in index.ts.
//
// Recipe steps (`steps`) are phrases around a step's editable settings: {0}, {1}, ... stand for the
// settings in the order they appear, and **double asterisks** mark the tool name, shown in bold.
// Words can move around the settings, but the settings must stay in order: {0} before {1}.

export const en = {
  toolbar: {
    save: 'save',
    open: 'open',
    clear: 'clear',
    stepPerSecond: 'step per second',
    stepsPerSecond: 'steps per second',
  },

  // the editing toolbar on the right, which acts on the step selected in the recipe
  editing: {
    delete: 'delete',
    remix: 'remix',
    copy: 'copy',
    remixCopy: 'remix a copy',
    randomRepeat: 'random repeat',
    label: 'label',
    draw: 'draw',
  },

  paletteColors: 'palette colors',
  randomColors: 'surprise colors',

  // tool categories, keyed by the `category` of tools in stores/effectList.ts
  categories: {
    shapes: 'shapes',
    backgrounds: 'backgrounds',
    lines: 'lines',
    brushes: 'brushes',
    patterns: 'patterns',
    effects: 'special effects',
    stencils: 'stencils',
  },

  // drawing tools, keyed by the `textLabel` of each tool in stores/effectList.ts
  tools: {
    'Circle': { label: 'Circle', help: 'Click to stamp a circle. Drag to make it larger or smaller' },
    'Square': { label: 'Square', help: 'Click to stamp a square. Drag to change its size and rotate it' },
    'Solid Fill': { label: 'Solid Fill', help: 'Click to fill the whole canvas with one color' },
    'Line': { label: 'Line', help: 'Click where the line starts, drag, then let go to end it' },
    'Polygon': { label: 'Polygon', help: 'Click to stamp a shape with straight sides. Drag to change its size and rotate it' },
    'Star': { label: 'Star', help: 'Click to stamp a star. Drag up or down to change its size and sideways to add more points' },
    'Spiro': { label: 'Spiro', help: 'Click and hold still to draw a spiro swirl. Drag to change its shape in surprising ways!' },
    'Heart': { label: 'Heart', help: 'Click to stamp a heart. Drag to change its size' },
    'Rectangle': { label: 'Rectangle', help: 'Click to stamp a rectangle. Drag to stretch it wider or taller' },
    'Triangle': { label: 'Triangle', help: 'Click to stamp a triangle. Drag to stretch it wider or taller' },
    'text': { label: 'text', help: 'Click to stamp words. Drag to change their size' },
    'Stripes': { label: 'Stripes', help: 'Click to fill the canvas with stripes. Drag to change how wide they are and which way they go' },
    'Gradient': { label: 'Gradient', help: 'Click to fill the canvas with two colors that blend together. Drag up or down to change the direction' },
    'Dot brush': { label: 'Dot brush', help: 'Click and drag to draw a dotted line that follows your mouse' },
    'Line Brush': { label: 'Line Brush', help: 'Click and drag to draw a smooth line that follows your mouse' },
    'Connected Line': { label: 'Connected Line', help: 'Click, click, click to make a shape with straight lines. Double-click to finish' },
    'Pattern Maker': { label: 'Pattern Maker', help: 'Click around the canvas to lay out a pattern of shapes. Double-click to finish. Then open it up in the recipe to change the shapes inside!' },
    'Mosaic Brush': { label: 'Mosaic Brush', help: "Click and drag to paint with a rainbow of little shapes. Open it up in the recipe to see what it's made of!" },
    'Heart brush': { label: 'Heart brush', help: 'Click and drag to paint a trail of hearts' },
    'Star Brush': { label: 'Star Brush', help: 'Click and drag to paint a trail of stars' },
    'Letter Brush': { label: 'Letter Brush', help: 'Click and drag to paint a trail of letters. Change the letters inside the brush to spell something!' },
    'Rainbow Bounce': { label: 'Rainbow Bounce', help: 'Click and drag to aim, then hold still: rainbow dots bounce off the edges until you let go' },
    'Speckles': { label: 'Speckles', help: 'Click and hold to sprinkle speckles over the canvas. Hold longer for more!' },
    'Multi Stripe': { label: 'Multi Stripe', help: 'Click and drag to paint tall stripes that follow your mouse' },
    'Straight Grid': { label: 'Straight Grid', help: 'Click to repeat your whole drawing in a grid of small copies. Drag to choose how many' },
    'Brick Pattern': { label: 'Brick Pattern', help: 'Click to repeat your whole drawing in small copies, in rows like bricks in a wall. Drag to choose how many' },
    'Half Drop': { label: 'Half Drop', help: 'Click to repeat your whole drawing in small copies, with every other column shifted down. Drag to choose how many' },
    'Checkerboard': { label: 'Checkerboard', help: 'Click to put small copies of your whole drawing in every other square like a checkerboard, with a color in the squares between. Drag to choose how many' },
    'Radial': { label: 'Rosette', help: 'Click to repeat your whole drawing in rings around a copy in the middle like a flower, on a color. Drag to choose how many' },
    'Honeycomb': { label: 'Honeycomb', help: 'Click to repeat your whole drawing in hexagons that fit together like a honeycomb. Drag to choose how many' },
    'Mirror': { label: 'Mirror', help: 'Click to repeat your whole drawing in small copies, each one a mirror image of the next. Drag to choose how many' },
    'Invert': { label: 'Invert', help: 'Click to flip every color in your design to its opposite' },
    'Grayscale': { label: 'Grayscale', help: 'Click to turn your design gray, like an old photo' },
    'Threshold': { label: 'Threshold', help: 'Click to turn your design into just black and white' },
    'Grow': { label: 'Grow', help: 'Click on part of your drawing to make it bigger. Drag to choose how much of it grows' },
    'Shrink': { label: 'Shrink', help: 'Click on part of your drawing to make it smaller. Drag to choose how much of it shrinks' },
    'Shift': { label: 'Shift', help: 'Click to slice your design into strips and slide every other one. Drag to change how wide the strips are and how far they slide' },
    'Move': { label: 'Move', help: 'Move part of your drawing: click and hold, drag it somewhere new, then let go. Change "move" to "copy" in its step to move a copy instead' },
    'Paper Box': { label: 'Paper Box', help: 'Add the outline of a paper box around your design. Print it, cut it out, and fold it up!' },
    'Paper Doll': { label: 'Paper Doll', help: 'Add a paper doll outline to dress up with your design' },
  },

  // recipe steps: see the note at the top of this file
  steps: {
    // shapes
    circle: '**circle** of radius {0}',
    square: '**square** of size {0}',
    polygon: '{0} sided **polygon** of radius {1}',
    star: '**star** with {0} points, outer {1}, inner {2}',
    heart: '**heart** of size {0}',
    rectangle: '**rectangle** of width {0} and height {1}',
    triangle: '**triangle** of width {0} and height {1}',
    text: '{0} in size {1}',
    spiro: '**spiro** outer: {0}, inner: {1}, pen at: {2}%, pen size: {3}',
    line: '**line** from {0} to {1} of width {2}',
    lineInBrush: '**line** of width {0}',
    at: 'at {0}',
    inColor: 'in {0}',
    // backgrounds
    fill: '**fill** with {0}',
    gradient: '**gradient** from {0} to {1}',
    stripes: '**stripes** of width {0} in {1}',
    speckles: '**speckles** for time {0} at {1} in {2}',
    // lines and brushes
    bounce: 'bounce from {0} to {1} for time {2}',
    drawWith: 'draw with {0}',
    // patterns
    pattern: '{0} {1} x {2}',
    rosettePattern: '{0} with {1} rings on {2}',
    rosettePatternOneRing: '{0} with {1} ring on {2}',
    honeycombPattern: '{0} with {1} rings',
    honeycombPatternOneRing: '{0} with {1} ring',
    checkerboardPattern: '{0} {1} x {2} with {3}',
    // special effects
    scale: '**scale** by {0}% width {1} and height {2} at {3}',
    shift: '{0} **shift** with width {1} and offset {2}',
    filter: '**color filter** {0}',
    moveCutout: '{0} {1} x {2} cutout from {3} to {4}',
    // stencils
    box: '**box** with length {0}, width {1}, height {2} at {3}',
    paperDoll: '**paper doll** with skin tone {0} hairstyle {1} outfit set {2}',
  },

  // choices in a step's menus, keyed by the value saved in the drawing
  options: {
    'move': 'move',
    'copy': 'copy',
    'vertical': 'vertical',
    'horizontal': 'horizontal',
    'invert': 'invert',
    'threshold': 'threshold',
    'gray': 'gray',
    'straight grid': 'straight grid',
    'brick': 'brick',
    'half drop': 'half drop',
    'checkerboard': 'checkerboard',
    'radial': 'rosette',
    'honeycomb': 'honeycomb',
    'mirror': 'mirror',
  },

  // names MOTIF gives to new recipes, brushes and groups, keyed by the English name.
  // Names are saved in drawings and can be edited, so a name is translated only while it is one of these.
  titles: {
    'How To Make My Design': 'How To Make My Design',
    'dot brush': 'dot brush',
    'line brush': 'line brush',
    'connected line': 'connected line',
    'my pattern': 'my pattern',
    'circle and dot': 'circle and dot',
    'mosaic brush': 'mosaic brush',
    'big heart little heart': 'big heart little heart',
    'star brush': 'star brush',
    'letter brush': 'letter brush',
    'stripe stripe stripe': 'stripe stripe stripe',
    'what does this draw?': 'what does this draw?',
    'a brush without a name': 'a brush without a name',
  },

  // the palette menu below the palette: built-in color schemes, and saving and opening palette files
  palettes: {
    menu: 'palettes',
    yours: 'your colors',
    save: 'save colors',
    open: 'open colors',
    noColors: 'Couldn’t get colors from that picture',
    // names of the built-in schemes, keyed like `palettePresets` in stores/colorStore.ts. The menu shows
    // them as swatches; the names are for screen readers.
    presets: {
      starting: 'starting colors',
      pastel: 'pastel rainbow',
      neon: 'neon pop',
      blocks: 'blocks',
      denim: 'denim',
    },
  },

  // names for downloaded files, without the .png
  files: {
    design: 'my design',
    palette: 'my colors',
  },

  colorPicker: {
    mixer: 'color mixer:',
    modes: { paint: 'paint', RGB: 'RGB', HSL: 'HSL' },
    red: 'Red',
    green: 'Green',
    blue: 'Blue',
    opacity: 'Opacity',
    newColor: 'new color!',
    clear: 'Clear',
    save: 'Save',
  },

  // hover help (see components/help.ts); "\n" starts a new line
  help: {
    // top toolbar
    save: 'Save your design as a picture. The recipe for making it is saved inside, so you can open it again later and keep changing it',
    open: 'Open a saved design to see the recipe for how it was made and remix it!',
    clear: 'Clear everything and start over. Changed your mind? Click undo to bring it back',
    undo: 'Undo your last change',
    redo: 'Redo the change you just undid',
    stepBackward: 'Go back one step to see how your design looked before',
    play: 'Watch your design draw itself one step at a time',
    pause: 'Pause the replay',
    stepForward: 'Go forward one step in your recipe',

    // tool categories, keyed like `categories` above
    categories: {
      shapes: 'Shapes',
      backgrounds: 'Backgrounds',
      lines: 'Lines',
      brushes: 'Brushes: paint with trails of shapes that follow your mouse. Peek inside a brush to change it or make your own!',
      patterns: 'Patterns: repeat your whole drawing in lots of small copies, like fabric or tiles',
      effects: 'Special effects',
      stencils: 'Stencils',
    },

    // the recipe ("How To Make My Design")
    recipe: 'These steps are the recipe for your design.\nClick a color, number or other setting in a step to change it.\nDrag a step up or down to change the order.\nHover over the step numbers on the left to go back in time. Double-click a step number to hide or show that step',
    nextStep: 'Your next step goes here. Drag this box higher in the recipe to add new steps earlier',
    brushInside: 'Open this brush to see the steps it repeats along your path. Change, reorder or delete them to make your own brush!',
    brushSettings: 'This is your active brush. Change its settings here, then draw on the canvas to use them',

    // editing toolbar
    delete: 'Delete the selected step (you can also press the Delete key)',
    remix: 'Remix: give the selected step random new settings. Keep clicking for more surprises!',
    copy: 'Make a copy of the selected step',
    remixCopy: 'Make a copy of the selected step with random new settings',
    randomRepeat: 'Repeat the selected step over and over in a grid of a random size',
    label: 'Give the selected step a name. Then you can drag other steps inside it to group them',
    draw: 'Turn the selected step into your brush, so you can draw more of it',
    selectFirst: '\nStart by clicking a step in the recipe to select it',

    // colors
    palette: 'These are your color scheme colors. Click one to draw with it and to change it.\nEvery step that uses that letter changes too',
    paletteMenu: 'Pick a new set of colors for your palette or save and open your own. Everything drawn with a lettered color changes too',
    savePalette: 'Save your colors as a picture, so you can use them again or share them',
    openPalette: 'Make a color palette from an image',
    paletteColors: 'When this is on, your brush uses the lettered colors from your palette',
    randomColors: 'When this is on, your brush gets a new color every time you draw. With palette colors on, it picks a new letter from your palette',
  },
};

export type Messages = typeof en;
