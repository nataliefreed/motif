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

  export let action: Action | null;
  export let depth = 0;
  export let selectedLine: number | null = null;
  let isOpen = true;

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

//   $: console.log('Action in ActionItem:', action);


</script>

{#if selectedLine}
    <span class="line-number">{selectedLine}</span>
{/if}

<div>
    {#if action}
        {#if action.category === 'backgrounds'}
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

        {:else if action.type === 'list' && Array.isArray(action.children) && action.children.length > 0}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <span on:click={toggle}>{action.name} {isOpen ? '▼' : '▶'}</span>
            {#if isOpen}
                <ActionList children={action.children} depth={depth} on:reorder />
            {/if}
            
        <!-- {:else}
            <span>Unknown type: {action.type} of length: {action.children}</span> -->
        {/if}
    {/if}
</div>

<style>
    .selected {
    background-color: yellow;
  }

  .line-number {
      position: absolute;
      left: -25px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.8em;
      color: #555;
  }
</style>

