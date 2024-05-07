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

  export let size = 1.7;

  const dispatch = createEventDispatcher();

  let colorButton: HTMLElement;

  onMount(() => {
    // colorButton.style.background = tinycolor(value).toHexString();
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
      updateColorButton(tinycolor(value).spin(2).toHexString());
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

  // on:mouseover={handleMouseOver}
  // on:mouseout={handleMouseOut}

</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<span
  bind:this={colorButton}
  on:click={handleClick}
  id={id}
  class="color-palette-widget"
  style="background-color: {value}; width:{size}em; height:{size}em;"
>
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
    height: 1.7em;
    padding: 0;
    /* border: 2px solid rgba(0,0,0,0.1); */
    display: inline-block;
    vertical-align: middle;
    transform: translateY(-0.1em);
    -webkit-transform: translateY(-0.1em);
    -webkit-mask-image: url('/assets/widgets/splotch-alpha-mask.png');
    mask-image: url('/assets/widgets/splotch-alpha-mask.png');
    -webkit-mask-size: cover;
    mask-size: cover;
}

.color-palette-widget:hover {
  cursor: pointer;
  box-shadow: 0 0 5px 0 rgba(0,0,0,0.1);
  transform: scale(1.2) translateY(-0.1em);
}

.color-picker {
  padding: 10px;
}

/* .color-overlay {
  position: relative;
  top: 2px;
  left: 0;
  right: 0;
  bottom: 2px;
  -webkit-mask-image: url('/assets/widgets/splotch-alpha-mask.png');
  mask-image: url('/assets/widgets/splotch-alpha-mask.png');
  -webkit-mask-size: cover;
  mask-size: cover;
} */

/* .splotch-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.color-overlay {
  position: relative;
  top: 2px;
  left: 0;
  right: 0;
  bottom: 2px;
} */
</style>