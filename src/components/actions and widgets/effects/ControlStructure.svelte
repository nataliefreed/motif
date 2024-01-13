<script lang="ts">
  import PathWidget from "../PathWidget.svelte";
  import StringWidget from "../StringWidget.svelte";
  import ListWidget from "../ListWidget.svelte";

  export let name = '';
  export let params: any = {};
  export let onUpdate: (params: any) => void; // callback to update the actionStore
  let isOpen = true;

  function handleValueChange(event: CustomEvent) {
    const { id, value } = event.detail;
    // console.log("updating param in control structure", id, value);
    const updatedParams = { ...params, [id]: value }; //update only the changed value
    onUpdate(updatedParams); //closure passed in
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
    <ListWidget id='children' value={params.children} on:valueChange={handleValueChange}/>
  {/if}
{:else if name === 'along path'}
  <StringWidget id='title' value={params.title} />
along path<PathWidget id='path' path={params.path} on:valueChange={handleValueChange}/>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <span class="toggle-arrow" on:click={toggle}> {isOpen ? '▼' : '▶'}</span>
  {#if isOpen}
    <ListWidget id='children' value={params.children} on:valueChange={handleValueChange}/>
  {/if}
{/if}
