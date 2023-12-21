<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import NumberWidget from './NumberWidget.svelte';
  import { p5CanvasSize } from '../../stores/canvasStore';
  import GridWidget from './GridWidget.svelte';
  import Tooltip from '../Tooltip.svelte';

  const dispatch = createEventDispatcher();

  export let points: [number, number][] = [];

  let x = 0;
  let displayY = 0; //display as traditional cartesian coordinate y, not graphics y
  let maxY = $p5CanvasSize.height;

  export let id = '';
  export let value: { x: number, y: number } = { x: 0, y: 0 };
  let domElement: HTMLElement;

  $: if(value) {
    if(typeof value.x !== 'number') value.x = 0;
    if(typeof value.y !== 'number') value.y = 0;
    x = value.x;
    displayY = maxY - value.y; // Flip the y value for display

    points = [[x, value.y]];
  }

  function handleXChange(event: CustomEvent) {
    // console.log("dispatching x event ", event.detail.value);
    x = event.detail.value; // Update local x
    dispatchValueChange();
  }

  function handleYChange(event: CustomEvent) {
    // console.log("dispatching y event ", event.detail);
    displayY = event.detail.value;
    const actualY = maxY - displayY; // unflip for storage
    dispatchValueChange(actualY);
  }

  function dispatchValueChange(actualY = maxY - displayY) {
    dispatch('valueChange', { id, value: { x, y: actualY } });
  }

  function handlePointsChange(event: CustomEvent) {
    points = event.detail.value;
    x = event.detail.value[0][0];
    displayY = maxY - event.detail.value[0][1];
    dispatchValueChange();
  }

  function handleYChangeFromNumberbox(event: Event) {
    if(event.target) {
      const target = event.target as HTMLInputElement;
      let y = parseInt(target.value);
      if(y > maxY) y = maxY;
      if(y < 0) y = 0;
      displayY = y;
      const actualY = maxY - displayY; // unflip for storage
      dispatchValueChange(actualY);
    }
  }
  
</script>

<span class="coordinate" bind:this={domElement}>
({x}, {displayY})
<!-- (<NumberWidget id="x" min={0} max={600} value={x} on:valueChange={handleXChange}/>,
<NumberWidget id="y" min={0} max={600} value={displayY} on:valueChange={handleYChange}/>) -->
</span>
{#if domElement}
  <Tooltip element={domElement}>
    <div class="grid-with-numberBoxes">
      <GridWidget {points} on:valueChange={handlePointsChange}/>
      <div class="number-box-container">
        <div>
          x = <input type="number"
          bind:value={value.x}
          min={0} 
          max={500}/>
        </div>
        <div>
          y = <input type="number"
            value={displayY}
            on:input={handleYChangeFromNumberbox}
            min={0} 
            max={500}/>
        </div>
      </div>
    </div>
  </Tooltip>
{/if}

<style>
  .coordinate {
    text-decoration: underline lightgray 2px;
    text-underline-offset: 5px;
    cursor: pointer;
  }

  .grid-with-numberBoxes {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .number-box-container {
    display: flex;
    gap: 1em;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
  }

  input[type=number] {
    /* width: 4em; */
    font-family: "FuturaHandwritten";
  }
</style>