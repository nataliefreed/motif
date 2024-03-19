<script lang="ts">
  import PathWidget from "../PathWidget.svelte";
  import StringWidget from "../StringWidget.svelte";
  import ListWidget from "../ListWidget.svelte";

  export let name = '';
  export let params: any = {};
  export let onUpdate: (params: any) => void; // callback to update the actionStore
  export let depth = 0;
  let isOpen = true;
  

  function handleValueChange(event: CustomEvent) {
    const { id, value } = event.detail;
    onUpdate({[id]: value });
  }

  function toggle() {
      isOpen = !isOpen;
  }

</script>

{#if name === 'do each'}
  <StringWidget id='title' value={params.title} />
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <span class="toggle-arrow" on:click={toggle}> {isOpen ? '▼' : '▶'}</span>
  {#if isOpen}
    <ListWidget id='children' value={params.children} {depth} on:valueChange={handleValueChange}/>
  {/if}
{:else if name === 'along path'}
  <StringWidget id='title' value={params.title} />
along path<PathWidget id='path' path={params.path} on:valueChange={handleValueChange}/>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <span class="toggle-arrow" on:click={toggle}> {isOpen ? '▼' : '▶'}</span>
  {#if isOpen}
    <ListWidget id='children' value={params.children} {depth} on:valueChange={handleValueChange}/>
  {/if}
{/if}
