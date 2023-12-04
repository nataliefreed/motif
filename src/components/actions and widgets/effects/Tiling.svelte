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

<ChooserWidget id="tiling" options={['straight grid', 'brick', 'half drop', 'checkerboard', 'radial']} selected={params.tiling || name} on:valueChange={handleValueChange}/>
with width 
<NumberWidget id="width" min={5} max={600} value={params.width || 100} on:valueChange={handleValueChange}/> 
and height 
<NumberWidget id="height" min={5} max={600} value={params.height || (name === 'brick' ? 40 : 100)} on:valueChange={handleValueChange}/>
{#if name === 'radial'}
at angle 
<NumberWidget id="angle" min={0} max={360} value={params.angle || 0} on:valueChange={handleValueChange}/>°
{/if}
at 
<CoordinateWidget id="position" value={params.position || []} on:valueChange={handleValueChange}/>
