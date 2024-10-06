<script lang="ts">
  import type { Action } from '../../types/types';
  import { onMount, createEventDispatcher } from 'svelte';
  import { updateActionParams, selectAction } from '../action-utils';
  import PathWidget from './PathWidget.svelte';

  export let action: Action | null;
  const dispatch = createEventDispatcher();

  function createPolygonPoints(nsides, radius, centerX, centerY) {
    let points = '';
    for (let i = 0; i < nsides; i++) {
      const angle = 2 * Math.PI * i / nsides;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points += `${x},${y} `;
    }
    return points.trim();
  }

  function createStarPoints(npoints, r1, centerX, centerY) {
    let points = '';
    let r2 = r1 / 1.5;
    for (let i = 0; i < 2 * npoints; i++) {
      const radius = i % 2 === 0 ? r1 : r2;
      const angle = Math.PI * i / npoints;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points += `${x},${y} `;
    }
    return points.trim();
  }

  function createHeart(size: number) {
    const x = 0.6 * size;
    const y = 0.3 * size;
    const path = `M${x},${y} 
                  C${x - size / 2},${y - size / 2}, ${x - size},${y + size / 3}, ${x},${y + size} 
                  C${x + size},${y + size / 3}, ${x + size / 2},${y - size / 2}, ${x},${y}`;
    return path;
  }

  function handleClick() {
    if(!action) return;
    selectAction(action.uuid);
    dispatch('miniActionClick', action.uuid);
  }

  function constrain(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

  // Convert list of points to a string of SVG path commands
  // M for move to start position, L for line to each point
  function getPathData(path: [number, number][]) {
    // console.log("getting path data", path);
    if(!path || path.length === 0) path = [[0, 0]];
    return path.map((pt, index) => 
      `${index === 0 ? 'M' : 'L'} ${pt[0]},${pt[1]}`
    ).join(' ');
  }

</script>

{#if action}
{@const size = 14}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <span on:click={handleClick}>
    {#if action.category === 'shapes' || action.name === 'straight line'}
      {#if action.name === 'circle'}
        <svg width="{size}" height="{size}" xmlns="http://www.w3.org/2000/svg">
          <circle cx="{size / 2}" cy="{size / 2}" r="{constrain(action.params.radius, 0, size/2) }" fill="{action.params.color}" />
        </svg>
      {:else if action.name === 'rectangle'}
        {@const aspectRatio = action.params.width / action.params.height}
        {@const rectWidth = Math.max(aspectRatio >= 1 ? size : size * aspectRatio, 4)}
        {@const rectHeight = Math.max(aspectRatio >= 1 ? size / aspectRatio : size, 4)}
        {@const rectX = (size - rectWidth) / 2}
        <svg width="{rectWidth+size/2}" height="{size}" xmlns="http://www.w3.org/2000/svg">
          <rect x="{rectX}" width="{rectWidth}" height="{rectHeight}" fill="{action.params.color}" />
        </svg>
      {:else if action.name === 'triangle'}
        <svg width="{size}" height="{size}" xmlns="http://www.w3.org/2000/svg">
          <polygon points="{size / 2},0 {size},{size} 0,{size}" fill="{action.params.color}" />
        </svg>
      {:else if action.name === 'polygon'}
        <svg width="{size}" height="{size}" xmlns="http://www.w3.org/2000/svg">
          <polygon points="{createPolygonPoints(action.params.nsides, size / 2, size / 2, size / 2)}" fill="{action.params.color}" />
        </svg>
      {:else if action.name === 'star'}
        <svg width="{size}" height="{size}" xmlns="http://www.w3.org/2000/svg">
          <polygon points="{createStarPoints(action.params.npoints, size / 2, size / 2, size / 2)}" fill="{action.params.color}" />
        </svg>
      {:else if action.name === 'heart'}
      <svg width="{size}" height="{size}" xmlns="http://www.w3.org/2000/svg">
        <path d="{createHeart(size*0.7)}" fill="{action.params.color}" />
      </svg>
      {:else if action.name === 'square'}
        <svg width="{size}" height="{size}" xmlns="http://www.w3.org/2000/svg">
          <rect x="{size * 0.1}" y="{size * 0.1}" width="{size*0.8}" height="{size*0.8}" fill="{action.params.color}" />
        </svg>
      {:else if action.name === 'straight line'}
        <svg width="{size}" height="{size}" xmlns="http://www.w3.org/2000/svg">
          <line x1="{0}" y1="{size/2}" x2="{size}" y2="{size/2}" stroke="{action.params.color}" stroke-width="3" />
        </svg>
      {:else if action.name === 'text'}
        <svg width="{size}" height="{size}" xmlns="http://www.w3.org/2000/svg">
          <text
            x="50%"
            y="50%"
            font-size="{size*0.9}"
            fill="{action.params.color}"
            dominant-baseline="middle"
            text-anchor="middle"
            font-family="'Arial Rounded MT Bold', sans-serif">
            {action.params.text}
          </text>
        </svg>
      {/if}
    {:else if action.name == 'along path'}
      <svg width="{size}" height="{size}" viewBox="0 0 540 540" style="margin-right:{size/4}">
        <path d={getPathData(action.params.path)} stroke="black" fill="none" />
        {#each action.params.path as point, index}
          {#if index > 0}
            <line x1={action.params.path[index - 1][0]} y1={action.params.path[index - 1][1]} x2={point[0]} y2={point[1]} stroke="black" />
          {/if}
        <circle cx={point[0]} cy={point[1]} r="20" fill="black" />
      {/each}
      </svg>
    {:else if action.name === 'do each'}
      <span class="mini-title">{action.params.title}</span>
    {/if}
  </span>
{/if}

<style>

svg {
  transform: translateY(2px);
  /* margin: 0 -2px; */
  cursor: pointer;
}

.mini-title {
  display: inline-block;
  font-size: 0.5em;
  font-family: 'FuturaHandwritten';
  margin-left: 0.5em;
  margin-right: 0.5em;
  line-height: 1em;
  text-align: center;
  font-style: italic;
  max-width: 25px;
  max-height: 1.5em;
}

</style>
