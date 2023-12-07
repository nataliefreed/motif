<script lang="ts">
  import ColorPalette from './ColorPalette.svelte';
  import { currentColor } from '../../stores/dataStore';

  function handleColorChange(event: CustomEvent) {
    currentColor.set(event.detail);
  }
</script>

<ColorPalette on:colorChange={handleColorChange}/>