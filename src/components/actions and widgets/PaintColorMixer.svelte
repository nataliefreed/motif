<script>
    import { mixPaintColors } from '../../utils/color-utils';
    import { getReadableColor } from '../../utils/color-utils';
    import spectral from 'spectral.js';
    import { createEventDispatcher } from 'svelte';
    import tinycolor from 'tinycolor2';
  
    let colors = {
      red: 0,
      yellow: 0,
      blue: 0,
      white: 0,
      black: 0
    };

    export let initialColor;
    let mixedColor = initialColor;
    let baseColor = initialColor;
    let intervalId = null;
    let activeButton = null;
    let direction = 'down'; // Direction of droplet animation

    const dispatch = createEventDispatcher();

    // $: mixedColor = toPaintColor(initialColor);
  
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

  // get an estimated color in red, yellow, blue, white, black channels. Get as close as possible with red, yellow, blue before adding white or black
  // function toPaintColor(color) {
  //   return color;
  // }


  /* Mixes all the current color values */
  /* this remixes all the colors every time, but at least it doesn't change the order... */ 
  function updateMixedColor() {
    let colorList = ['red', 'yellow', 'blue', 'white', 'black']; // Order of mixing
	  let totalParts = Object.values(colors).reduce((total, num) => total + num, 0);
    let newColor = '#ffffff';

    if (totalParts > 0) {
      newColor = '#ffffff'; // Start mixing from white
      for (let color of colorList) {
        if (colors[color] > 0) {
          let mixColor = getColor(color);
          let mixFactor = colors[color] / totalParts;
          newColor = spectral.mix(newColor, mixColor, mixFactor, spectral.RGBA);
        }
      }
    }
    mixedColor = newColor;
  }

  function startAdjustment(color, increment) {
    stopAdjustment(); // Clear any existing intervals
    adjustColor(color, increment); // Initial adjustment
    direction = increment > 0 ? 'down' : 'up'; // Set direction of droplet animation
    intervalId = setInterval(() => adjustColor(color, increment), 200); // Continuous adjustment
    activeButton = color; // Set active button for visual feedback
  }

  function stopAdjustment() {
    clearInterval(intervalId);
    intervalId = null;
    activeButton = null; // Reset active button when interaction stops
  }

  function clearColor() {
    for (let color in colors) {
      colors[color] = 0;
    }
    mixedColor = '#ffffff';
    baseColor = '#ffffff';
  }

  function resetColor() {
    clearColor();
    mixedColor = initialColor;
    baseColor = initialColor;
  }

  function saveColor() {
    dispatch('save', { color: mixedColor });
  }

  function getColor(colorName) {
    switch (colorName) {
      case 'red': return '#E30022'; //'#ff0000';
      case 'yellow': return '#FFF600'; //'#ffff00';
      case 'blue': return '#3F00FF'; //'#0000ff';
      case 'white': return '#ffffff';
      case 'black': return '#000000';
      default: return '#ffffff';
    }
  }
  
  </script>
  
  <!-- <div class="color-mixer">
    {#each Object.keys(colors) as color}
      <div class="color-control" style="color: {color}">
        <button on:click={() => adjustColor(color, -1)}>-</button>
        <input type="number" min="0" bind:value={colors[color]} readonly>
        <button on:click={() => adjustColor(color, 1)}>+</button>
      </div>
    {/each}
    <div class="mixed-color" style="background-color: {mixedColor}"></div>
  </div> -->

  <div class="color-mixer">
    <div class="controls">
      {#each Object.keys(colors) as color (color)}
        <div class="control">
          <button class="button plus"
            on:mousedown={() => startAdjustment(color, 1)}
            on:mouseup={stopAdjustment}
            on:mouseleave={stopAdjustment} 
            style="color: {getReadableColor(color)}">
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 384 512" stroke="#222" stroke-width="2" fill={getColor(color)}><path d="M192 512C86 512 0 426 0 320C0 228.8 130.2 57.7 166.6 11.7C172.6 4.2 181.5 0 191.1 0h1.8c9.6 0 18.5 4.2 24.5 11.7C253.8 57.7 384 228.8 384 320c0 106-86 192-192 192z"/></svg>
            <span class="button-label">{colors[color]}</span>
            <div class="droplet {direction === 'down' ? 'droplet-down' : 'droplet-up'}" style="display: {activeButton === color ? 'block' : 'none'};">
              <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 384 512" stroke="#222" stroke-width="2" fill={getColor(color)}><path d="M192 512C86 512 0 426 0 320C0 228.8 130.2 57.7 166.6 11.7C172.6 4.2 181.5 0 191.1 0h1.8c9.6 0 18.5 4.2 24.5 11.7C253.8 57.7 384 228.8 384 320c0 106-86 192-192 192z"/></svg>
            </div>
          </button>
        </div>
      {/each}
    </div>
    <div class="preview-and-buttons">
      <div class="color-preview" style="background-color: {tinycolor(mixedColor).toHexString()=='#ffffff'? '#fcfcfc' : mixedColor};"></div>
      <div class="action-buttons">
        <button class="instabutton" on:click={clearColor}>Clear</button>
        <button class="instabutton" on:click={resetColor}>Reset</button>
      </div>
    </div>
    <div class="controls">
      {#each Object.keys(colors) as color (color)}
        <div class="control">
          <button class="button minus" 
            on:mousedown={() => startAdjustment(color, -1)}
            on:mouseup={stopAdjustment}
            on:mouseleave={stopAdjustment}
          >
          -
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 512 512" stroke="#222" stroke-width="2" fill={getColor(color)}><path d="M3.9 54.9C10.5 40.9 24.5 32 40 32H472c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9V448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6V320.9L9 97.3C-.7 85.4-2.8 68.8 3.9 54.9z"/></svg>
          </button>
        </div>
      {/each}
    </div>
  </div>
  <div class="save-container"><input class="color-name" type="text" value="name this color!"><button class="instabutton" on:click={saveColor}>Save</button></div>
  
  
  <style>
    .color-mixer {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .controls {
      display: flex;
    }
    .control {
      margin: 0;
    }
    .button {
      position: relative;
      width: 36px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      cursor: pointer;
      background-color: transparent;
      overflow: visible;
      padding: 4px;
      transition: transform 0.1s ease;
      /* border-radius: 50%; */
    }

    .icon {
      width: 100%;
      height: 100%;
      display: block;
    }

    .color-name {
      font-family: 'FuturaHandwritten';
      color: gray;
    }

    .button-label {
      position: absolute;
      top: 60%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 16px;
      pointer-events: none; /* Prevents the label from blocking button clicks */
      font-family: 'FuturaHandwritten';
    }
    .button:hover {
      transform: scale(1.1);
    }
    .button:active {
      transform: scale(0.9);
    }
    .plus {
      font-weight: bold;
    }
    .minus {
      color: gray;
      padding: 7px;
    }
    .color-preview {
      width: 70px;
      height: 70px;
      /* border-radius: 50px; */
      /* margin: 5px; */
      /* border: 1px solid #000; */
      -webkit-mask-image: url('/assets/widgets/splotch-alpha-mask.png');
      mask-image: url('/assets/widgets/splotch-alpha-mask.png');
      -webkit-mask-size: cover;
      mask-size: cover;   
    }

    .preview-and-buttons {
      margin: 5px 0;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 40px;
    }
    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 5px;
      font-family: 'FuturaHandwritten';
    }
    .instabutton {
      padding: 0.5vh 0.5vw;
      font-family: 'FuturaHandwritten';
      cursor: pointer;
      border: none;
      border-radius: 5px;
      color: black;
    }

    @keyframes droplet-down-animation {
    from {
      transform: translateY(-10px); /* Start above the button */
      opacity: 1;
    }
    to {
      transform: translateY(30px); /* End below the button */
      opacity: 0;
      }
    }

    @keyframes droplet-up-animation {
      from {
        transform: translateY(15px); /* Start below the button */
        opacity: 1;
      }
      to {
        transform: translateY(-10px); /* Move back up towards the button */
        opacity: 0;
      }
    }

    .droplet-down {
      animation-name: droplet-down-animation;
    }

    .droplet-up {
      animation-name: droplet-up-animation;
    }

    .droplet {
      position: absolute;
      top: 100%;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      display: none; /* Hidden by default */
      animation-duration:0.2s;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }
  </style>
  