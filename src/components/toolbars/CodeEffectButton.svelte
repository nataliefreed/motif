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
    /* background-color: green; */
  }

  .selected {
    box-shadow:inset 0px 0px 0px 2px #f5a623;
    /* border: 1px solid #f5a623; */
  }
</style>

<!-- class:selected={$selectedEffect === tool}  -->
