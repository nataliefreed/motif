<script lang="ts">
  import { onMount } from 'svelte';
  import tinycolor from 'tinycolor2';
  import { createEventDispatcher } from 'svelte';
  import SimpleColorPicker from '../actions and widgets/SimpleColorPicker.svelte';
  import ColorPicker from '../actions and widgets/ColorPicker.svelte';
  import Tooltip from '../Tooltip.svelte';
  import SavedColorLabel from '../actions and widgets/SavedColorLabel.svelte';
  import { currentIndexedColor } from '../../stores/colorStore';

  export let color = '#FFFFFF';
  export let id: number;

  const dispatch = createEventDispatcher();

  let colorButton: HTMLElement;

  onMount(() => {
    // colorButton.style.background = tinycolor(value).toHexString();
  });

  let filterStyle = '';

  // notify the color bank!
  function updateColorButton(color: string) {
    dispatch('valueChange', { id, color });
  }

  function handleColorClick() {
    dispatch('clickColor', { id, color });
  }

  function handleColorChange(event: CustomEvent) {
    // console.log("palette color just changed in color picker in color bank widget");
    color = event.detail.value;
    updateColorButton(color);
  }

</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<span
  bind:this={colorButton}
  on:click={handleColorClick}
  class="color-palette-widget"
  class:active={$currentIndexedColor.index === id}
  style="background-color: {color};">
  <SavedColorLabel {id} {color} />
</span>

{#if colorButton}
  <!-- one click both draws with this color and opens it to edit -->
  <Tooltip element={colorButton} let:showContent>
    {#if showContent}
      <!-- <SimpleColorPicker value={color} on:valueChange={handleColorChange} /> -->
      <ColorPicker value={color} paletteLetter={id} showSavedColors={false} on:valueChange={handleColorChange} />
    {/if}
  </Tooltip>
{/if}


<style>

.color-palette-widget {
  display: inline-block;
  vertical-align: middle;
  -webkit-mask-image: url('/assets/widgets/splotch-alpha-mask.png');
  mask-image: url('/assets/widgets/splotch-alpha-mask.png');
  -webkit-mask-size: cover;
  mask-size: cover;
  display: flex;
  align-items: center; 
  justify-content: center;
  margin: auto;
  border-radius: 50%;
  border: 0.5px solid lightgray;
  width: 20px;
  /* height: 20px; */
}

.color-palette-widget:hover {
  cursor: pointer;
  box-shadow: 0 0 5px 0 rgba(0,0,0,0.1);
  transform: scale(1.2) translateY(-0.1em);
}

/* the color the brush is drawing with: a circle with a glow, like the selected color in the color pickers
   (after :hover, so the glow stays while hovering) */
.color-palette-widget.active {
  -webkit-mask-image: none;
  mask-image: none;
  width: 22px;
  height: 22px;
  box-shadow: 0 0 5px 1px gray;
}

.color-picker {
  padding: 10px;
}

</style>