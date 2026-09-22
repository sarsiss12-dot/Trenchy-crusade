import {TouchControls} from './TouchControls.js';
export class InputManager {
  constructor(canvas,handlers){this.touch=new TouchControls(canvas,handlers);this.keys=new Set();this.onKey=handlers.key||(()=>{});document.addEventListener('keydown',event=>{this.keys.add(event.key);this.onKey(event,true);});document.addEventListener('keyup',event=>{this.keys.delete(event.key);this.onKey(event,false);});}
}
