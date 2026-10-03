<script lang="ts">
  // A small picture of what a checkerboard's squares draw: their steps, drawn as the canvas draws them (see
  // squaresPicture in Renderer.js), shrunk to fit
  import { flatActionStore } from '../../stores/dataStore';
  import { p5Instance } from '../../stores/canvasStore';
  import { compileSquares } from '../action-utils';
  import { squaresPicture } from '../canvas/Renderer.js';
  import { turtle } from '../canvas/Turtle.js';

  export let uuid = ''; // the checkerboard's

  let picture: HTMLCanvasElement;
  let drawn = ''; // the steps the picture shows, so it's drawn again only when they change

  $: steps = $flatActionStore[uuid] ? compileSquares($flatActionStore[uuid]) : [];
  $: if (picture && $p5Instance) draw(steps);

  function draw(steps: ReturnType<typeof compileSquares>) {
    const shown = JSON.stringify(steps);
    if (shown === drawn) return;
    drawn = shown;
    const squares = squaresPicture(steps, $p5Instance, turtle);
    const context = picture.getContext('2d')!;
    context.imageSmoothingQuality = 'high';
    context.clearRect(0, 0, picture.width, picture.height);
    context.drawImage(squares.elt, 0, 0, picture.width, picture.height);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<canvas bind:this={picture} class="squares-picture" width="64" height="64" on:click></canvas>

<style>
  .squares-picture {
    width: 1.6em;
    height: 1.6em;
    vertical-align: middle;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2); /* shows its edge, even when it's the color of the paper */
    cursor: pointer;
  }
</style>
