<script>
  import { addEffectAsStagedAction, moveStagedActionToEnd, compileActionsBeforeStaged, updateStagedAction, updateStagedActionColor, copyStagedActionToActionStore, addCurrentEffectAsStagedAction, compileActions, hideAction, showAction, updateActiveActions, addToActiveActions, resetSpecialStagedActionParams } from '../action-utils';
	import P5 from 'p5-svelte';
  import { stagedAction, activeIDs, stagedActionID, actionRootID, activeCategory, selectedEffect, currentColor, shouldRandomizeColor, changedActionID, flatActionStore, actionRoot, hoveredActionID } from '../../stores/dataStore';
  import { renderers, loadStencils } from './Renderer.js';
  import { onMount, onDestroy } from 'svelte';
  import { getAntPath, mapValue } from '../../utils/utils.ts';
  import { curatedRandomHexColor } from '../../utils/color-utils.ts';
  import { turtle } from './Turtle.js';
	
  let x = 55;
	let y = 55;

  let startX, startY;

  let path = []; //current path points

  let p5; //p5 instance
  let canvasesLoaded = false;

  let canvasContainer;

  let thumbnails = [];

  let renderedActions = {
    static: [],
    drag: [],
    hover: []
  };
  let timeStagedActionRendered = 0;

  // whenever renderedActions changes, update activeActions store
  $: updateActiveActions([...renderedActions.static, ...renderedActions.drag, ...renderedActions.hover]);

  function randomizeCurrentColor() {
    // currentColor.set(tinycolor.random().toHexString());
    currentColor.set(curatedRandomHexColor());
  }

  $: if($shouldRandomizeColor) randomizeCurrentColor();

  // render hovered action
  // $: if ($hoveredActionID && $hoveredActionID.length > 0) {
  //   let hovered = compileActions($flatActionStore[$hoveredActionID]);
  //   clearTempCanvases();
  //   hovered.forEach(action => {
  //     renderAction(action, p5.getHoverCanvas());
  //   });
  // } else {
    // clearTempCanvases();
  // }

  // $: if($changedActionID != '') {
  //   if($changedActionID != $stagedActionID) {
  //     renderRoot();
  //   }
  // }

  onMount(() => {

    // if selectedEffect changed, update staged action accordingly
    selectedEffect.subscribe(effect => {
      if(!effect) return;
      let params = {};
      // if(effect.tags != "my tools") {
      if($activeCategory === "my tools") {
        shouldRandomizeColor.set(false);
        currentColor.set(effect.params.color);
      } else {
        updateStagedActionColor($currentColor);
      }
        // params.color2 = tinyColor($currentColor).rotate(180).toHexString();
      // }
      if($shouldRandomizeColor) randomizeCurrentColor();
      addEffectAsStagedAction(effect, params); //drawing effects have staged action
      if(p5) {
        p5.getHoverCanvas().clear();
      } 
    });

    flatActionStore.subscribe(actions => {
      if(!p5) return;
      if($changedActionID != $stagedActionID) {
        clearTempCanvases();
        renderActionsUntilStaged();
      }
      else if($changedActionID === $stagedActionID && !mouseOverCanvas){
        clearTempCanvases();
        renderStagedAction(p5.getHoverCanvas());
      }
    });

    // hoveredActionID.subscribe(id => {
    //   if(!p5) return;
    //   let actions = compileActions($flatActionStore[id]);
    //   if(actions.length > 0) {
    //     clearTempCanvases();
    //     actions.forEach(action => {
    //       renderAction(action, p5.getHoverCanvas());
    //     });
    //     p5.background(255);
    //     p5.tint(255, 50);
    //     p5.image(p5.getStaticCanvas(), 0, 0);
    //     p5.noTint();
    //     p5.image(p5.getHoverCanvas(), 0, 0);
    //   }
    //   else {
    //     clearTempCanvases();
    //     renderActionsUntilStaged();
    //   }
    // });

    // stagedActionID.subscribe(id => {
    //   if(stagedActionID !== '') {
    //     // hideAction(id); //hide when first added
    //   }
    // });

    currentColor.subscribe(color => {
      updateStagedActionColor(color);
    });
  })

    //if staged action empty or not found in action store, add a new staged action based on current effect
  // $: if($stagedActionID === '' || $stagedActionID === undefined || !flatActionStore[$stagedActionID]) {
  //   // console.log("adding new staged action");
  //   addCurrentEffectAsStagedAction();
  // }

  export const downloadCanvas = () =>{
    if(p5) {
      p5.save('my design.jpg');
    }
  }

  // debounce! don't update too often
  const debouncedStagedActionUpdate = debounce(updateStagedAction, 10);

  function debounce(f) {
    return f;
  }

//   export function getThumbnail(g, action, w, h) {
//   // Use the appropriate renderer to draw the action onto the buffer
//   const renderFunction = renderers[action.effect];
//   if (renderFunction) {
//     renderFunction(g, action.params, p5);
//   }
//   return g.canvas.toDataURL();
// }

  /* 
                             _                   
    _ _    ___    _ _     __| |    ___      _ _  
   | '_|  / -_)  | ' \   / _` |   / -_)    | '_| 
  _|_|_   \___|  |_||_|  \__,_|   \___|   _|_|_  
_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""| 
"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-' 
  
  */

  let previousActiveActions = $activeIDs;
  export function renderActionsUntilStaged(delay = 500, pathDelay = 10) {
    if(!p5) return;

    let actions = compileActionsBeforeStaged();
    clearAllCanvases();
    let staticCanvas = p5.getStaticCanvas();

    // console.log("rendering", actions.length, "actions");
    actions.forEach(action => {
      renderAction(action, staticCanvas);
    });

    p5.image(staticCanvas, 0, 0);

    // renderGradually(actions, staticCanvas, delay, pathDelay).then(() => {
    //   // Update the canvas and active actions after all actions are rendered
    //   p5.image(staticCanvas, 0, 0);
    //   updateActiveActions(actions.map(action => action.actionID));
    // });

    // // Update the previous active actions for the next call
    // previousActiveActions = actions.map(action => action.actionID);
  }

  let stagedCanvasTimeout;
  let stagedCanvasFade;
  function renderStagedAction(canvas) {
    if(!p5) return;
    clearTimeout(stagedCanvasTimeout);
    clearInterval(stagedCanvasFade);
    let actions = compileActions($flatActionStore[$stagedActionID]);
    actions.forEach(action => {
      renderAction(action, canvas);
    });
    p5.image(canvas, 0, 0);

    if(!mouseOverCanvas && !($hoveredActionID === $stagedActionID)) {
      stagedCanvasTimeout = setTimeout(() => { //after 1 second, start fading out
        let alpha = 255;
        stagedCanvasFade = setInterval(() => {
          fadeTempCanvases(alpha);
          alpha -= 50;
          // console.log("alpha", alpha);
          if(alpha <= 0) {
            clearInterval(stagedCanvasFade);
            clearTempCanvases();
            renderedActions.drag = [];
            renderedActions.hover = [];
          }
        }, 50);
      }, 500);
    }
  }


  function renderGradually(actions, canvas, delay, pathDelay = 10) {
  let previousActiveActions = [];
  let index = 0;

  function renderNextAction() {
    if (index >= actions.length) return Promise.resolve(); // All actions rendered

    // Determine if the action is new or existing
    let isNewAction = !previousActiveActions.includes(actions[index].actionID);

    // Render the action
    renderAction(actions[index], canvas);

    // Update the canvas and active actions only if it's a new action
    if (isNewAction) {
      p5.image(canvas, 0, 0);
      updateActiveActions(actions.slice(0, index + 1).map(action => action.actionID));
    }

    index++;

    // Determine the delay for the next action
    let nextDelay = isNewAction ? (actions[index] && actions[index].indexedID ? pathDelay : delay) : 0;

    // Return a promise that resolves after the delay, then calls renderNextAction again
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(renderNextAction());
      }, nextDelay);
    });
  }

  return renderNextAction(); // Start rendering the first action
}


  // Call the render function for an action
  function renderAction(action, canvas) {
    if(p5) {
      const renderFunction = renderers[action.effect];
      // console.log("running render function for ", action.effect, action.params, p5, turtle);
      if (renderFunction) {
        // console.log("rendering", action.effect)
        renderFunction(canvas, action.params, p5, turtle);
        // p5.image(canvas, 0, 0);
      }

      // update the active actions
      // these update even if render function not found in order to show the active actions in the DOM
      switch(canvas) {
        case p5.getStaticCanvas():
          renderedActions.static.push(action.actionID);
          break;
        case p5.getDragCanvas():
          renderedActions.drag.push(action.actionID);
          break;
        case p5.getHoverCanvas():
          renderedActions.hover.push(action.actionID);
          break;
      }
    }
  }

  function fadeTempCanvases(alpha) {
    if(!p5) return;
    p5.background(255);
    p5.image(p5.getStaticCanvas(), 0, 0);
    // p5.getDragCanvas().tint(255, alpha);
    // p5.getHoverCanvas().tint(255, alpha);
    // console.log("fading", alpha);
    p5.tint(255, alpha);
    p5.image(p5.getDragCanvas(), 0, 0);
    p5.image(p5.getHoverCanvas(), 0, 0);
    p5.noTint();
  }

  function clearTempCanvases() { //don't clear static canvas
    if(p5) {
      p5.background(255);
      p5.getDragCanvas().clear();
      renderedActions.drag = [];
      p5.getHoverCanvas().clear();
      renderedActions.hover = [];

      // draw the static canvas as background
      p5.image(p5.getStaticCanvas(), 0, 0);
    }
  }

  function clearAllCanvases() {
    p5.clear();
    p5.getDragCanvas().clear();
    p5.getHoverCanvas().clear();
    p5.getStaticCanvas().clear();
    p5.getStaticCanvas().background(255);

    renderedActions.static = [];
    renderedActions.drag = [];
    renderedActions.hover = [];
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
    let s, t, h, a, cached; //s is static canvas, t is temp for dragging, h is temp for hovering, a is to show a single action thumbnail, cached saves actions that haven't changed between renders
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
        loadStencils(p5);
        console.log("p5 instance created");
        renderActionsUntilStaged();
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
  mousemove
  
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
   hover 
   
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

      clearTempCanvases();
      renderStagedAction(p5.getHoverCanvas());
      
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
   dragging 
   
   */

    else { // dragging

      p5.getDragCanvas().clear();

      let params = $stagedAction.params;

      // set params based on dragging
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
        let width = Math.abs(x - startX)*2 + 15; //not zero on first click
        let height = Math.abs(y - startY)*2 + 15;
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
      if($stagedAction.name === 'bounce' || $stagedAction.name === 'spiro' && 'progress' in params) {
        mousePressedTime = Date.now(); //reset whenever moved
      }

      clearTempCanvases();
      renderStagedAction(p5.getDragCanvas());
  }
}

// function renderStep(generator) {
//   if (!generator.next().done && isDragging) {
//     // If the generator is not done, render the next step
//     p5.image(p5.getStaticCanvas(), 0, 0);
//     p5.image(p5.getDragCanvas(), 0, 0);
//     requestAnimationFrame(() => renderStep(generator));
//   }
// }
  /*
                                               _                           
    _ __     ___    _  _     ___     ___    __| |    ___   __ __ __ _ _    
   | '  \   / _ \  | +| |   (_-<    / -_)  / _` |   / _ \  \ V  V /| ' \   
   |_|_|_|  \___/   \_,_|   /__/_   \___|  \__,_|   \___/   \_/\_/ |_||_|  
   |_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""| 
   |"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-' 
   mousedown  
   
   */

  let isDragging = false;
  let mouseOverCanvas = false;
  let dragRenderComplete = true;
  let mousePressedTime = 0;
  let animationFrameId = null;

  function handleMouseDown(event) {

    if (p5) {
      isDragging = true;

      if('progress' in $stagedAction.params) {
        mousePressedTime = Date.now();
        animationFrameId = requestAnimationFrame(updateMouseHoldTime);
      }

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

      // p5.getDragCanvas().clear();
      // dragRenderFunction = renderers[$stagedAction.effect](p5.getDragCanvas(), $stagedAction.params, p5, false); // get the renderer for the staged effect
      // dragRenderComplete = false;
      // if($stagedAction.effect == 'gradient') {
      //   renderStep(dragRenderFunction);
      // }

      // Listen for global mouseup to handle cases where mouse is released outside the canvas
      document.addEventListener('mouseup', globalMouseUp);
    }
  }

  function updateMouseHoldTime() {

    updateStagedAction({ progress: getProgress() });

    // p5.getDragCanvas().clear();

    clearTempCanvases();
    renderStagedAction(p5.getDragCanvas());

    // p5.image(p5.getStaticCanvas(), 0, 0);
    p5.image(p5.getDragCanvas(), 0, 0);

    // continue animation loop
    animationFrameId = requestAnimationFrame(updateMouseHoldTime);
  }

  function getProgress() {
    return (Date.now() - mousePressedTime) / 100;
  }

/*

                                                   _ __  
  _ __     ___    _  _     ___     ___    _  _    | '_ \ 
 | '  \   / _ \  | +| |   (_-<    / -_)  | +| |   | .__/ 
 |_|_|_|  \___/   \_,_|   /__/_   \___|   \_,_|   |_|__  
_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""| 
"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-' 
mouseup
*/

function handleMouseUp(event) {
  if (p5 && isDragging) {
    isDragging = false;
    x = Math.round(p5.mouseX);
    y = Math.round(p5.mouseY);
    path.push([x, y]); //add last point to path

    cancelAnimationFrame(animationFrameId);
    updateStagedAction({path: getAntPath(path, $stagedAction.params.pathSpacing || 10), progress: Math.round(getProgress())});

    copyStagedActionToActionStore();

    resetSpecialStagedActionParams(); //reset staged action to default for progress, start, end

    //move staged action to end of list
    //TODO: slow replay of actions
    moveStagedActionToEnd();

    if($shouldRandomizeColor) randomizeCurrentColor();
    // addEffectAsStagedAction($selectedEffect, { color: $currentColor, position: { x: x, y: y } }); // reset staged action to default

    path = []; // clear current path

    // hideAction($stagedActionID);

    p5.getHoverCanvas().clear();
    p5.getDragCanvas().clear();
    p5.getDragCanvas().reset();
    p5.getHoverCanvas().reset();

    renderActionsUntilStaged();

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
    clearTempCanvases(); //clear when leaving canvas
  }

  mouseOverCanvas = false;
  // renderActionsUntilStaged();
  // if(isDragging) {
  //   // handleMouseUp(event);
  // }
  // else {
  //   path = []; // clear current path
  // }
  // isDragging = false;
}

function handleMouseOver(event) {
  mouseOverCanvas = true;
}

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="canvasContainer"
     bind:this={canvasContainer}
     on:mousedown={handleMouseDown} 
     on:mouseup={handleMouseUp} 
     on:mousemove={handleMouseMove}
     on:mouseleave={handleMouseLeave}
     on:mouseover={handleMouseOver}>
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

