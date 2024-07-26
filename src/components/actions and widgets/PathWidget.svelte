<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Tooltip from '../Tooltip.svelte';
  import PathEditor from './PathEditor.svelte';

  export let id = '';
  export let path:[number, number][] = [];
  export let angle:number = 0;
  let cumulativeAngle = 0;

  let domElement: SVGElement;

  const dispatch = createEventDispatcher();

  $: if(angle) { handleAngleChange(angle); }

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

  // function handleAngleChange(angle) {
  //   let newPath = rotatePath(path, angle);
  //   dispatch('valueChange', { id: 'path', value: newPath });
  // }

  function handleAngleChange(newAngle) {
    let incrementalAngle = newAngle - cumulativeAngle;
    cumulativeAngle = newAngle;
    let newPath = rotatePath(path, incrementalAngle);
    path = newPath;
    dispatch('valueChange', { id: 'path', value: newPath });
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

  function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  function getBoundingBoxCenter(points) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    points.forEach(point => {
      minX = Math.min(minX, point[0]);
      maxX = Math.max(maxX, point[0]);
      minY = Math.min(minY, point[1]);
      maxY = Math.max(maxY, point[1]);
    });
    return [(minX + maxX) / 2, (minY + maxY) / 2]; // Center of the bounding box
  }

  function rotatePath(points, angle) {
    let radians = degreesToRadians(angle);
    let cos = Math.cos(radians);
    let sin = Math.sin(radians);
    let [cx, cy] = getBoundingBoxCenter(points); // Center of bounding box
    return points.map(point => {
      let x = point[0] - cx;
      let y = point[1] - cy;
      let newX = cos * x - sin * y + cx;
      let newY = sin * x + cos * y + cy;
      return [newX, newY]; // New position of the point after rotation
    });
  }


</script>

  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-mouse-events-have-key-events -->
  <svg bind:this={domElement} class="path-widget" width="1.7em" height="1.7em" viewBox="0 0 540 540" style="border: 1px solid #ddd; max-width: 100%; height: auto;"
    on:mouseover={handleMouseOver}
    on:mouseout={handleMouseOut}
  >
    <path d={pathData} stroke="black" fill="none" />
    {#each path as point, index}
      {#if index > 0}
        <line x1={path[index - 1][0]} y1={path[index - 1][1]} x2={point[0]} y2={point[1]} stroke="black" />
      {/if}
      <circle cx={point[0]} cy={point[1]} r="20" fill="black" />
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
    vertical-align: bottom;
    margin: 0 0.2em 0 0.5em;
    background-color: rgba(255, 255, 255, 0.6);
    /* transform: translateY(-0.5em); */
  }
</style>
