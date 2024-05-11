<script lang="ts">
  import PathWidget from "../PathWidget.svelte";
  import StringWidget from "../StringWidget.svelte";
  import ListWidget from "../ListWidget.svelte";
  import ChildrenWidget from "../ChildrenWidget.svelte";

  export let name = '';
  export let params: any = {};
  export let onUpdate: (params: any) => void; // callback to update the actionStore
  export let depth = 0;
  export let isOpen = false;
  

  function handleValueChange(event: CustomEvent) {
    const { id, value } = event.detail;
    onUpdate({[id]: value });
    // console.log("handling value change in control structure", id, value);
  }

  function toggle() {
    // console.log("toggling");
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
  <ChildrenWidget id='children' on:miniActionClick={toggle} value={params.children}/>
  <!-- <StringWidget id='title' value={params.title} /> -->
  along<PathWidget id='path' path={params.path} on:valueChange={handleValueChange}/>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <span class="toggle-arrow" on:click={toggle}> {isOpen ? '▼' : '▶'}</span>
  {#if isOpen}
    <ListWidget id='children' value={params.children} {depth} on:valueChange={handleValueChange}/>
  {/if}
{/if}
