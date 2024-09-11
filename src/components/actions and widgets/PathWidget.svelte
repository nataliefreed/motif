<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import Tooltip from '../Tooltip.svelte';
  import PathEditor from './PathEditor.svelte';
  import CoordinateWidget from './CoordinateWidget.svelte';

  export let id = '';
  export let path:[number, number][] = [];
  export let angle:number = 0;
  let cumulativeAngle = 0;
  let shouldUpdateView = true;

  let size = 3;

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
      zoomedPointScale = Math.min(newWidth, newHeight) / 540;
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

  function handleAngleChange(newAngle: number) {
    let incrementalAngle = newAngle - cumulativeAngle;
    cumulativeAngle = newAngle;
    let newPath = rotatePath(path, incrementalAngle);
    path = newPath;
    dispatch('valueChange', { id: 'path', value: newPath });
  }

  let previewEnd = false;
  let savedValue = path;

  function handleMouseOver(event: MouseEvent) {
    // savedValue = path;
    // let newValue = path.map(point => [point[0] + (Math.random() - 0.5) * 10, point[1] + (Math.random() - 0.5) * 10]);
    previewEnd = false;
    // dispatch('valueChange', { id: 'path', value: newValue });

    viewBox = originalViewBox;
    pointScale = 1;
  }

  function handleMouseOut(event: MouseEvent) {
    if(!previewEnd) {
      // dispatch('valueChange', { id: 'path', value: savedValue });
      previewEnd = true;
    }
    
    if(shouldUpdateView) {
      viewBox = zoomedViewBox;
      pointScale = zoomedPointScale;
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
  <svg bind:this={domElement} class="path-widget" width="{size}em" height="{size}em" viewBox={viewBox}
    on:mouseover={handleMouseOver}
    on:mouseout={handleMouseOut}
  >
    <path d={pathData} stroke="black" fill="none" />
    {#each path as point, index}
      {#if index > 0}
        <!-- <line x1={path[index - 1][0]} y1={path[index - 1][1]} x2={point[0]} y2={point[1]} stroke="black" /> -->
      {/if}
      <circle cx={point[0]} cy={point[1]} r={10*pointScale} fill="black" />
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

  .path-widget:hover {
    border: 1px solid black;
    
    /* transform: scale(1.5); */
  }
</style>
