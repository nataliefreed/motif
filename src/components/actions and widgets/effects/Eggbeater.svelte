<script lang="ts">
  import NumberWidget from "../NumberWidget.svelte";
  import Words from "../Words.svelte";
  import { t, phraseWords } from "../../../i18n";
  import CoordinateWidget from "../CoordinateWidget.svelte";
  import ChooserWidget from "../ChooserWidget.svelte";

  export let name = '';
  export let params: any = {};
  export let onUpdate: (params: any) => void;

  function handleValueChange(event: CustomEvent) {
    const { id, value } = event.detail;
    const updatedParams = { ...params, [id]: value };
    onUpdate(updatedParams);
  }
</script>

<!-- Words come from `steps` in i18n/en.ts: words[i] goes before setting {i}. -->

{#if name === 'grow' || name === 'shrink'}
  {@const words = phraseWords($t.steps.scale)}
  <Words text={words[0]}/><NumberWidget id="scaleBy" min={0} max={600} value={params.scaleBy || 300}
    on:valueChange={handleValueChange}/><Words text={words[1]}/><NumberWidget id="width" min={1} max={600} value={params.width || 100}
    on:valueChange={handleValueChange}/><Words text={words[2]}/><NumberWidget id="height" min={1} max={600} value={params.height || 100}
    on:valueChange={handleValueChange}/><Words text={words[3]}/><CoordinateWidget id="position" value={params.position || []}
    on:valueChange={handleValueChange}/><Words text={words[4]}/>
{:else if name === 'shift'}
  {@const words = phraseWords($t.steps.shift)}
  <Words text={words[0]}/><ChooserWidget id="orientation" options={['vertical','horizontal']} selected={params.orientation || 'vertical'}
    on:valueChange={handleValueChange} on:saveChange/><Words text={words[1]}/><NumberWidget id="stripeWidth" min={1} max={600} value={params.stripeWidth || 50}
    on:valueChange={handleValueChange}/><Words text={words[2]}/><NumberWidget id="offset" min={1} max={600} value={params.offset || 20}
    on:valueChange={handleValueChange}/><Words text={words[3]}/>
{:else if name === 'filter'}
  {@const words = phraseWords($t.steps.filter)}
  <Words text={words[0]}/><ChooserWidget id="filter" options={['invert','threshold', 'gray']} selected={params.filter || 'invert'}
    on:valueChange={handleValueChange} on:saveChange/><Words text={words[1]}/>
{:else if name === 'move cutout'}
  {@const words = phraseWords($t.steps.moveCutout)}
  <Words text={words[0]}/><ChooserWidget id="mode" options={['move','copy']} selected={params.mode || 'move'}
    on:valueChange={handleValueChange} on:saveChange/><Words text={words[1]}/><NumberWidget id="w" min={1} max={600} value={params.w || 100}
    on:valueChange={handleValueChange}/><Words text={words[2]}/><NumberWidget id="h" min={1} max={600} value={params.h || 100}
    on:valueChange={handleValueChange}/><Words text={words[3]}/><CoordinateWidget id="start" value={params.start || []}
    on:valueChange={handleValueChange}/><Words text={words[4]}/><CoordinateWidget id="end" value={params.end || []}
    on:valueChange={handleValueChange}/><Words text={words[5]}/>
<!-- {:else if name === 'rotate'}
  Rotate <NumberWidget id="width" min={0} max={360} value={params.angle || 45} on:valueChange={handleValueChange}/>° -->
{/if}
