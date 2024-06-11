<script lang="ts">
  import { onMount, createEventDispatcher, tick } from 'svelte';
  import tinycolor from 'tinycolor2';
  import ColorPalette from '../toolbars/ColorPalette.svelte';
  import { activePalette, showSavedColors, pickerPalette }  from '../../stores/colorStore';
  import { getReadableColor } from '../../utils/color-utils';
  import PaintColorMixer from './PaintColorMixer.svelte';

  const dispatch = createEventDispatcher();

  export let value: string; //initial value

  export let selectedColorIndex = -1;

  let modes = ["paint", "RGB", "HSV"];
  let activeMode = "paint";

  let c = tinycolor(value).toRgb();
  let red = c.r;
  let green = c.g;
  let blue = c.b;
  let alpha = c.a;

  $: color = tinycolor({ r: red, g: green, b: blue, a: alpha });
  $: value = rgbaString;

  $: rgbaString = color.toRgbString();
  $: rgbString = tinycolor(rgbaString).setAlpha(1).toRgbString();
  $: gradientRed = `linear-gradient(to right, rgba(0, ${green}, ${blue}, 1), rgba(255, ${green}, ${blue}, 1))`;
  $: gradientGreen = `linear-gradient(to right, rgba(${red}, 0, ${blue}, 1), rgba(${red}, 255, ${blue}, 1))`;
  $: gradientBlue = `linear-gradient(to right, rgba(${red}, ${green}, 0, 1), rgba(${red}, ${green}, 255, 1))`;
  $: gradientAlpha = `linear-gradient(to right, rgba(${red}, ${green}, ${blue}, 0), rgba(${red}, ${green}, ${blue}, 1))`;

  function updateColorComponents(newColor: tinycolor.Instance) {
    c = newColor.toRgb();
    red = c.r;
    green = c.g;
    blue = c.b;
    alpha = c.a;
  }

  onMount(() => {
    updateColorComponents(tinycolor(value));
  });

  function updateColor() {
    unlockColor();
    dispatch('valueChange', { value: color.toRgbString() });
  }

  function handleColorChange(event: CustomEvent) {
    value = event.detail.color;
    updateColorComponents(tinycolor(value));
    color = tinycolor({ r: red, g: green, b: blue, a: alpha });
    updateColor();
  }

  function handleColorClick(event: Event) {
    let target = event.target as HTMLElement;
    let newColor = tinycolor(target.style.backgroundColor);
    updateColorComponents(newColor);
    color = tinycolor({ r: red, g: green, b: blue, a: alpha });
    updateColor();
  }

  function handleSavedPaletteClick(index: number) {
    if(selectedColorIndex === index) {
      unlockColor();
      return;
    } else {
      selectedColorIndex = index;
      
      let newColor = tinycolor($activePalette[index]);
      updateColorComponents(newColor);
      dispatch('lockChange', { lockedIndex: selectedColorIndex });
      // dispatch('valueChange', { value: newColor.toRgbString() });
    }
  }

  function unlockColor() {
    selectedColorIndex = -1;
    dispatch('lockChange', { lockedIndex: selectedColorIndex });
  }

  function setMode(mode) {
    activeMode = mode;
  }

</script>

<div class="top-line">
  <div>
    color mode:
    <select bind:value={activeMode} class="mode-selector">
      {#each modes as mode}
        <option value={mode}>{mode}</option>
      {/each}
    </select>
  </div>

  <div class="color-preview" style="background-color:{rgbaString}"></div>
</div>

<!-- switch based on mode -->
<div class="color-picker">
  {#if activeMode === 'RGB'}
  <div class="sliders">
    <div class="slider">
      <label class="color-label" for="red" style="color:red">Red</label>
      <input class="color-label" type="number" min="0" max="255" bind:value={red} on:input={updateColor} style="color:red">
      <input class="color-label" type="range" id="red" min="0" max="255" bind:value={red} on:input={updateColor} style="--slider-gradient: {gradientRed};">
    </div>
    <div class="slider">
      <label for="green" style="color:green">Green</label>
      <input type="number" min="0" max="255" bind:value={green} on:input={updateColor} style="color:green">
      <input type="range" id="green" min="0" max="255" bind:value={green} on:input={updateColor} style="--slider-gradient: {gradientGreen};">
      
    </div>
    <div class="slider">
      <label for="blue" style="color:blue">Blue</label>
      <input type="number" min="0" max="255" bind:value={blue} on:input={updateColor} style="color:blue">
      <input type="range" id="blue" min="0" max="255" bind:value={blue} on:input={updateColor} style="--slider-gradient: {gradientBlue};">
    </div>

    
    <div class="slider">
      <label for="opacity" style="color:black">Opacity</label>
      <input type="number" min="0" max="100" step="0.01" bind:value={alpha} on:input={updateColor}>
      <input type="range" id="opacity" min="0" max="1" step="0.01" bind:value={alpha} on:input={updateColor} style="--slider-gradient: {gradientAlpha};">
    </div>
  </div>
  <div id="palette">
    {#each pickerPalette as color, index}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="color-item"
      on:click={handleColorClick}
      style="background-color: {color};">
      </div>
    {/each}
  </div>
  
  
  {#if $showSavedColors || selectedColorIndex !== -1}
  <div id="saved-palette">
    {#each $activePalette as color, index}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="color-item {(selectedColorIndex === index) ? 'selected' : ''}"
      on:click={e => handleSavedPaletteClick(index)}
      style="--actual-color: {color}; --label-color: {getReadableColor(color)};">
        {index+1}
      </div>
    {/each}
  </div>
  {/if}

  {:else if activeMode === 'HSV'}
  <div>HSV mode</div>
  {:else if activeMode === 'paint'}
    <PaintColorMixer initialColor={value} on:save={handleColorChange}/>
  {/if}
</div>




  <!-- <div class="preview"> -->
    <!-- <div class="color-preview" style="background-color: {rgbaString}; border-color:{rgbString};"></div> -->
   
<!-- </div> -->

<style>
  .color-picker {
    display: flex;
    flex-direction: column;
    /* gap: 10px; */
    /* margin-top: 10px; */
    border-radius: 5px;
    padding: 5px;
  }

  .sliders {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    /* margin: 5px; */
  }

  .slider {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  #palette, #saved-palette {
   margin: 5px 0;
   width: 100%;
   display: flex;
   flex-direction: row;
   gap: 3px;
   flex-wrap: wrap;
   /* border: 1px solid lightgray; */
   border-radius: 5px;
   padding: 5px;
   /* background-color: rgb(234, 234, 234); */
  }

  .color-item {
    /* border: 0.5px solid lightgray; */
    box-sizing: border-box;
    border-radius: 50%;
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    -webkit-mask-image: url('/assets/widgets/splotch-alpha-mask.png');
    mask-image: url('/assets/widgets/splotch-alpha-mask.png');
    -webkit-mask-size: cover;
    mask-size: cover;
    background-color: lightgray;
    color: black;
  }

  .color-item:hover {
    cursor: pointer;
    box-shadow: 0 0 5px 1px gray;
    background-color: var(--actual-color);
    color: var(--label-color);
    mask-image: none;
  }

  .color-item.selected {
    /* border: 3px solid rgb(95, 95, 95); */
    background-color: var(--actual-color);
    color: var(--label-color);
    box-shadow: 0 0 5px 1px gray;
    /* box-shadow: 0 0 5px 1px gray; */
    mask-image: none;
  }

  .color-item.selected:hover {
    /* background-color: lightgray; */
    /* color: black; */
    box-shadow: none;
  }

  /* .color-label {
    flex-align: baseline;
  } */

  .slider input[type='range'] {
    appearance: none;
    background: transparent;
    height: 20px;
    border-radius: 6px;
    background: var(--slider-gradient);
    outline: none;
    cursor: pointer;
  }

  .top-line {
    display: flex;
    flex-direction: row;
    margin: 0;
    align-items: center;
    justify-content: space-between; /* Adjusts children to each end */
  }

.mode-selector {
  padding: 2px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: 'FuturaHandwritten';
}

  .mode {
    cursor: pointer;
    padding: 2px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .mode.active {
    background-color: #f0f0f0;
  }

  .preview-slider {
    flex-grow: 1;
    margin-bottom: 0px;
  }

  .preview-slider input[type='range'] {
    height: 30px;
    width: 100%;
    background: transparent;
    background: var(--slider-gradient);
    outline: none;
    margin: 0;
  }

  .color-preview-fallback {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    margin-right: 16px;
    border: 1px solid;
    box-sizing: border-box;
  }

  .color-preview {
    width: 45px;
    height: 45px;
    /* transform: translateX(-5px);
    -webkit-transform: translateX(-5px); */
    -webkit-mask-image: url('/assets/widgets/splotch-alpha-mask.png');
    mask-image: url('/assets/widgets/splotch-alpha-mask.png');
    -webkit-mask-size: cover;
    mask-size: cover;
}

  input[type='number'] {
      margin: 0 5px;
      font-family: 'FuturaHandwritten';
      /* font-size: 14px; */
      border: 1px solid lightgray;
      border-radius: 4px;          /* rounds the corners slightly */
      outline: none;               /* removes the blue outline when focused */
      transition: border 0.3s;    /* smooth transition for border changes */
      padding: 0 5px;            /* adds some internal spacing */
  }

  /* Styles for Chrome, Safari, and Opera */
  .slider input[type='range']::-webkit-slider-runnable-track {
    appearance: none;
    -webkit-appearance: none;
    width: 0;
    height: 0;
    background: var(--slider-gradient);
  }

  .preview-slider input[type='range']::-webkit-slider-runnable-track {
    appearance: none;
    width: 0;
    height: 0;
    -webkit-appearance: none;
    background: var(--slider-gradient);
  }

  /* Styles for Firefox */
  .slider input[type='range']::-moz-range-track {
    appearance: none;
    background: var(--slider-gradient);
  }

  /* Styles for IE */
  .slider input[type='range']::-ms-track {
    width: 0;
    height: 0;
    background: var(--slider-gradient);
  }

  /* Thumb styles */
  .slider input[type='range']::-webkit-slider-thumb {
    appearance: none;
    background: #ffffff;
    border: 1px solid #ccc;
    border-radius: 50%;
    transform: translateY(-2px);
  }

    /* Thumb styles */
  .preview-slider input[type='range']::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 34px;
    background: #ffffff;
    border: 1px solid #ccc;
    border-radius: 6px;
    transform: translateY(-12px);
  }

  /***** Focus Styles *****/
  /* Removes default focus */
  input[type="range"]:focus {
    outline: none;
  }

  /***** Chrome, Safari, Opera, and Edge Chromium *****/
  input[type="range"]:focus::-webkit-slider-thumb {
    border: 1px solid #ccc;
    outline: 3px solid rgb(255, 255, 255);
    outline-offset: 0.125rem;
  }

  /******** Firefox ********/
  input[type="range"]:focus::-moz-range-thumb {
    border: 1px solid #ccc;
    outline: 3px solid #ffffff;
    outline-offset: 0.125rem;     
  }

</style>
