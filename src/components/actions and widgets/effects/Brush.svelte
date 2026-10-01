<script lang="ts">
  import CoordinateWidget from "../CoordinateWidget.svelte";
  import Words from "../Words.svelte";
  import { t, phraseWords } from "../../../i18n";
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

<!-- Words come from `steps` in i18n/en.ts: words[i] goes before setting {i}. -->

{#if name === 'bounce'}
  {@const words = phraseWords($t.steps.bounce)}
  <Words text={words[0]}/><CoordinateWidget id="start" value={params.start}
    on:valueChange={handleValueChange}/><Words text={words[1]}/><CoordinateWidget id="end" value={params.end}
    on:valueChange={handleValueChange}/><Words text={words[2]}/><NumberWidget id="progress" value={params.progress} min={0} max={600}
    on:valueChange={handleValueChange}/><Words text={words[3]}/>
{/if}
