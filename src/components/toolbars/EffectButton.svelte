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
  class:code-button={tool.tags === 'recipe'}
  on:click={handleClick} 
  transition:slide={{axis: 'x', duration: 800}} 
  class:selected={$selectedEffect === tool}
  style:background-image={thumbnail ? `url(/assets/effect-thumbnails/${thumbnail})` : ''}
  >
  {tool.textLabel}
</button>


<style>
  .effect-button {
    display: flex;
    width: calc(var(--toolbar-height)*1.5);
    height: calc(var(--toolbar-height)*1.5);
    justify-content: center;
    align-items: center;
    border: 1px solid black;
    /* border-radius: 5px; */
    cursor: pointer;
    background-size: cover; /* Ensure the image covers the button */
    background-position: center; /* Center the background image */
    /* margin: 0 5px; */
    font-size: 0.5em;
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
