<script>
    import { mixPaintColors } from '../../utils/color-utils';
    import spectral from 'spectral.js';
  
    let colors = {
      red: 0,
      yellow: 0,
      blue: 0,
      white: 0,
      black: 0
    };
  
    function adjustColor(color, increment) {
      if (colors[color] + increment >= 0) {
        colors[color] += increment;
      }
      updateMixedColor();
    }
  
//     function updateMixedColor() {
//       mixedColor = mixPaintColors(colors);
//     }

//     function adjustColor(color, increment) {
//     if (colors[color] + increment >= 0) {
//       colors[color] += increment;
//     }
//     updateMixedColor();
//   }

  let mixedColor = '#ffffff'; // Initial color

  function updateMixedColor() {
    let colorList = ['red', 'yellow', 'blue', 'white', 'black']; // Order of mixing
    let baseColor = '#ff0000'; // Start with red
	let totalParts = Object.values(colors).reduce((total, num) => total + num, 0);

    if (totalParts > 0) {
      baseColor = '#ffffff'; // Start mixing from white
      for (let color of colorList) {
        if (colors[color] > 0) {
          let mixColor = getColor(color);
          let mixFactor = colors[color] / totalParts;
          baseColor = spectral.mix(baseColor, mixColor, mixFactor, spectral.HEX);
        }
      }
    }

    mixedColor = baseColor;
  }

  function getColor(colorName) {
    switch (colorName) {
      case 'red': return '#ff0000';
      case 'yellow': return '#ffff00';
      case 'blue': return '#0000ff';
      case 'white': return '#ffffff';
      case 'black': return '#000000';
      default: return '#ffffff';
    }
  }
  </script>
  
  <div class="color-mixer">
    {#each Object.keys(colors) as color}
      <div class="color-control" style="color: {color}">
        <button on:click={() => adjustColor(color, -1)}>-</button>
        <input type="number" min="0" bind:value={colors[color]} readonly>
        <button on:click={() => adjustColor(color, 1)}>+</button>
      </div>
    {/each}
    <div class="mixed-color" style="background-color: {mixedColor}"></div>
  </div>
  
  <style>
    .color-mixer {
      display: flex;
      flex-direction: column;
    }
    .color-control {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }
    .color-control button {
      width: 30px;
      height: 30px;
    }
    .mixed-color {
      width: 100px;
      height: 100px;
      border: 1px solid #000;
    }
  </style>
  