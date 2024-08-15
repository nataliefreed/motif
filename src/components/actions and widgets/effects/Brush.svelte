<script lang="ts">
  import CoordinateWidget from "../CoordinateWidget.svelte";
  import ColorWidget from "../ColorWidget.svelte";
  import NumberWidget from "../NumberWidget.svelte";
  import { isChildOfAlongPath } from "../../action-utils";

  export let name = '';
  export let uuid = '';
  export let params: any = {};
  export let onUpdate: (params: any) => void;

  function handleValueChange(event: CustomEvent) {
    const { id, value } = event.detail;
    onUpdate({[id]: value });
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

{#if name === 'bounce'}
  Bounce from <CoordinateWidget id="start" value={params.start} on:valueChange={handleValueChange}/>
  to <CoordinateWidget id="end" value={params.end} on:valueChange={handleValueChange}/> for time
  <NumberWidget id="progress" value={params.progress} min={0} max={600} on:valueChange={handleValueChange}/>
{/if}

