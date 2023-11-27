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
  import { selectedActionID } from '../../stores/dataStore';
  import PathWidget from './PathWidget.svelte';
  import { onMount } from 'svelte';

  export let action: Action | null;
  export let depth = 0;
  export let isOpen = false;

onMount(() => {
    if(action && action.category === 'top-level-list') {
        isOpen = true;
    }
  });

  function toggle() {
      isOpen = !isOpen;
  }

  function handleUpdate(updatedParams: any) {
    // console.log("updated params in handleUpdate:", updatedParams);
    actionStore.update(store => {
        if(action) { action.params = updatedParams; }
        //   console.log("updated params after save to store:", updatedParams);
        return store;
    });
  }

  function getActionThumbnail() {
    return "";
  }

//   $: console.log('Action in ActionItem:', action);
</script>

{#if action}
    <!-- <div class:selected={$selectedActionID === action.uuid}> -->
        {#if action.type === 'list' && Array.isArray(action.children) && action.children.length > 0}
            {action.name}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <span class="toggle-arrow" on:click={toggle}> {isOpen ? '▼' : '▶'}</span>
            {#if isOpen}
                <ActionList children={action.children} depth={depth} on:reorder />
            {/if}
        {:else if action.type === 'list' && action.params && Array.isArray(action.params.children) && action.params.children.length > 0}
            {action.dropdownName} along<PathWidget points={action.params.path} on:valueChange={handleUpdate}/>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <span class="toggle-arrow" on:click={toggle}> {isOpen ? '▼' : '▶'}</span>
            {#if isOpen}
                <ActionList children={action.params.children} depth={depth} on:reorder />
            {/if}
        {:else if action.category === 'backgrounds'}
            <Background name={action.effect} params={action.params} onUpdate={handleUpdate}/>
        {:else if action.category === 'shapes'}
            <Shape name={action.effect} params={action.params} onUpdate={handleUpdate}/>
        {:else if action.category === 'effects'}
            <Eggbeater name={action.effect} params={action.params} onUpdate={handleUpdate} />
        {:else if action.category === 'patterns'}
            <Tiling name={action.effect} params={action.params} onUpdate={handleUpdate} />
        {:else if action.category === 'stencils'}
            <Stencil name={action.effect} params={action.params} onUpdate={handleUpdate} />
        {:else if action.category === 'brushes'}
            <Brush name={action.effect} params={action.params} onUpdate={handleUpdate} />
        {/if}
    <!-- </div> -->
{/if}

<style>
    .selected {
        border: 2px solid gold;
        background-color: lightyellow;
        border-radius: 5px;
        padding-left: 5px;
        /* transform: scale(1.2);
        transform-origin: left center; */
        /* z-index: 1; */
        /* transition: transform 1s ease; */
   }

    .toggle-arrow {
        font-size: 0.8em;
    }

  /* .action-single-item {
    display: flex;
    align-items: center;
    justify-content: center;
  } */
</style>

