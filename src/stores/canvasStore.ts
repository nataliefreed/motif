import { writable } from 'svelte/store';

export const p5CanvasSize = writable({ width: 500, height: 500 });

// The p5 instance that draws the canvas, once its canvases are set up. Pictures drawn elsewhere, like the
// recipe's picture of a checkerboard's squares, draw with it, for the drawing tools' fonts, stencils and
// scratch canvases.
export const p5Instance = writable<any>(null);
