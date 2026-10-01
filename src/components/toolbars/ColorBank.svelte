<script lang="ts">
  import { palettes, activePaletteName, showSavedColors, randomizeColorSetting } from '../../stores/colorStore';
  import ColorBankWidget from './ColorBankWidget.svelte';
  import PaletteMenu from './PaletteMenu.svelte';
  import ColorWidget from '../actions and widgets/ColorWidget.svelte';
  import { writable } from 'svelte/store';
  import { createEventDispatcher } from "svelte";
  import { setCurrentColor, updateColorInPalette } from '../../stores/colorStore';
  import { shouldRandomizeColor } from '../../stores/dataStore';
  import ActionItem from '../actions and widgets/ActionItem.svelte';
  import { help } from '../help';
  import { t } from '../../i18n';

  let activeColor: string;
  let activeIndex: number;

  function handleToggle(event: Event) {
    const detailsElement = event.currentTarget as HTMLDetailsElement;
    showSavedColors.set(detailsElement.open);

  }

  function setGlobalColor(event: CustomEvent) {
    const { id, color } = event.detail;
    activeColor = color;
    // console.log("color clicked", color, id);
    setCurrentColor(color, id);
    shouldRandomizeColor.set(false);
  }

  function saveColor(event: CustomEvent) {
    const { id, color } = event.detail;
    updateColorInPalette(id, color);
  }


</script>
<div class="outer-container">
<!-- <details on:toggle={handleToggle}>
  <summary id="saved-colors-toggle"></summary> -->
  <div class="color-bank-container">


    <div class="color-palette" use:help={{ text: $t.help.palette, placement: 'left' }}>
      {#each $palettes[$activePaletteName].slice(0, 12) as color, index}
      <!-- <ColorWidget id="color" value={color} lockedIndex={index} on:click={handleClick.bind(null, color)}/> -->
        <ColorBankWidget bind:color={color} id={index} on:clickColor={setGlobalColor} on:valueChange={saveColor}/>
      {/each}
    </div>

    <PaletteMenu />


<!-- 
    <div class="chooser-container">
      Randomize color while drawing?
      <select value={$randomizeColorSetting} class="color-settings">
        <option value="yes">yes</option>
        <option value="no">no</option>
        <option value="from-saved">from saved</option>
      </select>
    </div> -->

    
    
</div>
<!-- </details> -->
</div>

<style>

  #saved-colors-toggle {
    cursor: pointer;
    color: rgb(40, 40, 40);
    margin: 10px;
    font-family: "Fandango";
  }

  .button-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    padding: 0;
    gap: 10px;
  }

  .palette-button {
    margin: 10px 0;
    padding: 0;
    background-color: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    border-radius: 5px;
    transition: background-color 0.2s ease;
    width: 100%;
  }

  .palette-button:hover {
    /* background-color: #f0f0f0; */
  }

  .palette-button:active {
    transform: translateY(2px);
  }

  .palette-button svg {
    width: 15px;
    height: 15px;
    margin: 0;
    fill: #000;
    transition: fill 0.2s ease;
  }

  .palette-button:hover svg {
    fill: #ffffff;
  }

  .outer-container {
    /* border: 1px solid white;
    box-shadow: 0px 0px 10px #ccc; */
    width: 100%;
    box-sizing: border-box;
    border-radius: 0 0 10px 10px;
  }

  .color-bank-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .chooser-container {
    display: flex;
    flex-direction: column;
    align-items: right;
    justify-content: center;
    font-size: 0.7vw;
    line-height: 1.5em;
    width: 6vw;
  }

  .color-palette {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    /* flex-grow: 1; */
    justify-content: flex-start;
    align-items: center;
    /* width: calc(min(3vh, 3vw)*10); */
  }

  .selected {
    border: 2px solid yellow;
  }

  .instabutton {
    padding: 0.5vh 0.5vw;
    font-size: 0.7vw;
    font-family: 'FuturaHandwritten';
    cursor: pointer;
    border: none;
    border-radius: 5px;
    color: black;
  }

  .instabutton:hover {
    background-color: #e6e6e6;
  }

  select {
    /* font-size: 1.2rem;
    padding: 0.2rem; */
    border-radius: 0.2rem;
    border: 2px solid #ccc;
    font-family: 'FuturaHandwritten';
    font-size: 0.7vw;
    padding: 0.2em;
  }

</style>
