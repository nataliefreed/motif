<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { onMount, onDestroy } from 'svelte';

  const dispatch = createEventDispatcher();

  export let points;
  let gridElement:SVGElement | null;

  let gridSize = 500;
  let gridSpacing = 50;
  let scaledGridSize = 240;
  let scaleBy = gridSize/scaledGridSize;
  let mouseDown = false;
  let padding = 10;

  let initialMousePos = { x: 0, y: 0 };
  let initialPoints = [];

  onMount(() => {
    window.addEventListener('mouseup', globalMouseUp);
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

  {#each points as point}
    <circle cx={point[0]} cy={point[1]} r="5" fill="black"/>
  {/each}
  
</svg>

  
<style>
  .grid-widget {
    /* border: 1px solid gray; */
    cursor: crosshair;
    padding: 10px;
  }
</style>


