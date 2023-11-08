<script lang="ts">
  import NumberWidget from "../NumberWidget.svelte";
  import ColorWidget from "../ColorWidget.svelte";
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

{#if name === 'box'}
<div>
  Box with length 
  <NumberWidget id="length" min={20} value={params.length || 120} on:valueChange={handleValueChange}/>, 
  width <NumberWidget id="width" min={20} value={params.width || 120} on:valueChange={handleValueChange}/>, 
  height <NumberWidget id="height" min={20} value={params.height || 120} on:valueChange={handleValueChange}/>
</div>
{:else if name === 'paper doll'}
<div>
  Paper doll with skin tone 
  <ColorWidget id="skinTone" on:valueChange={handleValueChange}/>
  hairstyle <ChooserWidget id="hairstyle" options={['1', '2', '3']} selected={params.hairstyle || '1'} on:valueChange={handleValueChange}/>
  outfit set <ChooserWidget id="outfit" options={['1', '2']} selected={params.outfit || '2'} on:valueChange={handleValueChange}/>
</div>
{/if}

<!-- colorOptions={params.skinToneOptions} alphaEnabled={false} swatchesOnly={true} value={params.skinTone} -->