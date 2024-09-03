<script lang="ts">
  import { onMount } from 'svelte';
  import { actionStore, toolStore, selectedEffect, activeCategory, stagedAction, stagedActionID, changedActionID, selectedActionID, selectedCodeEffect, actionRoot, flatActionStore, playSpeed, renderDelay, isPlaying, firstPlay, drawingLocked } from '../stores/dataStore';
  import { exportCodeWithImage, importCodeFromImage } from './export-utils';
  import LinedPaper from './LinedPaper.svelte';
  import ActionItem from './actions and widgets/ActionItem.svelte';
	import type { Action, Effect } from '../types/types';
  import Canvas from './canvas/Canvas.svelte';
  import Ruler from './canvas/Ruler.svelte';
  import ColorBank from './toolbars/ColorBank.svelte';
  import { scrollToAction, removeSelectedAction, repeatSelectedActionAlongPath, wrapSelectedInGroup, remixAction, duplicateAction, remixDuplicate, redrawSelectedAction, convertSelectedAction, clearAllActions, undo, redo, rewindToBeginning, fastForwardToEnd, stepBackward, stepForward, hideAction, showAction, selectAction, selectActionByIndex, deselect } from './action-utils';
  import Tooltip from './Tooltip.svelte';
  import CategoryToolbar from './toolbars/CategoryToolbar.svelte';
  import { setupKeyboardEvents, removeKeyboardEvents } from './KeyboardEvents';
  import EffectSettingsPanel from './toolbars/EffectSettingsPanel.svelte';
  import { historyStore, saveToHistory } from '../stores/history';
  import { curatedRandomHexColor } from '../utils/color-utils';
  import PlayButton from './PlayButton.svelte';
  import NumberWidget from './actions and widgets/NumberWidget.svelte';
  import { paintColors } from '../stores/colorStore';
  import ColorPicker from './actions and widgets/ColorPicker.svelte';
  import { scale, fade } from 'svelte/transition';
  import DebugPaintStore from './DebugPaintStore.svelte';

  let allCategories:string[] = [];
  let value = '#FFFFFF';
  let showCode = false;

  let drawingAreaWidth = 520;

  $: if ($selectedActionID) {
    scrollToAction($selectedActionID);
  }

  $: if($drawingLocked) {
    showCode = true;
  }

  // $: if($drawingLocked) {
    // hideAction($stagedActionID);
  // } else {
    // showAction($stagedActionID);
  // }

  $: canUndo = $historyStore.past.length > 0;
  $: canRedo = $historyStore.future.length > 0;

  const lockIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="1.5em" height="1.5em"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="rgb(227, 227, 227)" d="M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z"/></svg>`;
  const unlockIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="1.5em" height="1.5em"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="rgb(227, 227, 227)"d="M144 144c0-44.2 35.8-80 80-80c31.9 0 59.4 18.6 72.3 45.7c7.6 16 26.7 22.8 42.6 15.2s22.8-26.7 15.2-42.6C331 33.7 281.5 0 224 0C144.5 0 80 64.5 80 144v48H64c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V256c0-35.3-28.7-64-64-64H144V144z"/></svg>`;

  function saveTool(id:string) {
    // saveActionAsNewTool($flatActionStore[id]);
    // if($selectedActionID && $actionStore.children) {
    //   saveActionAsNewTool($actionStore.children.find(action => action.uuid === $selectedActionID));
    // }
  }

  function handleColorClick(color: string) {
    //set staged action color

  }

  function handleClickOutside(event: MouseEvent) {
    // console.log("clicked outside", event.target);

    let target = event.target as Element;

    // console.log("hit target", target.nodeName);

    // if(target.nodeName !== 'BUTTON'
    //   && target.nodeName !== 'INPUT'
    //   && target.nodeName !== 'CANVAS') {
    //     saveToHistory("outside click");
    // }

    // deselect
    if(!$selectedActionID || $selectedActionID.length < 1) return; //if nothing selected
    if(target.closest('.background') ||
      target.closest('.grid-paper') ||
      target.closest('.main-right') &&
      !target.closest('.dont-deselect')
    ) {
        deselect();
      }
  }
  
  // // if staged action changes, update the selected effect
  // watch out for circular dependencies! see selectedEffect.subscribe
  // stagedAction.subscribe(action => {
  //   if (action && action.effect) {
  //     const matchingEffect = $toolStore.find(tool => tool.name === action.effect);
  //     if (matchingEffect) {
  //       selectedEffect.set(matchingEffect);
  //     }
  //   }
  // });
  
  function handleSpeedChange(event:CustomEvent) {
    // console.log("speed change", event.detail.value);
    playSpeed.set(+event.detail.value);
    if($isPlaying) {
      renderDelay.set(1000/$playSpeed);
     }
  }

  function toggleLock() {
    drawingLocked.set(!$drawingLocked);
    selectActionByIndex(1);
  }

  function handleEffectClick(effectName: string) {
    let effect = $toolStore.find(e => e.name === effectName);
    if(!effect) return;
    selectedEffect.set(effect);
  }

  onMount(() => {

    // when data loads, set first effect as selected and initialize the staged action
    toolStore.subscribe(data => {
      if (data && data.length > 0) {
        selectedEffect.set(data[0]); // set the first effect as default
      }

      allCategories = [...new Set(data.map(tool => tool.category))];
    });

    window.addEventListener('click', handleClickOutside);

    setupKeyboardEvents();

    return () => {
        removeKeyboardEvents();
        window.removeEventListener('click', handleClickOutside);
    };
  
  });

  let count = 1;

  let drawingArea;


      // <button class="instabutton" title="save" id="exportButton" on:click={exportCodeWithImage}>save <svg xmlns="http://www.w3.org/2000/svg" height="20" width="16" viewBox="0 0 384 512" style="vertical-align: middle; transform: translateY(-2px);"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM216 232V334.1l31-31c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-72 72c-9.4 9.4-24.6 9.4-33.9 0l-72-72c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l31 31V232c0-13.3 10.7-24 24-24s24 10.7 24 24z"/></svg></button>
      //   <button class="instabutton" title="open" id="importButton" on:click={importCodeFromImage}>open <svg xmlns="http://www.w3.org/2000/svg" height="20" width="16" viewBox="0 0 384 512" style="vertical-align: middle; transform: translateY(-2px);"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM216 408c0 13.3-10.7 24-24 24s-24-10.7-24-24V305.9l-31 31c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l72-72c9.4-9.4 24.6-9.4 33.9 0l72 72c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-31-31V408z"/></svg></button>
        

</script>

<!-- svelte-ignore missing-declaration -->



  <!-- <div class="left-toolbar-background"></div>
  <div class="code-toolbar-background"></div> -->

 <!-- <div id="fixed-category-toolbar"><CategoryToolbar categories={$drawingLocked?[]:allCategories} /></div> -->

 <div class="viewport-container">
  
  <div class="background"></div> <!-- background -->
  
  <div class="container">

    <div class="grid-paper"></div> <!-- grid-paper -->

    <div class="left-toolbar-background"></div>
    <div class="code-toolbar-background"></div>
    <div class="staged-action-background"></div>
    <div class="header"></div>

    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="top-left-corner">
      <!-- <div class="lock-button" on:click={toggleLock}>{@html $drawingLocked?lockIcon:unlockIcon}</div> -->
    </div> <!-- top-left-corner -->

    <div class="above-canvas">
      <div class="doc-controls">
        <button class="top-menu-button" title="save" id="exportButton" on:click={exportCodeWithImage}>save</button>
        <button class="top-menu-button" title="open" id="importButton" on:click={importCodeFromImage}>open</button>
        <button class="top-menu-button" id="clearAllButton" on:click={clearAllActions}>clear</button>
      </div>
      <div class="history-controls">
        <button class="top-menu-button" id="undoButton" on:click={undo} disabled={!canUndo}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="vertical-align: middle;"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M48.5 224H40c-13.3 0-24-10.7-24-24V72c0-9.7 5.8-18.5 14.8-22.2s19.3-1.7 26.2 5.2L98.6 96.6c87.6-86.5 228.7-86.2 315.8 1c87.5 87.5 87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3c-62.2-62.2-162.7-62.5-225.3-1L185 183c6.9 6.9 8.9 17.2 5.2 26.2s-12.5 14.8-22.2 14.8H48.5z"/></svg>
        </button>
        
        <button class="top-menu-button" id="redoButton" on:click={redo} disabled={!canRedo}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="vertical-align: middle;"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M463.5 224H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1c-87.5 87.5-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5z"/></svg>
        </button>
      </div> <!-- history-controls -->
      <div class="playback-controls">
        <button class="top-menu-button dont-deselect" id="stepBackwardButton" on:click={stepBackward}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" height="16" width="16" style="vertical-align: middle; transform: translateY(-2px);"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M267.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29V96c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160L64 241V96c0-17.7-14.3-32-32-32S0 78.3 0 96V416c0 17.7 14.3 32 32 32s32-14.3 32-32V271l11.5 9.6 192 160z"/></svg></button>
        <PlayButton />        
        <button class="top-menu-button dont-deselect" id="stepForwardButton" on:click={stepForward}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" height="16" width="16" style="vertical-align: middle; transform: translateY(-2px);"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416V96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4l192 160L256 241V96c0-17.7 14.3-32 32-32s32 14.3 32 32V416c0 17.7-14.3 32-32 32s-32-14.3-32-32V271l-11.5 9.6-192 160z"/></svg></button>
        {#if $firstPlay}<span><NumberWidget id="speed" min={1} max={50} value={5} on:valueChange={handleSpeedChange}/></span>step{#if $playSpeed>1}s{/if} per second{/if}
        <!-- <input type="number" id="speed" min={1} max={100} value={10} on:input={handleSpeedChange}/>steps per second -->
      </div> <!-- playback-controls -->
    </div> <!-- above canvas -->
      

    <div class="above-code">

    </div> <!-- above code -->

    <div class="left-toolbar">
      <!-- <div class="current-effect">
        {#if $selectedEffect}
            <img class="effect-img" src='/assets/effect-thumbnails/{$selectedEffect.thumbnail}' alt={$selectedEffect.textLabel}>
        {/if}
      </div> -->
      <!-- {#if !$drawingLocked} -->
      <CategoryToolbar categories={allCategories} effectMode={false}/>
      <!-- {/if} -->
      <div class="color-bank"><ColorBank/></div>
    </div> <!-- left-toolbar -->

      <div class="drawing-area-container">
        <div class="drawing-area" bind:this={drawingArea}>
            {#if $drawingLocked}
              <Tooltip element={drawingArea} settings={{trigger:'mouseenter', offset: [0, -200], hideOnClick:false}}>
                <!-- {#if $drawingLocked}
                  <div class="lock-button" on:click={toggleLock}>{@html $drawingLocked?lockIcon:unlockIcon}</div>
                {/if} -->
              </Tooltip>
            {/if}
            <Ruler>
              <Canvas/>
            </Ruler>
          </div>
      </div>

    <div class="right-container">
      {#if !showCode}
        <div class="effect-buttons-in-code-area">
          <CategoryToolbar categories={allCategories} effectMode={!showCode}/>
        </div>
      {/if}

      <button class="selected-action-button dont-deselect" id="toggleCodeButton" on:click={()=>{showCode=!showCode;}}>{showCode ? '↓ show buttons ↓' : '↑	  more space please  ↑'}</button>


    <div class="main-right">
      <!-- {#if !showCode} -->
      <!-- {/if} -->
      <div id="main-list">
          <ActionItem action={$actionRoot} depth={0}/>
        
        <!-- <div class="effect-buttons-in-design">
        {#each $actionRoot.params.children as childID}
        
          <button
              on:click={() => handleEffectClick($flatActionStore[childID].effect)}
              class="effect-button"
              class:selected={$selectedEffect && $selectedEffect.name === $flatActionStore[childID].effect}
              style:background-image={`url(/assets/effect-thumbnails/${$flatActionStore[childID].thumbnail})`}
              >
              <span class="effect-label">{$flatActionStore[childID].effect}</span>
          </button>
        
        {/each}
      </div> -->
          <!-- <div class="last-action dont-deselect"><ActionItem action={$flatActionStore[$selectedActionID]}/></div> -->
        
        
      </div> <!-- main-list -->
    </div>  <!-- main-right -->
  </div>  <!-- right-container -->

    <div class="top-right-corner">
      <!-- <button class="selected-action-button dont-deselect" id="toggleCodeButton" on:click={()=>{showCode=!showCode;}}>{showCode ? 'show buttons' : 'hide buttons'}</button> -->
    </div> <!-- top-right-corner -->

    <div class="right-sidebar">
      <div class="code-toolbar">  
      <button class="selected-action-button dont-deselect" id="deleteButton" disabled={!$selectedActionID} on:click={() => removeSelectedAction()}><svg xmlns="http://www.w3.org/2000/svg" height="1.1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"/></svg> delete</button>
        <button class="selected-action-button dont-deselect" id="remixButton" disabled={!$selectedActionID} on:click={() => remixAction($selectedActionID)}><svg xmlns="http://www.w3.org/2000/svg" height="1.1em" viewBox="0 0 576 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M234.7 42.7L197 56.8c-3 1.1-5 4-5 7.2s2 6.1 5 7.2l37.7 14.1L248.8 123c1.1 3 4 5 7.2 5s6.1-2 7.2-5l14.1-37.7L315 71.2c3-1.1 5-4 5-7.2s-2-6.1-5-7.2L277.3 42.7 263.2 5c-1.1-3-4-5-7.2-5s-6.1 2-7.2 5L234.7 42.7zM46.1 395.4c-18.7 18.7-18.7 49.1 0 67.9l34.6 34.6c18.7 18.7 49.1 18.7 67.9 0L529.9 116.5c18.7-18.7 18.7-49.1 0-67.9L495.3 14.1c-18.7-18.7-49.1-18.7-67.9 0L46.1 395.4zM484.6 82.6l-105 105-23.3-23.3 105-105 23.3 23.3zM7.5 117.2C3 118.9 0 123.2 0 128s3 9.1 7.5 10.8L64 160l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L128 160l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L128 96 106.8 39.5C105.1 35 100.8 32 96 32s-9.1 3-10.8 7.5L64 96 7.5 117.2zm352 256c-4.5 1.7-7.5 6-7.5 10.8s3 9.1 7.5 10.8L416 416l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L480 416l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L480 352l-21.2-56.5c-1.7-4.5-6-7.5-10.8-7.5s-9.1 3-10.8 7.5L416 352l-56.5 21.2z"/></svg> remix</button>
        <button class="selected-action-button dont-deselect" id="duplicateButton" disabled={!$selectedActionID} on:click={() => duplicateAction($selectedActionID)}><svg xmlns="http://www.w3.org/2000/svg" height="1.1em" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M64 464H288c8.8 0 16-7.2 16-16V384h48v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h64v48H64c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16zM224 304H448c8.8 0 16-7.2 16-16V64c0-8.8-7.2-16-16-16H224c-8.8 0-16 7.2-16 16V288c0 8.8 7.2 16 16 16zm-64-16V64c0-35.3 28.7-64 64-64H448c35.3 0 64 28.7 64 64V288c0 35.3-28.7 64-64 64H224c-35.3 0-64-28.7-64-64z"/></svg>copy</button>
        <button class="selected-action-button dont-deselect" id="remixDuplicateButton" disabled={!$selectedActionID} on:click={() => remixDuplicate($selectedActionID)}>
          <div class="remix-duplicate-icon">
            <svg xmlns="http://www.w3.org/2000/svg" height="0.9em" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M64 464H288c8.8 0 16-7.2 16-16V384h48v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h64v48H64c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16zM224 304H448c8.8 0 16-7.2 16-16V64c0-8.8-7.2-16-16-16H224c-8.8 0-16 7.2-16 16V288c0 8.8 7.2 16 16 16zm-64-16V64c0-35.3 28.7-64 64-64H448c35.3 0 64 28.7 64 64V288c0 35.3-28.7 64-64 64H224c-35.3 0-64-28.7-64-64z"/></svg>
            <svg xmlns="http://www.w3.org/2000/svg" height="0.9em" viewBox="0 0 576 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M234.7 42.7L197 56.8c-3 1.1-5 4-5 7.2s2 6.1 5 7.2l37.7 14.1L248.8 123c1.1 3 4 5 7.2 5s6.1-2 7.2-5l14.1-37.7L315 71.2c3-1.1 5-4 5-7.2s-2-6.1-5-7.2L277.3 42.7 263.2 5c-1.1-3-4-5-7.2-5s-6.1 2-7.2 5L234.7 42.7zM46.1 395.4c-18.7 18.7-18.7 49.1 0 67.9l34.6 34.6c18.7 18.7 49.1 18.7 67.9 0L529.9 116.5c18.7-18.7 18.7-49.1 0-67.9L495.3 14.1c-18.7-18.7-49.1-18.7-67.9 0L46.1 395.4zM484.6 82.6l-105 105-23.3-23.3 105-105 23.3 23.3zM7.5 117.2C3 118.9 0 123.2 0 128s3 9.1 7.5 10.8L64 160l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L128 160l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L128 96 106.8 39.5C105.1 35 100.8 32 96 32s-9.1 3-10.8 7.5L64 96 7.5 117.2zm352 256c-4.5 1.7-7.5 6-7.5 10.8s3 9.1 7.5 10.8L416 416l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L480 416l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L480 352l-21.2-56.5c-1.7-4.5-6-7.5-10.8-7.5s-9.1 3-10.8 7.5L416 352l-56.5 21.2z"/></svg>
          </div>
          remix a copy
        </button>
        <button class="selected-action-button dont-deselect" id="repeatButton" disabled={!$selectedActionID} on:click={() => repeatSelectedActionAlongPath() }><svg xmlns="http://www.w3.org/2000/svg" height="1.1em" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M0 224c0 17.7 14.3 32 32 32s32-14.3 32-32c0-53 43-96 96-96H320v32c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l64-64c12.5-12.5 12.5-32.8 0-45.3l-64-64c-9.2-9.2-22.9-11.9-34.9-6.9S320 19.1 320 32V64H160C71.6 64 0 135.6 0 224zm512 64c0-17.7-14.3-32-32-32s-32 14.3-32 32c0 53-43 96-96 96H192V352c0-12.9-7.8-24.6-19.8-29.6s-25.7-2.2-34.9 6.9l-64 64c-12.5 12.5-12.5 32.8 0 45.3l64 64c9.2 9.2 22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6V448H352c88.4 0 160-71.6 160-160z"/></svg>random repeat</button>
        <button class="selected-action-button dont-deselect" id="nameButton" disabled={!$selectedActionID} on:click={() => wrapSelectedInGroup() }><svg xmlns="http://www.w3.org/2000/svg" height="1.1em"viewBox="0 0 640 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M192 128c0-17.7 14.3-32 32-32s32 14.3 32 32l0 7.8c0 27.7-2.4 55.3-7.1 82.5l-84.4 25.3c-40.6 12.2-68.4 49.6-68.4 92l0 71.9c0 40 32.5 72.5 72.5 72.5c26 0 50-13.9 62.9-36.5l13.9-24.3c26.8-47 46.5-97.7 58.4-150.5l94.4-28.3-12.5 37.5c-3.3 9.8-1.6 20.5 4.4 28.8s15.7 13.3 26 13.3l128 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-83.6 0 18-53.9c3.8-11.3 .9-23.8-7.4-32.4s-20.7-11.8-32.2-8.4L316.4 198.1c2.4-20.7 3.6-41.4 3.6-62.3l0-7.8c0-53-43-96-96-96s-96 43-96 96l0 32c0 17.7 14.3 32 32 32s32-14.3 32-32l0-32zm-9.2 177l49-14.7c-10.4 33.8-24.5 66.4-42.1 97.2l-13.9 24.3c-1.5 2.6-4.3 4.3-7.4 4.3c-4.7 0-8.5-3.8-8.5-8.5l0-71.9c0-14.1 9.3-26.6 22.8-30.7zM24 368c-13.3 0-24 10.7-24 24s10.7 24 24 24l40.3 0c-.2-2.8-.3-5.6-.3-8.5L64 368l-40 0zm592 48c13.3 0 24-10.7 24-24s-10.7-24-24-24l-310.1 0c-6.7 16.3-14.2 32.3-22.3 48L616 416z"/></svg>label</button>

        <button class="selected-action-button dont-deselect" id="redrawButton" disabled={!$selectedActionID || $drawingLocked} on:click={() => redrawSelectedAction()}><svg xmlns="http://www.w3.org/2000/svg" height="1.1em" viewBox="0 0 576 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M339.3 367.1c27.3-3.9 51.9-19.4 67.2-42.9L568.2 74.1c12.6-19.5 9.4-45.3-7.6-61.2S517.7-4.4 499.1 9.6L262.4 187.2c-24 18-38.2 46.1-38.4 76.1L339.3 367.1zm-19.6 25.4l-116-104.4C143.9 290.3 96 339.6 96 400c0 3.9 .2 7.8 .6 11.6C98.4 429.1 86.4 448 68.8 448H64c-17.7 0-32 14.3-32 32s14.3 32 32 32H208c61.9 0 112-50.1 112-112c0-2.5-.1-5-.2-7.5z"/></svg>draw with</button>
        <!-- <button class="instabutton selected-action-button dont-deselect" id="convertButton" disabled={!$selectedActionID} on:click={() => convertSelectedAction()}>find pattern</button> -->
        <!-- <button class="instabutton selected-action-button dont-deselect" id="saveToolButton" disabled={!$selectedActionID} on:click={() => saveTool($selectedActionID)}> <svg xmlns="http://www.w3.org/2000/svg" height="0.9em" viewBox="0 0 448 512">!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.<path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg> <svg xmlns="http://www.w3.org/2000/svg" height="1.4em" viewBox="0 0 512 512">!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.<path d="M176 88v40H336V88c0-4.4-3.6-8-8-8H184c-4.4 0-8 3.6-8 8zm-48 40V88c0-30.9 25.1-56 56-56H328c30.9 0 56 25.1 56 56v40h28.1c12.7 0 24.9 5.1 33.9 14.1l51.9 51.9c9 9 14.1 21.2 14.1 33.9V304H384V288c0-17.7-14.3-32-32-32s-32 14.3-32 32v16H192V288c0-17.7-14.3-32-32-32s-32 14.3-32 32v16H0V227.9c0-12.7 5.1-24.9 14.1-33.9l51.9-51.9c9-9 21.2-14.1 33.9-14.1H128zM0 416V336H128v16c0 17.7 14.3 32 32 32s32-14.3 32-32V336H320v16c0 17.7 14.3 32 32 32s32-14.3 32-32V336H512v80c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64z"/></svg>&nbsp;&nbsp;</button> -->
    </div>
      </div> <!-- right-sidebar -->

    <!-- <div class="footer"></div> -->

    <div class="footer-center">
      <div class="footer-center-wrapper">
      <!-- <div class="effect-settings"> -->
        {#if !$drawingLocked}
          {#if $stagedAction}
            {#key $stagedAction.params.lastChanged}
              <div class="staged-action" in:scale={{ duration: 500, delay: 100 }}>
                <ActionItem action={$stagedAction} />
              </div>
            {/key}
            <!-- <DebugPaintStore /> -->
          {/if}
        <!-- {:else}
          <div class="lock-button staged-lock" on:click={toggleLock}>{@html $drawingLocked?lockIcon:unlockIcon}</div> -->
        {/if}
        </div>
        <!-- <div class="staged-color-picker">
          <ColorPicker bind:value={value} />
          </div> -->
        <!-- <EffectSettingsPanel /> -->
      <!-- </div> -->
    </div> <!-- staged action container -->

  </div> <!-- grid container -->
</div> <!-- viewport container -->


    

    
  
    
          



          <!------------------------------------ debugging ----------------------------------->
          <!-- <br>

             <ActionItem action={$flatActionStore[$changedActionID]} depth={0}/>
          <ul>
            {#each Object.values($flatActionStore) as action (action.uuid)}
              <li style:color={action.uuid === $stagedActionID ? 'red' : 'black'}>
                {action.uuid} : {#if action.params.children && action.params.children.length > 0} {JSON.stringify(action.params.children)} {/if} {action.effect}
              </li>
            {/each}
          </ul> -->
          <!---------------------------------------------------------------------------------->




      



    <!-- debugging <History /> -->






<style>

  /* * {
    border: 1px solid blue;
  } */

  :root {
    --sidebar-width: 50px;
    --menu-bar-width: 40px;
    --drawing-area-height: 520px;
  }

  .background {
    background-image: url('/backgrounds/Cotton.jpg');
    background-size: 100vw 100vh;
    background-repeat: no-repeat;
    min-height: 100vh;
    min-width: 100vw;
    position: absolute;
    top: 0;
    z-index: -2;
  }

  .viewport-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100vh;
    width: 100vw;
    overflow: auto;
    position: relative;
    z-index: 0;
    background-color: transparent;
  }

  .grid-paper {
    grid-row: 2 / span 4;
    grid-column: 1 / span 4;
    /* max-width: 1301px; */
    /* margin-left: auto; */
    /* margin-right: auto; */
    overflow: hidden;
    background-image: linear-gradient(90deg, #A9D6DC 1px, transparent 1px), 
                      linear-gradient(180deg, #A9D6DC 1px, transparent 1px);
    background-size: 20px 20px;
  }

  .container { /* the main grid container */
    display: grid;
    width: 100%;
    height: 100%;
    /* max-height: 100vh; */
    max-width: 1300px;
    grid-template-columns: var(--sidebar-width) 2fr minmax(auto, 3fr) var(--sidebar-width);
    grid-template-rows: 1fr var(--menu-bar-width) var(--drawing-area-height) auto 3fr;
    gap: 0 5px; /* handled by media queries */
    grid-template-areas: 
        " . . . . "
        "header header header header"
        "left-sidebar main main right-sidebar"
        "footer footer-center footer-center footer"
        " . . . . ";
  }

  .container.drawingonly {
    /* width: 70%; */
    grid-template-columns: var(--sidebar-width) 2fr 0 var(--sidebar-width);
  }

  .footer {
    /* grid-area: footer; */
    /* background-color: #EEA57C; */
    /* opacity: 0.5; */
    /* position: relative;
    display: flex;
    flex-direction: row; */
    /* justify-content: center; */
    /* align-items: center; */
    /* border: 1px solid orange; */
  }

  .top-left-corner {
    grid-column: 1;
    grid-row: 2;
    display: flex;
    /* margin: auto; */
    align-items: center;
    justify-content: center;
    z-index: 2;
  }

  .above-canvas {
    grid-column: 2 / span 3;
    grid-row: 2;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }

  .above-canvas > * {
    flex-grow: 1;
  }

  .above-canvas > *:last-child {
    flex-grow: 2; /* Adds twice as much space at the end */
  }

  .doc-controls {
    display: flex;
    flex-direction: row;
    gap: 10px;
    margin: 10px;
  }

  .effect-buttons-in-design {
    display: flex;
    flex-direction: column;
    gap: 1em 0.5em;
  }

  /* .above-code {
    grid-column: 3 / span 2;
    grid-row: 2;
    display: flex;
    align-items: center;
    margin: auto;
  } */

  .drawing-area-container {
    grid-column: 2;
    grid-row: 3;
    /* border: 2px solid blue; */
    display: flex;
    flex-direction: column;
    position: relative;
    max-height: var(--drawing-area-height);
    /* justify-content: flex-start; */
  }

  .right-container {
    grid-column: 3;
    grid-row: 3;
    display: flex;
    flex-direction: column;
    /* gap: 3em; */
    max-height: var(--drawing-area-height);
  }

  .effect-buttons-in-code-area {
    margin-top: 1em;
  }

  .main-right {
    grid-column: 3;
    grid-row: 3;
    max-height: var(--drawing-area-height);
    position: relative;
    width: 100%;
    overflow-y: auto;
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
    /* border: 1px solid lightgray;
    background-color: rgba(255, 255, 255, 0.8); */
  }

  #main-list {
    max-height: calc(var(--drawing-area-height) - 2vh);
    max-width: 100%;
    position: relative;
  }

  .header {
    grid-area: header;
    grid-row: 2;
    grid-column: 1 / span 4;
    /* background-color: #B7D09F; */
    background-image: url('/backgrounds/55.png');
    background-size: cover;
    /* opacity: 0.8; */
  }

  .left-toolbar-background {
    grid-row: 2 / span 4;
    grid-column: 1;
    background-image: url('/backgrounds/56.png');
    background-size: var(--sidebar-width) auto;
    background-repeat: no-repeat;
    /* background-color: #989A4A; */
    width: var(--sidebar-width);
    /* height: 100vh; */
    /* position: absolute;
    top: 0;
    left: 0; */
    opacity: 0.6;
    margin-bottom: 2vh;
  }

  .code-toolbar-background {
    grid-row: 2 / span 4;
    grid-column: 4;
    background-image: url('/backgrounds/56.png');
    background-size: var(--sidebar-width) auto;
    background-repeat: no-repeat;
    width: var(--sidebar-width);
    /* height: 100vh; */
    /* position: absolute;
    top: 0;
    right: 0; */
    opacity: 0.5;
    margin-bottom: 2vh;
  }

  .top-right-corner {
    grid-column: 4;
    grid-row: 2;
    display: flex;
    /* margin: auto; */
    align-items: center;
    justify-content: center;
    z-index: 1;
  }

  .right-sidebar {
    grid-area: right-sidebar;
    grid-row: 3;
    grid-column: 4;
    width: var(--sidebar-width);
    z-index: 1;
  }

  .left-toolbar {
    /* width: 5em;
    height: 90vh; */
    /* background-color: #a4a4a4; */
    grid-row: 3;
    grid-column: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    position: relative;
    z-index: 2;
  }

  .code-toolbar {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 90%;
    /* gap: 1.5em; */
  }

  .current-effect {
    /* background-color: #a4a4a4; */
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    z-index: 1;
  }

  .effect-img {
    width: 80%;
    border-radius: 5px;
    height: auto;
    margin: 10% auto;
  }

  .color-bank {
    position: relative;
    bottom: 0;
    margin-top: 10px;
    /* margin-bottom: 10px; */
    width: 100%;
  }

  .footer-center {
    /* border: 1px solid red; */
    grid-column: 2 / span 2;
    grid-row: 4;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    height: --calc(100vh - var(--top-menu-width) - var(--drawing-area-height) - 2vh);
    /* max-height: --calc(100vh - var(--top-menu-width) - var(--drawing-area-height) - 2vh); */
    width: 100%;
    overflow-y: auto;
  }

  .staged-action {
    /* border: 1px solid green; */
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1;
    height: auto;
    margin-top: 1vh;
    box-sizing: border-box;
    background-color: #ffffff9b;
    border: 1px solid lightgray;
    border-radius: 5px 15px 15px 5px;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    padding: 0.1em 0.2em 0.1em 0.5em;
    /* margin-bottom: 2px; */
  }

  .staged-action-background {
    /* border: 1px solid blue; */
    grid-row: 4 / span 2;
    grid-column: 1 / span 4;
    background-image: url('/backgrounds/117.png');
    background-size: 100% 110%;
    background-repeat: no-repeat;
    margin: 0 calc(var(--sidebar-width) / 2);
    opacity: 0.6;
    margin-top: -1vh;
    margin-bottom: 1vh;
  }

  .effect-settings {
    position: absolute;
    top: 20%;
    left: 0;
  }

  #effect-settings-background {
    position: relative;
    width: 100%;
    height: 90%;
    opacity: 0.6;
  }

  .last-action {
    box-sizing: border-box;
    background-color: #ffffff9b;
    border: 1px solid lightgray;
    border-radius: 5px 15px 15px 5px;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    padding: 0.1em 0.2em 0.1em 0.5em;
    margin-bottom: 2px;
  }

  .bottom-row {
    /* background-color: #EEA57C; */
    /* opacity: 0.5; */
  }

  .bottom-row-test {
    /* background-color: #EEA57C;
    opacity: 0.5;
    position: absolute;
    width: 62%;
    height: 270px;
    bottom: 0; */
    /* left: 0; */
  }
  /* .code-area {
    margin-top: 30px;
  } */

  .top-menu-button {
    /* padding: 0.5vh 0.5vw; */
    font-size: 2rem;
    font-family: 'Fandango';
    cursor: pointer;
    /* border: 1px solid black; */
    border: none;
    /* border-radius: 5px; */
    color: rgba(0, 0, 0, 0.9);
    background-color: transparent;
    /* border: 1px solid blue; */
    /* background-color: white; */
    /* text-shadow: 2px 2px 0px rgb(138, 138, 138); */
    z-index: 1;
  }

  .top-menu-button:hover {
    /* background-color: #e6e6e6; */
    /* color: black; */
    text-shadow: 2px 5px 0px rgb(138, 138, 138);
    transform: scale(1.2);
    transition: transform 0.2s ease-in-out;
  }

  .top-menu-button:active:not(:disabled) {
    transform: translateY(2px);
  }

  .top-menu-button:disabled {
    color: gray;
    /* background-color: #f4f4f4; */
    /* background-color: buttonface; */
    color: #a0a0a0;
    fill: #a0a0a0;
  }

  .top-menu-button svg {
    height: 1em;
    width: auto;
    /* transform: translateY(-2px); */
  }

  .remix-duplicate-icon {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }

  .selected-action-button {
    background-color: transparent;
    cursor: pointer;
    border: none;
    font-family: 'Fandango';
    font-size: 1.1rem;
    height: 100%;
    color: black;
    border-radius: 50% 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5px;
  }

  .selected-action-button:hover:not(:disabled) {
    /* background-color: #ffffff57; */
    /* color: white; */
    transform: scale(1.2);
    transition: transform 0.2s ease-in-out;
    /* text-shadow: 2px 3px 0px rgb(138, 138, 138); */
  }

  .selected-action-button:hover:not(:disabled) svg {
    /* fill: white; */
    transform: scale(1.2);
    transition: transform 0.2s ease-in-out;
  }

  .selected-action-button:active:not(:disabled) {
    /* background-color: #ffffff9d; */
    /* color: white; */
    transform: translateY(2px);
    transition: transform 0.2s ease-in-out;
    /* text-shadow: 2px 5px 0px rgb(138, 138, 138); */
  }

  .selected-action-button:disabled {
    background-color: transparent;
    color: #858585;
    fill: #858585;
  }

  #duplicateButton {
    /* font-size: 0.9em; */
  }

  .lock-button {
    background: none;
    cursor: pointer;
    transform: translateY(2px);
    /* position: absolute;
    right: 10px;
    top: 10px; */
  }

  .staged-lock {
    margin: 0.8em auto;
    transform: none;
  }

  .staged-color-picker {
    /* border: 1px solid red; */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: 1px solid lightgray;
    background-color: white;
    padding: 5px;
    border-radius: 5px;
  }

  #toggleCodeButton {
    align-self: flex-end;
    border-radius: 5px;
    font-size: 1.2em;
    color: rgb(47, 47, 47);
    height: auto;
  }

  #toggleCodeButton:hover {
    color: rgb(23, 23, 23);
    transform: scale(1.05);
    transition: transform 0.2s ease-in-out;

  }


  /* wider than 1300px */
  @media (min-width: 1301px) {
    .container {
        margin-left: auto;
        margin-right: auto;
    }

    .left-toolbar-background {
        /* Position the left toolbar based on the centered grid width */
        /* left: calc((100vw - 1100px) / 2); */
    }

    .code-toolbar-background {
        /* Position the right toolbar based on the centered grid width */
        /* right: calc((100vw - 1100px - 40px) / 2); */
    }
  }

  /* taller than 680px */
  @media (min-height: 681px) {
    .container {
        row-gap: 20px;
    }

    .staged-action {
      /* margin: 0.5em auto; */
      font-size: 1.3rem;
    }
  }

    /* wider than 680px */
  @media (min-width: 1101px) {
    .container {
        column-gap: 10px;
    }

    .drawing-area-container {
      margin-left: 20px;
    }

    #main-list {
      margin-left: 1vw;
    }
  }

</style>