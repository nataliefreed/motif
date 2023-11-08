<script>
  import RingBinding from './RingBinding.svelte';
</script>

<div class="outer-container">
  <div class="notebook">

    <div class="cover">
      <slot name="left"></slot>
    </div>

    <RingBinding numRings=16 />

    <div class="cover">
      <slot name="right"></slot>
    </div>
    
  </div>
</div>

<style>
  .outer-container {
    min-height: 100%; /* At least the height of the viewport */
    overflow: none;
    display: flex;
    align-items: flex-start;
  }

  .notebook {
    max-width: var(--notebook-max-width);
    max-height: var(--notebook-max-height);
    min-width: 320px; /* Common minimum for mobile screens */
    display: flex;
    align-items: center;
    position: relative;
    padding: 50px 30px 50px 30px;
  }

  .cover {
    margin: var(--cover-gap);
    background-color: #bcbcbc;
    /* background-color: #bdc6dc; */
    border: 1.5px solid  #636363;
    width: calc(var(--page-width) + 2*var(--cover-margin) + var(--page-inset));
    height: calc(var(--page-height) + 2*var(--cover-margin));
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: 1px 1px 2px 2px gray;
    margin-bottom: 20px;
  }

  /* Move the right edge of the left-page towards the center */
.cover:nth-child(1) .left-page {
  position: absolute;
  right: var(--page-inset);
  top: 50%;
  transform: translateY(-50%);
}

/* Move the left edge of the right-page towards the center */
.cover:nth-child(3) .right-page {
  position: absolute;
  left: var(--page-inset);
  top: 50%;
  transform: translateY(-50%);
}


  
</style>