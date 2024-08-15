<script lang="ts">
  import { page } from '$app/stores';
  import { initStores } from './dataStore';
  import { initPaintStore } from './colorStore';

  // Read parameters from the URL
  let projectID = $page.url.searchParams.get('projectid');

  if(projectID) {
    console.log("projectID from URL: ", projectID);
  } else {
    console.log("No projectID found in URL");
  }

  initStores(projectID);
  console.log("stores initialized");

  initPaintStore();
  console.log("paint store initialized");

</script>