<script lang="ts">
  import { onMount, createEventDispatcher, tick } from 'svelte';
  import tinycolor from 'tinycolor2';
  import ColorPalette from '../toolbars/ColorPalette.svelte';
  import { activePalette, pickerPalette }  from '../../stores/colorStore';
  import { getReadableColor } from '../../utils/color-utils';
  import PaintColorMixer from './PaintColorMixer.svelte';
  import SavedColorLabel from './SavedColorLabel.svelte';

  const dispatch = createEventDispatcher();

  export let value: string; //initial value

  export let selectedColorIndex = -1;

  export let showSavedColors = true;

  let modes = ["paint", "RGB", "HSL"];
  let activeMode = "HSL";

  // initial color values
  let red = tinycolor(value).toRgb().r;
  let green = tinycolor(value).toRgb().g;
  let blue = tinycolor(value).toRgb().b;
  let alpha = tinycolor(value).toRgb().a;

  let hue = tinycolor(value).toHsv().h;
  let saturationPercentage = tinycolor(value).toHsv().s*100;
  let lightnessPercentage = tinycolor(value).toHsl().l*100;

  // update when values bound to sliders change
  // $: rgbcolor = tinycolor({ r: red, g: green, b: blue, a: alpha });
  // $: hsvcolor = tinycolor({ h: hue, s: saturationPercentage/100, v: lightnessPercentage/100, a: alpha });
  // $: value = rgbaString;

  // $: rgbaString = color.toRgbString();
  // $: rgbString = tinycolor(rgbaString).setAlpha(1).toRgbString();

  // RGB Gradients
  $: gradientRed = `linear-gradient(to right, rgba(0, ${green}, ${blue}, 1), rgba(255, ${green}, ${blue}, 1))`;
  $: gradientGreen = `linear-gradient(to right, rgba(${red}, 0, ${blue}, 1), rgba(${red}, 255, ${blue}, 1))`;
  $: gradientBlue = `linear-gradient(to right, rgba(${red}, ${green}, 0, 1), rgba(${red}, ${green}, 255, 1))`;

  $: gradientAlpha = `linear-gradient(to right, rgba(${red}, ${green}, ${blue}, 0), rgba(${red}, ${green}, ${blue}, 1))`;

  // HSB Gradients
  $: gradientHue = 'linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)';
  $: gradientSaturation = `linear-gradient(to right, hsl(${hue}, 0%, ${Math.round(lightnessPercentage)}%), hsl(${hue}, 100%, ${Math.round(lightnessPercentage)}%))`;
  $: gradientLightness = `linear-gradient(to right, hsl(${hue}, ${Math.round(saturationPercentage)}%, 0%), hsl(${hue}, ${Math.round(saturationPercentage)}%, 50%), hsl(${hue}, ${Math.round(saturationPercentage)}%, 100%))`;

  // $: console.log(`Hue: ${hue}, Saturation: ${saturationPercentage}%, Lightness: ${lightnessPercentage}%`);

  $: alphaPercentage = Math.round(alpha * 100);

  // $: saturationPercentage = Math.round(saturation * 100);
  // $: lightnessPercentage = Math.round(lightness * 100);

  function updateAlphaFromPercentage(event: Event) {
    if(!event || !event.target) return;
    let target = event.target as HTMLInputElement;
    alpha = +target.value / 100;
    if(activeMode == 'RGB') {
      dispatchRGB();
    } else {
      dispatchHSL();
    }
  }

  // update sliders when new color comes in
  function updateColorComponents(newColor: tinycolor.Instance) {
    // console.log("incoming string color", newColor);
    updateRGBComponents(newColor);
    if(activeMode === 'HSL') {
      updateHSLComponents(newColor);
    }
    // console.log("updating sliders with incoming value", hue, saturationPercentage, lightnessPercentage);
  }

  function updateRGBComponents(newColor: tinycolor.Instanc) {
      const rgb = tinycolor(newColor).toRgb();
      red = rgb.r;
      green = rgb.g;
      blue = rgb.b;
      alpha = rgb.a;
  }

  function updateHSLComponents(newColor: tinycolor.Instanc) {
      const hsl = tinycolor(newColor).toHsl();
      hue = Math.round(hsl.h);
      saturationPercentage = Math.round(hsl.s * 100);
      lightnessPercentage = Math.round(hsl.l * 100);
      alpha = hsl.a;
  }

  // dispatch color change
  function dispatchRGB() {
    unlockColor();
    let newColor = tinycolor({ r: red, g: green, b: blue, a: alpha });
    unlockAndDispatch(newColor);
  }

  // all this wackiness because tinycolor sets hue and saturation to 0 if lightness is 0, etc. - need a different way of parsing colors back out
  function dispatchHue() {
    // if(lightnessPercentage < 1) {
    //   lightnessPercentage = 1;
    // }
    // else if(lightnessPercentage > 99) {
    //   lightnessPercentage = 99;
    // }
    // if(saturationPercentage < 1) {
    //   saturationPercentage = 1;
    // }
    dispatchHSL();
  }

  function dispatchSaturation() {
    // if(lightnessPercentage < 1) {
    //   lightnessPercentage = 1;
    // }
    // else if(lightnessPercentage > 99) {
    //   lightnessPercentage = 99;
    // }
    dispatchHSL();
  }

  function dispatchLightness() {
    dispatchHSL();
  }

  function dispatchHSL() {

    let newColor = tinycolor({ h: +hue, s: +saturationPercentage/100.0, l: +lightnessPercentage/100.0, a: alpha });
    // console.log("sending out new color", hue, saturationPercentage, lightnessPercentage);
    // unlockAndDispatch(`hsla(${hue}, ${saturationPercentage}%, ${lightnessPercentage}%, ${alpha})`);
    unlockAndDispatch(tinycolor(newColor));
  }

  function dispatchPaint(event: CustomEvent) {
    value = event.detail.color;
    unlockAndDispatch(tinycolor(value));
  }

  function unlockAndDispatch(color: tinycolor.Instance) {
    let newColor = tinycolor(color).toString();
    unlockColor();
    dispatch('valueChange', { value: newColor });
  }

  function unlockColor() {
    selectedColorIndex = -1;
    dispatch('lockChange', { lockedIndex: selectedColorIndex });
  }

  onMount(() => {
    updateColorComponents(tinycolor(value));
  });

  function handleModeChange() {
    updateColorComponents(tinycolor(value));
  }

  // clicked a color in the palette
  function handleColorClick(event: Event) {
    let target = event.target as HTMLElement;
    let newColor = target.style.backgroundColor;
    unlockAndDispatch(tinycolor(newColor));
    updateColorComponents(tinycolor(newColor));
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

  function setMode(mode: string) {
    activeMode = mode;
  }

</script>

<div class="top-line">
  <div>
    color mixer:
    <select bind:value={activeMode} class="mode-selector"
      on:change={handleModeChange}>
      {#each modes as mode}
        <option value={mode}>{mode}</option>
      {/each}
    </select>
  </div>

  <div class="color-preview" style="background-color:{value}"></div>
</div>

<!-- switch based on mode -->
<div class="color-picker">
  {#if activeMode === 'RGB'}
  <div class="sliders">
    <div class="slider">
      <label class="color-label" for="red" style="color:red">Red</label>
      <input class="color-label" type="number" min="0" max="255" bind:value={red} on:input={dispatchRGB} style="color:red">
      <input class="color-label" type="range" id="red" min="0" max="255" bind:value={red} on:input={dispatchRGB} style="--slider-gradient: {gradientRed};">
    </div>
    <div class="slider">
      <label for="green" style="color:green">Green</label>
      <input type="number" min="0" max="255" bind:value={green} on:input={dispatchRGB} style="color:green">
      <input type="range" id="green" min="0" max="255" bind:value={green} on:input={dispatchRGB} style="--slider-gradient: {gradientGreen};">
      
    </div>
    <div class="slider">
      <label for="blue" style="color:blue">Blue</label>
      <input type="number" min="0" max="255" bind:value={blue} on:input={dispatchRGB} style="color:blue">
      <input type="range" id="blue" min="0" max="255" bind:value={blue} on:input={dispatchRGB} style="--slider-gradient: {gradientBlue};">
    </div>

    
  <div class="slider">
      <label for="opacity" style="color:black">Opacity</label>
      <input type="number" min="0" max="100" step="1" bind:value={alphaPercentage} on:input={updateAlphaFromPercentage}>%
      <input type="range" id="opacity" min="0" max="100" step="1" bind:value={alphaPercentage} on:input={updateAlphaFromPercentage} style="--slider-gradient: {gradientAlpha};">
    </div>
  </div>

    {:else if activeMode === 'HSL'}
      <div class="sliders">
        <div class="slider">
          <!-- <label class="color-label" for="hue" style="color:hsl({hue}, 100%, 50%)">Hue</label> -->
          <input class="color-label" type="number" min="0" max="360" step="1" bind:value={hue} on:input={dispatchHSL} style="color:hsl(${hue}, 100%, 50%)">
          <input type="range" id="hue" min="0" max="360" step="1" bind:value={hue} on:input={dispatchHue} style="--slider-gradient: {gradientHue};">
        </div>
        <div class="slider">
          <!-- <label for="saturation" style="color:hsl({hue}, 50%, 50%)">Saturation</label> -->
          <input type="number" min="0" max="100" step="1" bind:value={saturationPercentage} on:input={dispatchHSL} style="color:hsl(${hue}, 50%, 50%)">
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <span class="color-blob left" on:click={() => { saturationPercentage = 0; }} style="background-color:gray"></span>
          <input type="range" id="saturation" min="0" max="100" step="1" bind:value={saturationPercentage} on:input={dispatchSaturation} style="--slider-gradient: {gradientSaturation};">
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <span class="color-blob right" on:click={() => { saturationPercentage = 100; }} style="background-color:hsl({Math.round(hue)}, 100%, {Math.round(lightnessPercentage)}%);"></span>
        </div>
        <div class="slider">
          <!-- <label for="lightness" style="color:hsl(${Math.round(hue)}, ${saturation*100}%, 50%)">Lightness</label> -->
          <input type="number" min="0" max="100" step="1" bind:value={lightnessPercentage} on:input={dispatchHSL} style="color:hsl(${hue}, ${Math.round(saturationPercentage)}%, 50%)">
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <span class="color-blob left" on:click={() => { lightnessPercentage = 0; }} style="background-color:black"></span>
          <input type="range" id="lightness" min="0" max="100" step="1" bind:value={lightnessPercentage} on:input={dispatchLightness} style="--slider-gradient: {gradientLightness};">
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <span class="color-blob right" on:click={() => { lightnessPercentage = 100; }} style="background-color:white; border: 1px solid lightgray; box-sizing: border-box;"></span>
        </div>


        <div class="slider">
          <label for="opacity" style="color:black">Opacity</label>
          <input type="number" min="0" max="100" step="1" bind:value={alphaPercentage} on:input={updateAlphaFromPercentage}>%
          <input type="range" id="opacity" min="0" max="100" step="1" bind:value={alphaPercentage} on:input={updateAlphaFromPercentage} style="--slider-gradient: {gradientAlpha};">
        </div>
      </div>
    
    {:else if activeMode === 'paint'}
      <PaintColorMixer initialColor={value} on:save={dispatchPaint}/>
    {/if}
  
  
    {#if activeMode !== 'paint'}
      <div id="palette">
        {#each pickerPalette as color, index}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div class="color-item"
          on:click={handleColorClick}
          style="background-color: {color}; border: {tinycolor(color).getLuminance() > 0.9 ? '3px solid lightgray' : 'none'};">
          </div>
        {/each}
      </div>
    
    <!-- {#if $showSavedColors || selectedColorIndex !== -1} -->
    {#if showSavedColors}
      <div id="saved-palette">
        {#each $activePalette as color, index}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div class="color-item saved-color {(selectedColorIndex === index) ? 'selected' : ''}"
          on:click={e => handleSavedPaletteClick(index)}
          style="--actual-color: {color}; border: {tinycolor(color).getLuminance() > 0.9 ? '3px solid lightgray' : 'none'};">
            <span class="color-label"><SavedColorLabel id={index} color={color} /></span>
          </div>
        {/each}
      </div>
    {/if}
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

  .color-blob {
    width: 18px;
    height: 18px;
  }

  .color-blob.left {
    border-radius: 5px 0 0 5px;
  }

  .color-blob.right {
    border-radius: 0 5px 5px 0;
  }

  #palette, #saved-palette {
   margin: 10px 0 0 0;
   width: 100%;
   display: flex;
   flex-direction: row;
   gap: 2px;
   flex-wrap: wrap;
   /* border: 1px solid lightgray; */
   border-radius: 5px;
   /* padding: 5px; */
   /* background-color: rgb(234, 234, 234); */
  }

  .color-item {
    /* border: 0.5px solid lightgray; */
    box-sizing: border-box;
    border-radius: 50%;
    width: 23px;
    height: 23px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    -webkit-mask-image: url('/assets/widgets/splotch-alpha-mask.png');
    mask-image: url('/assets/widgets/splotch-alpha-mask.png');
    -webkit-mask-size: cover;
    mask-size: cover;
    background-color: lightgray;
    background-color: var(--actual-color);
    color: black;
  }

  .saved-color {
    font-size: 1.3em;
    font-family: 'Fandango';
  }

  .color-item:hover {
    cursor: pointer;
    /* box-shadow: 0 0 5px 1px gray; */
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
    /* box-shadow: none; */
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

  #opacity {
    width: 100%;
  }

  #hue {
    width: 240px;
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
