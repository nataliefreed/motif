<script lang="ts">
  import type { Action } from '../../types/types';
  import ActionList from './ActionList.svelte';
  import Background from './effects/Background.svelte';
  import Eggbeater from './effects/Eggbeater.svelte';
  import Tiling from './effects/Tiling.svelte';
  import Stencil from './effects/Stencil.svelte';
  import Brush from './effects/Brush.svelte';
  import ControlStructure from './effects/ControlStructure.svelte';
  import NamedList from './effects/NamedList.svelte';
  import Shape from './effects/Shape.svelte';
  import { selectedActionID, selectedCodeEffect, changedActionID, flatActionStore } from '../../stores/dataStore';
  import PathWidget from './PathWidget.svelte';
  import { onMount, createEventDispatcher } from 'svelte';

  export let action: Action | null;
  export let depth = 0;
  export let isOpen = false;

  const dispatch = createEventDispatcher();

  onMount(() => {
    if(action && action.category === 'top-level-list') { //expand main list by default
        isOpen = true;
    }
  });

  function toggle() {
      isOpen = !isOpen;
  }


  // handle all updates to action store
  // receive UUID, param name, and new value
  // find that UUID in the (nested) action store
  // update the param value without mutating the store directly
  // send update to the store


  // send param changes to the action store
  function handleUpdate(updatedParams: any) {
    console.log("updating params", updatedParams);
    flatActionStore.update(store => {
      if(!action) return store;
        const actionInStore = store[action.uuid];
        if(actionInStore) {
          return { ...store, [action.uuid]: { ...actionInStore, params: updatedParams } }; //update the action in the store
        }
        else {
            console.log("Action not found in store");
            return store;
        }
    });
    // console.log("parameter update");
    // if(action) {
    //     action.params = updatedParams;
    //     if($actionStore.children) {
    //         const actionInStore = $actionStore.children.some(a => a.uuid === action.uuid);
    //         if(actionInStore) {
    //             changedActionID.set(action.uuid); // log which action was changed
    //             actionStore.update(store => { return store }); //notify Svelte that store has changed
    //         }
    //         else {
    //             console.log("Action not found in store");
    //         }
    //     }
    // }
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

//   $: console.log('Action in ActionItem:', action);
</script>


{#if action}
    {#if action.category === 'control'}
        <ControlStructure name={action.name} params={action.params} onUpdate={handleUpdate} on:reorder/>
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

    .toggle-arrow {
        font-size: 0.8em;
    }

  /* .action-single-item {
    display: flex;
    align-items: center;
    justify-content: center;
  } */
</style>

