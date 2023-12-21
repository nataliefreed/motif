<script lang="ts">

    // function handleClick(event: Event) {
  //   if($selectedCodeEffect === "shuffle") {
  //     const target = event.target as HTMLElement;
  //     const clickedItem = children.find(item => item.uuid === target.id);
  //     shuffle(clickedItem);
  //   }
  // }

  // function shuffle(item) {
  //   alert("Shuffling!");
  //   // put clicked item in random position in list
  //   const newIndex = Math.floor(Math.random() * children.length);
    
  //   if(item) {
  //     const oldIndex = children.indexOf(item);
  //     children.splice(oldIndex, 1);
  //     children.splice(newIndex, 0, item);
  //     if (oldIndex === newIndex) return;
  //     dispatch('reorder', { oldIndex, newIndex });
  //   }
  // }


  import type { Action } from '../../types/types';
  import ActionItem from './ActionItem.svelte';
  import { SortableList } from '@jhubbardsf/svelte-sortablejs';
  import type { SortableEvent } from 'sortablejs';
  import { createEventDispatcher } from 'svelte';
  import { scale, fade } from 'svelte/transition';
  import { selectedActionID, selectedCodeEffect } from '../../stores/dataStore';
    import type { E } from 'vitest/dist/types-198fd1d9';

  const dispatch = createEventDispatcher();

  export let children: Action[] = [];
  export let depth = 0;

  function handleReorder(event: SortableEvent) {
    // console.log("handling reorder in DOM", event);
    const oldIndex = event.oldIndex;
    const newIndex = event.newIndex;
    // console.log("oldIndex:", oldIndex, "newIndex:", newIndex);
    if (oldIndex === newIndex) return;
    dispatch('reorder', { oldIndex, newIndex }); // dispatch to main app to update actual action list
  }

  function handleItemClick(event: Event, actionId: string) {
    const target = event.target as Element;
    if($selectedCodeEffect == "point" || !$selectedCodeEffect) {
        if(target && target.classList.contains('drag-handle') || target.classList.contains('action-item-content') || target === event.currentTarget) { //if not a widget, select the action
        selectAction(actionId);
      }
    }
    else {
      dispatch('codeEffect', { actionId, codeEffect: $selectedCodeEffect });
    }
  }

  function selectAction(actionID: string) {
    selectedActionID.set(actionID);
  }

  $: listStyleClass = depth % 2 === 0 ? 'decimal-style' : 'alpha-style';

</script>


<ol class={listStyleClass}>
<!-- <ol style={depth % 2 === 0 ? "list-style-type: decimal;" : "list-style-type: lower-alpha;"}> -->
  <!-- handle='.drag-handle' -->
  <!-- group='nested-action-list' fallbackOnBody={true} swapThreshold={0.65} -->
  <!-- multiDragClass="sortable-selected" -->
  <SortableList class="" onUpdate={handleReorder} animation={150} filter='.filtered'>
    {#each children as action (action.uuid)}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <li class:selected={$selectedActionID == action.uuid} class:obscured={action.obscured} class:filtered={$selectedCodeEffect != "point" && $selectedCodeEffect} class="scale-from-left" in:scale={{ duration: 400, start: 0.25, opacity: 1 }} id={`action-${action.uuid}`}>
        <span class="drag-handle" on:click={e => handleItemClick(e, action.uuid)}></span>
        <ActionItem {action} depth = {depth+1} />
      </li>
    {/each}
  </SortableList>
</ol>


<style>

  .sortable-selected {
    text-decoration: green wavy underline;
  }

  ol {
    counter-reset: list-counter; /* Initialize a counter */
    list-style-type: none; /* Remove default list style */
    padding-left: 0em;
    /* margin-left: 1em; */
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  }

  li {
    border: 2px solid transparent; /* Invisible border */
    user-select: none; /* prevent text selection - makes it easier to grab */
    position: relative;
    padding-left: 2.2em; /* Space for the index - note: this seems to multiply for each list level so there is probably a better way*/
    padding-right: 4px; /* makes selection box look nicer */
  }

  .selected {
    box-sizing: border-box; /* Include padding and border in element's width and height */
    border: 2px solid gold;
    background-color: lightyellow;
    border-radius: 5px;
    /* display: block; */
  }

  li::before {
    pointer-events: none; /* prevent click events on the index */
    counter-increment: list-counter;
    content: counter(list-counter);
  }

  .alpha-style li::before {
    content: counter(list-counter, lower-alpha); /* Alpha numbering */
  }

  .decimal-style li::before,
  .alpha-style li::before,
  .drag-handle {
    color: #aeaeae;
    position: absolute;
    display: flex;
    align-items: center; /* Center vertically */
    justify-content: center; /* Center horizontally */
    width: 1.8em; /* Fixed width for the circle */
    height: 1.8em; /* Fixed height for the circle */
    left: 0; /* Align with the start of the list item */
    top: 1.1em;
    border-radius: 50%; /* Round border */
    transform: translateY(-50%);
    font-size: 0.8em; /* Adjust font size as needed */
    font-weight: bold;
    z-index: 1;
    align-self: flex-start;
    margin-left: 4px;
  }

  .drag-handle {
    border: 1px solid #aeaeae;
    background-color: #ffffff;
    /* background-color: transparent; */
    /* cursor: grab; */
    z-index: 0;
  }

  .drag-handle:active {
    cursor: grabbing;
  }

  li:not(.filtered) {
    cursor: grab;
  }

  .obscured {
    opacity: 0.5;
  }

  .scale-from-left {
    transform-origin: left center; /* Scale from the left */
  }

  /* ol li:before {
      position: absolute; 
      left: -1.7em;
      top: 0;
      border-radius: 50%; 
      width: 1.5em;
      height: 1.5em;
      padding: 0;
      text-align: center;
      background: none;
      border: 1px solid #bebebe;
      color: #b7b7b7;
      line-height: 1.5em; 
  } */
  </style>

  