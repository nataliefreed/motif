<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { onMount, onDestroy } from 'svelte';
  import { flatActionStore } from '../../stores/dataStore';
  import { getPaths } from '../pathManager';

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

   //hardcoded to test
  let patternPaths: [number, number][][] = [[
    [0, 0], [50, 0], [100, 0], [150, 0], [200, 0], [250, 0], [300, 0], [350, 0], [400, 0], [450, 0], [500, 0],
    [25, 50], [75, 50], [125, 50], [175, 50], [225, 50], [275, 50], [325, 50], [375, 50], [425, 50], [475, 50],
    [0, 100], [50, 100], [100, 100], [150, 100], [200, 100], [250, 100], [300, 100], [350, 100], [400, 100], [450, 100], [500, 100],
    [25, 150], [75, 150], [125, 150], [175, 150], [225, 150], [275, 150], [325, 150], [375, 150], [425, 150], [475, 150],
    [0, 200], [50, 200], [100, 200], [150, 200], [200, 200], [250, 200], [300, 200], [350, 200], [400, 200], [450, 200], [500, 200],
    [25, 250], [75, 250], [125, 250], [175, 250], [225, 250], [275, 250], [325, 250], [375, 250], [425, 250], [475, 250],
    [0, 300], [50, 300], [100, 300], [150, 300], [200, 300], [250, 300], [300, 300], [350, 300], [400, 300], [450, 300], [500, 300],
    [25, 350], [75, 350], [125, 350], [175, 350], [225, 350], [275, 350], [325, 350], [375, 350], [425, 350], [475, 350],
    [0, 400], [50, 400], [100, 400], [150, 400], [200, 400], [250, 400], [300, 400], [350, 400], [400, 400], [450, 400], [500, 400],
    [25, 450], [75, 450], [125, 450], [175, 450], [225, 450], [275, 450], [325, 450], [375, 450], [425, 450], [475, 450],
    [0, 500], [50, 500], [100, 500], [150, 500], [200, 500], [250, 500], [300, 500], [350, 500], [400, 500], [450, 500], [500, 500]
  ],
    [[38, 10], [107, 11], [157, 8], [186, -3], [244, -11], [287, -9], [355, -13], [401, 0], [448, 3], [486, 6],
    [21, 34], [52, 62], [96, 59], [147, 62], [205, 35], [243, 46], [293, 58], [356, 47], [402, 31], [445, 31], [491, 48],
    [48, 93], [100, 97], [258, 405], [234, 89], [25, 446], [73, 460], [217, 328], [217, 259], [282, 493], [187, 450], 
    [162, 400], [133, 380], [301, 112], [240, 449], [229, 9], [135, 440], [7, 188], [295, 379], [305, 355], [131, 340], 
    [181, 468], [487, 351], [127, 441], [35, 391], [399, 458], [142, 208], [357, 18], [395, 144], [2, 98], [424, 183], 
    [483, 223], [475, 14], [45, 331], [102, 460], [257, 318], [366, 405], [119, 408], [294, 263], [288, 261], [409, 434], 
    [490, 385], [68, 326], [63, 82], [355, 437], [89, 443], [481, 433], [139, 433], [213, 16], [351, 58], [380, 118], 
    [74, 61], [38, 266], [254, 222], [466, 108], [408, 7], [304, 67], [66, 381], [126, 212], [393, 78], [416, 378], 
    [418, 346], [298, 306], [244, 270], [316, 169], [62, 473], [53, 389], [148, 166], [78, 112], [267, 466], [128, 217], [173, 156]]
  ];
  let storedPaths: [number, number][][] = [];

  onMount(() => {
    window.addEventListener('mouseup', globalMouseUp);
    // console.log("PathEditor mounted");
    storedPaths = [...patternPaths, ...getPaths()];
  });

  onDestroy(() => {
    window.removeEventListener('mouseup', globalMouseUp);
    // console.log("PathEditor destroyed");
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

  // Convert path data to SVG path
  function getPathData(path) {
    return path.map((pt, index) => `${index === 0 ? 'M' : 'L'} ${pt[0]},${pt[1]}`).join(' ');
  }

  function selectPath(index: number) {
    points = storedPaths[index];
    dispatch('valueChange', { id: 'path', value: points });
  }

  const gridLines = Array.from({ length: gridSize / gridSpacing + 1}, (_, i) => i * gridSpacing);
</script>

<div class="layout-container">
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
    {#if storedPaths && storedPaths.length > 0}
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
    {/if}
  </div>
</div>



  
<style>
  .layout-container {
    display: flex;
    align-items: flex-start; /* Aligns children at the top */
  }

  .grid-widget {
    /* Additional styles for the grid widget */
    cursor: crosshair;
    padding: 10px;
    flex-shrink: 0;
  }

  .stored-paths {
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    max-height: 250px;
    margin-left: 1em; /* Between grid widget and stored paths */
  }

  .stored-path {
    margin-bottom: 0.5em; /* Space between each path preview */
    flex-shrink: 0;
    cursor: pointer;
    border: 1px solid #ccc;
  }
</style>


