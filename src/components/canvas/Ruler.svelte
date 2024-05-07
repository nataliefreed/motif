<script lang="ts">

  import { mousePos } from '../../stores/dataStore';

  let ticks = [];
  const totalHeight = 500; // Canvas
  const majorTick = 50;
  const minorTick = 5;

  let majorTickHeight = 0.7;
  let minorTickHeight = 0.25;

  for (let i = 0; i <= totalHeight; i++) {
    if (i % majorTick === 0) {
      ticks.push({ position: i, type: 'major' });
    } else if (i % minorTick === 0) {
      ticks.push({ position: i, type: 'minor' });
    }
  }
  
</script>


<div class="ruler-container">
  <div class="ruler left">
    {#each ticks as tick}
      <div class="tick" style="height: 1px; width: {tick.type === 'major' ? '50%' : '20%'}; right: 0; bottom: {tick.position-1}px;"></div>
      {#if tick.type === 'major'}
        <span class="label y-label" style="left: 0; bottom: {tick.position-1}px; transform: translateY(70%);">{tick.position}</span>
      {/if}
    {/each}
    {#if $mousePos.y > 0}
      <div class="marker-tick" style="height: 2px; width: 40%; right: 0; bottom: {$mousePos.y-1}px;"></div>
    {/if}
  </div>
  <div class="ruler bottom">
    {#each ticks as tick}
      <div class="tick" style="width: 1px; height: {tick.type === 'major' ? '50%' : '20%'}; left: {tick.position-1}px;"></div>
      {#if tick.type === 'major'}
        <span class="label x-label" style="top: 0px; transform: translateX(-100%); left: {tick.position-1}px;">{tick.position}</span>
      {/if}
    {/each}
      {#if $mousePos.x > 0}
        <div class="marker-tick" style="width: 2px; height: 40%; left: {$mousePos.x-1}px;"></div>
      {/if}
  </div>
  <div class="canvas-container">
    <slot></slot>
  </div>
</div>


<style>

  .label {
    font-size: 9px;
    z-index: 1;
  }

  .x-label {
    position: absolute;
    bottom: 0;
  }

  .y-label {
    position: absolute;
    left: 0;
  }

  .tick {
    position: absolute;
    background-color: rgb(158, 158, 158); 
  }

  .marker-tick {
    position: absolute;
    background-color: rgb(0, 0, 0);}
  
  .ruler-container {
    /* border: 1px solid blue; */
    position: relative;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /* width: 100%; */
    display: flex;
    align-items: flex-end;
    overflow: hidden;
  }

  .ruler {
    position: absolute;
    /* box-sizing: border-box; */
    background-color: #f5f5f5;
    user-select: none;
    /* box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px; */
  }

  .ruler.left {
    border: 1px solid gray;
    width: 20px;
    height: 100%;
    max-height: 499px;
    left: 0;
    bottom: 22px;
  }

  .ruler.bottom {
    border: 1px solid gray;
    height: 20px;
    width: 100%;
    max-width: 499px;
    right: 0;
    bottom: 0;
    left: 22px;
  }

  .canvas-container {
    margin-left: 23px;
    margin-bottom: 23px;
    overflow: hidden;
  }
</style>


