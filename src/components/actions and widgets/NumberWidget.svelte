<script lang="ts">
  import tippy from 'tippy.js';
  import 'tippy.js/dist/tippy.css'; 
  import 'tippy.js/themes/light-border.css';
  import { onMount, onDestroy, beforeUpdate } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import { selectedCodeEffect } from '../../stores/dataStore';

  const dispatch = createEventDispatcher();

  export let id = '';
  export let min = 0;
  export let max = 300;
  export let value: number = 0;

  let numberWidget: HTMLElement;
  let sliderElement: HTMLInputElement;
  let sliderContainer: HTMLDivElement;
  let tippyInstance: any;

  $: if (value < min) {
    value = min;
  } else if (value > max) {
    value = max;
  }

  $: if(numberWidget) {
    reloadTippy();
  }

  function reloadTippy() {
    if(tippyInstance) tippyInstance.destroy();
    tippyInstance = tippy(numberWidget, {
      content: sliderContainer,
      theme: 'light-border',
      interactive: true,
      allowHTML: true,
      arrow: true,
      placement: 'bottom',
      trigger: 'click',
      hideOnClick: true,
      appendTo: document.body,
      onMount(instance) {
        sliderContainer.style.display = 'block';
    },
      onHide(instance) {
        sliderContainer.style.display = 'none';
      }
    });
  }

  onMount(() => {
    // console.log("mounting number widget");
    // Initialize the Tippy instance with the actual DOM element
    reloadTippy();
  });

  onDestroy(() => {
    // console.log("unmounting number widget");
    if(tippyInstance) tippyInstance.destroy();
  });

  function updateValue(event: Event) {
    value = +sliderElement.value; //+ is string to number
    debugger;
  }

  function handleClick(event: Event) {
    if($selectedCodeEffect === "shuffle") {
      randomize();
      dispatch('valueChange', { id, value: +value });
    }
  }

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    // console.log("target.value:", target.value);
    dispatch('valueChange', { id, value: +target.value });
  }

  function randomize() {
    value = Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // $: if(value && inputElement && sliderElement) {
  //     if (value !== +inputElement.value) {
  //       inputElement.value = value.toString();
  //       sliderElement.value = value.toString();
  //     }
  //   }

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<span class="number-widget" bind:this={numberWidget} on:click={handleClick}>
  {value}
</span>

<div bind:this={sliderContainer} class="slider-container" style="display: none;">

  <input type="number"
  class="numberbox-for-slider" 
  bind:value={value} 
  min={min} 
  max={max}
  on:input={handleChange}/>

  <input type="range"
  class="slider-for-numberbox" 
  bind:value={value} 
  min={min} 
  max={max}
  bind:this={sliderElement}
  on:input={handleChange}/>

</div>

<style>
  .slider-container {
    padding: 10px;
    /* background: white; */
    /* box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: 1px solid #ccc; */
  }

  .slider-container:has([data-tippy-root]) {
    display: block;
  }

  /* number that can be clicked to display a slider modal*/
  .number-widget {
      display: inline-block;
      text-decoration: underline lightgray 2px;
      text-underline-offset: 5px;
      cursor: pointer;
  }

  .slider-for-numberbox {
      display: block;
      width: 100px;
      margin: 30px 0 10px 0;
  }

  .numberbox-for-slider {
      display: block;
      text-align: center;
      margin: auto;
      width: 60%;
      font-family: 'FuturaHandwritten';
      font-size: 24px;
      border: 1px solid lightgray;
      border-radius: 4px;          /* rounds the corners slightly */
      outline: none;               /* removes the blue outline when focused */
      padding: 5px 8px;            /* adds some internal spacing */
      transition: border 0.3s;    /* smooth transition for border changes */
  }

  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button {  
   opacity: 1;                   /* always show arrows for numberbox in Chrome, other browsers have this by default */
  }

  .numberbox-for-slider:focus {
    border-color: darkgray;       /* changes border color when input is focused */
    background-color: lightgray;
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