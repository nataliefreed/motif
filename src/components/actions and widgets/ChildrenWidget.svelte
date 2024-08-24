<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { flatActionStore } from '../../stores/dataStore';
  import { v4 as uuidv4 } from 'uuid';
  import ColorWidget from './ColorWidget.svelte';
  import MiniActionItem from './MiniActionItem.svelte';
  import type { Action } from '../../types/types';

  export let id = '';
  export let value: string[] = [];
  let children: any[] = [];
  let listElement: HTMLElement;

  // get the child actions from their uuids
  $: children = value.map(uuid => $flatActionStore[uuid]);

  function checkAction(action: Action) {
    if (!action) {
      // console.error("Action not found");
      // Return a default action object to prevent the app from breaking
      return { uuid: 'not-found' + uuidv4(), params: { /* default params */ } };
    }
    return action;
  }
  
</script>

<span bind:this={listElement} class="child-widget">
  {#each children.map(checkAction) as action (action.uuid)}
    {#if action}
      <!-- <ColorWidget id='color' value={action.params.color} /> -->
      <MiniActionItem on:miniActionClick {action} />
    {/if}
    <!-- {#if children.length === 1}
      <MiniActionItem on:miniActionClick {action} />
      <MiniActionItem on:miniActionClick {action} />
    {/if} -->
    <!-- {action.name} 
    {#if action.thumbnail}
      <img src={`/assets/effect-thumbnails/${action.thumbnail}`} alt="{action.name} thumbnail" class="thumbnail">
    {/if} -->
  {/each}
</span>

<style>

.thumbnail {
  width: 2em;
  height: 2em;
}

.child-widget {
  display: flex;
  flex-direction: row;
  gap: 0;
}

</style>
