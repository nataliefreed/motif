<script lang="ts">
  import type { Action } from '../../types/types';
  import ActionItem from './ActionItem.svelte';
  import { SortableList } from '@jhubbardsf/svelte-sortablejs';
  import type { SortableEvent } from 'sortablejs';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let children: Action[] = [];
  export let depth = 0;
  // export let transition: any;

  function handleReorder(event: SortableEvent) {
    const oldIndex = event.oldIndex;
    const newIndex = event.newIndex;
    if (oldIndex === newIndex) return;
    dispatch('reorder', { oldIndex, newIndex });
  }
</script>

<ol style={depth % 2 === 0 ? "list-style-type: decimal;" : "list-style-type: lower-alpha;"}>
  <SortableList class="" onUpdate={handleReorder}>
    {#each children as action (action.uuid)}
        <li>
            <ActionItem {action} depth = {depth+1} />
        </li>
    {/each}
  </SortableList>
</ol>


<style>
  ol {
      /* list-style-type: none;  */
      /* counter-reset: li; */
      padding-left: 0; 
      margin-left: 2em; /* Adjust for indentation */
  }
  
  ol > li {
      /* counter-increment: li;  */
      position: relative;
      margin-bottom: 0.5em;
  }

  /* ol li:before {
      position: absolute; 
      left: -1.7em;
      top: 0;
      border-radius: 50%; 
      width: 1.5em;
      height: 1.5em;
      padding: 0;
      text-align: center;
      background: none;
      border: 1px solid #bebebe;
      color: #b7b7b7;
      line-height: 1.5em; 
  } */
  </style>