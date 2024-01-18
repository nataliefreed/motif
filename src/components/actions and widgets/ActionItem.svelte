<script lang="ts">
  import type { Action } from '../../types/types';
  import Background from './effects/Background.svelte';
  import Eggbeater from './effects/Eggbeater.svelte';
  import Tiling from './effects/Tiling.svelte';
  import Stencil from './effects/Stencil.svelte';
  import Brush from './effects/Brush.svelte';
  import ControlStructure from './effects/ControlStructure.svelte';
  import Shape from './effects/Shape.svelte';
  import { selectedActionID, selectedCodeEffect, changedActionID, flatActionStore } from '../../stores/dataStore';
  import { onMount, createEventDispatcher } from 'svelte';
  import { deepCopy } from '../../utils/utils';

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

  // send param changes to the action store
  function handleUpdate(updatedParams: any) {
    // console.log("updating params", updatedParams);
    flatActionStore.update(store => {
      if(!action) return store;
        const actionInStore = store[action.uuid];
        if(actionInStore) {
          let updatedAction = { ...deepCopy(actionInStore), params: updatedParams };
          changedActionID.set(action.uuid); // log which action was changed
          // console.log("updated action in store", actionInStore);

          // console.log("updated params", updatedParams);
          // if more issues with order of add and remove, can add a condition here

          return { ...store, [action.uuid]: updatedAction }; //update the action in the store
        }
        else {
            console.log("Action not found in store");
            return store;
        }
    });
  }

  function getActionThumbnail() {
    return "";
  }

//   function handleListClick(event: Event, actionId: string) {
//     console.log("list clicked", actionId);
//   }

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

  {#if action}
      {#if action.category === 'control'}
          <ControlStructure name={action.name} params={action.params} onUpdate={handleUpdate} depth={depth+1} on:reorder/>
      {:else if action.type === 'effect'}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <span class="action-item-content" on:click={e => handleItemClick(e, action.uuid)}>
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
              {/if}
          </span>
      {/if}
  {/if}


<style>
  /* .action-single-item {
    display: flex;
    align-items: center;
    justify-content: center;
  } */
</style>

