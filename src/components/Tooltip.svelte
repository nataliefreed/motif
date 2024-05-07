<script>
  import { onMount, onDestroy } from 'svelte';
  import tippy, { followCursor } from 'tippy.js';
  import 'tippy.js/dist/tippy.css';
  import 'tippy.js/themes/light-border.css';

  export let element; // external element to attach the tooltip to
  let showContent = false;
  // export let onOpen = () => {}; // Callback function prop for when the tooltip opens
  // export let onClose = () => {}; // Callback function prop for when the tooltip opens

  let contentElement;
  let tooltip;

  $: if(element) {
    reloadTippy(); //re-link to new content
  }

  function reloadTippy() {
    // console.log("reloading tippy");
    if(tooltip) tooltip.destroy();
    tooltip = tippy(element, {
      content: contentElement,
      theme: 'light-border',
      // flipOnUpdate: true,
      interactive: true,
      allowHTML: true,
      arrow: true,
      placement: 'bottom',
      trigger: 'click',
      hideOnClick: true,
      appendTo: document.body,
      onShow(instance) {
        showContent = true;
        // console.log("tooltip showing");
      },
      onMount(instance) {
        // showContent = true;
        // contentElement.style.display = 'block';

        // console.log("tooltip mounted");
      },
      onHide(instance) {
        // contentElement.style.display = 'none';
        showContent = false;
        // console.log("tooltip hidden");
      }
    });
  }

  onMount(() => {
    // console.log("mounting tooltip"); //when tooltip first attached to element from parent
    // contentElement.style.display = 'none';
    showContent = false;
    reloadTippy();
    
  });

  onDestroy(() => {
    // console.log("destroying tooltip");
    showContent = false;
    // contentElement.style.display = 'none';
    if (tooltip) {
      tooltip.destroy();
    }
  });

</script>

<!-- Hold the tooltip content -->
<div bind:this={contentElement} class="not-deselect">
    <slot {showContent}></slot>
</div>