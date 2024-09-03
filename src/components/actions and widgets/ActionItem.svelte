<script lang="ts">
  import type { Action } from '../../types/types';
  import Background from './effects/Background.svelte';
  import Eggbeater from './effects/Eggbeater.svelte';
  import Tiling from './effects/Tiling.svelte';
  import Stencil from './effects/Stencil.svelte';
  import Brush from './effects/Brush.svelte';
  import ControlStructure from './effects/ControlStructure.svelte';
  import Shape from './effects/Shape.svelte';
  import Movement from './effects/Movement.svelte';
  import { stagedActionID } from '../../stores/dataStore';
  import { onMount, createEventDispatcher } from 'svelte';
  import { updateActionParams, selectAction, actionToEffect } from '../action-utils';
  import { saveToHistory } from '../../stores/history';

  export let action: Action | null;
  export let depth = 0;
  let isOpen = false;

  let animate = false;

  const dispatch = createEventDispatcher();

  onMount(() => {
    if(action && action.name === 'do each') { //expand do each by default
        isOpen = true;
    } 
    // else if(action && action.uuid === $stagedActionID) {
    //   isOpen = true;
    // }
    else {
        isOpen = false;
    }
  });

  // function toggle() {
  //     isOpen = !isOpen;
  // }

  // on added, params are { children: [...] }
  // on removed, params are { children: [...] }

  // callback passed to child components to update the action store
  // potentially could be a dispatch passed along instead
  // valueChange -> handleValueChange -> calls onUpdate, each component knows how to do this
  function handleUpdate(updatedParams: any, save: boolean = false) {
    if(action) {
      updateActionParams(action.uuid, updatedParams, save);
      // console.log("updating params", action.uuid, updatedParams);
    }
  }

  function handleSaveChange(event: CustomEvent) {
    const { description } = event.detail;
    saveToHistory(description);
  }

  function getActionThumbnail() {
    return "";
  }

//   function handleListClick(event: Event, actionId: string) {
//     console.log("list clicked", actionId);
//   }

  // handles click on any part of item except the drag handle
  function handleItemClick(event: Event, actionId: string) {
    // event.stopPropagation();
    // const target = event.target as Element;
    // if($selectedCodeEffect == "point" || !$selectedCodeEffect) {
    //     if(target && target.classList.contains('drag-handle') || target.classList.contains('action-item-content') || target === event.currentTarget) { //if not a widget, select the action
    //     selectAction(actionId);
    //   }
    // }
    // else {
    //   dispatch('codeEffect', { actionId, codeEffect: $selectedCodeEffect });
    // }
  }

  function handleItemMouseover(event: Event, actionId: string) {
    // console.log("mouse over item id", action.uuid);
    // event.stopPropagation();
    // wiggleAction(action.uuid);
  }

</script>

  {#if action}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <span
    class:staged={$stagedActionID === action.uuid}
    class="action-item-outer"
    >

      {#if action.category === 'control'}
        <ControlStructure name={action.name} params={action.params} {isOpen} onUpdate={handleUpdate} depth={depth+1} on:saveChange={handleSaveChange}/>
      {:else if action.type === 'effect'}
        <div class="action-item-inner">
        {#if action.category !== 'shapes'}
        <img class="category-img" src="/assets/icons/{action.category}.svg" alt="{action.category}">
        
        {/if}

        {#if action.category === 'shapes' || action.effect === 'straight line'}
          <Shape uuid={action.uuid} name={action.effect} params={action.params} onUpdate={handleUpdate} on:saveChange />
          {:else if action.category === 'backgrounds'}
              <Background name={action.effect} params={action.params} onUpdate={handleUpdate} on:saveChange />
          {:else if action.category === 'effects'}
              <Eggbeater name={action.effect} params={action.params} onUpdate={handleUpdate} on:saveChange/>
          {:else if action.category === 'patterns'}
              <Tiling name={action.effect} params={action.params} onUpdate={handleUpdate} on:saveChange />
          {:else if action.category === 'stencils'}
              <Stencil name={action.effect} params={action.params} onUpdate={handleUpdate} on:saveChange />
          {:else if action.category === 'brushes'}
              <Brush name={action.effect} params={action.params} onUpdate={handleUpdate} on:saveChange />
          {:else if action.category === 'move'}
              <Movement name={action.effect} params={action.params} onUpdate={handleUpdate} on:saveChange />
          {/if}
        </div>
        {/if}
    </span>
  {/if}
<style>

  .staged {
    padding: 0 10px;
  }

  .category-img {
    width: 1em;
    height: 1em;
    filter: invert(.3);
  }

  .action-item-outer {
    display: block;
    /* display: flex-wrap;
    flex-direction: row; */
  }

  .action-item-inner {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 0 0.5em;
    justify-content: flex-start;
    align-items: center;
    /* margin: 0.5em 0; */
  }

</style>

