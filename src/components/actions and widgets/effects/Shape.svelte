<script lang="ts">
  import ColorWidget from "../ColorWidget.svelte";
  import NumberWidget from "../NumberWidget.svelte";
  import CoordinateWidget from "../CoordinateWidget.svelte"; // Assuming you have a widget for coordinates

  export let name = '';
  export let params: any = {};
  export let onUpdate: (params: any) => void; // callback to update the actionStore

  function handleValueChange(event: CustomEvent) {
    const { id, value } = event.detail;
    const updatedParams = { ...params, [id]: value };
    onUpdate(updatedParams);
  }
</script>

{#if name === 'circle'}
<div>
  Circle of radius 
  <NumberWidget id="radius" min={1} max={600} value={params.radius} on:valueChange={handleValueChange}/>
  in color 
  <ColorWidget id="color" value={params.color} on:valueChange={handleValueChange}/>
  at 
  <CoordinateWidget id="position" value={params.position} on:valueChange={handleValueChange}/>
</div>
{:else if name === 'square'}
<div>
  Square of size 
  <NumberWidget id="size" min={1} max={600} value={params.size} on:valueChange={handleValueChange}/>
  in color 
  <ColorWidget id="color" value={params.color} on:valueChange={handleValueChange}/>  
  at 
  <CoordinateWidget id="position" value={params.position} on:valueChange={handleValueChange}/>
</div>
{:else if name === 'polygon'}
<!-- Similarly for polygon -->
<div>
  Polygon with 
  <NumberWidget id="nsides" min={3} max={50} value={params.nsides} on:valueChange={handleValueChange}/> sides 
  and radius 
  <NumberWidget id="radius" min={1} max={600} value={params.radius} on:valueChange={handleValueChange}/>
  in color 
  <ColorWidget id="color" value={params.color} on:valueChange={handleValueChange}/>  
  at 
  <CoordinateWidget id="position" value={params.position} on:valueChange={handleValueChange}/>
</div>
{:else if name === 'star'}
<div>
  Star with 
  <NumberWidget id="npoints" min={3} max={200} value={params.npoints} on:valueChange={handleValueChange}/> points,
  outer 
  <NumberWidget id="r1" min={1} max={600} value={params.r1} on:valueChange={handleValueChange}/>,
  inner 
  <NumberWidget id="r2" min={1} max={600} value={params.r2} on:valueChange={handleValueChange}/> 
  in color 
  <ColorWidget id="color" value={params.color} on:valueChange={handleValueChange}/>  
  at 
  <CoordinateWidget id="position" value={params.position} on:valueChange={handleValueChange}/>
</div>
{:else if name === 'heart'}
<div>
  Heart of size 
  <NumberWidget id="size" min={1} max={600} value={params.size} on:valueChange={handleValueChange}/> 
  in color 
  <ColorWidget id="color" value={params.color} on:valueChange={handleValueChange}/>  
  at 
  <CoordinateWidget id="position" value={params.position} on:valueChange={handleValueChange}/>
</div>
{:else if name === 'rectangle'}
<div>
  Rectangle of width 
  <NumberWidget id="width" min={1} max={600} value={params.width} on:valueChange={handleValueChange}/>
  and height 
  <NumberWidget id="height" min={1} max={600} value={params.height} on:valueChange={handleValueChange}/> 
  in color 
  <ColorWidget id="color" value={params.color} on:valueChange={handleValueChange}/>  
  at 
  <CoordinateWidget id="position" value={params.position} on:valueChange={handleValueChange}/>
</div>
{:else if name === 'triangle'}
<div>
  Triangle of width 
  <NumberWidget id="width" min={1} max={600} value={params.width} on:valueChange={handleValueChange}/> 
  and height 
  <NumberWidget id="height" min={1} max={600} value={params.height} on:valueChange={handleValueChange}/> 
  in color 
  <ColorWidget id="color" value={params.color} on:valueChange={handleValueChange}/>  
  at 
  <CoordinateWidget id="position" value={params.position} on:valueChange={handleValueChange}/>
</div>
{/if}
