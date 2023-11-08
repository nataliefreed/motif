<script lang="ts">
  import { stagedAction } from '../../stores/dataStore';
  import ActionItem from './ActionItem.svelte';
  import { v4 as uuidv4 } from 'uuid';

  $: action = {
    name: "Staged Action",
    type: "list" as const,
    category: 'top-level-list',
    uuid: uuidv4(),
    children: $stagedAction ? [ $stagedAction ] : []
  }

</script>

<span class="staged"><ActionItem {action} /></span>

<style>
 .staged {
    font-style: italic;
    opacity: 0.5;
  }
</style>