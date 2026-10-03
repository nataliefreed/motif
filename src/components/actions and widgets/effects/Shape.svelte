<script lang="ts">
  import ColorWidget from "../ColorWidget.svelte";
  import NumberWidget from "../NumberWidget.svelte";
  import AngleWidget from "../AngleWidget.svelte";
  import CoordinateWidget from "../CoordinateWidget.svelte";
  import ChooserWidget from "../ChooserWidget.svelte";
  import StringWidget from "../StringWidget.svelte";
  import Words from "../Words.svelte";
  import { isChildOfAlongPath } from "../../action-utils";
  import { t, phraseWords } from "../../../i18n";

  export let name = '';
  export let uuid = '';
  export let params: any = {};
  export let onUpdate: (params: any) => void; // callback to update the actionStore

  function handleValueChange(event: CustomEvent) {
    const { id, value } = event.detail;
    onUpdate({[id]: value });
  }

  // every shape step ends with where it is and its color
  $: atWords = phraseWords($t.steps.at);
  $: inColorWords = phraseWords($t.steps.inColor);
</script>

<!-- Each step's words come from `steps` in i18n/en.ts: words[i] goes before setting {i}.
     Settings and words sit side by side with no space between tags; the words carry their own spaces. -->

{#if name === 'shape'}
  <ChooserWidget id="shape" options={['ellipse','rectangle','triangle']} selected={params.shape || 'rectangle'} on:valueChange={handleValueChange} on:saveChange/>
{:else}
  {#if name === 'circle'}
    {@const words = phraseWords($t.steps.circle)}
    <Words text={words[0]}/><NumberWidget id="radius" min={3} max={600} value={params.radius}
      on:valueChange={handleValueChange} on:reorder/><Words text={words[1]}/>
  {:else if name === 'square'}
    {@const words = phraseWords($t.steps.square)}
    <Words text={words[0]}/><NumberWidget id="size" min={3} max={600} value={params.size}
      on:valueChange={handleValueChange}/><Words text={words[1]}/>
  {:else if name === 'polygon'}
    {@const words = phraseWords($t.steps.polygon)}
    <Words text={words[0]}/><NumberWidget id="nsides" min={3} max={50} value={params.nsides}
      on:valueChange={handleValueChange}/><Words text={words[1]}/><NumberWidget id="radius" min={1} max={600} value={params.radius}
      on:valueChange={handleValueChange}/><Words text={words[2]}/>
  {:else if name === 'star'}
    {@const words = phraseWords($t.steps.star)}
    <Words text={words[0]}/><NumberWidget id="npoints" min={3} max={200} value={params.npoints}
      on:valueChange={handleValueChange}/><Words text={words[1]}/><NumberWidget id="r1" min={3} max={600} value={params.r1}
      on:valueChange={handleValueChange}/><Words text={words[2]}/><NumberWidget id="r2" min={3} max={600} value={params.r2}
      on:valueChange={handleValueChange}/><Words text={words[3]}/>
  {:else if name === 'heart'}
    {@const words = phraseWords($t.steps.heart)}
    <Words text={words[0]}/><NumberWidget id="size" min={3} max={600} value={params.size}
      on:valueChange={handleValueChange}/><Words text={words[1]}/>
  {:else if name === 'rectangle'}
    {@const words = phraseWords($t.steps.rectangle)}
    <Words text={words[0]}/><NumberWidget id="width" min={3} max={600} value={params.width}
      on:valueChange={handleValueChange}/><Words text={words[1]}/><NumberWidget id="height" min={3} max={600} value={params.height}
      on:valueChange={handleValueChange}/><Words text={words[2]}/>
  {:else if name === 'triangle'}
    {@const words = phraseWords($t.steps.triangle)}
    <Words text={words[0]}/><NumberWidget id="width" min={3} max={600} value={params.width}
      on:valueChange={handleValueChange}/><Words text={words[1]}/><NumberWidget id="height" min={3} max={600} value={params.height}
      on:valueChange={handleValueChange}/><Words text={words[2]}/>
  {:else if name === 'text'}
    {@const words = phraseWords($t.steps.text)}
    <Words text={words[0]}/><StringWidget id='text' showQuotes={true} value={params.text}
      on:valueChange={handleValueChange} on:saveChange/><Words text={words[1]}/><NumberWidget id="size" min={5} max={600} value={params.size}
      on:valueChange={handleValueChange}/><Words text={words[2]}/>
  {:else if name === 'spiro'}
    {@const words = phraseWords($t.steps.spiro)}
    <Words text={words[0]}/><NumberWidget id="outer" min={3} max={300} value={params.outer}
      on:valueChange={handleValueChange}/><Words text={words[1]}/><NumberWidget id="inner" min={3} max={params.outer-1} value={params.inner}
      on:valueChange={handleValueChange}/><Words text={words[2]}/><NumberWidget id="d" min={0} max={100} value={params.d}
      on:valueChange={handleValueChange}/><Words text={words[3]}/><NumberWidget id="lineWeight" value={params.lineWeight || 2} min={1} max={50}
      on:valueChange={handleValueChange}/><Words text={words[4]}/>
  {:else if name === 'straight line'}
    {#if isChildOfAlongPath(uuid)}
      {@const words = phraseWords($t.steps.lineInBrush)}
      <Words text={words[0]}/><NumberWidget id="lineWeight" value={params.lineWeight || 5} min={1} max={50}
        on:valueChange={handleValueChange}/><Words text={words[1]}/>
    {:else}
      {@const words = phraseWords($t.steps.line)}
      <Words text={words[0]}/><CoordinateWidget id="start" value={params.start}
        on:valueChange={handleValueChange}/><Words text={words[1]}/><CoordinateWidget id="end" value={params.end}
        on:valueChange={handleValueChange}/><Words text={words[2]}/><NumberWidget id="lineWeight" value={params.lineWeight || 5} min={1} max={50}
        on:valueChange={handleValueChange}/><Words text={words[3]}/>
    {/if}
  {/if}

  {#if params.position && !isChildOfAlongPath(uuid)}
    <Words text={atWords[0]}/><CoordinateWidget id="position" value={params.position}
      on:valueChange={handleValueChange}/><Words text={atWords[1]}/>
  {/if}

  <Words text={inColorWords[0]}/><ColorWidget id="color" value={params.color} lockedIndex={params.lockedIndex > -1? params.lockedIndex : -1}
    on:valueChange={handleValueChange}/><Words text={inColorWords[1]}/>

  {#if name !== 'circle' && name !== 'spiro' && name != 'straight line'}
    <AngleWidget id="angle" min={0} max={360} value={params.angle} on:valueChange={handleValueChange}/>
  {/if}

{/if}
