<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Tooltip from '../Tooltip.svelte';
  import PathEditor from './PathEditor.svelte';

  export let id = '';
  export let path:[number, number][] = []; // The path points as a prop

  let domElement: SVGElement;

  const dispatch = createEventDispatcher();

  // Convert list of points to a string of SVG path commands
  // M for move to start position, L for line to each point
  function getPathData(path: [number, number][]) {
    // console.log("getting path data", path);
    if(!path || path.length === 0) path = [[0, 0]];
    return path.map((pt, index) => 
      `${index === 0 ? 'M' : 'L'} ${pt[0]},${pt[1]}`
    ).join(' ');
  }

  // Reactively update path data
  $: pathData = getPathData(path);

  // Dispatch an event when points change
  // $: if (path) {
  //   dispatch('valueChange', { id, path });
  // }

  function handlePointsChange(event : CustomEvent) {
    // console.log("path widget points change", event.detail.value);
    // console.log(event.detail);
    previewEnd = true;
    dispatch('valueChange', { id: 'path', value: event.detail.value as [number, number][] });
  }

  let previewEnd = false;
  let savedValue = path;
  function handleMouseOver(event: MouseEvent) {
    savedValue = path;
    let newValue = path.map(point => [point[0] + (Math.random() - 0.5) * 10, point[1] + (Math.random() - 0.5) * 10]);
    previewEnd = false;
    dispatch('valueChange', { id: 'path', value: newValue });
  }

  function handleMouseOut(event: MouseEvent) {
    if(!previewEnd) {
      dispatch('valueChange', { id: 'path', value: savedValue });
      previewEnd = true;
    }
  }

</script>

  <svg bind:this={domElement} class="path-widget" width="1.7em" height="1.7em" viewBox="0 0 540 540" style="border: 1px solid #ddd; max-width: 100%; height: auto;"
    on:mouseover={handleMouseOver}
    on:mouseout={handleMouseOut}
  >
    <path d={pathData} stroke="lightgray" fill="none" />
    {#each path as point, index}
      {#if index > 0}
        <line x1={path[index - 1][0]} y1={path[index - 1][1]} x2={point[0]} y2={point[1]} stroke="black" />
      {/if}
      <circle cx={point[0]} cy={point[1]} r="10" fill="black" />
    {/each}
  </svg>

  <!-- dom element here is the inline path preview -->
  {#if domElement}
    <Tooltip element={domElement} let:showContent>
      {#if showContent}
        <PathEditor points={path} on:valueChange={handlePointsChange}/>
      {/if}
    </Tooltip>
  {/if}

<style>
  .path-widget {
    display: inline-block;
    vertical-align: top;
    margin: 0 0.5em;
  }
</style>
