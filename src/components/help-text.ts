// Hover help for the MOTIF interface, shown by the `help` action in help.ts.
// Help for each drawing tool lives with the tool itself, in the `help` field of stores/effectList.ts.
// The wording follows the workshop handouts: short, friendly, and an invitation to try things.

export const helpText = {
  // top toolbar
  save: 'Save your design as a picture. The recipe for making it is saved inside, so you can open it again later and keep changing it.',
  open: 'Open a design saved from MOTIF to see the recipe for how it was made, and remix it!',
  clear: 'Clear everything and start over. Changed your mind? Click undo to bring it back.',
  undo: 'Undo your last change: drawing, changing a step, or moving or deleting steps.',
  redo: 'Redo the change you just undid.',
  stepBackward: 'Go back one step to see how your design looked before it.',
  play: 'Watch your design draw itself, one step at a time.',
  pause: 'Pause the replay.',
  stepForward: 'Go forward one step in your recipe.',

  // tool categories, keyed by category name (see the `category` field in stores/effectList.ts)
  categories: {
    shapes: 'Shapes: stamp circles, stars, hearts, words and more.\nClick to place one, or click and drag to change it as you place it.',
    backgrounds: 'Backgrounds: fill the whole canvas with a color, stripes, a blend of colors or speckles.',
    lines: 'Lines: draw straight lines, dotted lines, connect-the-dots paths and bouncing rainbows.',
    brushes: 'Brushes: paint with trails of shapes that follow your mouse. Peek inside a brush to change it or make your own!',
    patterns: 'Patterns: copy one part of your drawing and repeat it all over, like fabric or tiles.\nDraw a few things first!',
    effects: 'Special effects: flip colors, turn your design gray, grow, shrink, shift or move parts of it.',
    stencils: 'Stencils: add a cutting outline for a paper doll or a paper box, so you can print your design and make something real.',
  } as Record<string, string>,

  // the recipe ("How To Make My Design")
  recipe: 'These steps are the recipe for your design.\nClick a color, number or other setting in a step to change it.\nDrag a step up or down to change the order.\nHover over the step numbers on the left to go back in time. Double-click a step number to hide or show that step.',
  nextStep: 'Your next step goes here. Drag this box higher in the recipe to add new steps earlier.',
  brushInside: 'Open this brush to see the steps it repeats along your path. Change, reorder or delete them to make your own brush!',
  brushSettings: 'This is your brush. Change its settings here, then draw on the canvas to use them.',

  // editing toolbar: these act on the step selected in the recipe
  delete: 'Delete the selected step. (You can also press the Delete key.)',
  remix: 'Remix: give the selected step random new settings. Keep clicking for more surprises!',
  copy: 'Make a copy of the selected step.',
  remixCopy: 'Make a copy of the selected step with random new settings.',
  randomRepeat: 'Repeat the selected step over and over in a grid of a random size.',
  label: 'Give the selected step a name. Then you can drag other steps inside it to group them, like "cat."',
  draw: 'Turn the selected step into your brush, so you can draw more of it.',
  selectFirst: '\nClick a step in the recipe to select it first.',

  // colors
  palette: 'These are your color scheme colors! Click one to draw with it.\nDouble-click a color to change it. Every step that uses that letter changes too!',
  switchColors: 'When this is on, your brush gets a new random color every time you draw. Pick a color yourself to turn it off.',
};
