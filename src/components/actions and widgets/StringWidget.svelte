<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let id = '';
  export let value: string = '';
  let stringWidget: HTMLElement;
  export let showQuotes = false;

  const dispatch = createEventDispatcher();

  function restrictInput(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === 'Escape') {
      event.preventDefault(); // Prevent default Enter and Esc key behavior
      let target = event.target as HTMLElement;
      target.blur(); // Remove focus from the element
      return;
    }

    const regex = /^[a-zA-Z0-9 .,!?'"-]+$/; // Regex to allow alphanumeric characters and spaces

    //event.key.length > 1 are control characters
    if (event.key.length === 1 && !regex.test(event.key)) {
      event.preventDefault();
    }
  }

  // $: if(value) {
  //   dispatch('valueChange', { id, value: value });
  //   console.log('dispatching value change', value);
  // }

  $: if (value.length > 32) {
    value = value.substring(0, 32); // Limit number of characters
  }

  function sanitizeInput() {
    // console.log('sanitizing input');
    value = value.replace(/[\.\s]{2,}/g, ' '); // Replace double spaces or periods with a single space
    value = value.replace(/[^a-zA-Z0-9 .,!?'"-]/g, ''); // Remove any characters that are not alphanumeric, spaces, or punctuation
    if (value.length < 1) {
      value = 'what is this?';
    }
  }

  function handleChange() {
    // console.log('handling change');
    sanitizeInput();
    dispatch('valueChange', { id, value: value });
    // console.log('dispatching value change in string widget', value);
  }

</script>

<!-- note: with the wrapper div using flex layout, moves arrow to new line
 this works for quotes for the text effect, but would need to be adjusted for other strings -->

<!-- svelte-ignore a11y-no-static-element-interactions -->
  {#if showQuotes}
  <div class="string-wrapper">
    "<span class="string-widget"
      bind:innerText={value}
      on:keydown={restrictInput}
      on:blur={handleChange}
      on:paste={handleChange}
      contenteditable="true"
      spellcheck="false">
      </span>"
    </div>
  {:else}
    <span class="string-widget"
      bind:innerText={value}
      on:keydown={restrictInput}
      on:blur={handleChange}
      on:paste={handleChange}
      contenteditable="true"
      spellcheck="false">
    </span>
  {/if}
  

<style>
  .string-widget {
    text-decoration: underline lightgray 2px;
    text-underline-offset: 5px;
    cursor: text;
    font-style: italic;
    color: #0a3f0c;
    font-family: 'FuturaHandwritten';
    /* font-family: 'fandango'; */
  }

  .string-wrapper {
    display: flex;
    flex-direction: row;
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