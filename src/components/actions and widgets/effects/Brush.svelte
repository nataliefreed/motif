<script lang="ts">
  import CoordinateWidget from "../CoordinateWidget.svelte";
  import ColorWidget from "../ColorWidget.svelte";
  import NumberWidget from "../NumberWidget.svelte";

  export let name = '';
  export let params: any = {};
  export let onUpdate: (params: any) => void;

  function handleValueChange(event: CustomEvent) {
    const { id, value } = event.detail;
    const updatedParams = { ...params, [id]: value };
    onUpdate(updatedParams);
  }

  // {:else if name === 'heart brush'}
  // {name}
  // <!-- svelte-ignore a11y-click-events-have-key-events -->
  // <span on:click={toggle}> {isOpen ? '▼' : '▶'}</span>
  // {#if isOpen}
  //   <ActionList children={action.children} depth={depth} on:reorder />
  // {/if}
  // <div>

</script>

{#if name === 'straight line'}
  <div>
    Line
    from <CoordinateWidget id="start" value={params.start} on:valueChange={handleValueChange}/>
    to <CoordinateWidget id="end" value={params.end} on:valueChange={handleValueChange}/>
    in color <ColorWidget id="color" value={params.color || '#f57f7e'} on:valueChange={handleValueChange}/>
    in width <NumberWidget id="lineWeight" value={params.lineWeight || 5} on:valueChange={handleValueChange}/>
  </div>
{/if}
