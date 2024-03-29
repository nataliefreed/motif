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
  import { selectedActionID, selectedCodeEffect, changedActionID, flatActionStore, stagedActionID } from '../../stores/dataStore';
  import { onMount, createEventDispatcher } from 'svelte';
  import { deepCopy } from '../../utils/utils';
  import { updateActionParams, selectAction } from '../action-utils';

  export let action: Action | null;
  export let depth = 0;
  export let isOpen = false;

  let animate = false;

  const dispatch = createEventDispatcher();

  onMount(() => {
    if(action && action.category === 'top-level-list') { //expand main list by default
        isOpen = true;
    }
  });

  function toggle() {
      isOpen = !isOpen;
  }

  // on added, params are { children: [...] }
  // on removed, params are { children: [...] }

  // parameter updates bubble up to here
  // sends param changes to the action store
  function handleUpdate(updatedParams: any, save: boolean = false) {
    if(action) {
      updateActionParams(action.uuid, updatedParams, save);
      // console.log("updating params", updatedParams);
    }
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
    class="action-item-content"
    on:click={e => handleItemClick(e, action.uuid)}
    on:mouseover={e => handleItemMouseover(e, action.uuid)}
    >
      {#if action.category === 'control'}
          <ControlStructure name={action.name} params={action.params} onUpdate={handleUpdate} depth={depth+1} on:reorder/>
      {:else if action.type === 'effect'}
          {#if action.category === 'backgrounds'}
              <Background name={action.effect} params={action.params} onUpdate={handleUpdate} on:reorder/>
          {:else if action.category === 'shapes'}
              <Shape name={action.effect} params={action.params} onUpdate={handleUpdate} on:reorder/>
          {:else if action.category === 'effects'}
              <Eggbeater name={action.effect} params={action.params} onUpdate={handleUpdate} on:reorder/>
          {:else if action.category === 'patterns'}
              <Tiling name={action.effect} params={action.params} onUpdate={handleUpdate} on:reorder/>
          {:else if action.category === 'stencils'}
              <Stencil name={action.effect} params={action.params} onUpdate={handleUpdate} on:reorder/>
          {:else if action.category === 'brushes'}
              <Brush name={action.effect} params={action.params} onUpdate={handleUpdate} on:reorder/>
          {:else if action.category === 'move'}
              <Movement name={action.effect} params={action.params} onUpdate={handleUpdate} on:reorder/>
          {/if}
      {/if}
    </span>
  {/if}
<style>
  /* .action-single-item {
    display: flex;
    align-items: center;
    justify-content: center;
  } */

  .staged {
    padding: 0 10px;
  }
</style>

