<script lang='ts'>

  import { createEventDispatcher } from "svelte";
  import { onMount } from 'svelte';
  import { shouldRandomizeColor, currentColor } from "../../stores/dataStore";

  // let colors = [
  //   '#FEFEFE','#D7D7D7','#B7B7B7','#636363','#363636','#070707','#EE1B25','#F5661F','#FCF500','#7CC475','#428DCC','#2C3094','#1C1463','#652B92','#300049','#790046',
  //   '#EE008D','#F26D89','#C49C6C','#A47952','#8D6239','#754B24','#4C3524','#DB594E','#FB675B','#EA7016','#F7933A','#FFAE11','#FBCF00','#00DB83','#00C279','#01CEAF',
  //   '#FF5963','#FF857A','#FFA3A4','#FFC502','#FFBA15','#FFAB0B','#FD9325','#FD7920','#BFE2CD','#B9D9B4','#ACCC6B','#6D9F00','#039142','#99DDDE','#73DAD6', '#01B59D','#3D99CD','#B975C9','#AE62C0'
  // ];

  let colors = [
    '#FEFEFE','#D7D7D7','#B7B7B7','#636363','#363636','#070707',
    '#EE1B25','#F5661F','#FCF500','#7CC475','#428DCC','#2C3094',
    '#1C1463','#652B92','#300049','#790046', '#F26D89','#C49C6C',
    '#A47952','#8D6239','#FD9325','#FD7920'
  ];

  const dispatch = createEventDispatcher();

  export let activeColor = '';

  onMount(() => {
    updateColor($currentColor);
  });

  function handleClick(color:string) {
    if(color == activeColor) return;
    // shouldRandomizeColor.set(false); // if the user changes the color, turn off randomization
    updateColor(color);
  }

  function updateColor(color:string) {
    activeColor = color;
    dispatch('colorChange', activeColor);
  }

  function handleValueChange(event: CustomEvent) {
    updateColor(event.detail.value);
  }

</script>

<div class="color-palette-container">
  <div class="color-palette">
    {#each colors as color}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <span class:selected={color===activeColor}
            class="color-item" 
            on:click={handleClick.bind(null, color)}
            style="background-color: {color}"></span>
    {/each}
  </div>
</div>

<style>

.color-palette-container {
  /* border: 1px solid red; */
  /* margin-top: 10px; */
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  width: 100%;
  /* height: 50px; */
}

.color-palette {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  flex-grow: 1;
  justify-content: flex-start;
  gap: 3px;
}

.color-item {
  box-sizing: border-box;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  border: 1px solid rgb(231, 231, 231);
  /* border: 0.5px solid black; */
  /* flex-grow: 1; */
  /* flex-basis: 23px; */
  /* flex-shrink: 1; */
}

.selected {
  border: 2px solid rgb(152, 152, 152);
}

</style>