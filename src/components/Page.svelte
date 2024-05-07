<script>

</script>

<div class="page">
  <div class="page-content">
      <slot></slot>
  </div>
</div>

<style>

  .page {

    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width:98%;
    height:98%;
    /* width: min(var(--page-width), var(--max-page-width));
    height: min(var(--page-height), var(--max-page-height)); */
    border-radius: 10px;
    position: relative;
    /* box-shadow: 0 2px 2px 2px gray; */
    /* box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
    box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
    box-shadow: rgba(240, 46, 170, 0.4) 5px 5px, rgba(240, 46, 170, 0.3) 10px 10px, rgba(240, 46, 170, 0.2) 15px 15px, rgba(240, 46, 170, 0.1) 20px 20px, rgba(240, 46, 170, 0.05) 25px 25px; */
    /* margin: 0 0 50px 0; */
    box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
    box-shadow: rgba(9, 30, 66, 0.25) 0px 1px 1px, rgba(9, 30, 66, 0.13) 0px 0px 1px 1px, rgba(9, 30, 66, 0.25) 3px 3px, rgba(9, 30, 66, 0.13) 0px 0px 1px 1px;
    background-color: #ffffff;

    /* border: 1px solid black; */
  }

  .page-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    /* transform: translateX(calc(-0.5*var(--cover-margin))); */
    /* max-height: calc(var(--adjusted-page-height) * 0.5); */
    /* max-height: calc(0.9 * min(var(--page-height), var(--max-page-height))); */
    /* overflow-y: auto; */
    /* border: 1px solid black; */
  }

</style>