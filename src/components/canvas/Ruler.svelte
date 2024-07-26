<script lang="ts">
import { mousePos } from '../../stores/dataStore';

  let ticks = [];
  const totalHeight = 500; // Canvas
  const majorTick = 100;
  const minorTick = 10;

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
      <div class="tick" style="height: 1px; width: {tick.type === 'major' ? '40%' : '20%'}; right: 0; bottom: {tick.position-1}px;"></div>
      {#if tick.type === 'major'}
        <span class="label y-label" style="left: -2px; bottom: {tick.position-1}px; transform: translateY(50%) rotate(-90deg);">{tick.position}</span>
      {/if}
    {/each}
    {#if $mousePos.y > 0}
      <div class="marker-tick" style="height: 2px; width: 40%; right: 0; bottom: {$mousePos.y-1}px;"></div>
    {/if}
    <img id="vertical-axis-img" src="/backgrounds/01 vertical.png" alt="vertical axis">
  </div> <!-- ruler left -->
  <div class="ruler bottom">
    {#each ticks as tick}
      <div class="tick" style="width: 1px; height: {tick.type === 'major' ? '40%' : '20%'}; left: {tick.position-1}px;"></div>
      {#if tick.type === 'major'}
        <span class="label x-label" style="top: 3px; transform: translateX(-50%); left: {tick.position-1}px;">{tick.position}</span>
      {/if}
    {/each}
      {#if $mousePos.x > 0}
        <div class="marker-tick" style="width: 2px; height: 40%; left: {$mousePos.x-1}px;"></div>
      {/if}
      <img id="horizontal-axis-img" src="/backgrounds/01.png" alt="horizontal axis">
  </div> <!-- ruler bottom -->
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
    background-color: rgb(43, 149, 255); 
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
    /* overflow: hidden; */
  }

  .ruler {
    position: absolute;
    /* box-sizing: border-box; */
    /* background-color: #f5f5f5; */
    user-select: none;
    /* box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px; */
  }

  #vertical-axis-img {
    width: 4px;
    height: 100%;
    position: absolute;
    right: 0;
    bottom: -10px;
  }

  #horizontal-axis-img {
    height: 4px;
    width: 100%;
    position: absolute;
    top: 0;
    left: -10px;
  }

  .ruler.left {
    /* border-right: 1px solid gray; */
    height: 100%;
    width: 20px;
    /* max-height: 499px; */
    left: 0;
    bottom: 20px;
  }

  .ruler.bottom {
    /* border-top: 1px solid gray; */
    height: 20px;
    width: 100%;
    /* max-width: 499px; */
    bottom: 0;
    left: 18px;
  }

  .canvas-container {
    margin-left: 20px;
    margin-bottom: 20px;
    overflow: hidden;
  }
</style>


