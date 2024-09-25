<script lang="ts">
  import NumberWidget from "../NumberWidget.svelte";
  import CoordinateWidget from "../CoordinateWidget.svelte";
  import ChooserWidget from "../ChooserWidget.svelte";

  export let name = '';
  export let params: any = {};
  export let onUpdate: (params: any) => void;

  function handleValueChange(event: CustomEvent) {
    const { id, value } = event.detail;
    const updatedParams = { ...params, [id]: value };
    onUpdate(updatedParams);
  }
</script>

{#if name === 'grow' || name === 'shrink'}
<span class="tool-name">scale</span> by
  <NumberWidget id="scaleBy" min={0} max={600} value={params.scaleBy || 300} on:valueChange={handleValueChange}/>%
  width 
  <NumberWidget id="width" min={1} max={600} value={params.width || 100} on:valueChange={handleValueChange}/> 
  and height 
  <NumberWidget id="height" min={1} max={600} value={params.height || 100} on:valueChange={handleValueChange}/>
  at 
  <CoordinateWidget id="position" value={params.position || []} on:valueChange={handleValueChange}/>
{:else if name === 'shift'}
  <ChooserWidget id="orientation" options={['vertical','horizontal']} selected={params.orientation || 'vertical'} on:valueChange={handleValueChange}/>
  <span class="tool-name">shift</span> with width 
  <NumberWidget id="stripeWidth" min={1} max={600} value={params.stripeWidth || 50} on:valueChange={handleValueChange}/> 
  and offset 
  <NumberWidget id="offset" min={1} max={600} value={params.offset || 20} on:valueChange={handleValueChange}/>
{:else if name === 'filter'}
<span class="tool-name">color filter</span>
  <ChooserWidget id="filter" options={['invert','threshold', 'gray']} selected={params.filter || 'invert'} on:valueChange={handleValueChange}/>
{:else if name === 'move cutout'}
  <ChooserWidget id="mode" options={['move','copy']} selected={params.mode || 'move'} on:valueChange={handleValueChange}/>
  <NumberWidget id="w" min={1} max={600} value={params.w || 100} on:valueChange={handleValueChange}/> 
  x <NumberWidget id="h" min={1} max={600} value={params.h || 100} on:valueChange={handleValueChange}/>
  cutout from
  <CoordinateWidget id="start" value={params.start || []} on:valueChange={handleValueChange}/>
  to
  <CoordinateWidget id="end" value={params.end || []} on:valueChange={handleValueChange}/>
<!-- {:else if name === 'rotate'}
  Rotate <NumberWidget id="width" min={0} max={360} value={params.angle || 45} on:valueChange={handleValueChange}/>° -->
{/if}
