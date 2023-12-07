<script lang="ts">
  import { onMount } from 'svelte';
  import tinycolor from 'tinycolor2';
  import { selectedCodeEffect } from '../../stores/dataStore';
  import { createEventDispatcher } from 'svelte';

  export let id = '';
  export let value = '#FFFFFF';
  let savedValue = value;

  const dispatch = createEventDispatcher();

  let colorOptions = [
    '#FF0000ff', // Red
    '#FFA500ff', // Orange
    '#FFD700ff', // Gold
    '#808000ff', // Olive
    '#008000ff', // Green
    '#26A2E0ff', // Light blue
    '#0000FFff', // Blue
    '#4B0082ff', // Indigo
    '#800080ff', // Purple
    '#EE82EEff', // Violet
    '#FFC0CBff', // Pink
    '#808080ff', // Gray
    '#FFFFFFff', // White
    '#000000ff', // Black
    '#5E2109ff', // Brown
    '#D2B48Cff'  // Tan
  ];

  let colorButton: HTMLElement;
  let hiddenColorInput: HTMLInputElement;

  onMount(() => {
    colorButton.style.background = tinycolor(value).toHexString();
  });

  let previewEnd = false;
  function updateColorButton(hexColor: string) {
    colorButton.style.background = tinycolor(hexColor).toHexString();
    dispatch('valueChange', { id, value: hexColor });
  }

  function randomize() {
    var randomColor = tinycolor.random();
    value = randomColor.toHexString();
    updateColorButton(value);
    previewEnd = true;
  }

  function handleClick(event: Event) {
    updateColorButton(savedValue);
    previewEnd = true;
    
    if($selectedCodeEffect === "random") {
      randomize();
    }
    else if($selectedCodeEffect === "point") {
      openColorPicker();
    }
  }

  function openColorPicker() {
    hiddenColorInput.click();
  }

  function handleColorChange(event: Event) {
    const input = event.target as HTMLInputElement;
    value = input.value;
    updateColorButton(value);
  }

  // let oscillateID: number;
  function handleMouseOver(event: Event) {
    savedValue = value;
    let newValue = tinycolor(value);
    newValue.spin(10);
    if(newValue.isDark()) newValue.brighten(20);
    else newValue.darken(20);
    previewEnd = false;
    updateColorButton(newValue.toHexString());
    // oscillate value
    // oscillateID = window.setInterval(() => {
    //   updateColorButton(tinycolor(value).spin(1).toHexString());
    // }, 20);
  }
  function handleMouseOut(event: Event) {
    //console.log("returning to saved value!");
    // clearInterval(oscillateID);
    if(!previewEnd) {
      updateColorButton(savedValue);
      previewEnd = true;
    }
  }

  $: cursorStyle = ($selectedCodeEffect === null || $selectedCodeEffect === 'point') ? 'pointer' : '';

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<span
  class="color-palette-widget"
  bind:this={colorButton}
  on:click={handleClick}
  on:mouseover={handleMouseOver}
  on:mouseout={handleMouseOut}
  style="background-color: {value}; cursor: {cursorStyle};"
  id={id}
></span>

<input
  type="color"
  bind:this={hiddenColorInput}
  class="hidden-color-picker"
  on:input={handleColorChange}
  value={value}
/>


<style>
  .color-palette-widget {
    border-radius: 50%;
    width: 1.5em;
    height: 1.5em;
    padding: 0;
    border: none;
    border: 2px solid rgba(0,0,0,0.1);
    /* cursor: pointer; */
    display: inline-block;
    line-height: 1.5em;
    vertical-align: top;
  }

  .hidden-color-picker {
    width: 1px;
    height: 1px;
    margin-left: -1em;
    margin-right: 0.5em;
    border: none;
    color: transparent;
    background-color: transparent;
  }
</style>


  <!-- <script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let id = '';
  export let value = '#FFFFFF';

  const dispatch = createEventDispatcher();

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    dispatch('valueChange', { id, value: target.value });
  }
</script>

<input type="color" bind:value={value} on:input={handleChange} id={id} /> -->