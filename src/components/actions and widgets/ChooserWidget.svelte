<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { t, entry } from '../../i18n';

  export let id = '';
  export let options: string[] = []; // The options for the chooser: values saved in the drawing
  export let selected = ''; // The currently selected option

  const dispatch = createEventDispatcher();

  function handleChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    dispatch('valueChange', { id, value: target.value });
    // console.log("dispatching valueChange event ", target.value);
  }
</script>

<select id={id} bind:value={selected} on:change={handleChange}>
  {#each options as option}
    <option value={option}>{entry($t.options, option) ?? option}</option>
  {/each}
</select>

<style>
  select {
    /* font-size: 1.2rem;
    padding: 0.2rem; */
    border-radius: 0.2rem;
    border: 2px solid #ccc;
    font-family: 'FuturaHandwritten';
    font-size: inherit;
  }
</style>
