<script lang="ts">

  import type { Action } from '../../types/types';
  import ActionItem from './ActionItem.svelte';
  import type { SortableEvent } from 'sortablejs';
  import Sortable from 'sortablejs';
  import { createEventDispatcher } from 'svelte';
  import { scale, fade } from 'svelte/transition';
  import { actionStore, selectedActionID, selectedCodeEffect } from '../../stores/dataStore';
  import { onMount, onDestroy, afterUpdate } from 'svelte';

  const dispatch = createEventDispatcher();

  export let action: Action;
  export let children: Action[] = [];
  export let depth = 0;

  let listElement: HTMLElement;
  let sortable: Sortable;

  onMount(() => {
    sortable = new Sortable(listElement, {
      group: '.alltheitems',
        onUpdate: handleReorder,
        onAdd: onAdd,
        onRemove: onRemove,
        animation: 150,
        filter: '.filtered',
        draggable: '.draggable'
    });

    function onAdd(event: SortableEvent) {
      
    }

    function onRemove(event: SortableEvent) {
      
    }

    function reorderItems(array, oldIndex, newIndex) {
      const newArray = [...array]; // Create a shallow copy of the array
      const [movedItem] = newArray.splice(oldIndex, 1); // Remove the item from old position
      newArray.splice(newIndex, 0, movedItem); // Insert the item at new position
      return newArray;
    }

    function handleReorder(event: SortableEvent) {
      if(event.to !== event.from) return; // make sure we are still in the same list
      const oldIndex = event.oldIndex;
      const newIndex = event.newIndex;
      if (oldIndex === newIndex) return;

      let uuid = event.item.id;

      actionStore.update(store => {
        if(!store.children) return store;
        if (action.category === 'top-level-list') {
            return {
                ...store,
                children: reorderItems(store.children, oldIndex, newIndex)
            };
        } else if (action.params && action.params.children) { // if in nested list
            // Find the parent action and update its children
            let parentIndex = store.children.findIndex(a => a.uuid === action.uuid); //doesn't work more than one level down
            if (parentIndex !== -1) {
                let updatedStore = {...store};
                updatedStore.children = [...store.children];
                updatedStore.children[parentIndex] = {
                    ...store.children[parentIndex],
                    params: {
                        ...store.children[parentIndex].params,
                        children: reorderItems(store.children[parentIndex].params.children, oldIndex, newIndex)
                    }
                };
                return updatedStore;
            }
        }
        return store;
      });
    }
  });

  onDestroy(() => {
    if (sortable) {
        sortable.destroy();
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

  $: listStyleClass = depth % 2 === 0 ? 'decimal-style' : 'alpha-style';

/*
anchor (instead of pin?)
<svg xmlns="http://www.w3.org/2000/svg" height="16" width="18" viewBox="0 0 576 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M320 96a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm21.1 80C367 158.8 384 129.4 384 96c0-53-43-96-96-96s-96 43-96 96c0 33.4 17 62.8 42.9 80H224c-17.7 0-32 14.3-32 32s14.3 32 32 32h32V448H208c-53 0-96-43-96-96v-6.1l7 7c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9L97 263c-9.4-9.4-24.6-9.4-33.9 0L7 319c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l7-7V352c0 88.4 71.6 160 160 160h80 80c88.4 0 160-71.6 160-160v-6.1l7 7c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-56-56c-9.4-9.4-24.6-9.4-33.9 0l-56 56c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l7-7V352c0 53-43 96-96 96H320V240h32c17.7 0 32-14.3 32-32s-14.3-32-32-32H341.1z"/></svg>

weight
<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M224 96a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm122.5 32c3.5-10 5.5-20.8 5.5-32c0-53-43-96-96-96s-96 43-96 96c0 11.2 1.9 22 5.5 32H120c-22 0-41.2 15-46.6 36.4l-72 288c-3.6 14.3-.4 29.5 8.7 41.2S33.2 512 48 512H464c14.8 0 28.7-6.8 37.8-18.5s12.3-26.8 8.7-41.2l-72-288C433.2 143 414 128 392 128H346.5z"/></svg>

balloon!


*/
</script>


<!-- <ol class={listStyleClass}> -->
  <ol bind:this={listElement} class={listStyleClass}>
    {#each children as action (action.uuid)}
      <li class:selected={$selectedActionID == action.uuid} class:obscured={action.obscured} class:draggable={!action.pinned} class="scale-from-left" in:scale={{ duration: 400, start: 0.25, opacity: 1 }} id={`${action.uuid}`}>
        {#if action.pinned}
          <span class="pin"><svg xmlns="http://www.w3.org/2000/svg" height="16" width="10" viewBox="0 0 320 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M16 144a144 144 0 1 1 288 0A144 144 0 1 1 16 144zM160 80c8.8 0 16-7.2 16-16s-7.2-16-16-16c-53 0-96 43-96 96c0 8.8 7.2 16 16 16s16-7.2 16-16c0-35.3 28.7-64 64-64zM128 480V317.1c10.4 1.9 21.1 2.9 32 2.9s21.6-1 32-2.9V480c0 17.7-14.3 32-32 32s-32-14.3-32-32z"/></svg></span>
        {/if}
        <span class="drag-handle" on:click={e => handleItemClick(e, action.uuid)}></span>
        <ActionItem {action} depth = {depth+1} />
      </li>
    {/each}
  </ol>
<!-- </ol> -->



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

  