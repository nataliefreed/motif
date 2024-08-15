<script lang="ts">
  import PathWidget from "../PathWidget.svelte";
  import StringWidget from "../StringWidget.svelte";
  import ListWidget from "../ListWidget.svelte";
  import ChildrenWidget from "../ChildrenWidget.svelte";
  import NumberWidget from "../NumberWidget.svelte";
  import AngleWidget from "../AngleWidget.svelte";
    import repeat from "svelte-awesome/icons/repeat";

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
  <StringWidget id='title' value={params.title} on:valueChange={handleValueChange}/>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <span class="toggle-arrow" on:click={toggle}> {isOpen ? '▼' : '▶'}</span>
  {#if isOpen}
    <ListWidget id='children' value={params.children} {depth} on:valueChange={handleValueChange}/>
  {/if}
{:else if name === 'along path'}
  <StringWidget id='title' value={params.title} on:valueChange={handleValueChange}/>
  <span class="children-widget"><ChildrenWidget id='children' on:miniActionClick={toggle} value={params.children}/></span>
  <!-- <StringWidget id='title' value={params.title} /> -->
  along<PathWidget id='path' path={params.path} angle={params.angle} on:valueChange={handleValueChange}/>
  <AngleWidget id='angle' min={0} max={360} value={params.angle} on:valueChange={handleValueChange}/>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <span class="toggle-arrow" on:click={toggle}> {isOpen ? '▼' : '▶'}</span>
  {#if isOpen}
    <ListWidget id='children' value={params.children} {depth} on:valueChange={handleValueChange}/>
  {/if}
{/if}

<style>

  .children-widget {
    margin: 0 0.5em;
  }

</style>