<script lang="ts">
  import { tick } from 'svelte';
  import Tooltip from '../Tooltip.svelte';
  import { help } from '../help';
  import { t, entry } from '../../i18n';
  import { activePalette, palettePresets, customPalette, samePalette, fillPalette, replaceActivePalette } from '../../stores/colorStore';
  import { saveToHistory } from '../../stores/history';
  import { exportPalette, importPalette } from '../export-utils';

  // Built-in color schemes and palette files. Using new colors replaces the palette's colors,
  // so everything drawn with a lettered color changes too.

  let menuButton: HTMLElement;
  let noColorsFound = false;

  // your own colors first, if you have made any, then the built-in palettes
  $: choices = [
    ...($customPalette ? [{ name: $t.palettes.yours, colors: $customPalette }] : []),
    ...Object.entries(palettePresets).map(([preset, colors]) => ({ name: entry($t.palettes.presets, preset), colors })),
  ];

  async function useColors(colors: string[]) {
    noColorsFound = false;
    saveToHistory('before changing palette colors');
    replaceActivePalette(fillPalette(colors, $activePalette));
    await tick(); // steps drawn with lettered colors take their new colors first, so one undo restores both
    saveToHistory('changed palette colors');
  }
</script>

<span class="help-target menu-spacing" use:help={{ text: $t.help.paletteMenu, placement: 'left' }}>
  <button class="palette-menu-button dont-deselect" bind:this={menuButton}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M512 256c0 .9 0 1.8 0 2.7c-.4 36.5-33.6 61.3-70.1 61.3L344 320c-26.5 0-48 21.5-48 48c0 3.4 .4 6.7 1 9.9c2.1 10.2 6.5 20 10.8 29.9c6.1 13.8 12.1 27.5 12.1 42c0 31.8-21.6 60.7-53.4 62c-3.5 .1-7 .2-10.6 .2C114.6 512 0 397.4 0 256S114.6 0 256 0S512 114.6 512 256zM128 288a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm0-96a32 32 0 1 0 0-64 32 32 0 1 0 0 64zM288 96a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm96 96a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"/></svg>
    {$t.palettes.menu}
  </button>
</span>

{#if menuButton}
  <Tooltip element={menuButton} settings={{ placement: 'left' }} let:showContent>
    {#if showContent}
      <div class="palette-menu">
        {#each choices as { name, colors }}
          <button class="preset" class:current={samePalette(colors, $activePalette)}
            aria-label={name}
            on:click={() => useColors(colors)}>
            {#each colors as color}<span class="swatch" style:background-color={color}></span>{/each}
          </button>
        {/each}

        <div class="palette-files">
          {#if noColorsFound}<p class="no-colors">{$t.palettes.noColors}</p>{/if}
          <span class="help-target" use:help={{ text: $t.help.savePalette, placement: 'bottom' }}>
            <button class="file-button" aria-label={$t.palettes.save} on:click={() => exportPalette($activePalette)}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM216 232V334.1l31-31c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-72 72c-9.4 9.4-24.6 9.4-33.9 0l-72-72c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l31 31V232c0-13.3 10.7-24 24-24s24 10.7 24 24z"/></svg>
            </button>
          </span>
          <span class="help-target" use:help={{ text: $t.help.openPalette, placement: 'bottom' }}>
            <button class="file-button" aria-label={$t.palettes.open} on:click={() => importPalette($activePalette.length, useColors, () => noColorsFound = true)}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM216 408c0 13.3-10.7 24-24 24s-24-10.7-24-24V305.9l-31 31c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l72-72c9.4-9.4 24.6-9.4 33.9 0l72 72c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-31-31V408z"/></svg>
            </button>
          </span>
        </div>
      </div>
    {/if}
  </Tooltip>
{/if}

<style>
  .menu-spacing {
    margin-top: 12px;
  }

  /* looks like the editing buttons above the palette: an icon over a label */
  .palette-menu-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 2px;
    border: none;
    background-color: transparent;
    font-family: 'Fandango';
    font-size: 0.9rem;
    color: black;
    cursor: pointer;
  }

  @media (min-height: 701px) {
    .palette-menu-button {
      font-size: 1rem;
    }
  }

  .palette-menu-button:hover {
    transform: scale(1.2);
    transition: transform 0.2s ease-in-out;
  }

  .palette-menu-button svg {
    width: 22px;
    height: 22px;
    fill: rgba(0, 0, 0, 0.85);
  }

  .palette-menu {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 4px;
  }

  .preset {
    display: flex;
    gap: 3px;
    filter: drop-shadow(0 0 0.6px rgba(0, 0, 0, 0.5)); /* outlines each splotch, so white shows on white */
    padding: 5px;
    border: 2px solid transparent;
    border-radius: 6px;
    background-color: transparent;
    cursor: pointer;
  }

  .preset:hover {
    border-color: #d0d0d0;
  }

  .preset.current {
    border-color: #555;
  }

  /* the same paint splotch as the palette's colors */
  .swatch {
    width: 20px;
    height: 20px;
    -webkit-mask-image: url('/assets/widgets/splotch-alpha-mask.png');
    mask-image: url('/assets/widgets/splotch-alpha-mask.png');
    -webkit-mask-size: cover;
    mask-size: cover;
    border: 0.5px solid lightgray;
  }

  .palette-files {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 4px;
  }

  .file-button {
    display: flex;
    padding: 4px 6px;
    border: none;
    border-radius: 5px;
    background-color: transparent;
    cursor: pointer;
  }

  .file-button:hover {
    background-color: #eeeeee;
  }

  .file-button svg {
    height: 20px;
    width: auto;
    fill: rgba(0, 0, 0, 0.85);
  }

  .no-colors {
    margin: 0 auto 0 4px;
    font-size: 0.9rem;
  }
</style>
