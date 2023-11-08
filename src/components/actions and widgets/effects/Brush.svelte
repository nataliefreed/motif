<script lang="ts">
  import CoordinateWidget from "../CoordinateWidget.svelte";
  import ColorWidget from "../ColorWidget.svelte"; // Assuming you have this for color picking
  import NumberWidget from "../NumberWidget.svelte";

  export let name = '';
  export let params: any = {};
  export let onUpdate: (params: any) => void;

  function handleValueChange(event: CustomEvent) {
    const { id, value } = event.detail;
    const updatedParams = { ...params, [id]: value };
    onUpdate(updatedParams);
  }
</script>

{#if name === 'straight line'}
<div>
  Straight line
  from <CoordinateWidget id="firstPoint" value={params.firstPoint || [100, 100]} on:valueChange={handleValueChange}/>
  to <CoordinateWidget id="lastPoint" value={params.lastPoint || [300, 300]} on:valueChange={handleValueChange}/>
  in color <ColorWidget id="color" value={params.color || '#f57f7e'} on:valueChange={handleValueChange}/>
  in width <NumberWidget id="lineWeight" value={params.lineWeight || 5} on:valueChange={handleValueChange}/>
</div>
{/if}
