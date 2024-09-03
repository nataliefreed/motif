<script lang="ts">
  import MotifApp from  '../components/MotifApp.svelte';
  import DataInitializer from '../stores/DataInitializer.svelte';
</script>

<body>
    <DataInitializer />
    <MotifApp />
</body>

<svelte:head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>MOTIF</title>
</svelte:head>