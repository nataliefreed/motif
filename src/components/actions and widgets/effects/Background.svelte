<script lang="ts">
	import ColorWidget from "../ColorWidget.svelte";
  import NumberWidget from "../NumberWidget.svelte";
  import AngleWidget from "../AngleWidget.svelte";
  import CoordinateWidget from "../CoordinateWidget.svelte";
    import { p5CanvasSize } from "../../../stores/canvasStore";

  export let name = '';
  export let params: any = {};
  export let onUpdate: (params: any, save: boolean) => void; // callback to update the actionStore

  function handleValueChange(event: CustomEvent) {
    const { id, value, save } = event.detail;
    onUpdate({[id]: value }, save);
  }

</script>

{#if name === 'solid fill'}
 <span class="tool-name">fill</span> with <ColorWidget id="color" value={params.color} lockedIndex={params.lockedIndex} on:valueChange={handleValueChange}/>
{:else if name === 'gradient'}
<span class="tool-name">gradient</span> from 
  <ColorWidget id="color" value={params.color} lockedIndex={params.lockedIndex} on:valueChange={handleValueChange}/>
  to 
  <ColorWidget id="color2" value={params.color2} lockedIndex={params.lockedIndex2} on:valueChange={handleValueChange}/>
  at angle 
  <AngleWidget id="angle" min={0} max={360} value={params.angle} on:valueChange={handleValueChange}/>
{:else if name === 'stripes'}
<span class="tool-name">stripes</span> of width
  <NumberWidget id="stripeWidth" min={1} max={300} value={params.stripeWidth} on:valueChange={handleValueChange}/>
  at angle 
  <AngleWidget id="angle" min={0} max={360} value={params.angle} on:valueChange={handleValueChange}/>
  in color 
  <ColorWidget id="color" value={params.color} lockedIndex={params.lockedIndex} on:valueChange={handleValueChange}/>
{:else if name === 'speckles'}
<span class="tool-name">speckles</span> for time
  <NumberWidget id="progress" min={0} max={100} value={params.progress} on:valueChange={handleValueChange}/>
  at
  <CoordinateWidget id="position" value={params.position} on:valueChange={handleValueChange}/>
  in
  <ColorWidget id="color" value={params.color} lockedIndex={params.lockedIndex} on:valueChange={handleValueChange}/>
{/if}