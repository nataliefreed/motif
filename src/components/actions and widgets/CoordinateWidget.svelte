<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import NumberWidget from './NumberWidget.svelte';

  const dispatch = createEventDispatcher();

  export let id = ''; // id for the coordinate pair, e.g., 'position'
  export let value: { x: number, y: number } = { x: 0, y: 0 }; 

  let x = value.x;
  let y = value.y;

  // $: value = { x: x, y: y };

  $: x = value.x;
  $: y = value.y;

  function handleXChange(event: CustomEvent) {
    // console.log("dispatching x event ", event.detail.value);
    x = event.detail.value; // Update local x
    dispatch('valueChange', { id, value: { x, y } });
  }

  function handleYChange(event: CustomEvent) {
    // console.log("dispatching y event ", event.detail);
    y = event.detail.value; // Update local x
    dispatch('valueChange', { id, value: { x, y } });
  }

  // function handleChange(event: CustomEvent) {
  //   // console.log("data", event.detail);
  //   // console.log('valueChange', { id, value: { x, y } });
  //   dispatch('valueChange', { id, value: event.detail.value });
  // }

</script>

<span>
(<NumberWidget id="x" min={0} max={600} value={x} on:valueChange={handleXChange}/>,
<NumberWidget id="y" min={0} max={600} value={y} on:valueChange={handleYChange}/>)
</span>