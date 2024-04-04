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
  let firstUpdate = false; // to save initial state to undo queue

  onMount(() => {
    colorButton.style.background = tinycolor(value).toHexString();
  });

  let previewEnd = false;

  let filterStyle = '';

  function updateColorButton(hexColor: string) {
    const color = tinycolor(hexColor);
    const hue = color.toHsv().h;
    filterStyle = `hue-rotate(${hue}deg)`;
    dispatch('valueChange', { id, value: hexColor, save: firstUpdate });
    firstUpdate = false;
  }

  // function updateColorButton(hexColor: string) {
  //   colorButton.style.background = tinycolor(hexColor).toHexString();
  //   dispatch('valueChange', { id, value: hexColor, save: firstUpdate });
  //   firstUpdate = false;
  // }

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
    firstUpdate = true;
    hiddenColorInput.click();
    firstUpdate = false;
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
<!-- <span
  class="color-palette-widget"
  bind:this={colorButton}
  on:click={handleClick}
  on:mouseover={handleMouseOver}
  on:mouseout={handleMouseOut}
  style="background-color: {value}; cursor: {cursorStyle};"
  id={id}
> -->

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<span>
<span
  bind:this={colorButton}
  on:click={handleClick}
  on:mouseover={handleMouseOver}
  on:mouseout={handleMouseOut}
  style="cursor: {cursorStyle};"
  id={id}
  class="color-palette-widget"
>
  <img src="/assets/widgets/splotch.png" alt="Color splotch" class="splotch-image" />
  <div class="color-overlay" style="background-color: {value};"></div>
</span>

<input
  type="color"
  bind:this={hiddenColorInput}
  class="hidden-color-picker"
  on:input={handleColorChange}
  value={value}
/>
</span>

<!-- </span> -->




<style>

  .hidden-color-picker {
    width: 1px;
    height: 1px;
    margin-left: 1em;
    margin-right: 0em;
    border: none;
    color: transparent;
    background-color: transparent;
    fill: transparent;
  }

  .color-palette-widget {
    position: relative;
    width: 1.7em;
    /* height: 1.5em; */
    padding: 0;
    /* border: 2px solid rgba(0,0,0,0.1); */
    display: inline-block;
    vertical-align: middle;
    transform: translateY(-0.1em);
    -webkit-transform: translateY(-0.1em);
}

.splotch-image {
  width: 100%;
  height: auto;
  display: block;
}

.color-overlay {
  position: absolute;
  top: 2px;
  left: 0;
  right: 0;
  bottom: 2px;
  mix-blend-mode: overlay;
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