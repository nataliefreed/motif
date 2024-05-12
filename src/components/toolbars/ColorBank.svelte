<script lang="ts">
  import { palettes, resetPaletteByName, activePaletteName, showSavedColors, randomizeColorSetting } from '../../stores/colorStore';
  import ColorBankWidget from './ColorBankWidget.svelte';
  import { writable } from 'svelte/store';
  import { createEventDispatcher } from "svelte";

  let activeColor: string;

  function selectPalette(selectedName: string) {
    if(selectedName && selectedName.length > 0) {
      activePaletteName.set(selectedName);
    }
  }

  function handleClick(color: string) {
    activeColor = color;
    // Dispatch an event for parent components
    // dispatch('colorChange', { detail: color });
  }

  function resetCurrentPalette() {
    resetPaletteByName($activePaletteName);
  }

  function handleToggle(event: Event) {
    const detailsElement = event.currentTarget as HTMLDetailsElement;
    showSavedColors.set(detailsElement.open);

  }

  function loadNewPalette(event: Event) {
    //open an image file, get top 16 colors, save back to store
  }

</script>
<div class="outer-container">
<details on:toggle={handleToggle}>
  <summary id="saved-colors-toggle">saved colors</summary>
  <div class="color-bank-container">

    <div class="color-palette">
      {#each $palettes[$activePaletteName] as color, index}
        <ColorBankWidget bind:color={color} label={index + 1} on:click={handleClick.bind(null, color)}/>
      {/each}
    </div>

    <!-- <div class="button-container">
      <button class="instabutton" id="saveButton" on:click={resetCurrentPalette}>save</button>
      <button class="instabutton" id="loadButton" on:click={loadNewPalette}>load</button>
    </div> -->
<!-- 
    <div class="chooser-container">
      Randomize color while drawing?
      <select value={$randomizeColorSetting} class="color-settings">
        <option value="yes">yes</option>
        <option value="no">no</option>
        <option value="from-saved">from saved</option>
      </select>
    </div> -->

    

    <!-- <div class="chooser-container">
      Color palette:
      <select bind:value={$activePaletteName} on:change="{e => selectPalette(e.target.value) }">
        {#each Object.keys($palettes) as name}
        <option value={name}>{name}</option>
        {/each}
      </select>
    </div> -->
    <!-- <button class="instabutton" id="resetButton" on:click={resetCurrentPalette}>reset</button> -->
    <!-- <button class="instabutton" id="loadButton" on:click={loadNewPalette}>load</button>
    </div> -->
    
</div>
</details>
</div>

<style>

  #saved-colors-toggle {
    cursor: pointer;
    color: rgb(40, 40, 40);
    margin: 0 0.5vw;
  }

  .button-container {
    display: flex;
    flex-direction: column;
    gap: 0.5vw;
  }

  .outer-container {
    border: 1px solid white;
    box-shadow: 0px 0px 10px #ccc;
    width: 100%;
    box-sizing: border-box;
    border-radius: 0 0 10px 10px;
  }

  .color-bank-container {
    display: flex;
    flex-direction: row;
    gap: 1vw;
    padding: 0 0.5vw 0.5vw 0.5vw;
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
    gap: 0.1vw;
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

  #resetButton {
    margin-right: 1vw;
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
