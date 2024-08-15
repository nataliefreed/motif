<script lang="ts">
import { getReadableColor } from '../../utils/color-utils';

 export let id = -1;
 export let color = '#FFFFFF';

//  $: textColor = getReadableColor(color);

</script>

<span class="saved-color-label" style="color:{getReadableColor(color)}">{String.fromCharCode(97 + id)}</span>

<style>

  .saved-color-label {
    font-size: 80%;
    font-family: 'Verdana';
  }

</style>

