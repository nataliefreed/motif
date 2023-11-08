<script lang="ts">
  import MotifApp from  '../components/MotifApp.svelte';
  import DataInitializer from '../stores/DataInitializer.svelte';
  import { actionStore } from '../stores/dataStore';
</script>

<style>
    /* body {
        margin: 0;
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: #f7f8f9;
        font-family: 'Courier New', Courier, monospace;
    } */

    /* * {
        border: 1px solid red; 
    } */

    html, body {
    height: 100%; /* Ensure full viewport height */
    margin: 0;    /* Remove default margins */
    overflow: hidden; /* Prevent scrolling at the body and html level */
    font-size: var(--base-font-size);
    line-height: calc(var(--line-height-multiplier) * 1em);
    font-family: 'FuturaHandwritten';
    font-weight: 100;
    background-color: #e9e9e9;
  }

  body {
    display: flex;
    justify-content: center; /* Horizontally center the child content/containers */
    align-items: center;
    height: 100vh;
  }

  @font-face{ 
      font-family: 'FuturaHandwritten';
      font-style: normal;
      src: url('../assets/FuturaHandwritten.ttf') format('truetype');
  }
</style>

<body>
    <DataInitializer />
    <MotifApp initialActions={$actionStore}/>
</body>