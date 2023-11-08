<script>
  import { activeCategory, toolStore, selectedEffect, myTools } from '../../stores/dataStore';
  import CategoryButton from './CategoryButton.svelte';
  import EffectButton from './EffectButton.svelte';
  import { fade } from 'svelte/transition';

  export let categories = [];
  let currentCategory;
  let tools = [];
  const imageCache = {};

// Function to preload tool thumbnail images and cache them
  // function preloadImage(tool) {
  //   if(tool.thumbnail && !imageCache[tool.thumbnail]) {
  //     const img = new Image();
  //     img.onload = () => imageCache[tool.thumbnail] = img.src;
  //     img.src = tool.thumbnail;
  //   }
  // }
  
  activeCategory.subscribe(value => {
    currentCategory = value;
    console.log("currentCategory:", currentCategory);
    if(currentCategory === "My Tools") {
    console.log("my tools category");
     tools = $myTools;
    }
    else {
      tools = $toolStore.filter(tool => tool.category === currentCategory);
    }
    // tools.forEach(preloadImage);
    if (tools.length > 0) {
      selectedEffect.set(tools[0]);  // set the first effect of this category when clicked
    }
  });

</script>

<div class="toolbar-container">
  {#if currentCategory}
  <div class="effect-toolbar">
    
      {#each tools as tool}
        <EffectButton tool={tool} thumbnail={tool.thumbnail?tool.thumbnail:''}/>
      {/each}
    
  </div>
  {/if}
  <div class="category-toolbar">
    {#each categories as category}
      <CategoryButton category={category} isActive={category === currentCategory} />
    {/each}
    <CategoryButton category="My Tools" isActive={"My Tools" === currentCategory} />
  </div>
</div>


<style>
  .effect-toolbar {
    position: relative;
    display: flex;
    flex-direction: row;
    margin-right: auto;
    background-color: #c0c0c0;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .category-toolbar {
    display: flex;
    flex-direction: row;
    background-color: #aaaaaa;
    border-radius: 5px;
  }

  .toolbar-container {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: auto;
      /* margin-top: calc(var(--category-button-size) + 20px); */
      /* background-color: #c0c0c0; */
      border-radius: 5px;
  }
</style>