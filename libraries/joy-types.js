class Vector {
  constructor(string) {
    this.coordinates = this.parse(string);
  }
  
  parse(string) {
    const regex = /\((-?\d+),\s*(-?\d+)\)/g;
    const coordinates = [];
  
    let match;
    while ((match = regex.exec(string))) {
    const x = parseInt(match[1]);
    const y = parseInt(match[2]);
    coordinates.push({ x, y });
    }
  
    return coordinates;
  }
  
  render(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    
    const firstPoint = this.coordinates[0];
    ctx.beginPath();
    ctx.moveTo(firstPoint.x, firstPoint.y);
    
    for (let i = 1; i < this.coordinates.length; i++) {
      const { x, y } = this.coordinates[i];
      ctx.lineTo(x, y);
    }
    
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.fillStyle = 'red';
    for (const { x, y } of this.coordinates) {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    return canvas;
  }  
}
  


















// Maybe this should be Actor
// What's the difference between an actor, a widget, and a type?

// class JoyType {
//   constructor() {

//   }

// }

// class String extends JoyType {

// }

// class Number extends JoyType {

// }

// class Path extends JoyType {

// }

// class Color extends JoyType {
  
// }

// class JoyModal {

// }

// class PathModel extends JoyModal {

// }

// class ColorModal extends JoyModal {

// }

/*


Here are some actors you can use in your main Joy editor, or inside other actors!

Joy({

// The words & actors inside the editor:
// (note: all parameters except id & type are optional)

init: "A number: {id:'number', type:'number', min:1, max:100, placeholder:50, noVariables:false}"+
    // "noVariables" means you can't plug variables into this number. By default, false 

    "A color: {id:'color', type:'color', placeholder:[0, 0.8, 1.0]}"+
    // the placeholder color has to be in [hue, saturation, value] format. By default, random

    "A choice: {id:'choose', type:'choose', options:['a','b','c'], placeholder:'a'}"+
    // "options" can also be [{label:"a", value:1}, {label:"b", value:2}, ...]

    "A string: {id:'string', type:'string', prefix:'“', suffix:'”', color:'#ffd0d0'}"+
    // "prefix" and "suffix" let you put quotes or whatever around the string input

    "Actions: {id:'actions', type:'actions'}"+
    // Gives you a programmable list of actions 

    "Save Data: {type:'save'}",
    // Makes a save & share button. No "id" needed!

// etc, etc...

});
*/