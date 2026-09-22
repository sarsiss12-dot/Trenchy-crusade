import {BALANCE} from '../core/Config.js';
export const VFX_EVENT=Object.freeze({SHOT:1,CASUALTY:2,COLLAPSE:3,SQUAD_LOST:4,HIT:5,EXPLOSION:6,BUILDING_DAMAGED:7,BUILDING_DESTROYED:8,WORK:9,REPAIR:10,DELIVERY:11});
export class VisualEvents {
  constructor(capacity=BALANCE.effects.visualEventCapacity){this.capacity=capacity;this.slots=Array.from({length:capacity},()=>({type:0,x:0,y:0,z:0,tx:0,ty:0,tz:0,faction:0,targetFaction:0,count:0,size:0,yaw:0,heavy:false,building:false,id:0}));this.read=0;this.write=0;this.count=0;this.dropped=0;}
  emit(type,x,y,z,tx,ty,tz,faction,targetFaction,count=1,size=1,yaw=0,heavy=false,building=false,id=0){const event=this.slots[this.write];event.type=type;event.x=x;event.y=y;event.z=z;event.tx=tx;event.ty=ty;event.tz=tz;event.faction=faction;event.targetFaction=targetFaction;event.count=count;event.size=size;event.yaw=yaw;event.heavy=heavy;event.building=building;event.id=id;this.write=(this.write+1)%this.capacity;if(this.count===this.capacity){this.read=(this.read+1)%this.capacity;this.dropped++;}else this.count++;}
  drain(consume){while(this.count){consume(this.slots[this.read]);this.read=(this.read+1)%this.capacity;this.count--;}}
  clear(){this.read=0;this.write=0;this.count=0;this.dropped=0;}
}
