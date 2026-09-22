export class TouchControls {
  constructor(element,handlers){this.element=element;this.handlers=handlers;this.pointers=new Map();this.bind();}
  bind(){for(const type of ['pointerdown','pointermove','pointerup','pointercancel'])this.element.addEventListener(type,event=>this.handle(type,event));}
  handle(type,event){const point={x:event.clientX,y:event.clientY,id:event.pointerId,button:event.button};if(type==='pointerdown'){this.pointers.set(event.pointerId,point);this.element.setPointerCapture?.(event.pointerId);this.handlers.down?.(point,event,this.pointers);}else if(type==='pointermove'){const previous=this.pointers.get(event.pointerId);if(previous){this.pointers.set(event.pointerId,point);this.handlers.move?.(point,previous,event,this.pointers);}}else{const previous=this.pointers.get(event.pointerId);this.pointers.delete(event.pointerId);this.handlers.up?.(point,previous,event,this.pointers);}}
}
