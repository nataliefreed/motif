<script lang="ts">
  import NumberWidget from "../NumberWidget.svelte"; // Assuming you have a NumberSlider component
  import CoordinateWidget from "../CoordinateWidget.svelte"; // Assuming you have a CoordinateInput component
  import ChooserWidget from "../ChooserWidget.svelte"; // Assuming you have a OptionSelector component for 'choose' type

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
  Scale by 
  <NumberWidget id="scaleBy" min={0} max={600} value={params.scaleBy || 300} on:valueChange={handleValueChange}/>%
  width 
  <NumberWidget id="width" min={1} max={600} value={params.width || 100} on:valueChange={handleValueChange}/> 
  and height 
  <NumberWidget id="height" min={1} max={600} value={params.height || 100} on:valueChange={handleValueChange}/>
  at 
  <CoordinateWidget id="position" value={params.position || []} on:valueChange={handleValueChange}/>
{:else if name === 'shift'}
  <ChooserWidget id="orientation" options={['vertical','horizontal']} selected={params.orientation || 'vertical'} on:valueChange={handleValueChange}/>
  shift with height 
  <NumberWidget id="height" min={1} max={600} value={params.height || 50} on:valueChange={handleValueChange}/> 
  and offset 
  <NumberWidget id="offset" min={1} max={600} value={params.offset || 20} on:valueChange={handleValueChange}/>
{:else if name === 'invert' || name === 'grayscale' || name === 'threshold'}
  Color shift of type 
  <ChooserWidget id="filter" options={['invert','threshold', 'gray']} selected={params.filter || 'invert'} on:valueChange={handleValueChange}/>
{/if}
