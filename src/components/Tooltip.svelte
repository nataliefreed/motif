<script>
  import { onMount, onDestroy } from 'svelte';
  import tippy, { followCursor } from 'tippy.js';
  import 'tippy.js/dist/tippy.css';
  import 'tippy.js/themes/light-border.css';

  export let element; // external element to attach the tooltip to
  export let cursorFollow = false;
  let contentElement;
  let tooltip;
  // let isTooltipVisible = false;

  $: if(element) {
    reloadTippy(); //re-link to new content
  }

  function reloadTippy() {
    // console.log("reloading tippy");
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
        contentElement.style.display = 'block';
        // console.log("tooltip mounted");
    },
      onHide(instance) {
        contentElement.style.display = 'none';
        // console.log("tooltip hidden");
      }
    });
  }

  onMount(() => {
    contentElement.style.display = 'none';
    reloadTippy();
    
  });

  onDestroy(() => {
    // console.log("destroying tooltip");
    contentElement.style.display = 'none';
    if (tooltip) {
      tooltip.destroy();
    }
  });

</script>

<!-- Hold the tooltip content -->
<div bind:this={contentElement} class="not-deselect">
    <slot></slot>
</div>