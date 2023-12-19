<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { actionStore, toolStore, selectedEffect, activeCategory, stagedAction, selectedActionID, selectedCodeEffect } from '../stores/dataStore';
  import LinedPaper from './LinedPaper.svelte';
  import ActionItem from './actions and widgets/ActionItem.svelte';
	import type { Action } from '../types/types';
  import Canvas from './canvas/Canvas.svelte';
  import StagedAction from './actions and widgets/StagedAction.svelte';
  import { saveMyTool, saveToHistory, copySelectedActionToStagedAction } from './action-utils';
  import EffectToolbar from './toolbars/EffectToolbar.svelte';
  import Notebook from './Notebook.svelte';
  import Page from './Page.svelte';
  import { crossfade } from 'svelte/transition';
  import CodeToolbar from './toolbars/CodeToolbar.svelte';
  import { historyStore } from '../stores/history';
  import { fade, fly } from 'svelte/transition';
  import Tooltip from './Tooltip.svelte';
  import CategoryToolbar from './toolbars/CategoryToolbar.svelte';
  import { p5CanvasSize } from '../stores/canvasStore';
  import tinycolor from "tinycolor2";
  import GridWidget from './actions and widgets/GridWidget.svelte';
  import { setupKeyboardEvents, removeKeyboardEvents } from './KeyboardEvents';
  import EffectSettingsPanel from './toolbars/EffectSettingsPanel.svelte';

  const [send, receive] = crossfade({}); // TODO

  let allCategories:string[] = [];

  $: if ($selectedActionID) {
    scrollToAction($selectedActionID);
  }

  $: codeCursorClass = `${$selectedCodeEffect}-cursor`;

  async function scrollToAction(id: string) {
    await tick(); // Wait for the DOM to update with the new item
    const element = document.getElementById(`action-${id}`);
    // console.log("scrolling to element:", element);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center', // align the bottom of the new item with the center of the viewport
        inline: 'nearest' // keep the horizontal alignment as it is
      });
    }
  }

  let downloadCanvas: Function;
  function handleDownload() {
    downloadCanvas();
  }

  function undo() {
    historyStore.undo();
  }

  function eyedropperSelectedAction() {
    copySelectedActionToStagedAction();
  }

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

  function clearAll() {
    if($actionStore.children) {
      let lastItem = $actionStore.children[$actionStore.children.length - 1];
      if(lastItem) {
        scrollToAction(lastItem.uuid);
      }
      // let penultimateItem = $actionStore.children[$actionStore.children.length - 2];
      // if(penultimateItem) {
      //   selectedActionID.set(penultimateItem.uuid);
      // }
    }
    const interval = setInterval(() => {
        actionStore.update(data => {
            if (data.children && data.children.length > 0) {
                const penultimateItem = data.children[data.children.length - 2];
                if(penultimateItem) {
                  selectedActionID.set(penultimateItem.uuid);
                }
                // Remove the last element from the array
                const removed = data.children.pop();
            } else {
                // If no more elements, clear the interval
                clearInterval(interval);
                selectedActionID.set("");
                saveToHistory(); // Call saveToHistory after all elements are removed
            }
            return data;
        });
    }, 300); //rate at which to clear actions
  }

  let markHidden: Function; // in Canvas.svelte
  function clearHidden() {
    markHidden($actionStore);
    actionStore.update(data => {
      return data;
    });
    //   if (data && data.children) {
    //     data.children = data.children.filter(action => !action.obscured);
    //   }
    //   return data;
    // });
    // saveToHistory();
  }

  // function clearHidden() {
  //   actionStore.update(data => {
  //     data.children?.map(action => { action.obscured = true });
  //     return data;
  //   });
  //   // render, mark items that don't change the canvas as hidden
  //   // then clear all hidden items
  // }

  function deleteSelected() {
    if ($selectedActionID) {
      actionStore.update(data => {
        if (data && data.children) {
          const index = data.children.findIndex(action => action.uuid === $selectedActionID);
          if (index > -1) {
            data.children.splice(index, 1);
          }
        }
        return data;
      });
    }
    saveToHistory();
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

  export let initialActions:Action;

  onMount(() => {
    actionStore.set(initialActions);

    // when data loads, set first effect as selected and initialize the staged action
    toolStore.subscribe(data => {
      if (data && data.length > 0) {
        selectedEffect.set(data[0]); // set the first effect as default
        activeCategory.set(data[0].category);
      }

      allCategories = [...new Set(data.map(tool => tool.category))];
    });

    setupKeyboardEvents();

    return () => {
        removeKeyboardEvents();
    };

    // actionStore.subscribe(action => {
    //   console.log("actionStore:", $actionStore);
    // });
  
  });

  // reorder action store to match DOM order
  function onReorder(event:any) {
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
    
    <div class="drawing-grid-container">

      <!-- First Row -->
      <div class="drawing-area"><Canvas bind:downloadCanvas bind:markHidden /></div>
  
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
    </div>

  </Page>
  <Page slot="right">
    <div class="instabuttons">
      <button class="instabutton left-aligned" id="undoButton" on:click={undo}>Undo</button>
      <div class="middle-aligned">
        <button class="instabutton" id="deleteButton" on:click={deleteSelected}><svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"/></svg></button>
        <button class="instabutton" id="clearAllButton" on:click={clearAll}>Clear All</button>
        <!-- <button class="instabutton" id="clearHiddenButton" on:click={clearHidden}>Mark Hidden</button> -->
      </div>
      <button class="instabutton right-aligned" id="downloadButton" on:click={handleDownload}><svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg></button>
    </div>

    <div class={codeCursorClass} id="code-zone">
      <LinedPaper>
          <ActionItem action={$actionStore} depth={0} on:reorder={onReorder}/>
        {#if $stagedAction}
          {#key $stagedAction.uuid}
            <div class="staged-action-in-list" in:fly={{ x: -1500, y: 1000, duration: 300 }} out:fade={{ duration: 300 }}>&#8680 &#8680 <ActionItem action={$stagedAction} /></div>
          {/key}
        {/if}
      </LinedPaper>

      <div id="code-toolbar"><CodeToolbar /></div>

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
    margin: auto;
    max-height: calc(var(--page-height)*0.9);
  }

  .drawing-area {
    overflow: hidden;
    margin-bottom: 20px;
    /* border: 1px solid black; */
  }

  #code-zone {
    height: calc(var(--page-height)*0.9);
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

  .staged-action-in-list {
    font-style: italic;
    opacity: 70%;
    margin: 1.7em 0 1.7em 1em;
  }

  .stagedActionHover {
    background-color: white;
  }

  .instabutton {
    /* padding: 5px; */
    font-size: 1.2em;
    font-family: 'FuturaHandwritten';
    cursor: pointer;
    border: none;
    border-radius: 5px;
    /* background-color: transparent; */
    /* font-weight: bold; */
    color: #313131;
  }

  .instabutton:hover {
    background-color: #e6e6e6;
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

  .instabuttons {
    position: absolute;
    top: 25px;
    display: flex;
    flex-direction: row;
    gap: 10px;
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