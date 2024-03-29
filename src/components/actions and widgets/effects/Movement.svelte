<script lang="ts">
  import NumberWidget from "../NumberWidget.svelte";
  import CoordinateWidget from "../CoordinateWidget.svelte";
  import ChooserWidget from "../ChooserWidget.svelte";

  export let name = '';
  export let params: any = {};
  export let onUpdate: (params: any) => void;

  function handleValueChange(event: CustomEvent) {
    const { id, value } = event.detail;
    onUpdate({[id]: value });
  }
</script>

{#if name === 'move to'}
  Go to
  <CoordinateWidget id="position" value={params.position || []} on:valueChange={handleValueChange}/>
{:else if name === 'move'}
  <ChooserWidget id="direction" options={['forward','back']} selected={params.direction || 'forward'} on:valueChange={handleValueChange}/>
  <NumberWidget id="distance" min={0} max={600} value={params.distance || 20} on:valueChange={handleValueChange}/>
  steps
{:else if name === 'stamp'}
  Stamp
{/if}
