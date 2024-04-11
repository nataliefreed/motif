<script>
  import { addEffectAsStagedAction, moveStagedActionToEnd, compileActionsBeforeStaged, updateStagedAction, updateStagedActionColor, copyStagedActionToActionStore, addCurrentEffectAsStagedAction, compileActions, hideAction, showAction, updateActiveActions, resetSpecialStagedActionParams, stopPlaying, play, pause, scrollToAction } from '../action-utils';
	import P5 from 'p5-svelte';
  import { stagedAction, activeIDs, stagedActionID, actionRootID, activeCategory, selectedEffect, currentColor, shouldRandomizeColor, changedActionID, flatActionStore, actionRoot, hoveredActionID, renderRequested, isPlaying, renderDelay, currentlyRenderingActionID } from '../../stores/dataStore';
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

  let actionQueue = [];

  let renderedActions = {
    static: [],
    drag: [],
    hover: []
  };

  // whenever renderedActions changes, update activeActions store
  $: updateActiveActions([...renderedActions.static, ...renderedActions.drag, ...renderedActions.hover]);

  function randomizeCurrentColor() {
    // currentColor.set(tinycolor.random().toHexString());
    currentColor.set(curatedRandomHexColor());
  }

  $: if($shouldRandomizeColor) randomizeCurrentColor();

  onMount(() => {

    window.addEventListener('keydown', handleKeyPress);

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
        renderActionsUntilStaged();
      }
      else if($changedActionID === $stagedActionID && !mouseOverCanvas){
        clearTempCanvases();
        renderStagedAction(p5.getHoverCanvas());
      }
    });

    renderRequested.subscribe(value => {
      // console.log("render requested");
      if(value) {
        // clearTempCanvases();
        // renderActionsUntilStaged();
        // renderStagedAction(p5.getHoverCanvas());
        // renderRequested.set(false);
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

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      cleanupP5();
    }
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

  // TODO: don't start over on pause
  function renderActionsUntilStaged() {
    if(!p5) return;
    actionQueue = compileActionsBeforeStaged();
    // console.log("action queue has", actionQueue.length, "actions");
    actionQueue.splice(0, 0, { effect:'clear', params: {} } );
    currentActionIndex = 0;
    // clearAllCanvases();
    renderFromQueue();
  }

  let isRendering = false;
  let currentActionIndex = 0;
  async function renderFromQueue(delay = 0) {

    if(!p5) return;
    if(isRendering) return;
    // console.log("starting render with queue of length", actionQueue.length);
    // console.log(actionQueue.map(action => action.effect));

    isRendering = true;

    clearAllCanvases();
    // console.log("actions before staged", actions, actions.length);
    let staticCanvas = p5.getStaticCanvas();

    // let delays = actions.map(action => action.parentID === $changedActionID ? delay : 0);
    // delays[0] = 0; //first action renders immediately

    while (currentActionIndex < actionQueue.length) {
      const action = actionQueue[currentActionIndex];
      // console.log("rendering action", action.actionID, action.effect, action.params);
      // console.log("which is action", currentActionIndex + 1, "of", actionQueue.length);
      delay = action.indexedID || action.effect === 'along path'? $renderDelay / 30 : $renderDelay;
      if(action.effect === 'clear') { delay = 0; }
      await renderAction(action, staticCanvas, delay);
      currentActionIndex++;
      // console.log("queue is now", actionQueue.length);
    }

    // console.log("got through the queue!", actionQueue.length);

    // console.log(actionQueue.map(action => action.effect));

    p5.image(staticCanvas, 0, 0);
    isRendering = false;
    renderDelay.set(0);
    isPlaying.set(false);
    // console.log("finished render");
  }

  // Call the render function for an action
  function renderAction(action, canvas, delay = 0) {
  return new Promise(resolve => {

    if (p5) {
      const renderFunction = renderers[action.effect];
      currentlyRenderingActionID.set(action.actionID);
      if(renderFunction) {
        if (delay > 0) {
          setTimeout(() => {
            if($isPlaying) {
              renderFunction(canvas, action.params, p5, turtle);
              updateRenderedActions(action, canvas); // Update the active actions
              scrollToAction(action.actionID);
              p5.image(canvas, 0, 0);
            }
            resolve(); // Resolve the promise after rendering
            }, delay);
        } else {
          // Render immediately
          renderFunction(canvas, action.params, p5, turtle);
          updateRenderedActions(action, canvas); // Update the active actions
          resolve(); // Resolve the promise after rendering
        }
      } else {
        // Update even if render function not found in order to show the active actions in the DOM
        updateRenderedActions(action, canvas); // Update the active actions
        resolve();
      }   
    } else {
      resolve();
    }
  });
}

  let stagedCanvasTimeout;
  let stagedCanvasFade;
  async function renderStagedAction(canvas) {
    // console.log("rendering staged action");
    if(!p5) return;
    clearTimeout(stagedCanvasTimeout);
    clearInterval(stagedCanvasFade);
    let actions = compileActions($flatActionStore[$stagedActionID]);
    for (let action of actions) {
      renderAction(action, canvas);
    }
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
      }, 750);
    }
  }

function updateRenderedActions(action, canvas) {
  switch (canvas) {
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
  renderedActions = renderedActions; // Trigger update
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

  function fadeBackgroundCanvas(alpha) {
    if(!p5) return;
    p5.background(255);
    p5.tint(255, alpha);
    p5.image(p5.getStaticCanvas(), 0, 0);
    p5.noTint();
    p5.image(p5.getHoverCanvas(), 0, 0);
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
      if(!continuousPathStarted) {
        path.push([x, y]);
      }
      else {
        path[path.length - 1] = [x, y];
        updateStagedAction({path: path});
      }
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
          updateStagedAction({ position: { x: x, y: y } });
        }
        if($stagedAction.params.start) {
          updateStagedAction({ start: { x: x, y: y } });
        }
        if($stagedAction.params.end) {
          updateStagedAction({ end: { x: x, y: y } });
        }
        if($stagedAction.params.path) {
          if(!continuousPathStarted) {
            updateStagedAction({path: path.slice(-5)}); // show small tail of path when hovering
          }
        }
        clearTempCanvases();
        renderStagedAction(p5.getHoverCanvas());
      }

    /*
          _                    __ _  
       __| |    _ _    __ _   / _` | 
      / _` |   | '_|  / _` |  \__, | 
      \__,_|  _|_|_   \__,_|  |___/  
   |_|"""""|_|"""""|_|"""""|_|"""""| 
   |"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-' 
   dragging 
   
   */

    else { // dragging

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
      if('path' in params && !continuousPathStarted) {
        updateStagedAction({path: getAntPath(path, $stagedAction.params.pathSpacing || 10)}); // calc path spacing
      }
      if($stagedAction.name === 'bounce' || $stagedAction.name === 'spiro' && 'progress' in params) {
        mousePressedTime = Date.now(); //reset whenever moved
      }

      clearTempCanvases();
      renderStagedAction(p5.getDragCanvas());
  }
}
  /*
                                                 _                           
      _ __     ___    _  _     ___     ___    __| |    ___   __ __ __ _ _    
     | '  \   / _ \  | +| |   (_-<    / -_)  / _` |   / _ \  \ V  V /| ' \|   
     |_|_|_|  \___/   \_,_|   /__/_   \___|  \__,_|   \___/   \_/\_/ |_||_|  
   |_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""|_|"""""| 
   |"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-' 
   mousedown  
   
   */

  let isDragging = false;
  let mouseOverCanvas = false;
  let mousePressedTime = 0;
  let animationFrameId = null;
  let continuousPathStarted = false;

  function handleMouseDown(event) {

    if (p5) {
      isDragging = true;

      if('progress' in $stagedAction.params) {
        mousePressedTime = Date.now();
        animationFrameId = requestAnimationFrame(updateMouseHoldTime);
      }

      startX = Math.round(p5.mouseX);
      startY = Math.round(p5.mouseY);

      if($stagedAction.textLabel === "Connected Line") {
        if(!continuousPathStarted) {
          path = [];
          continuousPathStarted = true;
          path.push([startX, startY]);
        }
        else {
        
        }
      }
      else {
        continuousPathStarted = false;
        path = []; // clear current path
        path.push([startX, startY]);
      }

      if($stagedAction.params.position) {
        updateStagedAction({ position: { x: startX, y: startY }});
      }
      if($stagedAction.params.start) {
        updateStagedAction({ start: { x: startX, y: startY }, end: { x: startX, y: startY }}); // add first point as last point when mouse first pressed so it doesn't jump to previous last point
      }
      if($stagedAction.params.path) {
        updateStagedAction({path: path});
      }

      // Listen for global mouseup to handle cases where mouse is released outside the canvas
      document.addEventListener('mouseup', globalMouseUp);
    }
  }

  function updateMouseHoldTime() {

    if('progress' in $stagedAction.params) {
      // console.log("updating mouse hold time");
      updateStagedAction({ progress: getProgress() });

      clearTempCanvases();
      renderStagedAction(p5.getDragCanvas());

      p5.image(p5.getStaticCanvas(), 0, 0);
      p5.image(p5.getDragCanvas(), 0, 0);

      // continue animation loop
      animationFrameId = requestAnimationFrame(updateMouseHoldTime);
    }
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

    if(!continuousPathStarted) {
      cancelAnimationFrame(animationFrameId);
      if('path' in $stagedAction.params) {
        updateStagedAction({path: getAntPath(path, $stagedAction.params.pathSpacing || 10)});
      }
      if('progress' in stagedAction) {
        updateStagedAction({progress: getProgress()});
      }
      endAction();
    }
    else {
      if('path' in $stagedAction.params) {
        updateStagedAction({path: path});
      }
    }

    // Once the mouse is released, remove global listener
    document.removeEventListener('mouseup', globalMouseUp);
  }
}

function globalMouseUp(event) {
  if (isDragging) {
    handleMouseUp(event);
  }
}

function handleDoubleClick(event) {
  endContinuousPath();
}

export function endContinuousPath() {
  if(continuousPathStarted) {
    continuousPathStarted = false;
    endAction();
  }
}

function endAction() {
  path = [];
  copyStagedActionToActionStore();
  resetSpecialStagedActionParams(); //reset staged action to default for progress, start, end, path

  if($stagedAction.name != $selectedEffect.name) {
    addCurrentEffectAsStagedAction();
  }
  //move staged action to end of list
  // moveStagedActionToEnd();

  p5.getHoverCanvas().clear();
  p5.getDragCanvas().clear();
  p5.getDragCanvas().reset();
  p5.getHoverCanvas().reset();

  if($shouldRandomizeColor) randomizeCurrentColor();
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
  // if(playingPaused) {
  //   play();
  //   playingPaused = false;
  // }
}

// let playingPaused = false;
function handleMouseOver(event) {
  mouseOverCanvas = true;
  if($isPlaying) {
    pause();
    // playingPaused = true;
  }
}

function handleKeyPress(event) {
  if(event.key === 'Enter') {
    endContinuousPath();
  }
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
     on:mouseover={handleMouseOver}
     on:dblclick={handleDoubleClick}
     on:keydown={handleKeyPress}>
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