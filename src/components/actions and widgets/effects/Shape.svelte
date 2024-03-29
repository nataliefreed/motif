<script lang="ts">
  import ColorWidget from "../ColorWidget.svelte";
  import NumberWidget from "../NumberWidget.svelte";
  import CoordinateWidget from "../CoordinateWidget.svelte";
  import ChooserWidget from "../ChooserWidget.svelte";

  export let name = '';
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
    Circle of radius 
    <NumberWidget id="radius" min={3} max={600} value={params.radius} on:valueChange={handleValueChange} on:reorder/>
    in color 
    <ColorWidget id="color" value={params.color} on:valueChange={handleValueChange}/>
  {:else if name === 'square'}
    Square of size 
    <NumberWidget id="size" min={3} max={600} value={params.size} on:valueChange={handleValueChange}/>
    in color 
    <ColorWidget id="color" value={params.color} on:valueChange={handleValueChange}/>
  {:else if name === 'polygon'}
    Polygon with 
    <NumberWidget id="nsides" min={3} max={50} value={params.nsides} on:valueChange={handleValueChange}/> sides 
    and radius 
    <NumberWidget id="radius" min={1} max={600} value={params.radius} on:valueChange={handleValueChange}/>
    in color 
    <ColorWidget id="color" value={params.color} on:valueChange={handleValueChange}/>
  {:else if name === 'star'}
    Star with 
    <NumberWidget id="npoints" min={3} max={200} value={params.npoints} on:valueChange={handleValueChange}/> points,
    outer 
    <NumberWidget id="r1" min={3} max={600} value={params.r1} on:valueChange={handleValueChange}/>,
    inner 
    <NumberWidget id="r2" min={3} max={600} value={params.r2} on:valueChange={handleValueChange}/> 
    in color 
    <ColorWidget id="color" value={params.color} on:valueChange={handleValueChange}/>
  {:else if name === 'heart'}
    Heart of size 
    <NumberWidget id="size" min={3} max={600} value={params.size} on:valueChange={handleValueChange}/> 
    in color 
    <ColorWidget id="color" value={params.color} on:valueChange={handleValueChange}/>
  {:else if name === 'rectangle'}
    Rectangle of width 
    <NumberWidget id="width" min={3} max={600} value={params.width} on:valueChange={handleValueChange}/>
    and height 
    <NumberWidget id="height" min={3} max={600} value={params.height} on:valueChange={handleValueChange}/> 
    in color 
    <ColorWidget id="color" value={params.color} on:valueChange={handleValueChange}/>
  {:else if name === 'triangle'}
    Triangle of width 
    <NumberWidget id="width" min={3} max={600} value={params.width} on:valueChange={handleValueChange}/> 
    and height 
    <NumberWidget id="height" min={3} max={600} value={params.height} on:valueChange={handleValueChange}/> 
    in color 
    <ColorWidget id="color" value={params.color} on:valueChange={handleValueChange}/>
  {:else if name === 'spiro'}
    Spiro outer:
    <NumberWidget id="outer" min={3} max={300} value={params.outer} on:valueChange={handleValueChange}/>
    , inner:
    <NumberWidget id="inner" min={3} max={params.outer-1} value={params.inner} on:valueChange={handleValueChange}/>
    , pen at:
    <NumberWidget id="d" min={0} max={100} value={params.d} on:valueChange={handleValueChange}/>%
    in
    <ColorWidget id="color" value={params.color} on:valueChange={handleValueChange}/>
    {/if}

    {#if params.position}
    at 
      <CoordinateWidget id="position" value={params.position} on:valueChange={handleValueChange}/>
    {/if}
  {/if}
