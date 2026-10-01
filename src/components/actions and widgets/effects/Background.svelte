<script lang="ts">
	import ColorWidget from "../ColorWidget.svelte";
  import NumberWidget from "../NumberWidget.svelte";
  import AngleWidget from "../AngleWidget.svelte";
  import CoordinateWidget from "../CoordinateWidget.svelte";
    import { p5CanvasSize } from "../../../stores/canvasStore";
  import Words from "../Words.svelte";
  import { t, phraseWords } from "../../../i18n";

  export let name = '';
  export let params: any = {};
  export let onUpdate: (params: any, save: boolean) => void; // callback to update the actionStore

  function handleValueChange(event: CustomEvent) {
    const { id, value, save } = event.detail;
    onUpdate({[id]: value }, save);
  }

</script>

<!-- Words come from `steps` in i18n/en.ts: words[i] goes before setting {i}. -->

{#if name === 'solid fill'}
  {@const words = phraseWords($t.steps.fill)}
  <Words text={words[0]}/><ColorWidget id="color" value={params.color} lockedIndex={params.lockedIndex}
    on:valueChange={handleValueChange}/><Words text={words[1]}/>
{:else if name === 'gradient'}
  {@const words = phraseWords($t.steps.gradient)}
  <Words text={words[0]}/><ColorWidget id="color" value={params.color} lockedIndex={params.lockedIndex}
    on:valueChange={handleValueChange}/><Words text={words[1]}/><ColorWidget id="color2" value={params.color2} lockedIndex={params.lockedIndex2}
    on:valueChange={handleValueChange}/><Words text={words[2]}/>
  <AngleWidget id="angle" min={0} max={360} value={params.angle} on:valueChange={handleValueChange}/>
{:else if name === 'stripes'}
  {@const words = phraseWords($t.steps.stripes)}
  <Words text={words[0]}/><NumberWidget id="stripeWidth" min={1} max={300} value={params.stripeWidth}
    on:valueChange={handleValueChange}/><Words text={words[1]}/><ColorWidget id="color" value={params.color} lockedIndex={params.lockedIndex}
    on:valueChange={handleValueChange}/><Words text={words[2]}/>
  <AngleWidget id="angle" min={0} max={360} value={params.angle} on:valueChange={handleValueChange}/>
{:else if name === 'speckles'}
  {@const words = phraseWords($t.steps.speckles)}
  <Words text={words[0]}/><NumberWidget id="progress" min={0} max={100} value={params.progress}
    on:valueChange={handleValueChange}/><Words text={words[1]}/><CoordinateWidget id="position" value={params.position}
    on:valueChange={handleValueChange}/><Words text={words[2]}/><ColorWidget id="color" value={params.color} lockedIndex={params.lockedIndex}
    on:valueChange={handleValueChange}/><Words text={words[3]}/>
{/if}
