<script lang="ts">
  import NumberWidget from "../NumberWidget.svelte";
  import Words from "../Words.svelte";
  import { t, phraseWords } from "../../../i18n";
  import ChooserWidget from "../ChooserWidget.svelte";
  import ColorWidget from "../ColorWidget.svelte";

  export let name = '';
  export let params: any = {};
  export let onUpdate: (params: any) => void;

  function handleValueChange(event: CustomEvent) {
    const { id, value } = event.detail;
    onUpdate({[id]: value });
  }

  // "straight grid 9 x 7", "checkerboard 4 x 4 with (color)", "rosette with 3 rings on (color)" (the
  // rosette is saved as 'radial'), or "honeycomb with 3 rings"
  $: tiling = params.tiling || name;
  $: inRings = tiling === 'radial' || tiling === 'honeycomb';
  $: withColor = tiling === 'radial' || tiling === 'checkerboard';
  $: rings = params.rings ?? params.numRings ?? 3;
  $: words = phraseWords(
    tiling === 'radial' ? (rings === 1 ? $t.steps.rosettePatternOneRing : $t.steps.rosettePattern)
    : tiling === 'honeycomb' ? (rings === 1 ? $t.steps.honeycombPatternOneRing : $t.steps.honeycombPattern)
    : tiling === 'checkerboard' ? $t.steps.checkerboardPattern : $t.steps.pattern);
</script>

<!-- Words come from `steps` in i18n/en.ts: words[i] goes before setting {i}. -->

<Words text={words[0]}/><ChooserWidget id="tiling" options={['straight grid', 'brick', 'half drop', 'checkerboard', 'honeycomb', 'mirror', 'radial']} selected={tiling}
  on:valueChange={handleValueChange}/><Words text={words[1]}/>{#if inRings}<NumberWidget id="rings" min={1} max={12} value={rings}
  on:valueChange={handleValueChange}/><Words text={words[2]}/>{#if withColor}<ColorWidget id="color" value={params.color ?? '#FFFFFF00'} lockedIndex={params.lockedIndex}
  on:valueChange={handleValueChange}/><Words text={words[3]}/>{/if}{:else}<NumberWidget id="columns" min={1} max={30} value={params.columns ?? 4}
  on:valueChange={handleValueChange}/><Words text={words[2]}/><NumberWidget id="rows" min={1} max={30} value={params.rows ?? 4}
  on:valueChange={handleValueChange}/><Words text={words[3]}/>{#if withColor}<ColorWidget id="color" value={params.color ?? '#FFFFFF00'} lockedIndex={params.lockedIndex}
  on:valueChange={handleValueChange}/><Words text={words[4]}/>{/if}{/if}
