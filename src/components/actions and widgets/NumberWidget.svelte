<script lang="ts">
  import tippy from 'tippy.js';
  import 'tippy.js/dist/tippy.css'; 
  import { onMount, beforeUpdate } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let id = '';
  export let min = 0;
  export let max = 300;
  export let value: number = 0;

  let inputElement: HTMLInputElement;
  let sliderElement: HTMLInputElement;
  let sliderContainer: HTMLDivElement;
  let tippyInstance: any;

  // $: console.log('New value in NumberWidget:', value);

  // beforeUpdate(() => {
  //   console.log('Updating number widget', value);
  // });

  onMount(() => {
    // Initialize the Tippy instance with the actual DOM element
    tippyInstance = tippy(inputElement, {
      content: sliderContainer,
      interactive: true,
      allowHTML: true,
      arrow: true,
      placement: 'bottom',
      trigger: 'click',
      hideOnClick: true,
      onMount(instance) {
        sliderContainer.style.display = 'block';
    },
      onHide(instance) {
        sliderContainer.style.display = 'none';
      }
    });
  });

  function updateValue(event: Event) {
    value = +sliderElement.value; //+ is string to number
  }

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    // console.log("target.value:", target.value);
    dispatch('valueChange', { id, value: target.value });
  }

  // $: if(value && inputElement && sliderElement) {
  //     if (value !== +inputElement.value) {
  //       inputElement.value = value.toString();
  //       sliderElement.value = value.toString();
  //     }
  //   }

</script>

<input 
  type="number" 
  bind:value={value} 
  min={min} 
  max={max} 
  id={id}
  bind:this={inputElement}
  on:input={handleChange}
/>

<div bind:this={sliderContainer} class="slider-modal" style="display: none;">
  <input type="range" 
  bind:value={value} 
  min={min} 
  max={max}
  bind:this={sliderElement}
  on:input={handleChange}/>

  {value}

</div>

<style>
  .slider-modal {
    padding: 10px;
    background: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: 1px solid #ccc;
  }

  .slider-modal:has([data-tippy-root]) {
    display: block;
  }
</style>

<!-- TODO: sortable reordering causing issues with Tippy -->
<!-- function onReorder(event:any) {
  // Destroy all tippy instances before reordering
  tippyInstance.destroyAll();

  console.log("actionStore:", {$actionStore});
  const { oldIndex, newIndex } = event.detail;
  if (oldIndex === newIndex) return;

  actionStore.update(currentData => {
    if (!currentData.children) return currentData;
    const [movedItem] = currentData.children.splice(oldIndex, 1);
    currentData.children.splice(newIndex, 0, movedItem);
    return currentData;
  });

  // Reinitialize tippy after reordering is complete
  tippyInstance = tippy(inputElement, {
    content: sliderContainer,
    interactive: true,
    arrow: true,
    placement: 'bottom',
    trigger: 'click',
    hideOnClick: 'toggle'
  });
} -->