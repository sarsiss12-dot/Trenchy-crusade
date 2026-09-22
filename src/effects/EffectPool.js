// Fixed-capacity pool. Saturation recycles the oldest slot and produces no per-frame allocation.
export class EffectPool {
  constructor(capacity){this.slots=Array.from({length:capacity},()=>({active:false,age:0,life:0,kind:0,x:0,y:0,z:0,vx:0,vy:0,vz:0,tx:0,ty:0,tz:0,size:1,f:0,yaw:0,pitch:0,roll:0,seed:0,heavy:false,alpha:1}));this.limit=capacity;this.cursor=0;this.recycled=0;}
  take(kind,x,y,z,life,size,f,seed){const item=this.slots[this.cursor];this.cursor=(this.cursor+1)%this.limit;if(item.active)this.recycled++;item.active=true;item.age=0;item.life=life;item.kind=kind;item.x=x;item.y=y;item.z=z;item.size=size;item.f=f;item.seed=seed;item.vx=item.vy=item.vz=item.tx=item.ty=item.tz=item.yaw=item.pitch=item.roll=0;item.heavy=false;item.alpha=1;return item;}
  setLimit(limit){this.limit=limit;this.cursor%=limit;for(let i=limit;i<this.slots.length;i++)this.slots[i].active=false;}
  clear(){for(const item of this.slots)item.active=false;this.cursor=0;this.recycled=0;}
  count(){let count=0;for(let i=0;i<this.limit;i++)if(this.slots[i].active)count++;return count;}
}
