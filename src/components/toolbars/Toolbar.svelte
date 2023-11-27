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
    background-color: #eee;
    border-radius: 10px;
    box-shadow: 1px 1px 1px 1px gray;
    align-items: center;
    justify-content: start;
    /* gap: 1px; */
    /* gap: 5px; */
  } 

  .horizontal {
    display: flex;
    flex-direction: row;
    text-align: center;
    max-width: 500px;
    width: 90%;
    height: 30px;
    padding: 5px;
    gap: 5px;
  }

  .vertical {
    display: flex;
    flex-direction: column;
    text-align: center;
    height: 90%;
    max-height: 500px;
    width: 30px;
    padding: 5px;
    gap: 5px;
  }
</style>