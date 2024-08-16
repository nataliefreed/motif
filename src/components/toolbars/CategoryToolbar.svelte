<script lang="ts">
  import CategoryButton from './CategoryButton.svelte';
  import { activeCategory, toolStore, selectedEffect } from '../../stores/dataStore';
  import type { Effect } from '../../types/types';
  import { onMount } from 'svelte';
  import { scale, fly, slide } from 'svelte/transition';
  import { cubicInOut } from 'svelte/easing';
  
  export let categories: string[];
  let visibleCategory = '';
  export let disabled = false;

  function handleCategoryClick(category: string) {
    //toggle open/closed, unless you click on a different category than the open one, in which case close the open one and open the new one
    visibleCategory = visibleCategory === category ? '' : category;
  }

  function handleCategoryMouseover(category: string) {
    visibleCategory = category;
  }
  function handleCategoryMouseleave() {
    visibleCategory = '';
  }

  function handleEffectClick(effect: Effect) {
    selectedEffect.set(effect);
    visibleCategory = '';
  }

  function handleActiveEffectClick() {
    //set visible category to the one that the active effect is in
    if($selectedEffect) visibleCategory = $selectedEffect.category;
  }

  let moveEffect: Effect | undefined;
  onMount(() => {
    moveEffect = $toolStore.find(tool => tool.name === "move cutout");
  });

</script>

<!-- <div>{$activeCategory}</div> -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<div class="category-toolbar">
  <!-- {#if $selectedEffect && $selectedEffect.thumbnail}
    <button 
    on:click={handleActiveEffectClick}
    class="active-effect-button" 
    style:background-image={`url(/assets/effect-thumbnails/${$selectedEffect.thumbnail})`}>
      {$selectedEffect.textLabel}
    </button>
  {/if} -->
  
  {#if moveEffect}
    <button
      class="move-effect effect-button"
      on:click={() => handleEffectClick(moveEffect)}
      class:selected={$selectedEffect === moveEffect}
      style:background-image={`url(/assets/icons/move.svg)`}>
      <!-- <span class="effect-label">Move</span> -->
    </button>
  {/if}

  {#each categories as category}
    <div class="category-container" on:mouseleave={handleCategoryMouseleave}>
      <!-- svelte-ignore a11y-mouse-events-have-key-events -->
      <button on:click={() => handleCategoryClick(category)}
        on:mouseover={() => handleCategoryMouseover(category)}
        class="category-button" class:selected={$activeCategory === category}
        style:background-image="{$activeCategory === category ? `url(/assets/effect-thumbnails/${$selectedEffect.thumbnail})` : ''}"
        disabled={disabled}>
        <img class="category-img" src="/assets/icons/{category}.svg" alt="{category}">
        <!-- {category} -->
      </button>
      {#if category === visibleCategory}
        <div class="effect-toolbar" transition:slide="{{ delay: 0, duration: 300, easing: cubicInOut, axis: 'x' }}">
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
    /* gap: 10px; */
  }

  .effect-toolbar {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 10px;
    margin-left: 10px;
    background-color: rgba(255, 255, 255, 0.7);
    padding: 5px;
    border-radius: 0 5px 5px 0;
  }

  .category-container {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    /* padding: 5px; */
    
    /* height: 40px; */
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
    background-image: none;
    padding: 5px;
  }

  .category-button:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }

  .category-button.selected {
    background-color: rgba(255, 255, 255, 0.7);
    background-size: contain;
  }

  .category-img {
    width: 26px;
    height: 26px;
    margin: 5px;
    /* display: block;
    margin: auto; */
  }

  .category-button.selected {
    color: #0d76a6;
  }

  .category-button::disabled {
    vislble: hidden;
  }

  .effect-button, .active-effect-button {
    background-color: transparent;
    cursor: pointer;
    border: none;
    background-size: cover;
    background-repeat: no-repeat;
    /* height: 40px; */
    font-family: 'Fandango';
    font-size: 1.1em;
    text-align: center;
    border-radius: 5px;
    height: 36px;
    /* border: 1px solid black; */
  }

  .active-effect-button {
    width: 80%;
    text-align: center;
    margin: 0 auto 10px auto;
  }

  .move-effect {
    /* background-size: 20px 20px; */
    width: 22px;
    background-size: contain;
    background-position: center;
    padding: 5px;
    margin: auto;
  }

  .effect-button.selected {
    border: 2px solid #d5be0d;
  }

  .effect-button:hover {
    border: 2px solid #d5be0d;
  }


  .move-effect:hover {
    /* border: 2px solid #d5be0d; */
    /* border-radius: 50%; */
    border: none;
    width: 26px;
    /* width: 34px; */
  }

  .move-effect.selected {
    border: 2px solid #e9c328;
    border-radius: 20% 20%;
    width: 30px;
  }


  .effect-label {
    text-align: center;
    /* margin-left: 20px; */
  }

</style>

