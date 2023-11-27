<script lang="ts">
  import { activeCategory } from '../../stores/dataStore'

  export let category: string;
  export let isActive: boolean;

  function handleCategoryClick() {
    activeCategory.set(category);
  }
</script>


<button on:click={handleCategoryClick} class="category-button {isActive ? 'active' : ''}">{category}</button>



<style>
  .category-button {
    display: flex;
    /* width: calc(var(--toolbar-height)*3.5);
    height: calc(var(--toolbar-height)*1.5); */
    width: 100%;
    /* height: 100%; */
    justify-content: center;
    align-items: center;
    background-color: #dedede;
    border: 1px solid black;
    /* border-radius: 5px; */
    color: rgb(77, 77, 77);
    /* margin: 5px; */
    cursor: pointer;
    padding: 5px;
    font-size: 0.8em;
    font-family: 'FuturaHandwritten';
  }

  .category-button.active {
    background-color: #f5a623;
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

