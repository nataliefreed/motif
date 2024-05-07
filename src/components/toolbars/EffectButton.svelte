<script lang="ts">
  import type { Effect } from '../../types/types';
  import { selectedEffect } from '../../stores/dataStore';
  import { slide } from 'svelte/transition';

  export let tool: Effect; // effect passed in when button is created
  export let thumbnail = '';

  function handleClick() {
    selectedEffect.set(tool); // set the selected effect in the store
  }
  // transition:slide={{axis: 'x', duration: 800}}
</script>

<button 
  class="effect-button"
  id={tool.name+"-button"};
  class:code-button={tool.tags === 'recipe'}
  on:click={handleClick} 
  class:selected={$selectedEffect === tool}
  style:background-image={thumbnail ? `url(/assets/effect-thumbnails/${thumbnail})` : ''}
  >
  {tool.textLabel}
</button>


<style>
  .effect-button {
    display: flex;
    /* max-width: 80%; */
    height: 50%;
    min-width: 15%;
    /* padding: 0px 12px; */
    justify-content: center;
    align-items: center;
    /* border: 0.5px solid black; */
    border-radius: 5px;
    border: none;
    cursor: pointer;
    background-size: cover; /* Ensure the image covers the button */
    background-position: center; /* Center the background image */
    font-family: 'FuturaHandwritten';
  }

  .code-button {
    background-color: pink;
  }

  .selected {
    box-shadow:inset 0px 0px 0px 2px #f5a623;
    /* border: 1px solid #f5a623; */
  }


</style>

<!-- style:background-image={thumbnail ? `url(${thumbnail})` : ''} -->
