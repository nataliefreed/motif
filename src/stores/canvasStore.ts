import { writable } from 'svelte/store';

export const p5CanvasSize = writable({ width: 500, height: 500 });