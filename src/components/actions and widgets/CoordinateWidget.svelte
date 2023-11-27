<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import NumberWidget from './NumberWidget.svelte';
  import { p5CanvasSize } from '../../stores/canvasStore';

  const dispatch = createEventDispatcher();

  let x = 0;
  let displayY = 0; //display as traditional cartesian coordinate y, not graphics y
  let maxY = $p5CanvasSize.height;

  export let id = '';
  export let value: { x: number, y: number } = { x: 0, y: 0 };

  $: if(value) {
    x = value.x;
    displayY = maxY - value.y; // Flip the y value for display
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
  
</script>

<span>
(<NumberWidget id="x" min={0} max={600} value={x} on:valueChange={handleXChange}/>,
<NumberWidget id="y" min={0} max={600} value={displayY} on:valueChange={handleYChange}/>)
</span>