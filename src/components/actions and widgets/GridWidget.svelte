<script>
  let points = [[50, 50], [100, 100], [150, 150]]; // Example points
  let selectedPoint = null;

  function selectPoint(point) {
    selectedPoint = point;
  }

  function movePoint(event) {
    if (!selectedPoint) return;
    const { clientX, clientY } = event;
    // Implement logic to update the selected point's position
    // based on clientX and clientY
  }

  let gridSize = 500;
  let gridSpacing = 50; // Spacing between grid lines

  // Generate an array of positions for grid lines
  const gridLines = Array.from({ length: gridSize / gridSpacing }, (_, i) => i * gridSpacing);

</script>

<svg class="grid-widget" width="50px" height="50px" viewBox={`0 0 ${gridSize} ${gridSize}`} on:mousemove={movePoint} on:mouseup={() => selectedPoint = null}>
  {#each gridLines as line}
    <!-- Horizontal Lines -->
    <line x1="0" y1={line} x2={gridSize} y2={line} stroke="lightgray" />

    <!-- Vertical Lines -->
    <line x1={line} y1="0" x2={line} y2={gridSize} stroke="lightgray" />
  {/each}

  {#each points as point}
    <circle cx={point[0]} cy={point[1]} r="5" fill="black"
      on:mousedown={() => selectPoint(point)} />
  {/each}
</svg>

  
<style>
  .grid-widget {
    border: 1px solid black;
  }
  line {
    stroke-width: 1; /* Adjust the thickness of the grid lines */
  }
</style>


