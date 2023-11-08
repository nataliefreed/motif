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
    box-shadow: 0 2px 2px 2px gray;
    /* margin: 0 0 50px 0; */
    background-color: #ffffff;
    /* border: 1px solid black; */
  }

  .page-content {
    width: 90%;
    height: 90%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: column;
    /* transform: translateX(calc(-0.5*var(--cover-margin))); */
    /* max-height: calc(var(--adjusted-page-height) * 0.5); */
    /* max-height: calc(0.9 * min(var(--page-height), var(--max-page-height))); */
    /* overflow-y: auto; */
    /* border: 1px solid black; */
  }

</style>