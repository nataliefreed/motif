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
    updateValue(points);
  }

  function updateValue(value: [number, number][]) {
    x = value[0][0];
    displayY = maxY - value[0][1];
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

  function handleXChangeFromNumberbox(event: Event) {
    if(event.target) {
      const target = event.target as HTMLInputElement;
      let x = parseInt(target.value);
      if(x > maxY) x = maxY;
      if(x < 0) x = 0;
      dispatchValueChange();
    }
  }

  let savedValue = points;
  let previewEnd = true;
  let oscillateID: number;
  function handleMouseOver(event: Event) {
    // console.log("mouse over");
    // savedValue = points;
    // previewEnd = false;
    // const startTime = Date.now();
    // oscillateID = setInterval(() => {
    //   const elapsedTime = Date.now() - startTime;
    //   const oscillationAngle = elapsedTime / 100; // adjust speed
    //   const oscillationAmount = Math.sin(oscillationAngle)*20; // adjust amplitude
    //   let newY = maxY - displayY + Math.round(oscillationAmount*Math.random());
    //   if(newY > 500) newY = 500;
    //   if(newY < 0) newY = 0;
    //   updateValue([[x, newY]]);
    // }, 100);
  }
  
  function handleMouseLeave(event: Event) {
    //console.log("returning to saved value!");
    // clearInterval(oscillateID);
    // if(!previewEnd) {
    //   updateValue(savedValue);
    //   previewEnd = true;
    // }
  }
  
</script>

<span class="coordinate" bind:this={domElement} on:mouseover={handleMouseOver} on:mouseleave={handleMouseLeave}>
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
          on:input={handleXChangeFromNumberbox}
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
    /* text-decoration: underline lightgray 2px;
    text-underline-offset: 5px; */
    box-sizing: border-box;
    border: 2px solid lightgray;
    background-color: #ffffff40;
    border-radius: 5px;
    cursor: pointer;
  }

  .coordinate:hover {
    color: #f5a623;
    transform: scale(1.1);
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