<script lang="ts">
  import NumberWidget from "../NumberWidget.svelte";
  import ListWidget from "../ListWidget.svelte";
  import SquaresPicture from "../SquaresPicture.svelte";
  import Words from "../Words.svelte";
  import { t, phraseWords } from "../../../i18n";

  export let uuid = '';
  export let params: any = {};
  export let onUpdate: (params: any) => void;
  export let depth = 0;
  let isOpen = false; // the steps its squares draw, shown or not

  function handleValueChange(event: CustomEvent) {
    const { id, value } = event.detail;
    onUpdate({[id]: value });
  }

  function toggle() {
    isOpen = !isOpen;
  }

  // "checkerboard 4 x 4 with (a small picture of what its squares draw) ▶", opening up to the steps its squares draw
  $: words = phraseWords($t.steps.checkerboard);
</script>

<!-- Words come from `steps` in i18n/en.ts: words[i] goes before setting {i}. -->

<Words text={words[0]}/><NumberWidget id="columns" min={1} max={30} value={params.columns}
  on:valueChange={handleValueChange}/><Words text={words[1]}/><NumberWidget id="rows" min={1} max={30} value={params.rows}
  on:valueChange={handleValueChange}/><Words text={words[2]}/><SquaresPicture {uuid} on:click={toggle}/><Words text={words[3]}/>
<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<span class="toggle-arrow" on:click={toggle}>{isOpen ? '▼' : '▶'}</span>
<div class="squares" hidden={!isOpen}><ListWidget id='children' value={params.children} {depth} on:valueChange={handleValueChange} on:saveChange/></div>

<style>
  .toggle-arrow {
    cursor: pointer;
  }

  .squares {
    flex-basis: 100%; /* the steps its squares draw, opened up, on lines of their own */
  }
</style>
