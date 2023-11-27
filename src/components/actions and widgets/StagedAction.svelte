//TODO: check if still using this class

<script lang="ts">
  import { stagedAction } from '../../stores/dataStore';
  import ActionItem from './ActionItem.svelte';
  import { v4 as uuidv4 } from 'uuid';
  import { fade } from 'svelte/transition';

  $: action = {
    name: "Staged Action",
    type: "list" as const,
    category: 'top-level-list',
    uuid: uuidv4(),
    children: $stagedAction ? [ $stagedAction ] : []
  }

</script>

<span class="staged" in:fade={{ duration: 300 }} out:fade={{ duration: 300 }}><ActionItem {action} /></span>

<style>
 .staged {
    font-style: italic;
    opacity: 0.5;
  }
</style>