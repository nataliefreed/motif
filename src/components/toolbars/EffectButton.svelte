<script lang="ts">
  import type { Effect } from '../../types/types';
  import { selectedEffect } from '../../stores/dataStore';
  import { slide } from 'svelte/transition';

  export let tool: Effect; // effect passed in when button is created
  export let thumbnail = '';

  function handleClick() {
    selectedEffect.set(tool); // set the selected effect in the store
  }
</script>

<button 
  class="effect-button" 
  on:click={handleClick} 
  transition:slide={{axis: 'x', duration: 800}} 
  class:selected={$selectedEffect === tool}
  style:background-image={thumbnail ? `url(/assets/effect-thumbnails/${thumbnail})` : ''}
  >
  {tool.dropdownName}
</button>


<style>
  .effect-button {
    width: var(--category-button-size);
    height: var(--category-button-size);
    display: flex;
    justify-content: center;
    align-items: center;
    /* background-color: #dedede; */
    border: none;
    border-radius: 5px;
    /* color: rgb(77, 77, 77); */
    margin: 5px;
    cursor: pointer;
    /* background-image: url('https://placekitten.com/200/300'); */
    background-size: cover; /* Ensure the image covers the button */
    background-position: center; /* Center the background image */
  }

  .selected {
    border: 2px solid #f5a623;
  }
</style>

<!-- style:background-image={thumbnail ? `url(${thumbnail})` : ''} -->
