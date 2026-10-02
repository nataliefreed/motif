<script lang="ts">
  import PathWidget from "../PathWidget.svelte";
  import StringWidget from "../StringWidget.svelte";
  import ListWidget from "../ListWidget.svelte";
  import ChildrenWidget from "../ChildrenWidget.svelte";
  import NumberWidget from "../NumberWidget.svelte";
  import AngleWidget from "../AngleWidget.svelte";
  import CoordinateWidget from "../CoordinateWidget.svelte";
  import { flatActionStore } from "../../../stores/dataStore";
  import { groupMiddle, isChildOfAlongPath } from "../../action-utils";
    import repeat from "svelte-awesome/icons/repeat";
  import Words from "../Words.svelte";
  import { help } from "../../help";
  import { t, phraseWords, displayTitle } from "../../../i18n";

  export let uuid = '';
  export let name = '';
  export let params: any = {};
  export let onUpdate: (params: any) => void; // callback to update the actionStore
  export let depth = 0;
  export let isOpen = false;
  export let isRecipe = false; // the top-level list: "How To Make My Design"
  

  function handleValueChange(event: CustomEvent) {
    const { id, value } = event.detail;
    onUpdate({[id]: value });
    // console.log("handling value change in control structure", id, value);
  }

  $: drawWithWords = phraseWords($t.steps.drawWith); // see `steps` in i18n/en.ts
  $: atWords = phraseWords($t.steps.at);

  // A group (made with "label") can be moved and turned, carrying its steps along (see moveWithGroup in
  // action-utils). Its position is where the middle of its steps is drawn: their middle, moved by `moveBy`.
  // Like a shape, a group inside a brush shows only its angle, since the brush places it.
  $: isGroup = name === 'do each' && !isRecipe;
  $: middle = isGroup && !isChildOfAlongPath(uuid) && $flatActionStore ? groupMiddle(params.children) : null;
  $: moveBy = params.moveBy ?? { x: 0, y: 0 };

  function handleMove(event: CustomEvent) {
    if (!middle) return;
    const { x, y } = event.detail.value;
    onUpdate({ moveBy: { x: x - middle.x, y: y - middle.y } });
  }

  function toggle() {
    // console.log("toggling");
      isOpen = !isOpen;
  }

</script>

{#if name === 'do each'}
  <span class="list-title" use:help={{ text: isRecipe ? $t.help.recipe : undefined, placement: 'right' }}><StringWidget id='title' value={$displayTitle(params.title)} on:valueChange={handleValueChange}/></span>
  {#if middle}<Words text={atWords[0]}/><CoordinateWidget id="position" value={{ x: middle.x + moveBy.x, y: middle.y + moveBy.y }}
    on:valueChange={handleMove}/><Words text={atWords[1]}/>{/if}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <span class="toggle-arrow" on:click={toggle}> {isOpen ? '▼' : '▶'}</span>
  <!-- {#if isOpen} -->
  <div hidden={!isOpen}>
    <ListWidget id='children' value={params.children} {depth} on:valueChange={handleValueChange} on:saveChange/>
  </div>
  <!-- {/if} -->
  {#if isGroup}<AngleWidget id='angle' min={0} max={360} value={params.angle ?? 0} on:valueChange={handleValueChange}/>{/if}


{:else if name === 'along path'}
<div class="along-path-widget" class:expanded={isOpen}>
  <div class="brush-definition">
    <span class="brush-name-and-preview-widget">
      <Words text={drawWithWords[0]}/><StringWidget id='title' value={$displayTitle(params.title)}
        on:valueChange={handleValueChange}/><Words text={drawWithWords[1]}/>
    </span>
    <!-- svelte-ignore a11y-click-events-have-key-events -->

    <div class="arrow-and-definition">
    <span class="toggle-arrow" on:click={toggle} use:help={{ text: $t.help.brushInside }}> {isOpen ? '▼' : '▶'}</span>
      <ChildrenWidget id='children' on:miniActionClick={toggle} value={params.children}/>
  </div>
      <!-- {#if isOpen} -->
        <div hidden={!isOpen}>
          <ListWidget id='children' value={params.children} {depth} on:valueChange={handleValueChange} on:saveChange/>
        </div>
      <!-- {/if} -->

  </div>

  <div class="along-path">
    <!-- <span>along</span> -->
    <PathWidget id='path' path={params.path} angle={params.angle} on:valueChange={handleValueChange}/>
  </div>

  <AngleWidget id='angle' min={0} max={360} value={params.angle} on:valueChange={handleValueChange}/>

</div>
  

{/if}

<style>

  .toggle-arrow {
    display: inline;
  }

  /* .list-title {
    position: sticky;
    top: 0;
    margin-bottom: 20px;
  } */

  .arrow-and-definition {
    display: flex;
    flex-direction: row;
    gap: 0.5em;
  }

  .along-path-widget {
    /* border: 1px solid red; */
    display: flex;
    flex-direction: row;
    gap: 0.5em;
  }

  /* .along-path-widget.expanded {
    flex-direction: row;
    gap: 0.5em;
  } */

  .brush-definition {
    /* border: 1px solid blue; */
    /* display: flex;
    flex-direction: column;
    align-items: center; */
    /* padding-left: 0.5em; */
  }

  .along-path {
    /* border: 1px solid green; */
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-end;
    margin-left: 0.5em;
  }

  .brush-name-and-preview-widget {
    /* border: 1px solid purple; */
    display: flex;
    flex-direction: row;
    gap: 0.5em;
    /* margin-bottom: 0.2em; */
    align-items: center;
    /* justify-content: center; */
  }

</style>