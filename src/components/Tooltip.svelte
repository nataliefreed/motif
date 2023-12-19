<script>
  import { onMount, onDestroy } from 'svelte';
  import tippy, { followCursor } from 'tippy.js';
  import 'tippy.js/dist/tippy.css';
  import 'tippy.js/themes/light-border.css';

  export let element; // external element to attach the tooltip to
  export let cursorFollow = false;
  let contentElement;
  let tooltip;

  function reloadTippy() {
    if(tooltip) tooltip.destroy();
    tooltip = tippy(element, {
      content: contentElement,
      theme: 'light-border',
      flipOnUpdate: true,
      interactive: true,
      allowHTML: true,
      arrow: true,
      placement: 'bottom',
      trigger: 'click',
      hideOnClick: true,
      appendTo: document.body,
      onMount(instance) {
        // sliderContainer.style.display = 'block';
    },
      onHide(instance) {
        // sliderContainer.style.display = 'none';
      }
    });
  }

  onMount(() => {
    reloadTippy();
  });

  onDestroy(() => {
    if (tooltip) {
      tooltip.destroy();
    }
  });

</script>

<!-- Hold the tooltip content -->
<div bind:this={contentElement}>
  <slot></slot>
</div>
