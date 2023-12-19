<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { onMount, onDestroy } from 'svelte';

  const dispatch = createEventDispatcher();

  export let points = [[50, 50], [100, 100], [150, 150]];
  let selectedPoint:[number, number] | null;
  let gridElement:SVGElement | null;

  let gridSize = 500;
  let gridSpacing = 50;
  let scaledGridSize = 120;
  let scaleBy = gridSize/scaledGridSize;
  let mouseDown = false;
  let padding = 10;

  function selectPoint(point:[number, number]) { //update this for multiple points
    selectedPoint = point;
    // console.log("selected point", selectedPoint);
  }

  function movePoint(event:MouseEvent) {
    if (!gridElement || !mouseDown) return;

    const gridRect = gridElement.getBoundingClientRect();
    let gridX = Math.round((event.clientX - gridRect.left - padding) * scaleBy);
    let gridY = Math.round((event.clientY - gridRect.top - padding) * scaleBy);

    if(gridX < 0) gridX = 0;
    if(gridX > gridSize) gridX = gridSize;
    if(gridY < 0) gridY = 0;
    if(gridY > gridSize) gridY = gridSize;

    // update points
    if(points.length === 1) {
      points = [[gridX, gridY]];
      dispatch('valueChange', { id: 'points', value: [[gridX, gridY]] });
      return;
    }
  }

  onMount(() => {
    window.addEventListener('mouseup', globalMouseUp);
  });

  onDestroy(() => {
    window.removeEventListener('mouseup', globalMouseUp);
  });

  function globalMouseUp(event:MouseEvent) {
    mouseDown = false;
  }

  const gridLines = Array.from({ length: gridSize / gridSpacing + 1}, (_, i) => i * gridSpacing);
</script>

<svg bind:this={gridElement} class="grid-widget" width="{scaledGridSize}px" height="{scaledGridSize}px" viewBox={`0 0 ${gridSize} ${gridSize}`} on:mousedown={(e)=>{ mouseDown=true; movePoint(e); }} on:mousemove={movePoint} on:mouseup={() => {selectedPoint = null; mouseDown = false;}}>

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
    <circle cx={point[0]} cy={point[1]} r="10" fill="black"
      on:mousedown={() => { selectPoint([point[0], point[1]]); }} />
  {/each}
  
</svg>

  
<style>
  .grid-widget {
    /* border: 1px solid gray; */
    cursor: crosshair;
    padding: 10px;
  }
</style>


