<script lang="ts">
  import { onMount } from 'svelte';
  import { actionStore, toolStore, selectedEffect, activeCategory, stagedAction, stagedActionID, changedActionID, selectedActionID, selectedCodeEffect, currentColor, actionRoot, flatActionStore } from '../stores/dataStore';
  import { exportCodeWithImage, importCodeFromImage } from './export-utils';
  import LinedPaper from './LinedPaper.svelte';
  import ActionItem from './actions and widgets/ActionItem.svelte';
	import type { Action, Effect } from '../types/types';
  import Canvas from './canvas/Canvas.svelte';
  import { scrollToAction, saveActionAsNewTool, removeAction, loopActionAlongPath, remixAction, duplicateAction, redrawAction, clearAllActions, refresh } from './action-utils';
  import EffectToolbar from './toolbars/EffectToolbar.svelte';
  import Notebook from './Notebook.svelte';
  import Page from './Page.svelte';
  import { crossfade } from 'svelte/transition';
  import { historyStore } from '../stores/history';
  import { fade, fly } from 'svelte/transition';
  import Tooltip from './Tooltip.svelte';
  import CategoryToolbar from './toolbars/CategoryToolbar.svelte';
  import { p5CanvasSize } from '../stores/canvasStore';
  import tinycolor from "tinycolor2";
  import { setupKeyboardEvents, removeKeyboardEvents } from './KeyboardEvents';
  import EffectSettingsPanel from './toolbars/EffectSettingsPanel.svelte';
  import { initHistoryStore } from '../stores/history';

  const [send, receive] = crossfade({}); // TODO

  let allCategories:string[] = [];

  $: if ($selectedActionID) {
    scrollToAction($selectedActionID);
  }

  $: codeCursorClass = `${$selectedCodeEffect}-cursor`;



  let downloadCanvas: Function;
  function handleDownload() {
    downloadCanvas();
  }

  function undo() {
    historyStore.undo();
  }

  // function eyedropperSelectedAction() {
  //   copySelectedActionToStagedAction();
  // }

  function randomizeAction() {
    if ($stagedAction) {
      $stagedAction.params = {
        ...$stagedAction.params,
        radius: Math.round(Math.random() * 250 + 5),
        r1: Math.round(Math.random() * 250 + 5),
        r2: Math.round(Math.random() * 250 + 5),
        npoints: Math.round(Math.random() * 10 + 3),
        nsides: Math.round(Math.random() * 10 + 3),
        width: Math.round(Math.random() * 500 + 5),
        height: Math.round(Math.random() * 500 + 5),
        scaleBy: Math.round(Math.random() * 400 + 1),
        size: Math.round(Math.random() * 500 + 5),
        offset: Math.round(Math.random() * 100 + 5),
        rotation: Math.round(Math.random() * 360),
        color: tinycolor.random().toHexString(),
      };
      $stagedAction.params.children.forEach((child:Action) => {
        child.params = {
          ...child.params,
          radius: Math.round(Math.random() * 10 + 1),
          r1: Math.round(Math.random() * 30 + 1),
          r2: Math.round(Math.random() * 20 + 1),
          npoints: Math.round(Math.random() * 10 + 1),
          nsides: Math.round(Math.random() * 10 + 1),
          width: Math.round(Math.random() * 20 + 1),
          height: Math.round(Math.random() * 20 + 1),
          scaleBy: Math.round(Math.random() * 400 + 1),
          size: Math.round(Math.random() * 20 + 5),
          color: tinycolor.random().toHexString(),
        };
      });
    }
  }


  function saveTool(id:string) {
    // saveActionAsNewTool($flatActionStore[id]);
    // if($selectedActionID && $actionStore.children) {
    //   saveActionAsNewTool($actionStore.children.find(action => action.uuid === $selectedActionID));
    // }
  }

  function deselectAction() {
    selectedActionID.set('');
  }

  function handleClickOutside(event: MouseEvent) {
    if(!$selectedActionID || $selectedActionID.length < 1) return;

    // const target = event.target as Element;
    // if (target.classList.contains('deselect-target')) {
    //   deselectAction();
    // }
    
    const mainList = document.querySelector('#main-list');
    let target = event.target as Node;
    // console.log("target:", target, target.nodeName);
    if(mainList
      && !mainList.contains(target)
      && target.nodeName !== 'BUTTON'
      && target.nodeName !== 'INPUT'
      && target.nodeName !== 'CANVAS'
      && !(event.target as Element).closest('.dont-deselect')) {
      deselectAction();
    }
  }
  // save to undo queue whenever these stores change
  // $: if ($myTools) { saveToHistory(); }
  // $: if ($stagedAction) { saveToHistory(); }
  
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

  // $: if ($actionStore) {
  //     $actionStore.children.forEach((action, i) => {
  //       console.log(i, action.effect, action.uuid);
  //     });
  //     console.log(" ");
  // }


  onMount(() => {

    // when data loads, set first effect as selected and initialize the staged action
    toolStore.subscribe(data => {
      if (data && data.length > 0) {
        selectedEffect.set(data[0]); // set the first effect as default
        activeCategory.set(data[0].category);
      }

      allCategories = [...new Set(data.map(tool => tool.category))];

      initHistoryStore(); //set starting state
    });

    window.addEventListener('click', handleClickOutside);

    setupKeyboardEvents();

    return () => {
        removeKeyboardEvents();
        window.removeEventListener('click', handleClickOutside);
    };

    // actionStore.subscribe(action => {
    //   console.log("actionStore:", $actionStore);
    // });
  
  });

  // reorder action store to match DOM order
  function onReorder(event:any) {
    console.log("reordering");
    const { oldIndex, newIndex } = event.detail;

    if (oldIndex === newIndex) return;
    console.log("reordering");
    actionStore.update(currentData => {
      if (!currentData.children) return currentData;
      let newChildren = [...currentData.children]; //shallow copy
      const [movedItem] = newChildren.splice(oldIndex, 1);
      newChildren.splice(newIndex, 0, movedItem);
      // Return new object
      return {...currentData, children: newChildren};
    });

    //todo: check if properly triggering cache update

    //before returning, run a check to make sure dom order matches action store order
    // list items in DOM look like:
    // <li class="scale-from-left s-de4ivI8dEb2o" id="action-31f24737-5d9e-48ae-b09b-c8e3a357b57e" style="">
    // each child in the action store has a uuid matching the id in the DOM (not including 'action-')
  }

  let count = 1;

  // let mouseX = 0;
  // let mouseY = 0;

  // function handleMouseMove(event: MouseEvent) {
  //   mouseX = event.clientX;
  //   mouseY = event.clientY;
  // }

  // const offsetX = 10;
  // const offsetY = 10;

</script>

<div id="notebook">
<Notebook>
  <Page slot="left">
    
    <!-- <div class="staged-action-above-canvas" in:fade={{ duration: 1000 }} out:fade={{ duration: 10 }}>
      <ActionItem action={$stagedAction} />
    </div> -->

    <div class="drawing-grid-container">

      <!-- First Row -->
      <div class="drawing-area"><Canvas bind:downloadCanvas /></div>
  
      <div class="category-toolbar"><CategoryToolbar categories={allCategories} /></div>
      <div class="drawing-effect-toolbar"><EffectToolbar /></div>
      <!-- <button class="icon-button">😮</button> -->
      
      <!-- Third Row -->
      <div class="staged-action-container">
        <!-- {#if $stagedAction}
          <div class="staged-action" in:fade={{ duration: 300 }} out:fade={{ duration: 300 }}><ActionItem action={$stagedAction} isOpen={true} /></div>
        {/if} -->
        <EffectSettingsPanel />
      </div>
      <!-- <div id="staged-action-in-panel">
        <ActionItem action={$stagedAction} />
      </div> -->
    </div>

  </Page>
  <Page slot="right">
    <div class="instabuttons-top">
      <button class="instabutton" id="undoButton" on:click={undo}>Undo</button>
      <button class="instabutton" id="refreshButton" on:click={refresh}><svg xmlns="http://www.w3.org/2000/svg"  height="16" width="16" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H464c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0s-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3s163.8-62.5 226.3 0L386.3 160z"/></svg></button>
      <button class="instabutton" id="clearAllButton" on:click={clearAllActions}>Clear All</button>
      <div class="spacer"></div>
      <button class="instabutton" id="exportButton" on:click={exportCodeWithImage}><svg xmlns="http://www.w3.org/2000/svg" height="16" width="12" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM216 232V334.1l31-31c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-72 72c-9.4 9.4-24.6 9.4-33.9 0l-72-72c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l31 31V232c0-13.3 10.7-24 24-24s24 10.7 24 24z"/></svg></button>
      <button class="instabutton" id="importButton" on:click={importCodeFromImage}><svg xmlns="http://www.w3.org/2000/svg" height="16" width="12" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM216 408c0 13.3-10.7 24-24 24s-24-10.7-24-24V305.9l-31 31c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l72-72c9.4-9.4 24.6-9.4 33.9 0l72 72c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-31-31V408z"/></svg></button>
    </div>

    <div class={codeCursorClass} id="code-zone">
      <LinedPaper>
          <!-- <div id="main-list"><ActionItem action={$actionStore} depth={0} on:reorder={onReorder}/></div> -->
          <div id="main-list">
            <ActionItem action={$actionRoot} depth={0}/>
            <!-- <ActionItem action={$stagedAction} /> -->
          </div>
          
          <!-- debugging -->
          <!-- <br>
          <ul>
            {#each Object.values($flatActionStore) as action (action.uuid)}
              <li style:color={action.uuid === $stagedActionID ? 'red' : 'black'}>
                {action.uuid} : {#if action.params.children && action.params.children.length > 0} {JSON.stringify(action.params.children)} {/if}
              </li>
            {/each}
          </ul> -->
        </LinedPaper>

      <!-- {#if $stagedAction}
      {#key $stagedAction.uuid}
        <div class="staged-action-in-list" in:fade={{ duration: 1000 }} out:fade={{ duration: 10 }}> -->
          <!-- <PathWidget></PathWidget> -->
          <!-- <ActionItem action={$stagedAction} />
        </div>
      {/key}
    {/if} -->

      <div class="instabuttons-bottom">
        <button class="instabutton selected-action-button dont-deselect" id="deleteButton" disabled={!$selectedActionID} on:click={() => removeAction($selectedActionID)}><svg xmlns="http://www.w3.org/2000/svg" height="1.4em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"/></svg></button>
        <button class="instabutton selected-action-button dont-deselect" id="remixButton" disabled={!$selectedActionID} on:click={() => remixAction($selectedActionID)}><svg xmlns="http://www.w3.org/2000/svg" height="1.1em" viewBox="0 0 576 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M234.7 42.7L197 56.8c-3 1.1-5 4-5 7.2s2 6.1 5 7.2l37.7 14.1L248.8 123c1.1 3 4 5 7.2 5s6.1-2 7.2-5l14.1-37.7L315 71.2c3-1.1 5-4 5-7.2s-2-6.1-5-7.2L277.3 42.7 263.2 5c-1.1-3-4-5-7.2-5s-6.1 2-7.2 5L234.7 42.7zM46.1 395.4c-18.7 18.7-18.7 49.1 0 67.9l34.6 34.6c18.7 18.7 49.1 18.7 67.9 0L529.9 116.5c18.7-18.7 18.7-49.1 0-67.9L495.3 14.1c-18.7-18.7-49.1-18.7-67.9 0L46.1 395.4zM484.6 82.6l-105 105-23.3-23.3 105-105 23.3 23.3zM7.5 117.2C3 118.9 0 123.2 0 128s3 9.1 7.5 10.8L64 160l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L128 160l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L128 96 106.8 39.5C105.1 35 100.8 32 96 32s-9.1 3-10.8 7.5L64 96 7.5 117.2zm352 256c-4.5 1.7-7.5 6-7.5 10.8s3 9.1 7.5 10.8L416 416l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L480 416l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L480 352l-21.2-56.5c-1.7-4.5-6-7.5-10.8-7.5s-9.1 3-10.8 7.5L416 352l-56.5 21.2z"/></svg> remix</button>
        <button class="instabutton selected-action-button dont-deselect" id="duplicateButton" disabled={!$selectedActionID} on:click={() => duplicateAction($selectedActionID)}><svg xmlns="http://www.w3.org/2000/svg" height="1.1em" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M64 464H288c8.8 0 16-7.2 16-16V384h48v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h64v48H64c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16zM224 304H448c8.8 0 16-7.2 16-16V64c0-8.8-7.2-16-16-16H224c-8.8 0-16 7.2-16 16V288c0 8.8 7.2 16 16 16zm-64-16V64c0-35.3 28.7-64 64-64H448c35.3 0 64 28.7 64 64V288c0 35.3-28.7 64-64 64H224c-35.3 0-64-28.7-64-64z"/></svg> duplicate</button>
        <button class="instabutton selected-action-button dont-deselect" id="repeatButton" disabled={!$selectedActionID} on:click={() => loopActionAlongPath($selectedActionID) }><svg xmlns="http://www.w3.org/2000/svg" height="1.1em" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M0 224c0 17.7 14.3 32 32 32s32-14.3 32-32c0-53 43-96 96-96H320v32c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l64-64c12.5-12.5 12.5-32.8 0-45.3l-64-64c-9.2-9.2-22.9-11.9-34.9-6.9S320 19.1 320 32V64H160C71.6 64 0 135.6 0 224zm512 64c0-17.7-14.3-32-32-32s-32 14.3-32 32c0 53-43 96-96 96H192V352c0-12.9-7.8-24.6-19.8-29.6s-25.7-2.2-34.9 6.9l-64 64c-12.5 12.5-12.5 32.8 0 45.3l64 64c9.2 9.2 22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6V448H352c88.4 0 160-71.6 160-160z"/></svg> repeat</button>
        <button class="instabutton selected-action-button dont-deselect" id="redrawButton" disabled={!$selectedActionID} on:click={() => redrawAction($selectedActionID)}><svg xmlns="http://www.w3.org/2000/svg" height="1.1em" viewBox="0 0 576 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M339.3 367.1c27.3-3.9 51.9-19.4 67.2-42.9L568.2 74.1c12.6-19.5 9.4-45.3-7.6-61.2S517.7-4.4 499.1 9.6L262.4 187.2c-24 18-38.2 46.1-38.4 76.1L339.3 367.1zm-19.6 25.4l-116-104.4C143.9 290.3 96 339.6 96 400c0 3.9 .2 7.8 .6 11.6C98.4 429.1 86.4 448 68.8 448H64c-17.7 0-32 14.3-32 32s14.3 32 32 32H208c61.9 0 112-50.1 112-112c0-2.5-.1-5-.2-7.5z"/></svg> re-draw</button>
        <!-- <button class="instabutton selected-action-button dont-deselect" id="saveToolButton" disabled={!$selectedActionID} on:click={() => saveTool($selectedActionID)}> <svg xmlns="http://www.w3.org/2000/svg" height="0.9em" viewBox="0 0 448 512">!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.<path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg> <svg xmlns="http://www.w3.org/2000/svg" height="1.4em" viewBox="0 0 512 512">!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.<path d="M176 88v40H336V88c0-4.4-3.6-8-8-8H184c-4.4 0-8 3.6-8 8zm-48 40V88c0-30.9 25.1-56 56-56H328c30.9 0 56 25.1 56 56v40h28.1c12.7 0 24.9 5.1 33.9 14.1l51.9 51.9c9 9 14.1 21.2 14.1 33.9V304H384V288c0-17.7-14.3-32-32-32s-32 14.3-32 32v16H192V288c0-17.7-14.3-32-32-32s-32 14.3-32 32v16H0V227.9c0-12.7 5.1-24.9 14.1-33.9l51.9-51.9c9-9 21.2-14.1 33.9-14.1H128zM0 416V336H128v16c0 17.7 14.3 32 32 32s32-14.3 32-32V336H320v16c0 17.7 14.3 32 32 32s32-14.3 32-32V336H512v80c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64z"/></svg>&nbsp;&nbsp;</button> -->
      </div>
      <!-- <div id="code-toolbar"><CodeToolbar /></div> -->

    </div>
    <!-- debugging <History /> -->
  </Page>

</Notebook>



<!-- <div>Canvas Size: {$p5CanvasSize.width} x {$p5CanvasSize.height}</div> -->

</div>

<!-- <Tooltip element='#canvasContainer' cursorFollow={true}>
  <ActionItem action={$stagedAction} />
</Tooltip> -->

<!-- <Tooltip element='#notebook' cursorFollow={false}>
  <ActionItem action={$stagedAction} />
</Tooltip> -->

<!-- <svelte:window on:mousemove={handleMouseMove} /> -->

<!-- staged action that follows mouse cursor -->
<!-- <div style="position: fixed; left: {mouseX + offsetX}px; top: {mouseY + offsetY}px; pointer-events: none;">
  <div class="stagedActionHover"><ActionItem action={$stagedAction} /></div>
</div> -->

<style>

  /* * {
    border: 1px solid red;
  } */

  .drawing-grid-container {
    display: grid;
    /* grid-template-columns: 1fr 40px; */
    grid-template-columns: 501px;
    /* grid-template-rows: 3fr auto 1fr 40px; */
    grid-template-rows: 501px auto 37px 1fr;
    /* margin: auto; */
    max-height: calc(var(--page-height)*0.9);
    margin-top: 40px;
  }

  .drawing-area {
    overflow: hidden;
    margin-bottom: 20px;
    /* padding: 1px; */
    border: 1px solid black;
    box-shadow: 1px 2px 3px 2px gray;
  }

  #code-zone {
    height: calc(var(--page-height)*0.9);
    width: 100%;
  }

  #main-list {
    /* margin-left: 4.8em; */
  }
  /* .code-area {
    margin-top: 30px;
  } */

  #code-toolbar {
    position: relative;
    bottom: 50px;
  }

  .staged-action-container {
    border: 1px solid black;
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
    
  }

  .staged-action-buttons {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
  }

  .drawing-effect-toolbar {
    border: 1px solid black;
  }

  .staged-action {
    /* font-style: italic; */
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 0 20px;
    border: none;
    overflow: scroll;
    /* margin-left: 2em; */
    /* width: calc(var(--canvas-width)*0.8); */
    /* padding: 30px;
    box-shadow: 1px 2px 3px 2px gray; */
  }

  .staged-action-in-list, .staged-action-above-canvas {
    /* font-style: italic; */
    /* opacity: 50%; */
    color: gray;
    /* margin: 1.7em 0 0 2em; */
    width: 75%;
    border: 1px solid gray;
    padding: 10px;
    background-color: white;
    box-shadow: 1px 2px 3px 2px gray;
  }

  .staged-action-in-list {
    margin-left: 5em;
    margin-bottom: 30px;
  }

  .staged-action-above-canvas {
    position: absolute;
    top: 50px;
  }

  .stagedActionHover {
    background-color: white;
  }

  #staged-action-in-panel {
    margin-top: 20px;
    padding: 5px;
    font-style: italic;
    max-height: 150px;
    overflow: auto;
    border: 1px solid black;
  }

  .instabutton {
    padding: 5px 10px;
    font-size: 1em;
    font-family: 'FuturaHandwritten';
    cursor: pointer;
    border: none;
    border-radius: 5px;
    /* background-color: transparent; */
    /* font-weight: bold; */
    /* background-color:  */
    color: black;
  }

  .instabutton:hover {
    background-color: #e6e6e6;
  }

  .selected-action-button {
    padding: 0 10px;
  }

  .selected-action-button:disabled {
    background-color: buttonface;
    color: #a0a0a0;
    fill: #a0a0a0;
  }

  .icon-button {
    border: none;
    font-size: 1.5em;
    background-color: transparent;
    fill: black;
    cursor: pointer;
  }

  .icon-button:hover {
    fill: rgb(52, 52, 52);
  }

  .icon-button:active {
    fill: rgb(115, 115, 115);
  }

  #deleteButton {
    /* padding: 8px 10px 3px 10px; */
    font-size: 1.2em;
    padding-top: 5px;
    color: gray;
  }

  .instabuttons-top {
    position: absolute;
    left: --calc(var(--canvas-width)*0.1);
    /* left: 10px; */
    width: 60%;
    right: 20px;
    top: 20px;
    display: flex;
    flex-direction: row;
    gap: 10px;
    justify-content: center;
  }

  .spacer {
    flex-grow: 1;
  }

  #undoButton, #refreshButton, #clearAllButton {

  }

  #exportButton, #importButton {

  }

  .instabuttons-bottom {
    position: absolute;
    bottom: 30px;
    display: flex;
    flex-direction: row;
    gap: 10px;
    margin-left: 100px;
    /* margin-bottom: 100px; */
  }

  /* Cursor styles */
  .point-cursor {
    cursor: auto;
  }
  .random-cursor {
    cursor: url('/assets/cursors/random.svg') 9 9, pointer;
  }
  .rainbow-cursor {
    cursor: url('/assets/cursors/rainbow-solid.svg') 9 9, pointer;
  }
  .shuffle-cursor {
    cursor: url('/assets/cursors/shuffle-solid.svg') 9 9, pointer;
  }
  .repeat-cursor {
    cursor: url('/assets/cursors/clone-regular.svg') 9 9, pointer;
  }
  .redo-cursor {
    cursor: url('/assets/cursors/pen-to-square-solid.svg') 9 9, pointer;
  }
  .erase-cursor {
    cursor: url('/assets/cursors/eraser-solid.svg') 9 9, pointer;
  }
  .sample-cursor {
    cursor: url('/assets/cursors/vial-solid.svg') 9 9, pointer;
  }
  .connect-cursor {
    cursor: url('/assets/cursors/diagram-project-solid.svg') 9 9, pointer;
  }

</style>

<!-- <style>
  .staged-action {
    position: absolute; /* so we can position it anywhere in the parent container */
    transform: translate(0, 0); /* start position */
    transition: transform 1s ease-in-out; /* 1s duration, ease-in-out timing function */
  }

  .staged-action.animate-to-end {
    transform: translate(0, 200px); /* move down by 200px */
  }



</style> -->