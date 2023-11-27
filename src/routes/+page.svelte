<script lang="ts">
  import MotifApp from  '../components/MotifApp.svelte';
  import DataInitializer from '../stores/DataInitializer.svelte';
  import { actionStore } from '../stores/dataStore';
</script>

<body>
    <DataInitializer />
    <MotifApp initialActions={$actionStore}/>
</body>