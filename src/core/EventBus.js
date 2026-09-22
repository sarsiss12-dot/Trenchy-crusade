export class EventBus {
  constructor(){this.listeners=new Map();}
  on(type,listener){const list=this.listeners.get(type)||[];list.push(listener);this.listeners.set(type,list);return()=>this.off(type,listener);}
  off(type,listener){const list=this.listeners.get(type);if(!list)return;const index=list.indexOf(listener);if(index>=0)list.splice(index,1);}
  emit(type,payload){const list=this.listeners.get(type);if(!list)return;for(const listener of [...list])listener(payload);}
  clear(){this.listeners.clear();}
}
