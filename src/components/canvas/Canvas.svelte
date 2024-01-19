<script>
  import { addActionToActionStore, merge, addEffectAsStagedAction, updateStagedAction, copyStagedActionToActionStore, updateActionParams } from '../action-utils';
	import P5 from 'p5-svelte';
  import { actionStore, stagedAction, stagedActionID, actionRootID, activeCategory, selectedEffect, currentColor, shouldRandomizeColor, changedActionID, flatActionStore, actionRoot } from '../../stores/dataStore';
  import { renderers } from './Renderer.js';
  import { onMount, onDestroy } from 'svelte';
  // import debounce from 'lodash';
  import tinycolor from "tinycolor2";
  import { getAntPath } from '../../utils/utils.ts';
    import { page } from '$app/stores';
	
  let x = 55;
	let y = 55;

  let startX, startY;
  // let currentColor = tinycolor.random().toHexString();
  let path = []; //current path points

  let p5; //p5 instance
  let canvasesLoaded = false;

  let canvasContainer;

  let scaleFactor = 1;

  let thumbnails = [];

  let dragRenderFunction;

  function randomizeCurrentColor() {
    // console.log("randomizing color");
    currentColor.set(tinycolor.random().toHexString());
  }

  $: if($shouldRandomizeColor) randomizeCurrentColor();

  onMount(() => {
    setScaleFactor();

    // if selectedEffect changed, update staged action accordingly
    selectedEffect.subscribe(effect => {
      if(!effect) return;
      let params = {};
      // if(effect.tags != "my tools") {
      if($activeCategory === "my tools") {
        shouldRandomizeColor.set(false);
        currentColor.set(effect.params.color);
      } else {
        params.color = $currentColor;
      }
        // params.color2 = tinyColor($currentColor).rotate(180).toHexString();
      // }
      if($shouldRandomizeColor) randomizeCurrentColor();
      addEffectAsStagedAction(effect, params); //drawing effects have staged action
    });

    flatActionStore.subscribe(actions => {
      if($changedActionID != $stagedActionID) {
        renderRoot();
      } else if($stagedActionID.length > 0 && !isDragging) { // render staged action in its current state
        if(p5) {
          const renderFunction = renderers[$stagedAction.effect];
          if (renderFunction) {
            p5.getHoverCanvas().clear();
            renderFunction(p5.getHoverCanvas(), $stagedAction.params, p5);
            p5.image(p5.getStaticCanvas(), 0, 0);
            p5.image(p5.getHoverCanvas(), 0, 0);
          }
        }
      }
    });


    currentColor.subscribe(color => {
      // console.log("current color changed", color);
      updateStagedAction({ color: color });
    });
  })

      //
    //   stagedAction.update(action => {
    //   let mergedParams = merge(action.params, params);
    //   return {
    //       ...action,
    //       params: mergedParams
    //     };
    //   });
    // }
    // console.log("new staged action params", $stagedAction.params);

  export const downloadCanvas = () =>{
    if(p5) {
      p5.save('my design.jpg');
    }
  }

  export const markHiddenActions = (actions) => { //ie. hidden behind other graphics or don't change the canvas
    p5.clear();
    // render all actions
    for(let i=0;i<actions.children.length-1;i++)
    {
      renderAction(actions.children[i], p5);
    }
    p5.getPixels(); //load pixels array
    let prev = JSON.stringify(p5.pixels);
    renderAction(actions.children[children.length-1], p5);
    p5.getPixels(); //load new pixels array
    let current = JSON.stringify(p5.pixels);

    if(current == previous) {
      actions.children[children.length-2].obscured = true;
    }
    else {
      actions.children[children.length-2].obscured = false;
    }
  }

    // TODO: test this
    function setScaleFactor() {
    const adjustedPageWidth = parseFloat(getComputedStyle(canvasContainer).getPropertyValue('--adjusted-page-width'));
    scaleFactor = adjustedPageWidth / 500;
    canvasContainer.style.transform = `scale(${scaleFactor})`;
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
 
  // renderRoot uses renderer doEach
  // how do we cache steps?
  // we need to know where it has changed

  function renderRoot() {
    if(p5) {
      let staticCanvas = p5.getStaticCanvas();
      let dragCanvas = p5.getDragCanvas();
      let hoverCanvas = p5.getHoverCanvas();

      hoverCanvas.clear();
      staticCanvas.clear();
      staticCanvas.background(255);
      dragCanvas.clear();

      renderAction($flatActionStore[$actionRootID], staticCanvas);

      p5.clear();
      p5.image(staticCanvas, 0, 0);
      p5.image(hoverCanvas, 0, 0);
      p5.image(dragCanvas, 0, 0);
    }
  }

  // let rootCached = false;
  // function renderRoot() {
  //   if(p5) {
  //     let staticCanvas = p5.getStaticCanvas();
  //     let dragCanvas = p5.getDragCanvas();
  //     let hoverCanvas = p5.getHoverCanvas();
  //     let cachedCanvas = p5.getCachedCanvas();

  //     hoverCanvas.clear();
  //     staticCanvas.clear();
  //     staticCanvas.background(255);
  //     dragCanvas.clear();

  //     // console.log("action root is ", $actionRoot);
  //     // renderAction($actionRoot, p5.getStaticCanvas());
  //     staticCanvas.image(cachedCanvas, 0, 0);
  //     if(!rootCached) {
  //       renderAction($flatActionStore[$actionRootID], cachedCanvas);
  //       rootCached = true;
  //       staticCanvas.image(cachedCanvas, 0, 0); //run this again, for anything depending on static canvas
  //     }
      
  //     //todo: something is up with the tile patterns

  //     p5.clear();
  //     p5.image(staticCanvas, 0, 0);
  //     p5.image(hoverCanvas, 0, 0);
  //     p5.image(dragCanvas, 0, 0);
  //   }
  // }

  function renderAction(action, canvas) {
    if(p5) {
      const renderFunction = renderers[action.effect];
      if (renderFunction) {
        // console.log("rendering", action.effect)
        if(action.effect == 'gradient') {
          renderFunction(canvas, action.params, p5, true).next();
        }
        else {
          renderFunction(canvas, action.params, p5);
        }
      }
    }
  }

  let cachedIndex = 999999;
  function renderAll(actions, changedIndex = -1) { //changedIndex = -1 means re-render all actions
    if(changedIndex === -1) console.log("full re-render");
    thumbnails = [];
    if(p5) {
      let staticCanvas = p5.getStaticCanvas();
      let dragCanvas = p5.getDragCanvas();
      let hoverCanvas = p5.getHoverCanvas();
      let cachedCanvas = p5.getCachedCanvas();

      staticCanvas.clear();
      staticCanvas.background(255);
      // hoverCanvas.clear();
      dragCanvas.clear();

      // Render and cache actions up to changedIndex if cache is outdated
      // Either: cachedIndex is -1 (no cache), or cachedIndex is > changedIndex (cache is outdated)
      if (cachedIndex >= changedIndex) { //redo cache from scratch
        cachedCanvas.clear();
        console.log("Clearing cache");
        // cachedCanvas.background(100, 0, 100);
        let endIndex = changedIndex === -1 ? actions.children.length : changedIndex; //cache to end, or cache to changedIndex
        for (let i = 0; i < endIndex; i++) {
          renderAction(actions.children[i], cachedCanvas);
        }
        cachedIndex = endIndex - 1;
        console.log("Canvas cached up to", cachedIndex);
      }

      // If cache still valid but needs more actions added, cache remaining actions up to changedIndex
      else if(cachedIndex < changedIndex) {
        for (let i = cachedIndex+1; i < changedIndex; i++) {
          console.log("adding to cache", i);
          renderAction(actions.children[i], cachedCanvas);
        }
        cachedIndex = changedIndex - 1;
        console.log("Canvas cached up to", cachedIndex);
      }

      // Use cached canvas
      console.log("Using cache up to", cachedIndex);
      if(cachedIndex > -1) staticCanvas.image(cachedCanvas, 0, 0);

      // Render remaining actions
      for (let i = cachedIndex+1; i < actions.children.length; i++) {
        console.log("rendering remaining action", i);
        renderAction(actions.children[i], staticCanvas);
      }

      // const actionsToRender = actions;

      // //if not cached but fromIndex is > -1 (marked), render until cached index, then cache, then resume rendering the rest
      // // set cachedIndex to indicate cache has been stored
      // // next time it's rendered, check for cached index, then draw cached to static canvas, then resume rendering the rest
      // if(cachedIndex > -1) {
      //   staticCanvas.image(cached, 0, 0);
      //   const actionsToRender = actions.slice(cachedIndex + 1);
      // }
      //   actionsToRender.children.forEach(action => {
      //     const renderFunction = renderers[action.effect];
      //     if (renderFunction) {
      //       if(action.effect == 'gradient') {
      //         renderFunction(staticCanvas, action.params, p5, true).next();
      //       }
      //       else {
      //         renderFunction(staticCanvas, action.params, p5); // Render to static canvas
      //       }
      //     }
      //     // thumbnailCanvas.image(staticCanvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
      //     // thumbnails.push(thumbnailCanvas.canvas.toDataURL());
      //     // thumbnails.push(getThumbnail(thumbnailCanvas, action, 10, 10));
      //     //TODO: update specific action with thumbnail
      //     // setActionThumbnail(action, thumbnailCanvas.canvas.toDataURL());
      //   });

      p5.clear();
      p5.image(staticCanvas, 0, 0);
      p5.image(hoverCanvas, 0, 0);
      p5.image(dragCanvas, 0, 0);
    }
  }

  function clearTempCanvases() { //don't clear static canvas
    if(p5) {
      p5.background(255);
      p5.getDragCanvas().clear();
      p5.getHoverCanvas().clear();
      p5.image(p5.getStaticCanvas(), 0, 0);
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

// sketch is the function that defines the behavior of this specific sketch, passed to the P5 component
// c is the parameter to sketch, acting as the namespace to call p5 functions
// p5  is the p5 instance, returned by the P5 component with the instance event - connection to running sketch

	const sketch = (c) => {
    let s, t, h, a, cached, test; //s is static canvas, t is temp for dragging, h is temp for hovering, a is to show a single action thumbnail, cached saves actions that haven't changed between renders
    let thumbnailSize = 10;
    let renderFunction;
		c.setup = () => {
			c.createCanvas(500, 500);
      c.fill(100, 0, 100);
      c.background(255);
      c.noLoop();
      s = c.createGraphics(c.width, c.height);
      t = c.createGraphics(c.width, c.height);
      h = c.createGraphics(c.width, c.height);
      a = c.createGraphics(thumbnailSize, thumbnailSize);
      cached = c.createGraphics(c.width, c.height);

      canvasesLoaded = true;
		};

    c.getStaticCanvas = () => {
      if(!s) {
        s = c.createGraphics(c.width, c.height);
      }
      return s;
    };

    c.getDragCanvas = () => {
      if(!t) {
        t = c.createGraphics(c.width, c.height);
      }
      return t;
    };

    c.getHoverCanvas = () => {
      if(!h) {
        h = c.createGraphics(c.width, c.height);
      }
      return h;
    };

    c.getThumbnailCanvas = () => {
      if(!a) {
        a = c.createGraphics(thumbnailSize, thumbnailSize);
      }
      return a;
    }

    c.getCachedCanvas = () => {
      if(!cached) {
        cached = c.createGraphics(c.width, c.height);
      }
      return cached;
    }

    c.draw = () => {
      // if(renderFunction) {
      //   renderFunction(t, $stagedAction.params, p5, c.millis());
      // }
      // c.image(s, 0, 0); //static canvas
      // c.image(t, 0, 0); //drag canvas
		};

    c.flipY = function(y) {
      return c.height - y;
    };

    c.cleanup = () => {
      s.clear();
      t.clear();
      h.clear();
      a.clear();
      cached.clear();

      canvasesLoaded = false;
    }
	}

  onDestroy(() => { //TODO: test this
    // console.log("destroy");
    cleanupP5();
  });

  function cleanupP5() {
    if (p5) {
      p5.cleanup();
      p5.remove();
      p5 = undefined;
      console.log("p5 instance removed");
    }
  }

  function handleNewInstance(event) { //grab the p5 instance when it returns
    cleanupP5();
		p5 = event.detail;
    if(p5) {
      waitForCanvases().then(() => {
        // renderAll($actionStore); // render initial actions
        console.log("p5 instance created");
        renderRoot();
        console.log("initial render");
      });
    }
  }

  // complete when P5 canvases initialized
  function waitForCanvases() {
    return new Promise(resolve => {
        const checkSetup = () => {
            if (canvasesLoaded) {
                resolve();
            } else {
                requestAnimationFrame(checkSetup);
            }
        };
        checkSetup();
    });
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
      p5.getHoverCanvas().clear();
      if($stagedAction.params.position) {
        debouncedStagedActionUpdate({ position: { x: x, y: y } });
      }
      if($stagedAction.params.start) {
        debouncedStagedActionUpdate({ start: { x: x, y: y } });
      }
      if($stagedAction.params.path) {
          debouncedStagedActionUpdate({path: path.slice(-5)}); // show small tail of path when hovering
      }
      // console.log($stagedAction.effect);
      // const renderFunction = renderers[$stagedAction.effect];
      // if (renderFunction) {

      //   // renderFunction(p5.getHoverCanvas(), merge($stagedAction.params, { position: { x: x, y: y } }), p5);
      //   renderFunction(p5.getHoverCanvas(), $stagedAction.params, p5);
      // }
      // p5.image(p5.getStaticCanvas(), 0, 0);
      // p5.image(p5.getHoverCanvas(), 0, 0);
    }

    /*
       _                     __ _  
    __| |     _ _   __ _    / _` | 
   / _` |    | '_| / _` |   \__, | 
   \__,_|   _|_|_  \__,_|   |___/  
   |_|"""""|_|"""""|_|"""""|_|"""""| 
   |"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-' 
    */

    else { // dragging
      p5.getDragCanvas().clear();
      const renderFunction = renderers[$stagedAction.effect]; // get the renderer for the staged effect
      let params = $stagedAction.params;
      if (renderFunction) {
        // console.log("start X", startX, "startY", startY, "x", x, "y", y);
        if('radius' in params) {
          let radius = Math.round(Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2))) + 1;
          updateStagedAction({ radius: radius });
        }
        if('r1' in params) {
          let radius = Math.round(Math.abs(y - startY)) + 1;
          let r2 = Math.round(radius/2);
          updateStagedAction({ r1: radius, r2: r2 });
        }
        if('outer' in params) { // spiro
          let outer = Math.round(Math.abs(y - startY)) + 30;
          let d = Math.round(mapValue(x, 0, 500, 0, 100));
          updateStagedAction({ outer: outer, d: d });
        }
        if('npoints' in params) {
          let npoints = Math.round(Math.abs(x - startX)) + 1;
          updateStagedAction({ npoints: npoints });
        }
        if('size' in params) {
          let radius = Math.round(Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2))) + 1;
          updateStagedAction({ size: radius*2 });
        }
        if('width' in params) {
          let width = Math.abs(x - startX) + 15; //not zero on first click
          let height = Math.abs(y - startY) + 15;
          updateStagedAction({ width: width, height: height});
        }
        if('stripeWidth' in params) {
          let stripeWidth = Math.round(mapValue(x, 0, 500, 20, 100));
          updateStagedAction({ stripeWidth: stripeWidth });
        }
        if('angle' in params) {
          let angle = Math.round(mapValue(y, 0, 500, 0, 360));
          updateStagedAction({ angle: angle });
        }
        if('end' in params) {
          updateStagedAction({ end: { x: x, y: y } });
        }
        if('path' in params) {
          updateStagedAction({path: getAntPath(path, $stagedAction.params.pathSpacing || 10)}); // calc path spacing
        }
        renderFunction(p5.getDragCanvas(), $stagedAction.params, p5);
      }
      p5.image(p5.getStaticCanvas(), 0, 0);
      p5.image(p5.getDragCanvas(), 0, 0);
    }
  }

  function renderStep(generator) {
    if (!generator.next().done && isDragging) {
      // If the generator is not done, render the next step
      p5.image(p5.getStaticCanvas(), 0, 0);
      p5.image(p5.getDragCanvas(), 0, 0);
      requestAnimationFrame(() => renderStep(generator));
    }
  }

  function mapValue(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
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
  let dragRenderComplete = true;

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
        debouncedStagedActionUpdate({path: path}); // why not ant path here?
      }

      p5.getDragCanvas().clear();
      dragRenderFunction = renderers[$stagedAction.effect](p5.getDragCanvas(), $stagedAction.params, p5, false); // get the renderer for the staged effect
      dragRenderComplete = false;
      if($stagedAction.effect == 'gradient') {
        renderStep(dragRenderFunction);
      }

      // Listen for global mouseup to handle cases where mouse is released outside the canvas
      document.addEventListener('mouseup', globalMouseUp);
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

    updateStagedAction({path: getAntPath(path, $stagedAction.params.pathSpacing || 10)}); 

    copyStagedActionToActionStore();
    renderRoot();

    if($shouldRandomizeColor) randomizeCurrentColor();
    // addEffectAsStagedAction($selectedEffect, { color: $currentColor, position: { x: x, y: y } }); // reset staged action to default
    // renderRoot();

    if($activeCategory === "my tools") {
      addEffectAsStagedAction($selectedEffect, { position: { x: x, y: y } }); // reset staged action to default
    }

    path = []; // clear current path

    p5.getHoverCanvas().clear();
    p5.getDragCanvas().reset();
    p5.getHoverCanvas().reset();
    p5.image(p5.getStaticCanvas(), 0, 0);

    // Once the mouse is released, remove global listener
    document.removeEventListener('mouseup', globalMouseUp);
  }
}

function globalMouseUp(event) {
  // console.log("global mouse up");
  // p.image(0, 0, staticCanvas);
  // hoverCanvas.clear();
  // dragCanvas.clear();
  if (isDragging) {
    handleMouseUp(event);
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
  if(!isDragging) {
    clearTempCanvases(); //clear when leaving canvas, but will draw again if staged action params changed
  }
  // if(isDragging) {
  //   // handleMouseUp(event);
  // }
  // else {
  //   path = []; // clear current path
  // }
  // isDragging = false;
}

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
    <img class="canvas-thumbnail" src={thumbnail} />
  {/each}
</div>


<style>
  .canvasContainer  {
    /* position: absolute; */
    /* top: calc(var(--lined-paper-line-height)*2); */
    /* overflow: hidden; */
    /* width: calc(var(--adjusted-page-width)*0.85); */
    max-width: 501px;
    max-height: 501px;
    /* border: 1px solid black; */
    /* box-shadow: 1px 1px 2px 2px gray; */
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

