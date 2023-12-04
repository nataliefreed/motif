<script>
  import { activeCategory, toolStore, selectedEffect, myTools, codeTools } from '../../stores/dataStore';
  import EffectButton from './EffectButton.svelte';
  let tools = [];

  $: if ($activeCategory) {
    if($activeCategory === "my tools") {
     tools = $myTools;
     selectedEffect.set(tools[tools.length-1]);
    }
    else if($activeCategory === "recipe tools") {
      tools = $codeTools;
      selectedEffect.set(tools[tools.length-1]);
    }
    else {
      tools = $toolStore.filter(tool => tool.category === $activeCategory);
      if (tools.length > 0) {
        selectedEffect.set(tools[0]);  // set the first effect of this category when clicked
      }
    }
  }

</script>

  <div class="horizontal-toolbar">
    {#if $activeCategory}
      {#each tools as tool}
        <EffectButton tool={tool} thumbnail={tool.thumbnail?tool.thumbnail:''}/>
      {/each}
    {/if}
  </div>


<style>

  .vertical-toolbar {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: start;
  } 

  .horizontal-toolbar {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
  } 

</style>