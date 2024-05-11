<script lang="ts">
  import { onMount } from 'svelte';
  import tinycolor from 'tinycolor2';
  import { createEventDispatcher } from 'svelte';
  import SimpleColorPicker from '../actions and widgets/SimpleColorPicker.svelte';
  import Tooltip from '../Tooltip.svelte';
  import { getReadableColor } from '../../utils/color-utils';

  export let color = '#FFFFFF';
  export let label: number;

  const dispatch = createEventDispatcher();

  let colorButton: HTMLElement;

  $: textColor = getReadableColor(color);

  onMount(() => {
    // colorButton.style.background = tinycolor(value).toHexString();
  });

  let filterStyle = '';

  //todo: somehow this is changing the store value

  function updateColorButton(hexColor: string) {
    const color = tinycolor(hexColor);
    const hue = color.toHsv().h;
    filterStyle = `hue-rotate(${hue}deg)`;
    // dispatch('valueChange', { id, value: hexColor });
  }

  function handleClick(event: Event) {
    // updateColorButton(savedValue);
  }

  function handleColorChange(event: CustomEvent) {
    color = event.detail.value;
    updateColorButton(color);
  }

</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<span
  bind:this={colorButton}
  on:click={handleClick}
  class="color-palette-widget"
  style="background-color: {color}; color: {textColor};">
  <span class="color-item-label">{label}</span>
</span>

{#if colorButton}
  <Tooltip element={colorButton} let:showContent>
    {#if showContent}
      <SimpleColorPicker bind:value={color} on:valueChange={handleColorChange} />
    {/if}
  </Tooltip>
{/if}


<style>

.color-palette-widget {
  padding: 0.2vh;
  display: inline-block;
  vertical-align: middle;
  -webkit-mask-image: url('/assets/widgets/splotch-alpha-mask.png');
  mask-image: url('/assets/widgets/splotch-alpha-mask.png');
  -webkit-mask-size: cover;
  mask-size: cover;
  display: flex;
  align-items: center; 
  justify-content: center;
  border-radius: 50%;
  border: 0.5px solid lightgray;
  width: calc(min(3vh, 3vw));
  height: calc(min(3vh, 3vw));
}

.color-palette-widget:hover {
  cursor: pointer;
  box-shadow: 0 0 5px 0 rgba(0,0,0,0.1);
  transform: scale(1.2) translateY(-0.1em);
}

.color-picker {
  padding: 10px;
}

.color-item-label {
  font-family: 'FuturaHandwritten';
}

</style>