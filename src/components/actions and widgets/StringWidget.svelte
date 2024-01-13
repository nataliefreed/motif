<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let id = '';
  export let value: string;
  let stringWidget: HTMLElement;

  const dispatch = createEventDispatcher();

  function restrictInput(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === 'Escape') {
      event.preventDefault(); // Prevent default Enter key behavior
      let target = event.target as HTMLElement;
      target.blur(); // Remove focus from the element
      return;
    }

    const regex = /^[a-zA-Z0-9 ]+$/; // Regex to allow alphanumeric characters and spaces

    //event.key.length > 1 are control characters
    if (event.key.length === 1 && !regex.test(event.key)) {
      event.preventDefault();
    }
  }

  $: if(value) {
    dispatch('valueChange', { id, value: value });
  }

  $: if (value.length > 32) {
    value = value.substring(0, 32); // Limit number of characters
  }

  function sanitizeInput() {
    // console.log('sanitizing input');
    value = value.replace(/[\.\s]{2,}/g, ' '); // Replace double spaces or periods with a single space
    value = value.replace(/[^a-zA-Z0-9 ]/g, ''); // Ensure content is alphanumeric and spaces only
    if (value.length < 1) {
      value = 'name this tool';
    }
  }

</script>

<span class="string-widget"
      bind:innerText={value}
      on:keydown={restrictInput}
      on:blur={sanitizeInput}
      on:paste={sanitizeInput}
      contenteditable="true"
      spellcheck="false">
</span>

<style>
  .string-widget {
    text-decoration: underline lightgray 2px;
    text-underline-offset: 5px;
    cursor: text;
    font-style: italic;
  }
</style>


<!-- <style>
  .string-widget {
    text-decoration: underline lightgray 2px;
    text-underline-offset: 5px;
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
  }
</style> -->