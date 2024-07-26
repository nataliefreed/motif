<script lang="ts">
  import { activeCategory } from '../../stores/dataStore'
  import EffectToolbar from './EffectToolbar.svelte';

  export let category: string;
  export let isActive: boolean;

  function handleCategoryClick() {
    // activeCategory.set(category);
  }

  function handleCategoryHover() {
    // console.log('hovering over', category);
  }
</script>

<div class="category-button-container">
  <button 
    title={category}
    on:mouseover={handleCategoryHover}
    on:click={handleCategoryClick}
    class="category-button {isActive ? 'active' : ''}"
    >
    <img src="/assets/category-thumbnails/{category}.png" alt="{category}">
    <!-- {category} -->
  </button>
</div>
<EffectToolbar category={category} />

<style>

  .category-button-container {
    /* border: 1px solid green; */
    box-sizing: border-box;
    /* padding: 0 5% 0 5%; */
    /* width: 75%; */
  }
  .category-button {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    border: none;
    background-color: transparent;
    cursor: pointer;
    padding: 20% 0;
    font-size: 0.8em;
    font-family: 'FuturaHandwritten';
    width: 50px;
    height: 50px;
    /* border: 1px solid red; */
  }

  .category-button.active {
    background-color: #eaeaea;
    /* filter: drop-shadow(0px 0px 10px rgb(169, 169, 169)); */
  }

  .category-button:hover img {
    filter: drop-shadow(3px 4px 1px #646464);
  }

  .category-button.active:hover img {
    filter: drop-shadow(3px 4px 1px #646464);
  }

  .category-button.active img {
    filter: none;
    /* filter: drop-shadow(3px 4px 1px #646464); */
  }

  .category-button img {
    width: 60%;
    filter: grayscale(100%);
    /* transition: filter 0.3s ease; */
  }
</style>

<!-- <style>
  #tool-palette {
    width: calc(0.85 * var(--adjusted-page-width));
    margin: 1em 0 3em 0;
    z-index: 3;
  }

  #category-tabs {
    display: flex;
    padding: 0px 10px 0px 0px;
    margin: 0px 0px 0px 0px;
  }

  .effect-button-bar {
    display: flex;
    gap: 5px;  /* Spacing between the buttons */
  }

  .effect-button {
    width: calc((0.85 * var(--adjusted-page-width) - 9 * 5px) / 12);
    height: calc((0.85 * var(--adjusted-page-width) - 9 * 5px) / 12);
    background-color: white;
    margin: 0;
    padding: 0;
    border-radius: 5%;
    box-shadow: 1px 2px 2px 0px gray;
    border: 2px solid gray;
    cursor: pointer;
    font-family: 'FuturaHandwritten';
    font-size: 10px;
    white-space: normal; /* wrap text */
    display: flex;
    align-items: center;
    justify-content: center;
  } 

  .effect-button.selected {
    background-color: rgb(255, 205, 40);
  }

  #effect-toolbar {
    display: flex;
    flex-wrap: wrap;
    border: 2px solid gray;
    background-color: #cacaca;
    padding: 2px;
    z-index: 2;
    gap: 10px;  /* Spacing between the buttons */
  }

  #effect-settings {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .category-tab {
    background-color: #e6e6e6;
    padding: 7px 6px 5px 6px;
    border-radius: 10px 10px 0px 0px;
    border: 2px rgb(149, 149, 149);
    border-style: solid solid hidden solid;
    cursor: pointer;
    margin: 2px 3px 0px 3px;
    font-family: 'FuturaHandwritten';
    font-size: 0.8em;
    color: #454545;
  }

  .category-tab:hover, .effect-button:hover, .general-button:hover {
    background-color: #b3b3b3;
  }

  .category-tab.selected {
    transform: translate(0px, -3px);
    -webkit-transform: translate(0px, -3px);
    margin-top: 0px;
    margin-bottom: -5px;
    background-color: #cacaca;
    border: 2px gray;
    border-style: solid solid hidden solid;
    color: black;
    z-index: 3;
  }

  .category-tab:active, .effect-button:active, .general-button:active {
  transform: translate(0px, 5px);
  -webkit-transform: translate(0px, 5px);
  border-style: solid solid hidden solid;
  }

  #category-tabs > .category-tab.selected:first-child {
    margin-left: 0px;
  }
</style> -->

