/* 
  Note: just a starting point, I think this should reference the outer list and not the lined paper
  Also the store should be in a store file
*/

<script lang="ts">
  import { writable } from 'svelte/store';

  // Store for line number
  export const lineNumber = writable(0);

  let yPosition = 0; // Initial position of the playhead
  let listContainer; // Reference to the list container

  // Function to handle the dragging logic
  function drag(event) {
    // Calculate new position and restrict to vertical movement
    // Update yPosition accordingly
    // Calculate line number based on yPosition and update lineNumber store
  }

  // Function to handle the drop logic
  function drop(event) {
    // Finalize the position and update lineNumber store
  }

  // Function to update the playhead's position based on lineNumber
  function updatePosition() {
    // Calculate yPosition based on lineNumber and list's scroll position
  }

  // Subscribe to lineNumber to update playhead's position
  $: lineNumber.subscribe(updatePosition);
</script>

<div bind:this={listContainer} class="lined-paper">
  <div use:drag class="playhead" style="top: {yPosition}px;"></div>
  <slot></slot>
</div>

<style>
  .playhead {
    position: absolute;
    left: 0;
  }
</style>
