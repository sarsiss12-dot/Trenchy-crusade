import {clamp} from '../../data.js';
import {PARTICLE} from '../../effects/EffectCoordinator.js';
import {soldierArt} from './SoldierArt.js';
const DUST=[.39,.35,.28],SMOKE=[.32,.31,.27],SPORE=[.37,.42,.19];
const ASH=[.09,.10,.085],BRUISE=[.17,.105,.085],ROT=[.18,.21,.10];
const FIRE=[1,.48,.13],TOXIC=[.61,.75,.20],SPARK=[1,.78,.37],DIRT=[.25,.21,.15];
export function effectArt(fx,batch,transparent,renderer){
  const pixel=renderer.height/renderer.cam.zoom,lod=clamp((pixel-6)/7,0,1);
  const visible=(p,margin=80)=>{const q=renderer.project(p.x,p.y,p.z);return q.x>-margin&&q.x<renderer.width+margin&&q.y>-margin&&q.y<renderer.height+margin;};
  for(let i=0;i<fx.marks.limit;i++){
    const p=fx.marks.slots[i];if(!p.active||!visible(p))continue;
    const fade=Math.min(1,(p.life-p.age)/12),col=p.kind===1?(p.f?ROT:BRUISE):ASH;
    batch.add('cylinder',p.x,p.y+.001*(i%6),p.z,p.size,.012,p.size*(.60+p.seed*.35),col,p.yaw,fade*.86);
    if(p.kind===2&&lod>.15){
      for(let j=0;j<5;j++){const a=j*1.257+p.yaw,r=p.size*.27;batch.add('sphere',p.x+Math.sin(a)*r,p.y+.12,p.z+Math.cos(a)*r,p.size*.20,.23,p.size*.12,DIRT,a,fade*lod);}
    }
  }
  for(let i=0;i<fx.corpses.limit;i++){
    const p=fx.corpses.slots[i];if(!p.active||!visible(p))continue;
    const fall=clamp(p.age/.68,0,1),ease=fall*fall*(3-2*fall),fade=Math.min(1,(p.life-p.age)/5);
    if(lod<.12&&p.age>1){
      batch.add('box',p.x,.28,p.z,.46,.25,1.7,p.f?ROT:[.23,.26,.24],p.yaw,fade);
      batch.add('sphere',p.x+Math.sin(p.yaw)*.9,.28,p.z+Math.cos(p.yaw)*.9,.38,.29,.38,[.32,.33,.27],0,fade);
    }else soldierArt(batch,p.x,p.z,p.yaw,p.f,p.heavy,lod,0,false,ease,fade,p.seed);
  }
  for(let i=0;i<fx.particles.limit;i++){
    const p=fx.particles.slots[i];if(!p.active||p.age<0||!visible(p,110))continue;
    const t=p.age/p.life,fade=Math.min(1,(1-t)*3);
    if(p.kind===PARTICLE.TRACER){
      const h=clamp(t*1.6,0,1),tail=Math.max(0,h-.22),dx=p.tx-p.x,dy=p.ty-p.y,dz=p.tz-p.z;
      const length=Math.hypot(dx,dy,dz)*(h-tail),yaw=Math.atan2(dx,dz),pitch=-Math.atan2(dy,Math.hypot(dx,dz));
      batch.add('box',p.x+dx*(h+tail)*.5,p.y+dy*(h+tail)*.5,p.z+dz*(h+tail)*.5,p.size,p.size,length,p.f?TOXIC:SPARK,yaw,fade,pitch,0,1);
    }else if(p.kind===PARTICLE.FLASH){
      const scale=p.size*(1-t*.65);
      batch.add('cone',p.x,p.y,p.z,scale,scale,scale,p.f?TOXIC:FIRE,p.yaw,fade,Math.PI*.5,0,1);
      batch.add('sphere',p.x,p.y,p.z,scale*.45,scale*.45,scale*.45,[1,.91,.58],0,fade,0,0,1);
    }else if(p.kind===PARTICLE.FIRE){
      const size=p.size*(.5+t*1.5);
      batch.add('sphere',p.x,p.y+t,p.z,size,size*.8,size,p.f?TOXIC:FIRE,0,fade,0,0,1);
      if(t<.4)batch.add('sphere',p.x,p.y+t,p.z,size*.65,size*.65,size*.65,[1,.84,.37],0,fade,0,0,1);
    }else{
      const debris=p.kind===PARTICLE.DEBRIS,glow=p.kind===PARTICLE.SPARK||p.kind===PARTICLE.TOXIC;
      const col=p.kind===PARTICLE.TOXIC?TOXIC:p.kind===PARTICLE.SPARK?SPARK:debris?(p.f?[.31,.19,.16]:[.32,.33,.28]):DIRT;
      batch.add(debris?'box':'sphere',p.x,p.y,p.z,p.size*(debris?2.5:1),p.size,p.size*(debris?1.6:1),col,p.yaw,fade,p.pitch,p.roll,glow?1:0);
    }
  }
  // Only soft smoke is transparent. Back-to-front order, depth writes disabled.
  const order=fx.smokeOrder;order.length=0;
  for(let i=0;i<fx.smoke.limit;i++){const p=fx.smoke.slots[i];if(p.active&&p.age>=0&&visible(p,180))order.push(i);}
  order.sort((a,b)=>{const p=fx.smoke.slots[a],q=fx.smoke.slots[b];return(p.x+p.y+p.z)-(q.x+q.y+q.z);});
  for(const i of order){
    const p=fx.smoke.slots[i],t=p.age/p.life,size=p.size*(1+t*1.8),alpha=Math.min(1,p.age*8)*(1-t)*p.alpha;
    const color=p.f?SPORE:p.kind===1?DUST:SMOKE;
    transparent.add('quad',p.x,p.y,p.z,size,size,1,color,0,alpha*(p.kind===2?.13:.72),0,0,0,1);
  }
}
