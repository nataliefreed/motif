<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import Tooltip from '../Tooltip.svelte';
  import PathEditor from './PathEditor.svelte';
  import CoordinateWidget from './CoordinateWidget.svelte';
  import { turnPath } from '../../utils/transform';

  export let id = '';
  export let path:[number, number][] = [];
  export let angle:number = 0;
  let turnedTo = angle; // the angle the path's points are turned to: the step's angle when it appears
  let shouldUpdateView = true;

  export let size = 3; // in em

  let domElement: SVGElement;

  const dispatch = createEventDispatcher();

  $: handleAngleChange(angle);
  $: pathData = getPathData(path);
  $: updatePathView(path);

  onMount(() => {
    updatePathView(path); //update when component mounts
  });

  // Convert list of points to a string of SVG path commands
  // M for move to start position, L for line to each point
  function getPathData(path: [number, number][]) {
    // console.log("getting path data", path);
    if(!path || path.length === 0) path = [[0, 0]];
    return path.map((pt, index) => 
      `${index === 0 ? 'M' : 'L'} ${pt[0]},${pt[1]}`
    ).join(' ');
  }

  let viewBox = '0 0 540 540';
  let originalViewBox = '0 0 540 540';
  let zoomedViewBox = '0 0 540 540';
  let zoomedPointScale = 1;
  let pointScale = 1;
  let centerX = 250;
  let centerY = 250;

  function updatePathView(path) {
    if(!shouldUpdateView) return;
    if(!domElement) return;
    // console.log("updating path view");
    const pathElement = domElement.querySelector('path');
    if (pathElement) {
      const bbox = pathElement.getBBox(); // Get bounding box of the path
      const padding = 6;

      centerX = Math.round(bbox.x - padding);
      centerY = Math.round(bbox.y - padding);
      const newWidth = bbox.width + 2 * padding;
      const newHeight = bbox.height + 2 * padding;

      // Set the viewBox to the expanded bounding box
      zoomedViewBox = `${centerX} ${centerY} ${newWidth} ${newHeight}`;
      zoomedPointScale = Math.max(newWidth, newHeight) / 540; // the picture fits its longer side, so dots scale with it
      viewBox = zoomedViewBox;
      pointScale = zoomedPointScale;
    }
  }

  function handlePointsChange(event : CustomEvent) {
    // console.log("path widget points change", event.detail.value);
    // console.log(event.detail);
    previewEnd = true;
    dispatch('valueChange', { id: 'path', value: event.detail.value as [number, number][] });
  }

  function handleEditStart() {
    // console.log("starting");
    shouldUpdateView = false;
    viewBox = originalViewBox;
    pointScale = 1;
  }

  function handleEditEnd() {
    // console.log("ending");
    shouldUpdateView = true;
    updatePathView(path);
  }

  // A brush's angle turns its path's points; changing the angle turns them by the difference.
  function handleAngleChange(newAngle: number) {
    if (newAngle === turnedTo) return;
    const newPath = turnPath(path, newAngle - turnedTo);
    turnedTo = newAngle;
    path = newPath;
    dispatch('valueChange', { id: 'path', value: newPath });
  }

  let previewEnd = true;
  let savedValue = path;
  let hovered = false; // hovering makes the dots bolder

  // Hovering previews the path shifted up a little, as hovering a position does, so you can see on the canvas
  // what it draws; leaving puts it back.
  function handleMouseOver(event: MouseEvent) {
    hovered = true;
    if (!previewEnd) return;
    savedValue = path;
    previewEnd = false;
    dispatch('valueChange', { id: 'path', value: path.map(([x, y]) => [x, y - 10]) });
  }

  function handleMouseOut(event: MouseEvent) {
    hovered = false;
    if(!previewEnd) {
      dispatch('valueChange', { id: 'path', value: savedValue });
      previewEnd = true;
    }
  }

</script>

  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <svg bind:this={domElement} class="path-widget" width="{size}em" height="{size}em" viewBox={viewBox}
    on:mouseenter={handleMouseOver}
    on:mouseleave={handleMouseOut}
  >
    <path d={pathData} stroke="black" fill="none" />
    {#each path as point, index}
      {#if index > 0}
        <!-- <line x1={path[index - 1][0]} y1={path[index - 1][1]} x2={point[0]} y2={point[1]} stroke="black" /> -->
      {/if}
      <circle cx={point[0]} cy={point[1]} r={(hovered ? 24 : 10) * pointScale} fill="black" />
    {/each}
  </svg>
  <!-- {#if path.length > 0} -->
    <!-- <span>at <CoordinateWidget id="center" value={{x:path[0][0], y:path[0][1]}}/></span> -->
  <!-- {/if} -->

  <!-- editor in tooltip -->
  <!-- dom element is the inline path preview -->
  {#if domElement}
    <Tooltip element={domElement} let:showContent>
      {#if showContent}   
        <PathEditor points={path} on:start={handleEditStart} on:end={handleEditEnd} on:valueChange={handlePointsChange}/>
      {/if}
    </Tooltip>
  {/if}

<style>
  .path-widget {
    display: inline-block;
    vertical-align: bottom;
    margin: 0 0.5em 0 0;
    border: none;
    max-width: 100%;
    height: auto;
    /* background-color: rgba(255, 255, 255, 0.6); */
    /* transform: translateY(-0.5em); */
  }

</style>
