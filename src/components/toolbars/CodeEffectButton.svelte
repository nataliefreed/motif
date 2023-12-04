<script>
  import { selectedCodeEffect } from '../../stores/dataStore';

  export let label = "";
  let tool = "";

  function handleClick() {
    selectedCodeEffect.set(label);
  }

</script>

<button 
  class="code-effect-button"
  on:click={handleClick}
  class:selected={$selectedCodeEffect === label} 
>
  {label}
  <slot></slot>
</button>

<style>
  .code-effect-button {
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

  .selected {
    box-shadow:inset 0px 0px 0px 2px #f5a623;
    /* border: 1px solid #f5a623; */
  }
</style>

<!-- class:selected={$selectedEffect === tool}  -->
