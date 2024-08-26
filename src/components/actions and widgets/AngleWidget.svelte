<script lang="ts">
  import tippy from 'tippy.js';
  import 'tippy.js/dist/tippy.css'; 
  import 'tippy.js/themes/light-border.css';
  import { onMount, onDestroy, beforeUpdate } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import { selectedActionID } from '../../stores/dataStore';
  import Tooltip from '../Tooltip.svelte';

  const dispatch = createEventDispatcher();

  export let id = '';
  export let min = 0;
  export let max = 360;
  export let value: number = 0;

  let angleWidget: HTMLElement;
  let sliderElement: HTMLInputElement;
  let sliderContainer: HTMLDivElement;


  $: displayValue = Math.round(value);
  $: arrowRotation = `rotate(${value}deg)`;

  function updateValue(event: Event) {
    value = +sliderElement.value; //+ is string to number
  }

  let previewEnd = false;
  let savedValue = value;
    function handleMouseOver(event: Event) {
    savedValue = value;
    let newValue = value+10;
    previewEnd = false;
    dispatch('valueChange', { id, value: newValue });
  }

  function endPreview(event: Event) {
    if(!previewEnd) {
      dispatch('valueChange', { id, value: savedValue });
      previewEnd = true;
    }
  }

  function handleFocus(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  //triggers when number input is changed either by typing or up/down buttons
  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    let newValue = +target.value;
    //dispatch only if within allowed range, otherwise let the user finish typing!
    if(newValue >= min && newValue <= max) {
      dispatch('valueChange', { id, value: newValue });
    }
  }

  function handleFinalChange(event: Event) {
    const target = event.target as HTMLInputElement;
    let newValue = +target.value;
    if(newValue < min) {
      newValue = min;
    } else if(newValue > max) {
      newValue = max;
    }
    dispatch('valueChange', { id, value: newValue });
  }

  // on:mouseover={handleMouseOver}
  // on:mouseout={handleMouseOut}

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- <span class="angle-widget"
      bind:this={angleWidget}
      on:click={handleClick}>
  {displayValue}°
</span> -->

<span class="angle-widget" 
  bind:this={angleWidget}
  on:mouseover={handleMouseOver}
  on:mouseout={endPreview}
>
  
  <svg class="arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" style="transform: {arrowRotation};"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#8f8f8f" d="M318 177.5c3.8-8.8 2-19-4.6-26l-136-144C172.9 2.7 166.6 0 160 0s-12.9 2.7-17.4 7.5l-136 144c-6.6 7-8.4 17.2-4.6 26S14.4 192 24 192l72 0 0 288c0 17.7 14.3 32 32 32l64 0c17.7 0 32-14.3 32-32l0-288 72 0c9.6 0 18.2-5.7 22-14.5z"/></svg>
  <span class="angle-value">{displayValue}°</span>
</span>


{#if angleWidget}
  <Tooltip element={angleWidget} let:showContent>
    {#if showContent}
      <div bind:this={sliderContainer} class="slider-container">

        <input type="number"
        class="numberbox-for-slider" 
        bind:value={value} 
        min={min} 
        max={max}
        on:focus={handleFocus}
        on:input={handleChange}
        on:change={handleFinalChange}/>

        <input type="range"
        class="slider-for-numberbox" 
        bind:value={value} 
        min={min} 
        max={max}
        bind:this={sliderElement}
        on:input={handleFinalChange}/>
      </div>
    {/if}
  </Tooltip>
{/if}

<style>
  .slider-container {
    padding: 10px;
  }

  /* number that can be clicked to display a slider modal*/
  .angle-widget {
      display: flex;
      align-items: center;
      justify-content: space-evenly;
      /* text-decoration: underline gray 2px; */
      position: relative;
      /* text-decoration: underline inherit 2px; */
      /* text-underline-offset: 5px; */
      box-sizing: border-box;
      border-width: 1px 1px 1px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-style: solid;
      border-color: lightgray;
      margin: 0;
      cursor: pointer;
      background-color: #ffffff9c;
      border-radius: 0 10px 10px 0;
      position: absolute;
      right: -3.9em;
      width: 3.8em;
      height: 100%;
      max-height: 1.7em;
      /* top: 0.4em; */
      top: 0;
      padding-left: 0.3em;
      padding-right: 0.1em;
  }

  .arrow {
    content: '';
    display: inline-block;
    position: relative;
    align-self: center;
    /* top: 0.2em; */
    width: 1em;
    height: 1em;
    /* background-color: #ffffffc6; */
    border-radius: 50%;
  }

  .angle-value {
    margin-left: 0.5em;
    width: 3em;
    z-index: 2; /* Ensure the number is above the arrow */
  }

  .angle-widget:hover .angle-value {
    color: #f5a623;
    transform: scale(1.1);
  }

  .selected.angle-widget {
    background-color: lightyellow;
    border: 2px solid gold;
    box-shadow: none;
  }

  .slider-for-numberbox {
      display: block;
      width: 100px;
      margin: 30px 0 10px 0;
  }

  .numberbox-for-slider {
      display: block;
      text-align: center;
      margin: auto;
      width: 60%;
      font-family: 'FuturaHandwritten';
      font-size: 24px;
      border: 1px solid lightgray;
      border-radius: 4px;          /* rounds the corners slightly */
      outline: none;               /* removes the blue outline when focused */
      padding: 5px 8px;            /* adds some internal spacing */
      transition: border 0.3s;    /* smooth transition for border changes */
  }

  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button {  
   opacity: 1;                   /* always show arrows for numberbox in Chrome, other browsers have this by default */
  }

  .numberbox-for-slider:focus {
    border-color: darkgray;       /* changes border color when input is focused */
    background-color: lightgray;
  }
</style>