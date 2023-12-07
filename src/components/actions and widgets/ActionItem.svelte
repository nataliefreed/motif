<script lang="ts">
  import type { Action } from '../../types/types';
  import ActionList from './ActionList.svelte';
  import Background from './effects/Background.svelte';
  import Eggbeater from './effects/Eggbeater.svelte';
  import Tiling from './effects/Tiling.svelte';
  import Stencil from './effects/Stencil.svelte';
  import Brush from './effects/Brush.svelte';
  import { actionStore } from '../../stores/dataStore';
  import Shape from './effects/Shape.svelte';
  import { selectedActionID, selectedCodeEffect, changedActionID } from '../../stores/dataStore';
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

  function handleUpdate(updatedParams: any) {
    // console.log("parameter update");
    if(action) {
        action.params = updatedParams;
        if($actionStore.children) {
            const actionInStore = $actionStore.children.some(a => a.uuid === action.uuid);
            if(actionInStore) {
                changedActionID.set(action.uuid); // log which action was changed
                actionStore.update(store => { return store }); //notify Svelte that store has changed
            }
            // else {
            //     console.log("Action not found in store");
            // }
        }
    }
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
    <!-- {action.uuid} debugging -->
    {#if action.type === 'list' && Array.isArray(action.children) && action.children.length > 0}
        {action.name}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span class="toggle-arrow" on:click={toggle}> {isOpen ? '▼' : '▶'}</span>
        {#if isOpen}
            <ActionList children={action.children} depth={depth} on:reorder />
        {/if}
    {:else if action.type === 'list' && action.params && Array.isArray(action.params.children) && action.params.children.length > 0}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span class="action-list-heading" on:click={e => handleItemClick(e, action.uuid)}>
            {action.dropdownName} along<PathWidget points={action.params.path} on:valueChange={handleUpdate}/>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <span class="toggle-arrow" on:click={toggle}> {isOpen ? '▼' : '▶'}</span>
        </span>
            {#if isOpen}
                <ActionList children={action.params.children} depth={depth} on:reorder/>
            {/if}
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
            <!-- {#if action.thumbnail}
                <img src={action.thumbnail} alt="thumbnail" width="50" height="50"/>
            {/if} -->
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

