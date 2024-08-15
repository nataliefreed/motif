<script lang="ts">
  import ColorWidget from "../ColorWidget.svelte";
  import NumberWidget from "../NumberWidget.svelte";
  import AngleWidget from "../AngleWidget.svelte";
  import CoordinateWidget from "../CoordinateWidget.svelte";
  import ChooserWidget from "../ChooserWidget.svelte";
  import { isChildOfAlongPath } from "../../action-utils";

  export let name = '';
  export let uuid = '';
  export let params: any = {};
  export let onUpdate: (params: any) => void; // callback to update the actionStore

  function handleValueChange(event: CustomEvent) {
    const { id, value } = event.detail;
    onUpdate({[id]: value });
  }
</script>

{#if name === 'shape'}
  <ChooserWidget id="shape" options={['ellipse','rectangle','triangle']} selected={params.shape || 'rectangle'} on:valueChange={handleValueChange}/>
{:else}
  {#if name === 'circle'}
  <span class="tool-name">Circle</span> of radius 
    <NumberWidget id="radius" min={3} max={600} value={params.radius} on:valueChange={handleValueChange} on:reorder/>
  {:else if name === 'square'}
    <span class="tool-name">Square</span> of size 
    <NumberWidget id="size" min={3} max={600} value={params.size} on:valueChange={handleValueChange}/>
  {:else if name === 'polygon'}
    <NumberWidget id="nsides" min={3} max={50} value={params.nsides} on:valueChange={handleValueChange}/>-sided   
    <span class="tool-name">Polygon</span> of radius 
    <NumberWidget id="radius" min={1} max={600} value={params.radius} on:valueChange={handleValueChange}/>
  {:else if name === 'star'}
  <span class="tool-name">Star</span> with 
    <NumberWidget id="npoints" min={3} max={200} value={params.npoints} on:valueChange={handleValueChange}/> points,
    outer 
    <NumberWidget id="r1" min={3} max={600} value={params.r1} on:valueChange={handleValueChange}/>,
    inner 
    <NumberWidget id="r2" min={3} max={600} value={params.r2} on:valueChange={handleValueChange}/>
  {:else if name === 'heart'}
  <span class="tool-name">Heart</span> of size 
    <NumberWidget id="size" min={3} max={600} value={params.size} on:valueChange={handleValueChange}/>
  {:else if name === 'rectangle'}
  <span class="tool-name">Rectangle</span> of width 
    <NumberWidget id="width" min={3} max={600} value={params.width} on:valueChange={handleValueChange}/>
    and height 
    <NumberWidget id="height" min={3} max={600} value={params.height} on:valueChange={handleValueChange}/>
  {:else if name === 'triangle'}
  <span class="tool-name">Triangle</span> of width 
    <NumberWidget id="width" min={3} max={600} value={params.width} on:valueChange={handleValueChange}/> 
    and height 
    <NumberWidget id="height" min={3} max={600} value={params.height} on:valueChange={handleValueChange}/>
  {:else if name === 'spiro'}
  <span class="tool-name">Spiro</span> outer:
    <NumberWidget id="outer" min={3} max={300} value={params.outer} on:valueChange={handleValueChange}/>
    , inner:
    <NumberWidget id="inner" min={3} max={params.outer-1} value={params.inner} on:valueChange={handleValueChange}/>
    , pen at:
    <NumberWidget id="d" min={0} max={100} value={params.d} on:valueChange={handleValueChange}/><span>%</span>
    , pen size:
    <NumberWidget id="lineWeight" value={params.lineWeight || 2} min={1} max={50} on:valueChange={handleValueChange}/>
  {:else if name === 'straight line'}
  <span class="tool-name">Line</span>
    {#if !isChildOfAlongPath(uuid)}
      from <CoordinateWidget id="start" value={params.start} on:valueChange={handleValueChange}/>
      to <CoordinateWidget id="end" value={params.end} on:valueChange={handleValueChange}/>
    {/if}
    of width <NumberWidget id="lineWeight" value={params.lineWeight || 5} min={1} max={50} on:valueChange={handleValueChange}/>
{/if}

  {#if params.position && !isChildOfAlongPath(uuid)}
    at 
    <CoordinateWidget id="position" value={params.position} on:valueChange={handleValueChange}/>
  {/if}

  in <ColorWidget id="color" value={params.color} lockedIndex={params.lockedIndex > -1? params.lockedIndex : -1} on:valueChange={handleValueChange}/>

  {#if name !== 'circle' && name !== 'spiro' && name != 'straight line'}
    <AngleWidget id="angle" min={0} max={360} value={params.angle} on:valueChange={handleValueChange}/>
  {/if}

{/if}

<style>
  .tool-name {
    font-weight: bold;
    color: black;
    font-family: 'Roboto', sans-serif;
    font-style: inherit;
    color: inherit;
  }
</style>