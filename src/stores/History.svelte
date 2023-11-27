<script lang="ts">
  import { historyStore } from '../stores/history';
</script>

<div id="historyContainer">
  {#each $historyStore as store}
    <div class="historyItem">
      {store.actionStore.children.length}
    </div>
  {/each}

</div>

<style>
#historyContainer {
  display: flex;
  flex-direction: row;
  gap: 5px;
}

.historyItem {
  border: 1px solid lightgray;
  border-radius: 5px;
}
</style>