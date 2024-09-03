<script lang="ts">
  import NumberWidget from "../NumberWidget.svelte";
  import ColorWidget from "../ColorWidget.svelte";
  import ChooserWidget from "../ChooserWidget.svelte";
  import CoordinateWidget from "../CoordinateWidget.svelte";

  export let name = '';
  export let params: any = {};
  export let onUpdate: (params: any) => void;

  function handleValueChange(event: CustomEvent) {
    const { id, value } = event.detail;
    onUpdate({[id]: value });
  }

  // <button><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="1.5em" height="1.5em"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V173.3c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32H64zm0 96c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V128zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg></button>
  // <NumberWidget id="threshold" min={0} max={100}/>% 
</script>

{#if name === 'box'}
<span class="tool-name">box</span> with length 
  <NumberWidget id="length" min={20} value={params.length || 120} on:valueChange={handleValueChange}/>, 
  width <NumberWidget id="width" min={20} value={params.width || 120} on:valueChange={handleValueChange}/>, 
  height <NumberWidget id="height" min={20} value={params.height || 120} on:valueChange={handleValueChange}/>
  at <CoordinateWidget id="position" value={params.position} on:valueChange={handleValueChange}/>
  <!-- in <ColorWidget id="color" value={params.color} on:valueChange={handleValueChange}/> -->
{:else if name === 'paper doll'}
<span class="tool-name">paper doll</span> with skin tone 
  <ColorWidget id="skintone" value={params.skintone} on:valueChange={handleValueChange}/>
  hairstyle <ChooserWidget id="hairstyle" options={['1', '2', '3']} selected={params.hairstyle || '1'} on:valueChange={handleValueChange}/>
  outfit set <ChooserWidget id="outfit" options={['1', '2']} selected={params.outfit || '2'} on:valueChange={handleValueChange}/>
  <!-- {:else if name === 'trace'}
  Trace -->
{/if}

<!-- colorOptions={params.skinToneOptions} alphaEnabled={false} swatchesOnly={true} value={params.skinTone} -->

<style>
    button {
      display: flex-inline;
      font-size: 1vw;
      font-family: 'FuturaHandwritten';
      cursor: pointer;
      border: none;
      background-color: transparent;
      padding: 0;
      margin: 0;
      /* border-radius: 5px; */ 
  }

  button svg {
    fill: black;
  }
</style>