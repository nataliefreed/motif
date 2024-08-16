<script lang="ts">
  import { palettes, resetPaletteByName, activePaletteName, showSavedColors, randomizeColorSetting } from '../../stores/colorStore';
  import ColorBankWidget from './ColorBankWidget.svelte';
  import ColorWidget from '../actions and widgets/ColorWidget.svelte';
  import { writable } from 'svelte/store';
  import { createEventDispatcher } from "svelte";
  import { setCurrentColor, addPalette, updateColorInPalette } from '../../stores/colorStore';
  import { shouldRandomizeColor } from '../../stores/dataStore';
  import ActionItem from '../actions and widgets/ActionItem.svelte';
    import { saveToHistory } from '../../stores/history';

  let activeColor: string;
  let activeIndex: number;

  function selectPalette(selectedName: string) {
    if(selectedName && selectedName.length > 0) {
      activePaletteName.set(selectedName);
    }
  }

  function resetCurrentPalette() {
    saveToHistory("reset palette");
    resetPaletteByName($activePaletteName);
    saveToHistory("reset palette");
  }

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

  function loadPalette(event: Event) {
    //open a file
    // if it is a palette file, load it
    //open an image file, get top 12 colors, save back to store
    // let newPalette = 
    
    // loadPalette('paint', newPalette);
  }

  function saveColor(event: CustomEvent) {
    const { id, color } = event.detail;
    updateColorInPalette(id, color);
  }

  // <div class="button-container">
  //     <button class="palette-button" id="resetButton" title="reset" on:click={resetCurrentPalette}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M170.5 51.6L151.5 80l145 0-19-28.4c-1.5-2.2-4-3.6-6.7-3.6l-93.7 0c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80 368 80l48 0 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-8 0 0 304c0 44.2-35.8 80-80 80l-224 0c-44.2 0-80-35.8-80-80l0-304-8 0c-13.3 0-24-10.7-24-24S10.7 80 24 80l8 0 48 0 13.8 0 36.7-55.1C140.9 9.4 158.4 0 177.1 0l93.7 0c18.7 0 36.2 9.4 46.6 24.9zM80 128l0 304c0 17.7 14.3 32 32 32l224 0c17.7 0 32-14.3 32-32l0-304L80 128zm80 64l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16z"/></svg></button>
  //     <!-- <button class="palette-button" id="loadButton" title="load palette" on:click={loadPalette}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.<path d="M288 109.3L288 352c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-242.7-73.4 73.4c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l128-128c12.5-12.5 32.8-12.5 45.3 0l128 128c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L288 109.3zM64 352l128 0c0 35.3 28.7 64 64 64s64-28.7 64-64l128 0c35.3 0 64 28.7 64 64l0 32c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64l0-32c0-35.3 28.7-64 64-64zM432 456a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"/></svg></button> -->
  //   </div>

</script>
<div class="outer-container">
<!-- <details on:toggle={handleToggle}>
  <summary id="saved-colors-toggle"></summary> -->
  <div class="color-bank-container">

    <div class="color-palette">
      {#each $palettes[$activePaletteName].slice(0, 12) as color, index}
      <!-- <ColorWidget id="color" value={color} lockedIndex={index} on:click={handleClick.bind(null, color)}/> -->
        <ColorBankWidget bind:color={color} id={index} on:clickColor={setGlobalColor} on:valueChange={saveColor}/>
      {/each}
    </div>


<!-- 
    <div class="chooser-container">
      Randomize color while drawing?
      <select value={$randomizeColorSetting} class="color-settings">
        <option value="yes">yes</option>
        <option value="no">no</option>
        <option value="from-saved">from saved</option>
      </select>
    </div> -->

    
    <!-- palette chooser dropdown -->
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
