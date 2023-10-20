/*

User picks a brush
User draws on canvas
User edits next brushstroke

Mouse events:
- hover / mouseover
- mousedown
- drag
- mouseup

Key presses
- adding an effect with randomized parameters
- editing parameters of last placed effect
- editing parameters of selected effect






model:
 - next action with its parameter settings
    - includes list of parameters it needs (for randomization)
 - action list in Joy
 - current brushstroke - list of points in path
 - list of effects and their parameter settings







*/

export class DrawingController {
  constructor(sketch) {
    this.sketch = sketch;
  }

  _addKeyListeners() {

  }

  _addMouseListeners() {

    //Mouse event listeners
    let dragging = false;
    let mouseDownOverCanvas = false; //TODO: doesn't work if you leave canvas with mouse down

    document.getElementById('drawing-canvas').addEventListener('mousedown', e => {
      dragging = false;
      mouseDownOverCanvas = true;

      let activeEffect = this.effects.getEffectByName(this.ui.getSelectedEffect());

      if(activeEffect) {
        let point = { x: this.sketch.mouseX, y: this.sketch.flippedMouseY() };

          if(!this.activeBrushstroke) {
            this.activeBrushstroke = new Brushstroke(
              activeEffect,
              point,
              [0, 0, 0],
              this.sketch);
            this.brushstrokes.addBrushstroke(this.activeBrushstroke);
            let mouseActionType = activeEffect.getValue('mouseActionType');

            if(mouseActionType === 'single-click') {
              // this.joyManager.addEvent(...this.activeBrushstroke.makeJoyEvent());
              this.joyManager.addCurrentAction(this.activeBrushstroke.getPathAndPoint());

              //update preview action
            }
            else if(mouseActionType === 'drag') {
              this.joyManager.updatePreviewData(this.activeBrushstroke.getPathAndPoint());
              this.joyManager.previewActionEnabled = true;
              this.sketch.loop(); //render preview of brushstroke
            }
            else if(mouseActionType === 'drag-path') {
              this.joyManager.updatePreviewData(this.activeBrushstroke.getPath());
              this.joyManager.previewActionEnabled = true;
              this.sketch.loop(); //render preview of brushstroke
            }
          }
      }

    });

    document.getElementById('drawing-canvas').addEventListener('mousemove', e => {
      /*
          When mouse is down over canvas and mouse is moving,
          - add more points to the current path, making sure the Joy event gets the updates
          - render current preview of brushstroke to "preview" canvas
      */
      if(mouseDownOverCanvas) {
        dragging = true;

        if(this.activeBrushstroke) {
          this.activeBrushstroke.addPoint({x: this.sketch.mouseX, y: this.sketch.flippedMouseY()});
          if(this.activeBrushstroke.getMouseActionType() === 'drag') {
            this.joyManager.updatePreviewData(this.activeBrushstroke.getPathAndPoint());
            // this.activeBrushstroke.renderPreview({}); //current canvas settings go here
          }
          else if(this.activeBrushstroke.getMouseActionType() === 'drag-path') {
            this.joyManager.updatePreviewData(this.activeBrushstroke.getPath());
            // this.activeBrushstroke.renderPreview({}); //current canvas settings go here
          }

        }
        else {
          console.log("No active brushstroke found");
        }
      }
      else {
        // // preview follows mouse pointer
        // if(this.effects.getEffectByName(this.ui.getSelectedEffect()).getValue('mouseActionType') === 'single-click') {
        //   this.sketch.loop();
        // 	this.joyManager.updatePreviewData({position: [this.sketch.mouseX, this.sketch.mouseY]});
        // 	this.joyManager.previewActionEnabled = true;
        // }
      }
    });

    document.getElementById('drawing-canvas').addEventListener('mouseup', e => {
      mouseDownOverCanvas = false;

      if(this.activeBrushstroke) {	
        this.activeBrushstroke.addPoint({x: this.sketch.mouseX, y: this.sketch.flippedMouseY()});
        if(this.activeBrushstroke.getMouseActionType() === 'drag') {
          let pathAndPoint = this.activeBrushstroke.getPathAndPoint();
          this.joyManager.addCurrentAction(pathAndPoint);
        }
        else if(this.activeBrushstroke.getMouseActionType() === 'drag-path') {
          let path = this.activeBrushstroke.getPath();
          this.joyManager.addCurrentAction(path);
        }
        this.activeBrushstroke = null;
        this.joyManager.previewActionEnabled = false;
        this.sketch.noLoop();
      }
    });

  document.getElementById('replay-button').addEventListener("click", (e) => {
    this.joyManager.runWithDelay(200);
  });

    // document.getElementById('clear-all-button').addEventListener("click", (e) => {
    // 		console.log("clear all");
    // });
    
    document.getElementById('download-button').addEventListener("click", (e) => {
      this.sketch.save('my drawing.jpg');
    });
    
    // document.getElementById('shuffle-button').addEventListener("click", (e) => {
    // 		console.log("shuffle all");
    // });

    document.getElementById('save-button').addEventListener("click", (e) => {
      this.joyManager.saveURLToClipboard();
    });

    window.addEventListener('resize', this.adjustAlignment);
  }
}