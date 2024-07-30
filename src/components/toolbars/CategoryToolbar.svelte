<script lang="ts">
  import CategoryButton from './CategoryButton.svelte';
  import { activeCategory, toolStore, selectedEffect } from '../../stores/dataStore';
  import type { Effect } from '../../types/types';
  
  export let categories: string[];
  let visibleCategory = '';

  function handleCategoryClick(category: string) {
    //toggle open/closed, unless you click on a different category than the open one, in which case close the open one and open the new one
    visibleCategory = visibleCategory === category ? '' : category;
  }

  function handleCategoryMouseover(category: string) {
    visibleCategory = category;
  }
  function handleCategoryMouseout() {
    // visibleCategory = '';
  }

  function handleEffectClick(effect: Effect) {
    selectedEffect.set(effect);
    visibleCategory = '';
  }

  function handleActiveEffectClick() {
    //set visible category to the one that the active effect is in
    if($selectedEffect) visibleCategory = $selectedEffect.category;
  }

</script>

<!-- <div>{$activeCategory}</div> -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<div class="category-toolbar" on:mouseout={handleCategoryMouseout}>
  {#if $selectedEffect && $selectedEffect.thumbnail}
    <button 
    on:click={handleActiveEffectClick}
    class="active-effect-button" 
    style:background-image={`url(/assets/effect-thumbnails/${$selectedEffect.thumbnail})`}>
      {$selectedEffect.textLabel}
    </button>
  {/if}
  {#each categories as category}
    <div class="category-container">
      <!-- svelte-ignore a11y-mouse-events-have-key-events -->
      <button on:click={() => handleCategoryClick(category)}
        on:mouseover={() => handleCategoryMouseover(category)}
        class="category-button" class:selected={$activeCategory === category && visibleCategory === ''}>
        <img class="category-img" src="/assets/icons/{category}.svg" alt="{category}">
        <!-- {category} -->
      </button>
      {#if category === visibleCategory}
        <div class="effect-toolbar">
          {#each $toolStore.filter(effect => effect.category === category) as effect}
            <button
              on:click={() => handleEffectClick(effect)}
              class="effect-button"
              class:selected={$selectedEffect === effect}
              style:background-image={`url(/assets/effect-thumbnails/${effect.thumbnail})`}
              >
              <span class="effect-label">{effect.textLabel}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>

.category-toolbar {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .effect-toolbar {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 10px;
    margin-left: 10px;
    border: 1px solid blue;
  }

  .category-container {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    /* margin: auto; */
    /* border: 1px solid red; */
  }

  .category-button {
    background-color: transparent;
    cursor: pointer;
    border: none;
    font-family: 'Fandango';
    font-size: 1.1em;
    color: #5299BB;
    /* height: 40px; */
    display: flex;
    flex-direction: column;
    /* margin: auto; */
    padding: 5px;
  }

  .category-img {
    width: 30px;
    height: 30px;
    display: block;
    margin: auto;
  }

  .category-button.selected {
    color: #0d76a6;
  }

  .effect-button, .active-effect-button {
    background-color: transparent;
    cursor: pointer;
    border: none;
    background-size: cover;
    background-repeat: no-repeat;
    height: 40px;
    font-family: 'Fandango';
    font-size: 1.1em;
    text-align: center;
    border-radius: 5px;
    /* border: 1px solid black; */
  }

  .active-effect-button {
    width: 80%;
    text-align: center;
    margin: 0 auto 10px auto;
  }

  .effect-button.selected {
    border: 2px solid #d5be0d;
  }

  .effect-label {
    text-align: center;
    /* margin-left: 20px; */
  }

</style>

