<script lang="ts">
  import CategoryButton from './CategoryButton.svelte';
  import { activeCategory } from '../../stores/dataStore';
  
  export let categories: string[];

</script>

<div class="horizontal-toolbar">
  {#each categories as category}
    <CategoryButton category={category} isActive={category === $activeCategory} />
  {/each}
  <CategoryButton category="my tools" isActive={"my tools" === $activeCategory} />
  <!-- <CategoryButton category="code effects" isActive={"code effects" === currentCategory} /> -->
</div>

<style>

.horizontal-toolbar {
  display: flex;
  flex-direction: row;
  text-align: center;
}

.vertical-toolbar {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: start;
  }

</style>

