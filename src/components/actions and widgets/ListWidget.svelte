<script lang="ts">
  
  import type { SortableEvent } from 'sortablejs';
  import Sortable from 'sortablejs';
  import { onMount, createEventDispatcher } from 'svelte';
  import { selectedActionID, selectedCodeEffect, flatActionStore, stagedActionID, currentColor } from '../../stores/dataStore';
  import ActionItem from './ActionItem.svelte';
  import { scale, fade } from 'svelte/transition';
  import { deepCopy } from '../../utils/utils';
  import { selectAction } from '../action-utils';
  import tinycolor from 'tinycolor2';
  import { v4 as uuidv4 } from 'uuid';

  export let id = '';
  export let value: string[] = [];
  let children: any[] = [];
  let listElement: HTMLElement;
  export let depth = 0;
  
  let stagedIcon: SVGElement;

  // get the child actions from their uuids
  $: children = value.map(uuid => $flatActionStore[uuid]);
  // $: newValue = value;

  // $: if (stagedIcon) {
  //   stagedIcon.style.fill = $currentColor;
  // }

  const dispatch = createEventDispatcher();

  $: listStyleClass = depth % 2 === 0 ? 'alpha-style' : 'decimal-style';

  onMount(() => {
    const sortable = new Sortable(listElement, {
      group: '.alltheitems',
      onUpdate: onReorder,
      onAdd: onAdd,
      onRemove: onRemove,
      // onEnd: onDropEnd,
      animation: 150,
      filter: '.filtered',
      draggable: '.draggable'
    });
  
    console.log("depth", depth);
    console.log("list style class", listStyleClass);

    function onAdd(event: SortableEvent) {
      const newIndex = event.newIndex;

      console.log("adding at index", newIndex);
      if(newIndex === undefined) return;
      // update children
      let uuid = event.item.id;
      // console.log("adding", uuid);
      let newArray = [...value];
      newArray.splice(newIndex, 0, uuid);
      dispatch('valueChange', { id, value: newArray });
    }

    function onRemove(event: SortableEvent) {
      let newValue = value.filter(uuid => uuid !== event.item.id);
      // update children
      // console.log("removing", event.item.id);
      dispatch('valueChange', { id, value: newValue });
    }

    function onReorder(event: SortableEvent) {
      if(event.to !== event.from) return; // make sure we are still in the same list
      const oldIndex = event.oldIndex;
      const newIndex = event.newIndex;
      if (oldIndex === newIndex) return;
      // console.log("reordering", oldIndex, newIndex);

      let newValue = reorderItems(value, oldIndex, newIndex);
      dispatch('valueChange', { id, value: newValue });
    }

    function reorderItems(array:string[], oldIndex:number, newIndex:number) {
      const newArray = deepCopy(array);
      const [movedItem] = newArray.splice(oldIndex, 1); // Remove the item from old position
      newArray.splice(newIndex, 0, movedItem); // Insert the item at new position
      return newArray;
    }

    // function onDropEnd(event: SortableEvent) {
    //   console.log("old value", value, "new value", newValue);
    //   dispatch('valueChange', { id, value: newValue });
    // }

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
          console.log("selecting");
        selectAction(actionId);
      }
    }
    else {
      dispatch('codeEffect', { actionId, codeEffect: $selectedCodeEffect });
    }
  }

  function checkAction(action) {
    if (!action) {
      // console.error("Action not found");
      // Return a default action object to prevent the app from breaking
      return { uuid: 'not-found' + uuidv4(), params: { /* default params */ } };
    }
    return action;
  }

  // not yet working
  function getInAnimation(id:string) {
    if ($stagedActionID === id) {
      return {
          animation: fade,
          params: { duration: 400, start: 0.25, opacity: 1 } // customize as needed
      };
    } else {
      return {
        animation: scale,
          params: { duration: 400, start: 0.25, opacity: 1 } // customize as needed
      };
  }
}

// function getDynamicStyle(id:string) {
//   if ($stagedActionID === id) {
//     if($flatActionStore[id]) {
//       if($flatActionStore[id].params && $flatActionStore[id].params.color) {
//         const foreground = tinycolor($flatActionStore[id].params.color);
//         const background = tinycolor(foreground);
//         if(foreground.getLuminance() > 0.5) {
//           foreground.darken(20);
//         }

//         let textColor = foreground.toRgbString();
//         let backgroundColor = background.setAlpha(0.1).toRgbString();
        
//         return `color: ${textColor}; background-color: ${backgroundColor}; border-color: ${textColor};`;
//         // return `color: ${textColor}; border-color: ${textColor};`;
//       }
//     }
//   } else {
//     return '';
//   }
// }

function getPaintbrushColor(id:string) {
  if ($flatActionStore[id].params && $flatActionStore[id].params.color) {
    let color = tinycolor($flatActionStore[id].params.color).toRgbString();
    let outline = tinycolor(color).darken(10).toRgbString();
    return `fill: ${color}; stroke: ${outline};`;
  }
}

function getDynamicStyle(id:string) {
  if ($stagedActionID === id) {
    if ($flatActionStore[id]) {
      if ($flatActionStore[id].params && $flatActionStore[id].params.color) {
        const originalColor = tinycolor($flatActionStore[id].params.color);

        // Create new instances for manipulation
        const foreground = tinycolor(originalColor.toString()); 
        const background = tinycolor(originalColor.toString());

        if (foreground.getLuminance() > 0.3) {
          foreground.darken(20);
        }

        let textColor = foreground.toRgbString();
        // let baseColor = tinycolor(background.toString()).setAlpha(0.1).toRgbString();
        // let stripeColor = tinycolor(background.toString()).darken(10).setAlpha(0.2).toRgbString();

        let baseColor = tinycolor('#555555').setAlpha(0.1).toRgbString();
        let stripeColor = tinycolor(baseColor.toString()).darken(10).setAlpha(0.2).toRgbString();

        let stripedBackground = `repeating-linear-gradient(
          -45deg,
          ${baseColor},
          ${baseColor} 10px,
          ${stripeColor} 10px,
          ${stripeColor} 20px
        )`;

        // return `color: ${textColor}; background: ${stripedBackground}; border-color: ${textColor};`;
        return `background: ${stripedBackground}; border-color: ${textColor};`;
      }
    }
  } else {
    return '';
  }
}


</script>

<ol bind:this={listElement} class={listStyleClass}>
  {#each children.map(checkAction) as action (action.uuid)}
    <li
      class:selected={$selectedActionID === action.uuid}
      class:staged={$stagedActionID === action.uuid}
      style={getDynamicStyle(action.uuid)}
      class:obscured={action.obscured}
      class:draggable={!action.pinned}
      class="scale-from-left"
      in:scale={{ duration: $stagedActionID === action.uuid? 1000 : 500, start: 0.25, opacity: 1 }}
      id={`${action.uuid}`}
    >
      {#if action.pinned}
        <span class="pin"><svg xmlns="http://www.w3.org/2000/svg" height="16" width="10" viewBox="0 0 320 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M16 144a144 144 0 1 1 288 0A144 144 0 1 1 16 144zM160 80c8.8 0 16-7.2 16-16s-7.2-16-16-16c-53 0-96 43-96 96c0 8.8 7.2 16 16 16s16-7.2 16-16c0-35.3 28.7-64 64-64zM128 480V317.1c10.4 1.9 21.1 2.9 32 2.9s21.6-1 32-2.9V480c0 17.7-14.3 32-32 32s-32-14.3-32-32z"/></svg></span>
      {/if}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      {#if $stagedActionID === action.uuid}
        <span class="paintbrush" style={getPaintbrushColor(action.uuid)}>
          <svg bind:this={stagedIcon} xmlns="http://www.w3.org/2000/svg" height="16" width="18" viewBox="0 0 576 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M339.3 367.1c27.3-3.9 51.9-19.4 67.2-42.9L568.2 74.1c12.6-19.5 9.4-45.3-7.6-61.2S517.7-4.4 499.1 9.6L262.4 187.2c-24 18-38.2 46.1-38.4 76.1L339.3 367.1zm-19.6 25.4l-116-104.4C143.9 290.3 96 339.6 96 400c0 3.9 .2 7.8 .6 11.6C98.4 429.1 86.4 448 68.8 448H64c-17.7 0-32 14.3-32 32s14.3 32 32 32H208c61.9 0 112-50.1 112-112c0-2.5-.1-5-.2-7.5z"/></svg>
        </span>
      {:else}
        <span class="drag-handle" on:click={e => handleItemClick(e, action.uuid)}>
        </span>
      {/if}
      <ActionItem {action} {depth} />
    </li>
  {/each}
</ol>

<style>
  /* .sortable-selected {
    text-decoration: green wavy underline;
  } */

  ol {
    counter-reset: list-counter; /* Initialize a counter */
    list-style-type: none; /* Remove default list style */
    padding-left: 0em;
    /* margin-left: 1em; */
    overflow-y: auto;
    /* overflow-x: hidden; */
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    width: 100%;
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

  .staged {
    box-sizing: border-box; /* Include padding and border in element's width and height */
    border: 2px solid #757575;
    background-color: white;
    background-color: #f6f6f6;
    border-radius: 0;
    /* border-style: dashed none dashed none; */
    border: none;
    color: #757575;
    /* width: calc(var(--adjusted-page-width)*0.95); */
    background: repeating-linear-gradient(
          -45deg,
          #bbbbbb,
          #bbbbbb 10px,
          #222222 10px,
          #222222 20px
        );
  }

  li::before {
    pointer-events: none; /* prevent click events on the index */
    counter-increment: list-counter;
    content: counter(list-counter);
    color: #aeaeae;
  }

  .alpha-style li::before,
  .decimal-style li::before {
    border: 1px solid #aeaeae;
    background-color: #ffffff;
    border-radius: 50%; /* Round border */
    width: 1.8em; /* Fixed width for the circle */
    height: 1.8em; /* Fixed height for the circle */
  }
  
  .alpha-style li::before,
  .decimal-style li::before,
  .drag-handle, .paintbrush {
    position: absolute;
    display: flex;
    align-items: center; /* Center vertically */
    justify-content: center; /* Center horizontally */
    left: 0; /* Align with the start of the list item */
    top: 1.1em;
    width: 1.8em; /* Fixed width for the circle */
    height: 1.8em; /* Fixed height for the circle */
    transform: translateY(-50%);
    font-size: 0.8em;
    font-weight: bold;
    z-index: 1;
    align-self: flex-start;
    margin-left: 4px;
  }

  .alpha-style li::before {
    content: counter(list-counter, lower-alpha); /* Alpha numbering */
  }

  li.staged::before {
    border: none;
    border-radius: 0;
    counter-increment: none;
    content: '';
    background-color: transparent;
    /* background-image: url('/assets/cursors/paintbrush-solid.svg');
    background-size: contain; /* Scale the image to fit within the element */
    /* background-repeat: no-repeat;
    display: inline-block; */
  }

  .paintbrush svg {
  
    /* margin-left: -40px; */
    /* transform: translateX(-60%); */
    /* z-index: 0;
    overflow: visible; */
    /* stroke: #000000;
    stroke-width: 10px; */
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