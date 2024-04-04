<script lang="ts">
  import type { Action } from '../../types/types';
  import { onMount, createEventDispatcher } from 'svelte';
  import { updateActionParams, selectAction } from '../action-utils';

  export let action: Action | null;

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

</script>

{#if action}
  <span>
    {#if action.category === 'shapes'}
      {@const size = 14}
      {#if action.name === 'circle'}
        <svg width="{size}" height="{size}" xmlns="http://www.w3.org/2000/svg">
          <circle cx="{size / 2}" cy="{size / 2}" r="{size / 2 }" fill="{action.params.color}" />
        </svg>
      {:else if action.name === 'rectangle'}
        {@const aspectRatio = action.params.width / action.params.height}
        {@const rectWidth = aspectRatio >= 1 ? size : size * aspectRatio}
        {@const rectHeight = aspectRatio >= 1 ? size / aspectRatio : size}
        {@const rectX = (size - rectWidth) / 2}
        <svg width="{size}" height="{size}" xmlns="http://www.w3.org/2000/svg">
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
      {/if}
    {/if}
  </span>
{/if}

<style>

svg {
  transform: translateY(2px);
  margin: 0 1px;
}

</style>
