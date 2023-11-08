<script lang="ts">
  import { onMount } from 'svelte';
  // import Coloris from "@melloware/coloris";
  import tinycolor from 'tinycolor2';

  export let id = '';
  export let value = '#FFFFFF';
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
  let colorButton: any;

  // Dispatch function setup if needed

  onMount(() => {
    // Initialize Coloris here if necessary
    colorButton.style.background = tinycolor(value).toRgbString();
  });

  function openColorPicker() {
    // Coloris({
    //   el: colorButton,
    //   swatches: colorOptions,
    //   // ... other Coloris options
    //   format: 'rgb',
    //   alpha: true,
    //   onChange: (color) => {
    //     // Update the value and background color when the color changes
    //     colorButton.style.background = color;
    //     value = color;
    //     // Dispatch the valueChange event
    //   }
    // });
  }
</script>

<style>
  /* Add your CSS styles here, e.g., */
  .color-palette-widget {
    border-radius: 50%;
    width: 1.5em;
    height: 1.5em;
    padding: 0;
    border: 2px solid rgba(0,0,0,0.1);
    cursor: pointer;
    display: inline-block;
    line-height: 1.5em;
  }
</style>

<input
  type="color"
  bind:this={colorButton}
  class="color-palette-widget clr-field"
  on:click={openColorPicker}
  style="background-color: {value};"
  id={id}
/>


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