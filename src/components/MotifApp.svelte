<script lang="ts">
  import { onMount } from 'svelte';
  import { actionStore, toolStore, selectedEffect, activeCategory, stagedAction } from '../stores/dataStore';
  import LinedPaper from './LinedPaper.svelte';
  import ActionItem from './actions and widgets/ActionItem.svelte';
	import type { Action } from '../types/types';
  import Canvas from './canvas/Canvas.svelte';
  import StagedAction from './actions and widgets/StagedAction.svelte';
  import { addEffectAsStagedAction, saveMyTool } from './action-utils';
  import EffectToolbar from './toolbars/EffectToolbar.svelte';
  import Notebook from './Notebook.svelte';
  import Page from './Page.svelte';
  import { crossfade } from 'svelte/transition';


  const [send, receive] = crossfade({}); // add settings here

  let allCategories:String[] = [];

  toolStore.subscribe(data => {
    allCategories = [...new Set(data.map(tool => tool.category))];
  });

  // if selectedEffect changed, update staged action accordingly
  // TODO: potentially pass in current settings as params, eg. global color or random
  selectedEffect.subscribe(effect => {
    console.log("new effect is:", effect);
    if(effect) {
      addEffectAsStagedAction(effect, {});
    }
    console.log("staged action", $stagedAction);
  });

  // // if staged action changes, update the selected effect
  // watch out for circular dependencies! see selectedEffect.subscribe
  // stagedAction.subscribe(action => {
  //   if (action && action.effect) {
  //     const matchingEffect = $toolStore.find(tool => tool.name === action.effect);
  //     if (matchingEffect) {
  //       selectedEffect.set(matchingEffect);
  //     }
  //   }
  // });

  export let initialActions:Action;

  onMount(() => {
    actionStore.set(initialActions);

    // when data loads, set first effect as selected and initialize the staged action
    toolStore.subscribe(data => {
      if (data && data.length > 0) {
        selectedEffect.set(data[0]); // set the first effect as default
        activeCategory.set(data[0].category);
      }
    });
    

  });

  function onReorder(event:any) {
    console.log("actionStore:", {$actionStore});
    const { oldIndex, newIndex } = event.detail;
    if (oldIndex === newIndex) return;

    actionStore.update(currentData => {
      if (!currentData.children) return currentData;
      const [movedItem] = currentData.children.splice(oldIndex, 1);
      currentData.children.splice(newIndex, 0, movedItem);
      return currentData;
    });
  }

  let count = 1;

</script>


<Notebook>
  <Page slot="left">
    <!-- <button on:click={() => count++}>
      Re-render Canvas
    </button> -->
    <EffectToolbar categories={allCategories} />
    {#key count}
      <Canvas />
    {/key}
    {#if $stagedAction}
      <ActionItem action={$stagedAction} />
    {/if}
    <button id="saveTool" on:click={() => saveMyTool($stagedAction) }>Save to My Tools</button>
  </Page>
  <Page slot="right">
      <LinedPaper>
        <ActionItem action={$actionStore} depth={0} on:reorder={onReorder} />
      </LinedPaper>
      <!-- <CodeToolbar /> -->
  </Page>
</Notebook>

<!-- <style>
  .staged-action {
    position: absolute; /* so we can position it anywhere in the parent container */
    transform: translate(0, 0); /* start position */
    transition: transform 1s ease-in-out; /* 1s duration, ease-in-out timing function */
  }

  .staged-action.animate-to-end {
    transform: translate(0, 200px); /* move down by 200px */
  }



</style> -->