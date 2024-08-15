<script>
  import { onMount, onDestroy } from 'svelte';
  import tippy, { followCursor } from 'tippy.js';
  import 'tippy.js/dist/tippy.css';
  import 'tippy.js/themes/light-border.css';
  import { saveToHistory } from '../stores/history';

  export let element; // external element to attach the tooltip to
  let showContent = false;

  let contentElement;
  let tooltip;
  export let settings = {};

  $: if(element) {
    reloadTippy(); //re-link to new content - todo: clean this up
  }

  function reloadTippy() {

    // Create or get a tooltip container to append tooltips to
    let tooltipContainer = document.getElementById('tooltip-container');
    if (!tooltipContainer) {
      tooltipContainer = document.createElement('div');
      tooltipContainer.id = 'tooltip-container';
      document.body.appendChild(tooltipContainer);
    }

    // console.log("reloading tippy");
    if(tooltip) tooltip.destroy();
    tooltip = tippy(element, {
      plugins: [followCursor],
      content: contentElement,
      theme: 'light-border',
      interactive: true,
      allowHTML: true,
      arrow: true,
      trigger: 'click',
      hideOnClick: true,
      appendTo: tooltipContainer,
      ...settings,
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

    tooltipContainer.addEventListener('mouseleave', handleMouseLeave);
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

    // Clean up event listener
    const tooltipContainer = document.getElementById('tooltip-container');
    if (tooltipContainer) {
      tooltipContainer.removeEventListener('mouseleave', handleMouseLeave);
    }
  });

  function handleMouseLeave() {
    saveToHistory("leaving parameter settings");
  }

</script>

<!-- Hold the tooltip content -->
<div bind:this={contentElement} class="not-deselect">
    <slot {showContent}></slot>
</div>