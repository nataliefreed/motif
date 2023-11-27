<script>
  import { onMount } from 'svelte';
  import tippy, { followCursor } from 'tippy.js';
  import 'tippy.js/dist/tippy.css';
  import 'tippy.js/themes/light-border.css';

  export let element; // external element to attach the tooltip to
  export let cursorFollow = false;
  let contentElement;

  onMount(() => {
    if (element) {
      tippy(element, {
        content: contentElement,
        followCursor: cursorFollow,
        plugins: [followCursor],
        hideOnClick: false,
        theme: 'light-border',
        allowHTML: true,
      });
    }
  });
</script>

<!-- Hold the tooltip content -->
<div bind:this={contentElement}>
  <slot></slot>
</div>
