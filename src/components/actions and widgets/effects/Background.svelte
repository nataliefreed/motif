<script lang="ts">
	import ColorWidget from "../ColorWidget.svelte";
  import NumberWidget from "../NumberWidget.svelte";

  export let name = '';
  export let params: any = {};
  export let onUpdate: (params: any) => void; // callback to update the actionStore

  // call closure onUpdate passed from Background
  function handleValueChange(event: CustomEvent) {
    const { id, value } = event.detail;
    const updatedParams = { ...params, [id]: value }; //update only the changed value
    onUpdate(updatedParams);
  }

</script>

{#if name === 'solid fill'}
<div>
  Fill with 
  <ColorWidget id="color" value={params.color} on:valueChange={handleValueChange}/>
</div>
{:else if name === 'gradient'}
<div>
  Gradient from 
  <ColorWidget id="color1" value={params.color1} on:valueChange={handleValueChange}/>
  to 
  <ColorWidget id="color2" value={params.color2} on:valueChange={handleValueChange}/>
  at angle 
  <NumberWidget id="angle" min={0} max={360} value={params.angle} on:valueChange={handleValueChange}/>°
</div>
{:else if name === 'stripes'}
<div>
  Stripes of width 
  <NumberWidget id="stripeWidth" min={1} max={300} value={params.stripeWidth} on:valueChange={handleValueChange}/>
  from 
  <ColorWidget id="color1" value={params.color1} on:valueChange={handleValueChange}/> 
  to 
  <ColorWidget id="color2" value={params.color2} on:valueChange={handleValueChange}/>
  at angle 
  <NumberWidget id="angle" min={0} max={360} value={params.angle} on:valueChange={handleValueChange}/>°
</div>
{/if}


