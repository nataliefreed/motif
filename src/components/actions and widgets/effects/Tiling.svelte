<script lang="ts">
  import NumberWidget from "../NumberWidget.svelte";
  import Words from "../Words.svelte";
  import { t, phraseWords } from "../../../i18n";
  import AngleWidget from "../AngleWidget.svelte";
  import CoordinateWidget from "../CoordinateWidget.svelte";
  import ChooserWidget from "../ChooserWidget.svelte";

  export let name = '';
  export let params: any = {};
  export let onUpdate: (params: any) => void;

  function handleValueChange(event: CustomEvent) {
    const { id, value } = event.detail;
    onUpdate({[id]: value });
  }
  
</script>

<!-- Words come from `steps` in i18n/en.ts: words[i] goes before setting {i}. -->

{#if name === 'radial'}
  {@const words = phraseWords($t.steps.radialPattern)}
  <Words text={words[0]}/><ChooserWidget id="tiling" options={['straight grid', 'brick', 'half drop', 'checkerboard', 'radial', 'mirror']} selected={params.tiling || name}
    on:valueChange={handleValueChange}/><Words text={words[1]}/><NumberWidget id="width" min={5} max={600} value={params.width || 100}
    on:valueChange={handleValueChange}/><Words text={words[2]}/><NumberWidget id="height" min={5} max={600} value={params.height || 100}
    on:valueChange={handleValueChange}/><Words text={words[3]}/><AngleWidget id="angle" min={0} max={360} value={params.angle || 0}
    on:valueChange={handleValueChange}/><Words text={words[4]}/><CoordinateWidget id="position" value={params.position || []}
    on:valueChange={handleValueChange}/><Words text={words[5]}/>
{:else}
  {@const words = phraseWords($t.steps.pattern)}
  <Words text={words[0]}/><ChooserWidget id="tiling" options={['straight grid', 'brick', 'half drop', 'checkerboard', 'radial', 'mirror']} selected={params.tiling || name}
    on:valueChange={handleValueChange}/><Words text={words[1]}/><NumberWidget id="width" min={5} max={600} value={params.width || 100}
    on:valueChange={handleValueChange}/><Words text={words[2]}/><NumberWidget id="height" min={5} max={600} value={params.height || (name === 'brick' ? 40 : 100)}
    on:valueChange={handleValueChange}/><Words text={words[3]}/><CoordinateWidget id="position" value={params.position || []}
    on:valueChange={handleValueChange}/><Words text={words[4]}/>
{/if}
