<script lang="ts">
  import tippy from 'tippy.js';
  import 'tippy.js/dist/tippy.css'; 
  import 'tippy.js/themes/light-border.css';
  import { onMount, onDestroy, beforeUpdate } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import { selectedCodeEffect } from '../../stores/dataStore';
  import Tooltip from '../Tooltip.svelte';

  const dispatch = createEventDispatcher();

  export let id = '';
  export let min = 0;
  export let max = 300;
  export let value: number = 0;

  let numberWidget: HTMLElement;
  let sliderElement: HTMLInputElement;
  let sliderContainer: HTMLDivElement;
  let tippyInstance: any;

  // $: if (value < min) {
  //   value = min;
  // } else if (value > max) {
  //   value = max;
  // }

  $: displayValue = Math.round(value);

  $: cursorStyle = ($selectedCodeEffect === null || $selectedCodeEffect === 'point') ? 'pointer' : '';

  function updateValue(event: Event) {
    value = +sliderElement.value; //+ is string to number
  }

  let previewEnd = true;
  let savedValue = value;
  let timeoutId: NodeJS.Timeout | undefined;

  function handleMouseOver(event: Event) {
    savedValue = value;
    let newValue = value+10;
    previewEnd = false;
    dispatch('valueChange', { id, value: newValue });

    // if (timeoutId !== undefined) {
    //   clearTimeout(timeoutId);
    // }

    // timeoutId = setTimeout(() => {
    //   previewEnd = true;
    //   dispatch('valueChange', { id, value: savedValue });
    // }, 300);

  }

  function endPreview(event: Event) {
    if(!previewEnd) {
      dispatch('valueChange', { id, value: savedValue });
      previewEnd = true;
    }
    // if (timeoutId !== undefined) {
    //   clearTimeout(timeoutId);
    //   timeoutId = undefined;
    // }
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
<span class="number-widget"
      bind:this={numberWidget}
      on:mouseover={handleMouseOver}
      on:mouseout={endPreview}
      on:click={endPreview}
      style="cursor: {cursorStyle};">
  {displayValue}
</span>

{#if numberWidget}
  <Tooltip element={numberWidget} let:showContent>
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
  .number-widget {
      /* text-decoration: underline lightgray 2px; */
      /* text-underline-offset: 5px; */
      box-sizing: border-box;
      border: 2px solid lightgray;
      background-color: #ffffff40;
      border-radius: 5px;
      margin: 0;
  }

  .number-widget:hover {
    color: #f5a623;
    transform: scale(1.1);
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