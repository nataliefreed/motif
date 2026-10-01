<script lang="ts">
  // The words between a recipe step's settings, from a phrase in i18n/en.ts.
  // Text inside **double asterisks** is the tool name, shown in bold.
  export let text = '';

  $: pieces = text.split('**');
</script>

{#each pieces as piece, i}{#if i % 2 === 1}<span class="tool-name">{piece}</span>{:else}{piece}{/if}{/each}
