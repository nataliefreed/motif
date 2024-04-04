<script lang="ts">
  import { onMount } from 'svelte';
  import tinycolor from 'tinycolor2';
  import { selectedCodeEffect } from '../../stores/dataStore';
  import { createEventDispatcher } from 'svelte';
  import ColorPicker from './ColorPicker.svelte';
  import Tooltip from '../Tooltip.svelte';

  export let id = '';
  export let value = '#FFFFFF';
  let savedValue = value;

  const dispatch = createEventDispatcher();

  let colorButton: HTMLElement;

  onMount(() => {
    colorButton.style.background = tinycolor(value).toHexString();
  });

  let previewEnd = false;

  let filterStyle = '';

  function updateColorButton(hexColor: string) {
    const color = tinycolor(hexColor);
    const hue = color.toHsv().h;
    filterStyle = `hue-rotate(${hue}deg)`;
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
    clearInterval(oscillateID);
    previewEnd = true;
  }

  function handleColorChange(event: CustomEvent) {
    value = event.detail.value;
    updateColorButton(value);
  }

  let oscillateID;
  function handleMouseOver(event: Event) {
    savedValue = value;
    // let newValue = tinycolor(value);
    // newValue.spin(10);
    // if(newValue.isDark()) newValue.brighten(20);
    // else newValue.darken(20);
    previewEnd = false;
    // updateColorButton(newValue.toRgbString());
    // oscillate value
    oscillateID = setInterval(() => {
      updateColorButton(tinycolor(value).spin(1).toHexString());
    }, 20);
  }
  function handleMouseOut(event: Event) {
    //console.log("returning to saved value!");
    clearInterval(oscillateID);
    if(!previewEnd) {
      updateColorButton(savedValue);
      previewEnd = true;
    }
  }

</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<span
  bind:this={colorButton}
  on:click={handleClick}
  on:mouseover={handleMouseOver}
  on:mouseout={handleMouseOut}
  id={id}
  class="color-palette-widget"
>
  <img src="/assets/widgets/splotch.png" alt="Color splotch" class="splotch-image" />
  <div class="color-overlay" style="background-color: {value};"></div>
</span>

{#if colorButton}
  <Tooltip element={colorButton}>
    <div class="color-picker">
      <ColorPicker {value} on:valueChange={handleColorChange} />
   </div>
  </Tooltip>
{/if}


<style>

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

.color-picker {
  padding: 10px;
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