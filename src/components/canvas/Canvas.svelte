<script>
  import { addActionToActionStore, merge } from '../action-utils';
	import P5 from 'p5-svelte';
  import { actionStore, stagedAction, activeCategory } from '../../stores/dataStore';
  import { renderers } from './Renderer.js';
  import { onMount, onDestroy } from 'svelte';
  import { debounce } from 'lodash';
  import tinycolor from "tinycolor2";
	
  let x = 55;
	let y = 55;
  let startX, startY;
  let currentColor = tinycolor.random().toHexString();

  export let p5; //p5 instance
  let staticCanvas, dragCanvas, hoverCanvas;
  let canvasContainer;

  let scaleFactor = 1;

  function setScaleFactor() {
    const adjustedPageWidth = parseFloat(getComputedStyle(canvasContainer).getPropertyValue('--adjusted-page-width'));
    scaleFactor = adjustedPageWidth / 500;
    // console.log("scale factor", scaleFactor);
    canvasContainer.style.transform = `scale(${scaleFactor})`;
  }

  onMount(() => {
    setScaleFactor();
  })

  // // This function sets the scale factor based on the container's width
  // function setScaleFactor() {
  //   scaleFactor = (canvasContainer.clientWidth*0.9) / 500;
  // }

  // onMount(() => {
  //   setScaleFactor();
  //   console.log("scale factor", scaleFactor);
  //   window.addEventListener('resize', setScaleFactor);
  //   return () => {
  //     window.removeEventListener('resize', setScaleFactor);
  //   };
  // });

  // listen for changes to action data
  actionStore.subscribe(actions => {
    renderAll(actions);
  });

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

  // don't update too often
  const debouncedStagedActionUpdate = debounce(updateStagedAction, 10);


  function getThumbnail(p, action, w, h) {
  // Create a new graphics buffer
  let g = p.createGraphics(w, h);

  // Use the appropriate renderer to draw the action onto the buffer
  const renderer = renderers[action.effect];
  if (renderer) {
    renderer(g, action.params);
  }

  // Convert the graphics buffer to an image
  let img = new Image();
  img.src = g.canvas.toDataURL();

  // Return the image
  return img;
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
    if(p5) {
      staticCanvas.clear();
      hoverCanvas.clear();
      dragCanvas.clear();
      actions.children.forEach(action => {
        const renderer = renderers[action.effect];
        if (renderer) {
          renderer(staticCanvas, action.params); // Render to static canvas
        }
      });

      p5.clear();
      p5.image(staticCanvas, 0, 0);
      p5.image(hoverCanvas, 0, 0);
      p5.image(dragCanvas, 0, 0);
    }
  }

  function clearTempCanvases() {
    if(p5) {
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

	const sketch = (c) => {
    let s, t, h, a; //s is static canvas, t is temp for dragging, h is temp for hovering, a is to show a single action thumbnail
    let thumbnailSize = 30;
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
      p5.remove();
      console.log("p5 instance removed");
    }
  });

  function handleNewInstance(event) { //grab the p5 instance when it returns
		p5 = event.detail;
    staticCanvas = p5.getStaticCanvas();
    dragCanvas = p5.getDragCanvas();
    hoverCanvas = p5.getHoverCanvas();

    renderAll($actionStore); // render on start
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
      y = Math.round(p5.flipY(p5.mouseY));
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
      const renderFunction = renderers[$stagedAction.effect];
      if (renderFunction) {
        renderFunction(hoverCanvas, merge($stagedAction.params, { position: { x: x, y: y } }));
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
        console.log("start X", startX, "startY", startY, "x", x, "y", y);
        if($stagedAction.params.radius) {
          let radius = Math.round(Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2))) + 1;
          updateStagedAction({ radius: radius });
        }
        renderFunction(dragCanvas, $stagedAction.params );
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
      startY = Math.round(p5.flipY(p5.mouseY));

      if($stagedAction.params.position) {
        debouncedStagedActionUpdate({ position: { x: startX, y: startY } });
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
    y = Math.round(p5.flipY(p5.mouseY));
    // let params = { position: { x: x, y: y } };
    // updateStagedAction(params); //add last point

    addActionToActionStore($stagedAction, {});
    clearTempCanvases(); // Clear the temp graphics once the action has been added

    // don't randomize if it's one of the user saved tools
    if($activeCategory !== "My Tools") {
      currentColor = tinycolor.random().toHexString(); // or use with range
      updateStagedAction({ color: currentColor });
    }

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
</div>
<!-- Pass the target element to the P5 component -->
<P5 {sketch} target={canvasContainer} on:instance={handleNewInstance} />

<style>

  .canvasContainer  {
    /* position: absolute; */
    top: calc(var(--lined-paper-line-height)*2);
    overflow: hidden;
    width: calc(var(--adjusted-page-width)*0.85);
    max-width: 500px;
    max-height: 500px;
    /* margin: 30px 0 0 45px; */
    border: 3px solid black;
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

