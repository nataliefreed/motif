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
  import { selectedActionID } from '../../stores/dataStore';


  const dispatch = createEventDispatcher();

  export let children: Action[] = [];
  export let depth = 0;

  function handleReorder(event: SortableEvent) {
    const oldIndex = event.oldIndex;
    const newIndex = event.newIndex;
    if (oldIndex === newIndex) return;
    dispatch('reorder', { oldIndex, newIndex });
  }

  function selectAction(actionID: string) {
    selectedActionID.set(actionID);
  }

  $: listStyleClass = depth % 2 === 0 ? 'decimal-style' : 'alpha-style';

</script>


<ol class={listStyleClass}>
<!-- <ol style={depth % 2 === 0 ? "list-style-type: decimal;" : "list-style-type: lower-alpha;"}> -->
  <SortableList class="" onUpdate={handleReorder} handle='.drag-handle' animation={150}>
    {#each children as action (action.uuid)}
      <li class:selected={$selectedActionID === action.uuid} class="scale-from-left" in:scale={{ duration: 400, start: 0.25, opacity: 1 }} id={`action-${action.uuid}`}>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span class="drag-handle" on:click={() => selectAction(action.uuid)}></span>  
        <ActionItem {action} depth = {depth+1} />
      </li>
    {/each}
  </SortableList>
</ol>


<style>
  ol {
    counter-reset: list-counter; /* Initialize a counter */
    list-style-type: none; /* Remove default list style */
    /* padding-left: 2em;
    margin-left: 2em; */
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  }

  li {
    user-select: none; /* prevent text selection - makes it easier to grab */
    position: relative;
    padding-left: 2.3em; /* Space for the index */
    margin-left: -1em; /* times depth ideally */
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
    position: absolute;
    display: flex;
    align-items: center; /* Center vertically */
    justify-content: center; /* Center horizontally */
    width: 1.8em; /* Fixed width for the circle */
    height: 1.8em; /* Fixed height for the circle */
    left: 0; /* Align with the start of the list item */
    top: 1.2em;
    border-radius: 50%; /* Round border */
    transform: translateY(-50%);
    font-size: 0.8em; /* Adjust font size as needed */
    font-weight: bold;
    z-index: 1;
    align-self: flex-start;
    margin-left: 4px;
  }

  .drag-handle {
    color: #979797;
    border: 1px solid #aeaeae;
    background-color: #efefef;
    cursor: grab;
    z-index: 0;
  }

  .drag-handle:active {
    cursor: grabbing;
  }

  .selected {
    border: 2px solid gold;
    background-color: lightyellow;
    border-radius: 5px;
    display: block; /* Ensure the border wraps the entire item */
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

  