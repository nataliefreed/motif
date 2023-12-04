<script lang='ts'>
  export let orientation = "horizontal";
</script>

{#if orientation === "horizontal"}
<div class="toolbar horizontal">
  <slot></slot>
</div>

{:else if orientation === "vertical"}
  <div class="toolbar vertical">
    <slot></slot>
  </div>
{/if}


<style>
  .toolbar {
    background-color: white;
    border: 1px solid black;
    align-items: center;
    justify-content: start;
  } 

  .horizontal {
    display: flex;
    flex-direction: row;
    text-align: center;
  }

  .vertical {
    display: flex;
    flex-direction: column;
    text-align: center;
  }
</style>