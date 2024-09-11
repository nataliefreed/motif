<script lang="ts">
  import { onMount } from 'svelte';
  import tinycolor from 'tinycolor2';
  import { createEventDispatcher } from 'svelte';
  import ColorPicker from './ColorPicker.svelte';
  import Tooltip from '../Tooltip.svelte';
  import { getReadableColor } from '../../utils/color-utils';
  import { activePalette } from '../../stores/colorStore';
  import SavedColorLabel from './SavedColorLabel.svelte';

  export let id = '';
  export let value = '#FFFFFF';
  export let lockedIndex = -1;

  export let size = 1.7;

  const dispatch = createEventDispatcher();

  let colorButton: HTMLElement;

  onMount(() => {
    // colorButton.style.background = tinycolor(value).toHexString();
    // console.log("locked index at mount", lockedIndex);
  });

  // let filterStyle = '';

  function updateColorButton(hexColor: string) {
    const color = tinycolor(hexColor);
    // const hue = color.toHsv().h;
    // filterStyle = `hue-rotate(${hue}deg)`;
    dispatch('valueChange', { id, value: hexColor });
  }

  function randomize() {
    var randomColor = tinycolor.random();
    value = randomColor.toHexString();
    updateColorButton(value);
    previewEnd = true;
  }

  let previewEnd = false;
  let savedValue = value;
  
  function handleMouseEnter() {
    savedValue = value;
    let newValue = tinycolor(value).lighten(20).toHexString();
    previewEnd = false;
    dispatch('valueChange', { id, value: newValue });
  }

  function endPreview() {
    if(!previewEnd) {
      dispatch('valueChange', { id, value: savedValue });
      previewEnd = true;
    }
  }

  function handleColorChange(event: CustomEvent) {
    value = event.detail.value;
    updateColorButton(value);
  }

  function handleLockChange(event: CustomEvent) {
    lockedIndex = event.detail.lockedIndex;
    // console.log("locked index", lockedIndex);
    if(id==="color2") { //workaround, right now only gradient has 2 colors
      dispatch('valueChange', { id:"lockedIndex2", value: lockedIndex });
    } else {
      dispatch('valueChange', { id:"lockedIndex", value: lockedIndex });
    }
  }

  // this is currently what updates the colors when a palette color is changed
  // it relies on nested list items being hidden, not unmounted (see ControlStructure)
  $: if(lockedIndex > -1) {
    value = $activePalette[lockedIndex];
    updateColorButton(value);
  }

</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<span
  bind:this={colorButton}
  id={id}
  class="color-palette-widget {lockedIndex > -1 ? 'locked' : ''}"
  on:mouseenter={handleMouseEnter}
  on:mouseleave={endPreview}
  on:click={endPreview}
  style="background-color: {value}; color: {getReadableColor(value)}; width:{size}em; height:{size}em;"
>
  {#if lockedIndex > -1}<span class="color-label"><SavedColorLabel id={lockedIndex} color={value} /></span> {/if}
</span>

{#if colorButton}
  <Tooltip element={colorButton} let:showContent>
    {#if showContent}
      <div class="color-picker">
       <ColorPicker bind:value={value} bind:selectedColorIndex={lockedIndex} on:valueChange={handleColorChange} on:lockChange={handleLockChange} />
    </div>
   {/if}
  </Tooltip>
{/if}


<style>

.color-palette-widget {
    position: relative;
    width: 1.7em;
    height: 1.7em;
    padding: 0;
    /* border: 2px solid rgba(0,0,0,0.1); */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
    transform: translateY(-0.1em);
    -webkit-transform: translateY(-0.1em);
    -webkit-mask-image: url('/assets/widgets/splotch-alpha-mask.png');
    mask-image: url('/assets/widgets/splotch-alpha-mask.png');
    -webkit-mask-size: cover;
    mask-size: cover;
}

.locked {
  /* mask-image: none; */
  border-radius: 50%;
}

.color-label {
  transform: translate(-0.05em, -0.05em);
  -webkit-transform: translate(-0.05em, -0.05em);
}

.color-palette-widget:hover {
  cursor: pointer;
  box-shadow: 0 0 5px 0 rgba(0,0,0,0.1);
  transform: scale(1.2) translateY(-0.1em);
}

.color-picker {
  padding: 10px;
}
</style>