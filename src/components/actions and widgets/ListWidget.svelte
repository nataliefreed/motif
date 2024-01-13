<script lang="ts">
  
  import type { SortableEvent } from 'sortablejs';
  import Sortable from 'sortablejs';
  import { onMount, createEventDispatcher } from 'svelte';
  import { selectedActionID, selectedCodeEffect, flatActionStore } from '../../stores/dataStore';
  import ActionItem from './ActionItem.svelte';

  export let id = '';
  export let value: string[] = [];
  let newValue = value;
  let children: any[] = [];
  let listElement: HTMLElement;
  export let depth = 0;

  // get the child actions from their uuids
  $: children = value.map(uuid => $flatActionStore[uuid]);
  // $: newValue = value;

  const dispatch = createEventDispatcher();

  $: listStyleClass = depth % 2 === 0 ? 'decimal-style' : 'alpha-style'; //why reactive?

  onMount(() => {
    const sortable = new Sortable(listElement, {
      group: '.alltheitems',
      onUpdate: onReorder,
      onAdd: onAdd,
      onRemove: onRemove,
      onEnd: onDropEnd,
      animation: 150,
      filter: '.filtered',
      draggable: '.draggable'
    });

    function onAdd(event: SortableEvent) {
      // update children
      let uuid = event.item.id;
      // find the one that was added in the action store? or just its id? this seems like a store update already...
    }

    function onRemove(event: SortableEvent) {
      // update children
    }

    function onReorder(event: SortableEvent) {
      if(event.to !== event.from) return; // make sure we are still in the same list
      const oldIndex = event.oldIndex;
      const newIndex = event.newIndex;
      if (oldIndex === newIndex) return;

      console.log("reorder", oldIndex, newIndex);

      newValue = reorderItems(value, oldIndex, newIndex);
      // console.log("new value", newValue);
    }

    function reorderItems(array:string[], oldIndex:number, newIndex:number) {
      // console.log("array", array);
      const newArray = [...array]; // Create a shallow copy of the array
      // console.log("new array", newArray);
      const [movedItem] = newArray.splice(oldIndex, 1); // Remove the item from old position
      // console.log("moved item", movedItem);
      newArray.splice(newIndex, 0, movedItem); // Insert the item at new position
      // console.log("new array", newArray);
      return newArray;
    }

    function onDropEnd(event: SortableEvent) {
      console.log("old value", value, "new value", newValue);
      dispatch('valueChange', { id, value: newValue });
    }

    function reorderArrayItem(array: [any], oldIndex: number, newIndex: number) {
      const newArray = [...array]; // Create a shallow copy of the array
      const [movedItem] = newArray.splice(oldIndex, 1); // Remove the item from old position
      newArray.splice(newIndex, 0, movedItem); // Insert the item at new position
      return newArray;
    }
  });

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

</script>

<ol bind:this={listElement} class={listStyleClass}>
  {#each children as action (action.uuid)}
    <li class:selected={$selectedActionID == action.uuid} class:obscured={action.obscured} class:draggable={!action.pinned} class="scale-from-left" in:scale={{ duration: 400, start: 0.25, opacity: 1 }} id={`${action.uuid}`}>
      {#if action.pinned}
        <span class="pin"><svg xmlns="http://www.w3.org/2000/svg" height="16" width="10" viewBox="0 0 320 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M16 144a144 144 0 1 1 288 0A144 144 0 1 1 16 144zM160 80c8.8 0 16-7.2 16-16s-7.2-16-16-16c-53 0-96 43-96 96c0 8.8 7.2 16 16 16s16-7.2 16-16c0-35.3 28.7-64 64-64zM128 480V317.1c10.4 1.9 21.1 2.9 32 2.9s21.6-1 32-2.9V480c0 17.7-14.3 32-32 32s-32-14.3-32-32z"/></svg></span>
      {/if}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <span class="drag-handle" on:click={e => handleItemClick(e, action.uuid)}></span>
      <ActionItem {action} depth = {depth+1} />
    </li>
  {/each}
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

  .pin {
    position: absolute;
    left: 2px;
    transform: translateY(-30%);
    z-index: 1;
  }

  li.draggable {
    cursor: grab;
  }

  .obscured {
    opacity: 0.5;
  }

  .scale-from-left {
    transform-origin: left center; /* Scale from the left */
  }

</style>