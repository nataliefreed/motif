<script>
  import { paintColors } from '../stores/colorStore';

  function formatPaintColor(paintColor) {
    return `${paintColor.red}r, ${paintColor.yellow}y, ${paintColor.blue}b, ${paintColor.white}w, ${paintColor.black}k`;
  }
</script>

<style>
  .color-block {
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    /* border-radius: 5px; */
    font-family: Arial, sans-serif;
    font-size: 0.2em;
    text-align: center;
    /* width: 100px;
    height: 100px; */
    text-shadow: 1px 1px 2px black;
  }
  .container {
    display: flex;
    flex-wrap: wrap;
  }
</style>

<div class="container">
  {#each Object.entries($paintColors) as [hex, paintColor]}
    <div class="color-block" style="background-color: {hex};">
      <div>{hex}</div>
      <!-- {formatPaintColor(paintColor)} -->
    </div>
  {/each}
</div>
