<script>
  import { addActionToActionStore, merge, addEffectAsStagedAction } from '../action-utils';
	import P5 from 'p5-svelte';
  import { actionStore, stagedAction, activeCategory, selectedEffect } from '../../stores/dataStore';
  import { renderers } from './Renderer.js';
  import { onMount, onDestroy } from 'svelte';
  // import debounce from 'lodash';
  import tinycolor from "tinycolor2";
  import { getAntPath } from '../../utils/utils.ts';

  export const downloadCanvas = () =>{
    if(p5) {
      p5.save('my design.jpg');
    }
  }
	
  let x = 55;
	let y = 55;

  let startX, startY;
  let currentColor = tinycolor.random().toHexString();
  let path = []; //current path points

  let p5; //p5 instance
  let staticCanvas, dragCanvas, hoverCanvas, thumbnailCanvas;
  let canvasContainer;

  let scaleFactor = 1;

  let thumbnails = [];

  // TODO: test this
  function setScaleFactor() {
    const adjustedPageWidth = parseFloat(getComputedStyle(canvasContainer).getPropertyValue('--adjusted-page-width'));
    scaleFactor = adjustedPageWidth / 500;
    canvasContainer.style.transform = `scale(${scaleFactor})`;
  }



  onMount(() => {
    setScaleFactor();

    // if selectedEffect changed, update staged action accordingly
    // TODO: potentially pass in current settings as params, eg. global color or random
    selectedEffect.subscribe(effect => {
      if(effect) {
        addEffectAsStagedAction(effect, {});
      }
    });

    // render whenever actionStore changes
    actionStore.subscribe(actions => {
      debouncedRenderAll(actions);
    });
  })

  function updateStagedAction(params) {
    stagedAction.update(action => {
    let mergedParams = merge(action.params, params);
    return {
        ...action,
        params: mergedParams
      };
    });
    // console.log("new staged action params", $stagedAction.params);
  }

  // debounce! don't update too often
  const debouncedStagedActionUpdate = debounce(updateStagedAction, 10);

  const debouncedRenderAll = debounce(renderAll, 10);

  function debounce(f) {
    return f;
  }

  export function getThumbnail(g, action, w, h) {
  // Use the appropriate renderer to draw the action onto the buffer
  const renderFunction = renderers[action.effect];
  if (renderFunction) {
    renderFunction(g, action.params, p5);
  }
  return g.canvas.toDataURL();
}

  /* 
                             _                   
    _ _    ___    _ _     __| |    ___      _ _  
   | '_|  / -_)  | ' \   / _` |   / -_)    | '_| 
  _|_|_   \___|  |_||_|  \__,_|   \___|   _|_|_  
_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""| 
"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-' 
  
  */

  function renderAll(actions) {
    thumbnails = [];
    if(p5) {
      staticCanvas.clear();
      staticCanvas.background(255);
      // hoverCanvas.clear();
      dragCanvas.clear();
      actions.children.forEach(action => {
        const renderFunction = renderers[action.effect];
        if (renderFunction) {
          renderFunction(staticCanvas, action.params, p5); // Render to static canvas
        }
        thumbnailCanvas.image(staticCanvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
        thumbnails.push(thumbnailCanvas.canvas.toDataURL());
        // thumbnails.push(getThumbnail(thumbnailCanvas, action, 10, 10));
        //TODO: update specific action with thumbnail
        // action.thumbnail = getThumbnail(p5, action, 20, 20);
      });

      p5.clear();
      p5.image(staticCanvas, 0, 0);
      p5.image(hoverCanvas, 0, 0);
      p5.image(dragCanvas, 0, 0);
    }
  }

  function clearTempCanvases() { //don't clear static canvas
    if(p5) {
      p5.background(255);
      dragCanvas.clear();
      hoverCanvas.clear();
      p5.image(staticCanvas, 0, 0);
    }
  }

  /*

           _               _              _      
   ___    | |__    ___    | |_     __    | |_    
  (_-<    | / /   / -_)   |  _|   / _|   | ' \   
  /__/_   |_\_\   \___|   _\__|   \__|_  |_||_|  
_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""| 
"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-' 

   */

// my best attempt at explaining these:   
// sketch is the function that defines the behavior of this specific sketch, passed to the P5 component
// c is the parameter to sketch, acting as the namespace to call p5 functions
// p5  is the p5 instance, returned by the P5 component with the instance event - connection to running sketch

	const sketch = (c) => {
    let s, t, h, a; //s is static canvas, t is temp for dragging, h is temp for hovering, a is to show a single action thumbnail
    let thumbnailSize = 10;
		c.setup = () => {
			c.createCanvas(500, 500);
      c.fill(100, 0, 100);
      c.background(255);
      c.noLoop();
      s = c.createGraphics(c.width, c.height);
      t = c.createGraphics(c.width, c.height);
      h = c.createGraphics(c.width, c.height);
      a = c.createGraphics(thumbnailSize, thumbnailSize);
		};

    c.getStaticCanvas = () => {
      return s;
    };

    c.getDragCanvas = () => {
      return t;
    };

    c.getHoverCanvas = () => {
      return h;
    };

    c.getThumbnailCanvas = () => {
      return a;
    }

    c.draw = () => {
		};

    c.flipY = function(y) {
      return c.height - y;
    };
	}

  onDestroy(() => { //TODO: test this
    if (p5) {
      staticCanvas.remove();
      dragCanvas.remove();
      hoverCanvas.remove();
      thumbnailCanvas.remove();
      p5.remove();
      p5 = undefined;
      console.log("p5 instance removed");
    }
  });

  function handleNewInstance(event) { //grab the p5 instance when it returns
		p5 = event.detail;
    staticCanvas = p5.getStaticCanvas();
    dragCanvas = p5.getDragCanvas();
    hoverCanvas = p5.getHoverCanvas();
    thumbnailCanvas = p5.getThumbnailCanvas();

    renderAll($actionStore); // render on start
    console.log("p5 instance created");
	}

  /*                                                               
    _ __     ___    _  _     ___     ___    _ __     ___    __ __    ___   
  | '  \   / _ \  | +| |   (_-<    / -_)  | '  \   / _ \   \ V /   / -_)  
  |_|_|_|  \___/   \_,_|   /__/_   \___|  |_|_|_|  \___/   _\_/_   \___|  
  _|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""| 
  "`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-' 
  */

  function handleMouseMove(event) {
    if (p5) {
      x = Math.round(p5.mouseX);
      y = Math.round(p5.mouseY);
      path.push([x, y]);
    }

    /*
    _                                      
   | |_      ___    __ __    ___      _ _  
   | ' \    / _ \   \ V /   / -_)    | '_| 
   |_||_|   \___/   _\_/_   \___|   _|_|_  
   |_|"""""|_|"""""|_|"""""|_|"""""|_|"""""| 
   |"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-' 
    */
    
    if(!isDragging) {
      hoverCanvas.clear();
      if($stagedAction.params.position) {
        debouncedStagedActionUpdate({ position: { x: x, y: y } });
      }
      if($stagedAction.params.start) {
        debouncedStagedActionUpdate({ start: { x: x, y: y } });
      }
      if($stagedAction.params.path) {
          debouncedStagedActionUpdate({path: path.slice(-5)});
      }
      const renderFunction = renderers[$stagedAction.effect];
      if (renderFunction) {
        renderFunction(hoverCanvas, merge($stagedAction.params, { position: { x: x, y: y } }), p5);
      }
      p5.image(staticCanvas, 0, 0);
      p5.image(hoverCanvas, 0, 0);
    }

    /*
       _                     __ _  
    __| |     _ _   __ _    / _` | 
   / _` |    | '_| / _` |   \__, | 
   \__,_|   _|_|_  \__,_|   |___/  
   |_|"""""|_|"""""|_|"""""|_|"""""| 
   |"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-' 
    */

    else {  
      dragCanvas.clear();
      const renderFunction = renderers[$stagedAction.effect]; // get the renderer for the staged effect
      if (renderFunction) {
        // console.log("start X", startX, "startY", startY, "x", x, "y", y);
        if($stagedAction.params.radius) {
          let radius = Math.round(Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2))) + 1;
          updateStagedAction({ radius: radius });
        }
        if($stagedAction.params.size) {
          let radius = Math.round(Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2))) + 1;
          updateStagedAction({ size: radius*2 });
        }
        if($stagedAction.params.width) {
          let width = Math.abs(x - startX) + 15; //not zero on first click
          let height = Math.abs(y - startY) + 15;
          updateStagedAction({ width: width, height: height});
        }
        if($stagedAction.params.end) {
          updateStagedAction({ end: { x: x, y: y } });
        }
        if($stagedAction.params.path) {
          debouncedStagedActionUpdate({path: getAntPath(path, $stagedAction.params.pathSpacing || 10)});
        }
        renderFunction(dragCanvas, $stagedAction.params, p5);
      }
      p5.image(staticCanvas, 0, 0);
      p5.image(dragCanvas, 0, 0);
    } 
  }

  /*
                                               _                           
    _ __     ___    _  _     ___     ___    __| |    ___   __ __ __ _ _    
   | '  \   / _ \  | +| |   (_-<    / -_)  / _` |   / _ \  \ V  V /| ' \   
   |_|_|_|  \___/   \_,_|   /__/_   \___|  \__,_|   \___/   \_/\_/ |_||_|  
   |_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""| 
   |"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-' 
     */

  let isDragging = false;

  function handleMouseDown(event) {

    if (p5) {
      isDragging = true;

      startX = Math.round(p5.mouseX);
      startY = Math.round(p5.mouseY);
      path = []; // clear current path
      path.push([x, y]);

      if($stagedAction.params.position) {
        debouncedStagedActionUpdate({ position: { x: startX, y: startY }});
      }
      if($stagedAction.params.start) {
        debouncedStagedActionUpdate({ start: { x: startX, y: startY }, end: { x: startX, y: startY }}); // add first point as last point when mouse first pressed so it doesn't jump to previous last point
      }
      if($stagedAction.params.path) {
        debouncedStagedActionUpdate({path: path});
      }

      // Listen for global mouseup to handle cases where mouse is released outside the canvas
      // document.addEventListener('mouseup', globalMouseUp);
    }
  }

/*

                                                   _ __  
  _ __     ___    _  _     ___     ___    _  _    | '_ \ 
 | '  \   / _ \  | +| |   (_-<    / -_)  | +| |   | .__/ 
 |_|_|_|  \___/   \_,_|   /__/_   \___|   \_,_|   |_|__  
_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""| 
"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-' 

*/

function handleMouseUp(event) {
  if (p5 && isDragging) {
    isDragging = false;
    x = Math.round(p5.mouseX);
    y = Math.round(p5.mouseY);
    path.push([x, y]); //add last point to path
    // let params = { position: { x: x, y: y } };
    updateStagedAction({path: getAntPath(path, $stagedAction.params.pathSpacing || 10)}); 

    addActionToActionStore($stagedAction);
    addEffectAsStagedAction($selectedEffect, {}); // reset staged action to default

    path = []; // clear current path

    // don't randomize if it's one of the user saved tools
    if($activeCategory !== "My Tools") {
      currentColor = tinycolor.random().toHexString(); // or use with range
      updateStagedAction({ color: currentColor });
    }

    hoverCanvas.clear();

    // Once the mouse is released, remove global listener
    // document.removeEventListener('mouseup', globalMouseUp);
  }
}

/*
                                            _                                    
  _ __     ___    _  _     ___     ___     | |     ___    __ _    __ __    ___   
 | '  \   / _ \  | +| |   (_-<    / -_)    | |    / -_)  / _` |   \ V /   / -_)  
 |_|_|_|  \___/   \_,_|   /__/_   \___|   _|_|_   \___|  \__,_|   _\_/_   \___|  
_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""| 
"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-' 

*/

//TODO: check if need to handle release click off canvas
function handleMouseLeave(event) {
  clearTempCanvases();
  if(isDragging) {
    handleMouseUp(event);
  }
  else {
    path = []; // clear current path
  }
  isDragging = false;
}

// function globalMouseUp(event) {
//   console.log("global mouse up");
//   p.image(0, 0, staticCanvas);
//   hoverCanvas.clear();
//   dragCanvas.clear();
//   if (isDragging) {
//     handleMouseUp(event);
//   }
// }

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="canvasContainer"
     bind:this={canvasContainer}
     on:mousedown={handleMouseDown} 
     on:mouseup={handleMouseUp} 
     on:mousemove={handleMouseMove}
     on:mouseleave={handleMouseLeave}>
     <!-- style="width: calc(var(--adjusted-page-width)*0.85);"> -->
     <P5 {sketch} target={canvasContainer} on:instance={handleNewInstance} />
</div>
<!-- Pass the target element to the P5 component -->


<div id="thumbnailContainer">
  {#each thumbnails as thumbnail}
    <!-- <img class="canvas-thumbnail" src={thumbnail} /> -->
  {/each}
</div>


<style>

  .canvasContainer  {
    /* position: absolute; */
    /* top: calc(var(--lined-paper-line-height)*2); */
    /* overflow: hidden; */
    /* width: calc(var(--adjusted-page-width)*0.85); */
    max-width: 500px;
    max-height: 500px;
    border: 1px solid black;
    box-shadow: 1px 1px 2px 2px gray;
    cursor: url('/assets/cursors/paintbrush-solid.svg') 0 28, pointer;
  }

  #thumbnailContainer {
    position: absolute;
    right: -700px;
    top: 110px;
    gap: 8.5px;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }

  .canvas-thumbnail {
    width: 1.5em;
    height: 1.5em;
    opacity: 80%;
    /* border: 1px solid black; */
  }
</style>

<!--  -->
<!-- <div> -->
<!-- <label> -->
	<!-- X -->
	<!-- <input type="range" bind:value={x} min="0" max="400" step="0.01" /> -->
	<!-- {Math.round(x)} -->
<!-- </label> -->
<!-- </div> -->
<!--  -->
<!-- <div> -->
<!-- <label> -->
	<!-- Y -->
	<!-- <input type="range" bind:value={y} min="0" max="400" step="0.01" /> -->
	<!-- {Math.round(y)} -->
<!-- </label> -->
<!-- </div> -->

