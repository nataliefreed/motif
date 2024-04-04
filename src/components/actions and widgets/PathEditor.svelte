<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { onMount, onDestroy } from 'svelte';
  import { flatActionStore } from '../../stores/dataStore';

  const dispatch = createEventDispatcher();

  export let points:[number, number][] = [];
  let gridElement:SVGElement | null;

  let gridSize = 500;
  let gridSpacing = 50;
  let scaledGridSize = 240;
  let scaleBy = gridSize/scaledGridSize;
  let mouseDown = false;
  let padding = 10;

  let initialMousePos = { x: 0, y: 0 };
  let initialPoints: [number, number][] = [];

  // let storedPaths = [ // other paths to choose from
  //   [[50, 50], [100, 100], [150, 50], [200, 100], [250, 50]], // Zigzag path
  //   [[50, 100], [100, 50], [150, 100], [200, 50], [250, 100]], // Inverted zigzag
  //   [[50, 50], [250, 100], [50, 150], [250, 200]], // Wavy path
  //   [[100, 50], [200, 50], [200, 150], [100, 150], [100, 50]] // Square path
  // ];

  let storedPaths:[] = [];

  onMount(() => {
    window.addEventListener('mouseup', globalMouseUp);

    // refresh the list of paths
    storedPaths = [];
    for (const key in $flatActionStore) {
      if ($flatActionStore[key].params?.path) {
        storedPaths.push($flatActionStore[key].params.path);
      }
    }
  });

  onDestroy(() => {
    window.removeEventListener('mouseup', globalMouseUp);
  });

  // Update the initialMousePos on mousedown
  function handleMouseDown(event: MouseEvent) {
    const gridRect = gridElement.getBoundingClientRect();

    initialMousePos.x = Math.round((event.clientX - gridRect.left - padding) * scaleBy);
    initialMousePos.y = Math.round((event.clientY - gridRect.top - padding) * scaleBy);
  
    // Store the initial positions of the points
    initialPoints = points.map(point => [...point]);

    mouseDown = true;
  }

  function handleMouseUp(event: MouseEvent) {
    mouseDown = false;
  }

  function globalMouseUp(event:MouseEvent) {
    mouseDown = false;
  }

  function movePoint(event:MouseEvent) {
    if (!gridElement || !mouseDown) return;

    // get mouse position
    const gridRect = gridElement.getBoundingClientRect();
    let gridX = Math.round((event.clientX - gridRect.left - padding) * scaleBy) - initialMousePos.x;
    let gridY = Math.round((event.clientY - gridRect.top - padding) * scaleBy) - initialMousePos.y;

    // bounds checking
    // todo: check bounds for entire path, it gets a bit choppy if you limit the mouse position
    // to the grid, but you also don't want all the points off screen
    // if(gridX < 0) gridX = 0;
    // if(gridX > gridSize) gridX = gridSize;
    // if(gridY < 0) gridY = 0;
    // if(gridY > gridSize) gridY = gridSize;

    // shift entire path with mouse (apply displacement to the initial positions of the points)
    points = initialPoints.map(point => {
      return [point[0] + gridX, point[1] + gridY];
    });

    dispatch('valueChange', { id: 'path', value: points });
  }

  // Helper function to convert a path to SVG path data
  function getPathData(path) {
    return path.map((pt, index) => `${index === 0 ? 'M' : 'L'} ${pt[0]},${pt[1]}`).join(' ');
  }

  function selectPath(index: number) {
    points = storedPaths[index];
    dispatch('valueChange', { id: 'path', value: points });
  }

  const gridLines = Array.from({ length: gridSize / gridSpacing + 1}, (_, i) => i * gridSpacing);
</script>




<svg bind:this={gridElement} class="grid-widget" width="{scaledGridSize}px" height="{scaledGridSize}px" viewBox={`0 0 ${gridSize} ${gridSize}`} on:mousedown={handleMouseDown} on:mousemove={movePoint} on:mouseup={handleMouseUp}>

  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" 
      refX="10" refY="4" orient="auto">
      <polygon points="0 0, 10 4, 0 8" fill="black" />
    </marker>
  </defs>

  {#each gridLines as line}
    <!-- Horizontal Lines -->
    <line x1="0" y1={line} x2={gridSize} y2={line} stroke="gray" stroke-width="1"/>
    <!-- Vertical Lines -->
    <line x1={line} y1="0" x2={line} y2={gridSize} stroke="gray" stroke-width="1"/>
  {/each}

  <!-- Axes -->
  <line x1="0" y1="{gridSize}" x2={gridSize} y2={gridSize} stroke="black" stroke-width=3 marker-end="url(#arrowhead)"/>
  <line x1="0" y1={gridSize} x2="0" y2="0" stroke="black" stroke-width=3 marker-end="url(#arrowhead)"/>

  {#each points as point, index}
    {#if index > 0}
      <line x1={points[index - 1][0]} y1={points[index - 1][1]} x2={point[0]} y2={point[1]} stroke="black" />
    {/if}
    <circle cx={point[0]} cy={point[1]} r="5" fill="black"/>
  {/each}
  
</svg>

<!-- Display stored paths as a grid -->
<div class="stored-paths">
  {#each storedPaths as storedPath, index}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <svg
      class="stored-path"
      width="50"
      height="50"
      viewBox="0 0 540 540"
      on:click={() => selectPath(index)}>

      <path d={getPathData(storedPath)} stroke="lightgray" fill="none" />
      {#each storedPath as point, index}
        {#if index > 0}
          <line x1={storedPath[index - 1][0]} y1={storedPath[index - 1][1]} x2={point[0]} y2={point[1]} stroke="black" />
        {/if}
        <circle cx={point[0]} cy={point[1]} r="5" fill="black" />
      {/each}

      </svg>
    {/each}
  </div>



  
<style>
  .grid-widget {
    /* border: 1px solid gray; */
    cursor: crosshair;
    padding: 10px;
  }

  .stored-paths {
    display: flex;
    flex-wrap: wrap;
    margin-top: 1em;
    overflow-x: auto;
    max-height: 75px;
  }
  .stored-path {
    margin: 0.5em;
    cursor: pointer;
    border: 1px solid #ccc;
  }
</style>


