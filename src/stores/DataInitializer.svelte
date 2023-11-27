<script lang="ts">
  import { page } from '$app/stores';
  import { initStores } from './dataStore';
  import { initHistoryStore } from './history';

  // Read parameters from the URL
  let projectID = $page.url.searchParams.get('projectid');
  console.log(projectID);

  // Initialize your stores
  initStores(projectID);
  console.log("stores initialized");
  initHistoryStore();

</script>