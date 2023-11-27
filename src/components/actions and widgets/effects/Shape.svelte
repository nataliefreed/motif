<script lang="ts">
  import ColorWidget from "../ColorWidget.svelte";
  import NumberWidget from "../NumberWidget.svelte";
  import CoordinateWidget from "../CoordinateWidget.svelte";

  export let name = '';
  export let params: any = {};
  export let onUpdate: (params: any) => void; // callback to update the actionStore

  function handleValueChange(event: CustomEvent) {
    const { id, value } = event.detail;
    const updatedParams = { ...params, [id]: value };
    onUpdate(updatedParams);
  }
</script>

<div>
{#if name === 'circle'}
  Circle of radius 
  <NumberWidget id="radius" min={1} max={600} value={params.radius} on:valueChange={handleValueChange}/>
  in color 
  <ColorWidget id="color" value={params.color} on:valueChange={handleValueChange}/>
{:else if name === 'square'}
  Square of size 
  <NumberWidget id="size" min={1} max={600} value={params.size} on:valueChange={handleValueChange}/>
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
  <NumberWidget id="r1" min={1} max={600} value={params.r1} on:valueChange={handleValueChange}/>,
  inner 
  <NumberWidget id="r2" min={1} max={600} value={params.r2} on:valueChange={handleValueChange}/> 
  in color 
  <ColorWidget id="color" value={params.color} on:valueChange={handleValueChange}/>
{:else if name === 'heart'}
  Heart of size 
  <NumberWidget id="size" min={1} max={600} value={params.size} on:valueChange={handleValueChange}/> 
  in color 
  <ColorWidget id="color" value={params.color} on:valueChange={handleValueChange}/>
{:else if name === 'rectangle'}
  Rectangle of width 
  <NumberWidget id="width" min={1} max={600} value={params.width} on:valueChange={handleValueChange}/>
  and height 
  <NumberWidget id="height" min={1} max={600} value={params.height} on:valueChange={handleValueChange}/> 
  in color 
  <ColorWidget id="color" value={params.color} on:valueChange={handleValueChange}/>
{:else if name === 'triangle'}
  Triangle of width 
  <NumberWidget id="width" min={1} max={600} value={params.width} on:valueChange={handleValueChange}/> 
  and height 
  <NumberWidget id="height" min={1} max={600} value={params.height} on:valueChange={handleValueChange}/> 
  in color 
  <ColorWidget id="color" value={params.color} on:valueChange={handleValueChange}/>
{:else if name === 'copy cutout'}
  Copy rect of width
  <NumberWidget id="width" min={1} max={600} value={params.width} on:valueChange={handleValueChange}/> 
  and height 
  <NumberWidget id="height" min={1} max={600} value={params.height} on:valueChange={handleValueChange}/> 
  from
  <CoordinateWidget id="start" value={params.start} on:valueChange={handleValueChange}/>
  to
  <CoordinateWidget id="end" value={params.end} on:valueChange={handleValueChange}/>
{/if}

{#if params.position && !params.tempPosition}
at 
  <CoordinateWidget id="position" value={params.position} on:valueChange={handleValueChange}/>
{/if}
</div>
