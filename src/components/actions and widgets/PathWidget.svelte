<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let points:[number, number][] = []; // The path points as a prop

  const dispatch = createEventDispatcher();

  // Convert list of points to a string of SVG path commands
  // Start with M for move to start position, then L for line to each point
  function getPathData(points: [number, number][]) {
    return points.map((pt, index) => 
      `${index === 0 ? 'M' : 'L'} ${pt[0]},${pt[1]}`
    ).join(' ');
  }

  // Reactively update path data
  $: pathData = getPathData(points);

  // // Emit an event when points change
  // $: if (points) {
  //   dispatch('valueChange', points);
  // }
</script>

<svg class="path-widget" width="1.7em" height="1.7em" viewBox="0 0 540 540" style="border: 1px solid #888; max-width: 100%; height: auto;">
  <path d={pathData} stroke="lightgray" fill="none" />
  {#each points as point}
    <circle cx={point[0]} cy={point[1]} r="10" fill="black" />
  {/each}
</svg>

<style>
  .path-widget {
    display: inline-block;
    vertical-align: top;
    margin: 0 0.5em;
  }
</style>
