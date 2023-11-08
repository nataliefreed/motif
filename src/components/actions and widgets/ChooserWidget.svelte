<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let id = '';
  export let options: string[] = []; // The options for the chooser
  export let selected = ''; // The currently selected option

  const dispatch = createEventDispatcher();

  function handleChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    dispatch('valueChange', { id, value: target.value });
  }
</script>

<select id={id} bind:value={selected} on:change={handleChange}>
  {#each options as option}
    <option value={option}>{option}</option>
  {/each}
</select>
