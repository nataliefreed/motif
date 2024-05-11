<script lang="ts">
  
  import type { SortableEvent } from 'sortablejs';
  import Sortable from 'sortablejs';
  import { onMount, createEventDispatcher } from 'svelte';
  import { selectedActionID, activeIDs, flatActionStore, stagedActionID, currentColor, changedActionID, hoveredActionID } from '../../stores/dataStore';
  import ActionItem from './ActionItem.svelte';
  import { scale, fade, fly } from 'svelte/transition';
  import { deepCopy } from '../../utils/utils';
  import { selectAction, hoverAction, copyStagedActionToActionStore } from '../action-utils';
  import tinycolor from 'tinycolor2';
  import { v4 as uuidv4 } from 'uuid';
    import PathWidget from './PathWidget.svelte';

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

    //called when dragging element changes position
    // function onChange(event: SortableEvent) {
    //   let uuid = event.item.id;
    //   console.log(uuid, $stagedActionID);
    //   if(uuid === $stagedActionID) {
    //     // debugger;
    //     if(event.to === event.from) { //still in same list
    //       console.log("staged action is changing position from " + event.oldIndex + " to " + event.newIndex);
    //       let newValue = reorderItems(value, event.oldIndex, event.newIndex);
    //       console.log("new value", newValue);
    //       dispatch('valueChange', { id, value: newValue });
    //     }
    //   }
    // }

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
      // console.log("reordered", newValue);
    }

    function reorderItems(array:string[], oldIndex:number, newIndex:number) {
      const newArray = deepCopy(array);
      const [movedItem] = newArray.splice(oldIndex, 1); // Remove the item from old position
      newArray.splice(newIndex, 0, movedItem); // Insert the item at new position
      return newArray;
    }
  });

  // handles clicking on the drag handle only
  function handleItemClick(event: Event, actionId: string) {
    event.stopPropagation();
    const target = event.target as Element;
    if(target && target.classList.contains('drag-handle') || target.classList.contains('action-item-content') || target === event.currentTarget) { //if not a widget, select the action
        //   console.log("selecting");
      selectAction(actionId);
    }
    // else {
    //   dispatch('codeEffect', { actionId, codeEffect: $selectedCodeEffect });
    // }
  }

  function handleItemMouseover(event: MouseEvent, actionId: string) {
    event.stopPropagation();
      const target = event.target as Element;
      // if(actionId === $stagedActionID) {
      //   hoverAction(actionId);
      // }
      const offsetX = event.offsetX; //mouse relative to target
      // if(target && !target.classList.contains('addStagedActionButton') && target.classList.contains('drag-handle') || target.classList.contains('action-item-content') || target === event.currentTarget) { //if not a widget, set the action as hovered
        if(target && (target.classList.contains('drag-handle') || (offsetX <= 50 && target.classList.contains('action-item-content')))) { //if over drag handle, set the action as hovered
        hoverAction(actionId);
      }
  }

  function handleItemMouseLeave(event: Event, actionId: string) {
    // event.stopPropagation();
    // console.log("mouse out li of action id", actionId);
      hoverAction('');
      // console.log("staged action is no longer hovered");
  }


  function handleAddButton(event: Event) {
    copyStagedActionToActionStore();
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


  /* to use, add this to li: style={getDynamicStyle(action.uuid)} */

  // class:playhead={$playheadID === action.uuid}

  // class:lastChanged={$changedActionID === action.uuid}

// out:scale={{ duration: $stagedActionID === action.uuid? 1000 : 500, start: 0.25, opacity: 1 }}

  // {#if action.pinned}
  //       <span class="pin"><svg xmlns="http://www.w3.org/2000/svg" height="16" width="10" viewBox="0 0 320 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M16 144a144 144 0 1 1 288 0A144 144 0 1 1 16 144zM160 80c8.8 0 16-7.2 16-16s-7.2-16-16-16c-53 0-96 43-96 96c0 8.8 7.2 16 16 16s16-7.2 16-16c0-35.3 28.7-64 64-64zM128 480V317.1c10.4 1.9 21.1 2.9 32 2.9s21.6-1 32-2.9V480c0 17.7-14.3 32-32 32s-32-14.3-32-32z"/></svg></span>
  //     {/if}

  // <!-- <span class="paintbrush"> -->
  //         <!-- style={getPaintbrushColor(action.uuid)} -->
          
  //       <!-- </span> -->
  //       <!-- <PathWidget id={action.uuid} path={action.params.path} /> -->
  //     {:else}
  // <svg bind:this={stagedIcon} xmlns="http://www.w3.org/2000/svg" height="10" width="10" viewBox="0 0 576 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M339.3 367.1c27.3-3.9 51.9-19.4 67.2-42.9L568.2 74.1c12.6-19.5 9.4-45.3-7.6-61.2S517.7-4.4 499.1 9.6L262.4 187.2c-24 18-38.2 46.1-38.4 76.1L339.3 367.1zm-19.6 25.4l-116-104.4C143.9 290.3 96 339.6 96 400c0 3.9 .2 7.8 .6 11.6C98.4 429.1 86.4 448 68.8 448H64c-17.7 0-32 14.3-32 32s14.3 32 32 32H208c61.9 0 112-50.1 112-112c0-2.5-.1-5-.2-7.5z"/></svg>

  // {#if $stagedActionID === action.uuid && $hoveredActionID === action.uuid}
  //       <svg class=addStagedActionButton on:click={e => handleAddButton(e)} xmlns="http://www.w3.org/2000/svg" height="25" width="25" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M32 448c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c53 0 96-43 96-96l0-306.7 73.4 73.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 109.3 160 416c0 17.7-14.3 32-32 32l-96 0z"/></svg>
  // {/if}

}

</script>

<!-- <div>{$changedActionID.substr(0, 6)}</div> -->
<ol bind:this={listElement} class={listStyleClass} class:staged={$stagedActionID === id}>
  {#each children.map(checkAction) as action (action.uuid)}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <li
      class:selected={$selectedActionID === action.uuid}
      class:staged={$stagedActionID === action.uuid}
      class:obscured={action.obscured}
      class:hidden={action.hidden}
      class:draggable={!action.pinned}
      class:inactive={!$activeIDs.includes(action.uuid)}
      class:hovered={$hoveredActionID === action.uuid}
      class="action-list-item scale-from-left"
      on:mouseover={e => handleItemMouseover(e, action.uuid)}
      on:click={e => handleItemClick(e, action.uuid)}
      on:mouseleave={e => handleItemMouseLeave(e, action.uuid)}
      in:scale={{ duration: $stagedActionID === action.uuid? 1000 : 500, start: 0.25, opacity: 1 }}
      id={`${action.uuid}`}
    >
      {#if $stagedActionID !== action.uuid}
        <span class="drag-handle"></span>
      {/if}
      <ActionItem {action} {depth} />
      <!-- _ _{action.uuid.substr(0, 6)} -->
    </li>
  {/each}
</ol>

<style>
  /* .sortable-selected {
    text-decoration: green wavy underline;
  } */

  /* list */
  ol {
    counter-reset: list-counter; /* Initialize a counter */
    list-style-type: none; /* Remove default list style */
    padding-left: 0em;
    /* margin-left: 1em; */
    overflow-y: auto;
    /* overflow-x: hidden; */
    overflow-x: auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    width: 100%;
    margin: 0;
  }

/* list item */
  li {
    border: 2px solid transparent; /* Invisible border */
    user-select: none; /* prevent text selection - makes it easier to grab */
    position: relative;
    padding-left: 2.2em; /* Space for the numbered index */
    padding-right: 4px; /* makes selection box look nicer */
  }

  .selected {
    box-sizing: border-box; /* Include padding and border in element's width and height */
    border: 2px solid gold;
    background-color: lightyellow;
    border-radius: 5px;
    /* display: block; */
  }

  .hovered {
    background-color: #f0f0f0;
  }

  .hovered.selected {
    background-color: #fafaa9;
  }

  .hovered.staged {
    background-color: #ffffff;
  }

  .fixed {
    position: fixed;
  }

  .staged {
    display: flex;
    align-items: center;
    box-sizing: border-box; /* Include padding and border in element's width and height */
    border: 1px solid #e2e2e2;
    border-radius: 10px;
    box-shadow: rgba(17, 17, 26, 0.1) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 8px 24px, rgba(17, 17, 26, 0.1) 0px 16px 48px;
    /* border: none; */
    color: #2c2c2c;
    opacity: 1;
    font-style: normal;
    z-index: 0;
    margin: 1em 5px 0.7em 10px;
    padding: 1em;
    /* padding-left: 3em;  */
    /* indent a little extra for paintbrush which is larger than index */
    background-color: #ffffff;
    z-index: 1;
  }


  .staged::after {
    /* content: "";
    position: absolute; */
    /* left: 3em; */
    /* blank area at start for paintbrush */
    /* top: 0.5em;
    right: 0.5em;
    bottom: 0.5em;
    background:
      repeating-linear-gradient(
          -45deg,
          rgba(238, 238, 238),
          rgba(238, 238, 238) 10px,
          rgba(216, 216, 216) 10px,
          rgba(216, 216, 216) 20px
        );    
    border-radius: 4px;
    z-index: -1; */
  }

  .hovered.staged::after {
    background-color: #ffffff;
    /* background:
      repeating-linear-gradient(
          -45deg,
          rgba(223, 223, 223),
          rgb(223, 223, 223) 10px,
          rgb(202, 202, 202) 10px,
          rgba(202, 202, 202) 20px
        );     */
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
  .drag-handle {
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

  /* .paintbrush { */
    /* position: absolute; */
    /* left: 0; */
    /* background-color: white; */
    /* transform: translate(10%, 10%); */
  /* } */

  .alpha-style li::before {
    content: counter(list-counter, lower-alpha); /* Alpha numbering */
  }

  .lastChanged::after {
    float: left;
    content: '👉';
  }

  /* .playhead::after {
    float: left;
    content: '👉';
  } */

  li.staged::before { /* hide the index for the staged item */
    border: none;
    border-radius: 0;
    counter-increment: none;
    content: '';
    background-color: transparent;
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

  .hidden {
    display: none;
  }

  .scale-from-left {
    transform-origin: left center; /* Scale from the left */
  }

  .inactive {
    /* opacity: 0.5; */
    color: rgba(0, 0, 0, 0.5);
    font-style: italic;
  }

  .addStagedActionButton {
    /* background-color: #f0f0f0; */
    /* border: 1px solid #ccc; */
    border-radius: 4px;
    width: 1.5em;
    height: 1.5em;
    padding: 4px;
    cursor: pointer;
    margin-left: 0.5em;
    /* transform: translate(-10%, 10%); */
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    /* box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset; */
}

.addStagedActionButton:hover {
    background-color: #e0e0e0;
    /* box-shadow: 0 4px 6px rgba(0,0,0,0.15); */
}

.addStagedActionButton:active {
    background-color: #d0d0d0;
    /* box-shadow: 0 1px 2px rgba(0,0,0,0.1); */
}
</style>