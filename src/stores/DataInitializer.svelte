<script lang="ts">
  import { page } from '$app/stores';
  import { initStores } from './dataStore';

  // Read parameters from the URL
  let projectID = $page.url.searchParams.get('projectid');
  console.log(projectID);

  // Initialize your stores
  initStores(projectID);
</script>