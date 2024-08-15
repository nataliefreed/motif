<script lang="ts">
  import { palettes, resetPaletteByName, activePaletteName, showSavedColors, randomizeColorSetting } from '../../stores/colorStore';
  import ColorBankWidget from './ColorBankWidget.svelte';
  import ColorWidget from '../actions and widgets/ColorWidget.svelte';
  import { writable } from 'svelte/store';
  import { createEventDispatcher } from "svelte";
  import { setCurrentColor, addPalette, updateColorInPalette } from '../../stores/colorStore';
  import ActionItem from '../actions and widgets/ActionItem.svelte';

  let activeColor: string;
  let activeIndex: number;

  function selectPalette(selectedName: string) {
    if(selectedName && selectedName.length > 0) {
      activePaletteName.set(selectedName);
    }
  }

  function resetCurrentPalette() {
    resetPaletteByName($activePaletteName);
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

    <div class="button-container">
      <button class="palette-button" id="resetButton" on:click={resetCurrentPalette}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M512 256c0 .9 0 1.8 0 2.7c-.4 36.5-33.6 61.3-70.1 61.3L344 320c-26.5 0-48 21.5-48 48c0 3.4 .4 6.7 1 9.9c2.1 10.2 6.5 20 10.8 29.9c6.1 13.8 12.1 27.5 12.1 42c0 31.8-21.6 60.7-53.4 62c-3.5 .1-7 .2-10.6 .2C114.6 512 0 397.4 0 256S114.6 0 256 0S512 114.6 512 256zM128 288a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm0-96a32 32 0 1 0 0-64 32 32 0 1 0 0 64zM288 96a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm96 96a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"/></svg></button>
      <button class="palette-button" id="loadButton" on:click={loadPalette}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M288 109.3L288 352c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-242.7-73.4 73.4c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l128-128c12.5-12.5 32.8-12.5 45.3 0l128 128c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L288 109.3zM64 352l128 0c0 35.3 28.7 64 64 64s64-28.7 64-64l128 0c35.3 0 64 28.7 64 64l0 32c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64l0-32c0-35.3 28.7-64 64-64zM432 456a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"/></svg></button>
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
  }

  .palette-button {
    margin-top: 10px;
    background-color: transparent;
    border: none;
    cursor: pointer;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    transition: background-color 0.2s ease;
  }

  .palette-button:hover {
    /* background-color: #f0f0f0; */
  }

  .palette-button svg {
    width: 15px;
    height: 15px;
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
