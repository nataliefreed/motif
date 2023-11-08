<script lang="ts">
  export let numRings = 0;
</script>

<div class="rings">
  {#each Array(+numRings) as _}
    <div class="ring">
        <div class="circle left-circle"></div>
        <div class="line"></div>
        <div class="circle right-circle"></div>
    </div>
  {/each}
</div>

<style>
  .rings {
    display: flex;
    flex-direction: column;
    width: var(--ring-width);
    height: calc(var(--page-height)*0.9);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
    justify-content: space-evenly;
  }

  .ring {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .circle {
    width: calc(var(--ring-width) * 0.2);
    height: calc(var(--ring-width) * 0.2);
    background-color: #ffffff;
    border: 1px solid gray;
    box-shadow: inset 2px 2px 1px 1px gray;
    border-radius: 50%;
    z-index: 1;
  }

  .line {
    flex-grow: 1;
    height: calc(var(--ring-width) * 0.1);
    /* border: 3px solid #a2a2a2; */
    background-color: #a2a2a2;
    border-radius: 10px;
    margin: 2px -8px 0px -8px;
    z-index: 2;
  }

  /* debugging */
  /* .rings, .ring, .circle, .line {
    border: 1px solid red;
  } */

</style>
