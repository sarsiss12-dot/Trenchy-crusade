import {clamp} from '../core/math.js';
import {terrain} from '../world/Terrain.js';
import {VFX_EVENT} from './VisualEvents.js';
import {BALANCE} from '../core/Config.js';
import {DeterministicRNG} from '../core/DeterministicRNG.js';
import {EffectPool} from './EffectPool.js';
import {ParticleSystem,PARTICLE} from './ParticleSystem.js';
import {SmokeSystem} from './SmokeSystem.js';
import {DecalSystem} from './DecalSystem.js';
import {CorpseManager} from './CorpseManager.js';
export const EFFECT_QUALITY=BALANCE.effects.quality;
export {EffectPool,PARTICLE};
export class EffectCoordinator {
  constructor(quality=1) {
    this.particles=new ParticleSystem();this.smoke=new SmokeSystem();
    this.corpses=new CorpseManager();this.marks=new DecalSystem();
    this.smokeOrder=[];this.rng=new DeterministicRNG(348127);this.clock=0;
    this.environmentTimer=0;this.flash=0;this.soundShot=-1;this.soundExplosion=0;
    this.consume=e=>this.event(e);this.camera=null;
    this.setQuality(quality);
  }
  random(){return this.rng.next();}
  setQuality(index){this.quality=clamp(index|0,0,2);this.budget=EFFECT_QUALITY[this.quality];for(const k of ['particles','smoke','corpses','marks'])this[k].setLimit(this.budget[k]);}
  clear(){for(const k of ['particles','smoke','corpses','marks'])this[k].clear();this.flash=0;this.soundShot=-1;this.soundExplosion=0;this.clock=0;this.environmentTimer=0;}
  visible(x,z,margin=100){if(!this.camera)return true;const p=this.camera.project(x,1,z);return p.x>-margin&&p.x<this.camera.width+margin&&p.y>-margin&&p.y<this.camera.height+margin;}
  puff(x,y,z,size,life,f,kind=0){
    const p=this.smoke.take(kind,x,y,z,life,size,f,this.random());
    p.vx=.18+this.random()*.18;p.vz=-.08;p.vy=kind===2?.04:.35+this.random()*.25;
    return p;
  }
  mark(x,z,size,f,kind=0){
    const t=terrain(x,z);if(t==='river')return;
    const p=this.marks.take(kind,x,t==='bridge'?.375:.09,z,this.budget.markLife,size,f,this.random());
    p.yaw=this.random()*6.283;return p;
  }
  burst(x,y,z,n,f,kind=PARTICLE.DIRT,strength=1){
    n=Math.max(1,Math.round(n*this.budget.density));
    for(let i=0;i<n;i++){
      const p=this.particles.take(kind,x,y,z,.3+this.random()*.7,.06+this.random()*.13,f,this.random());
      const a=this.random()*6.283,vel=(.8+this.random()*2)*strength;
      p.vx=Math.cos(a)*vel;p.vz=Math.sin(a)*vel;p.vy=(1+this.random()*2.5)*strength;
      p.yaw=a;p.roll=this.random()*3;
    }
  }
  explosion(x,z,size,f,building=false){
    this.mark(x,z,size*(building?2.6:1.2),f,building?2:0);
    if(!this.visible(x,z,160))return;
    const core=this.particles.take(PARTICLE.FIRE,x,.7,z,.42,size*1.25,f,this.random());
    core.vy=.5;
    this.burst(x,.7,z,building?28:10,f,building?PARTICLE.DEBRIS:PARTICLE.DIRT,building?2.2:1);
    this.burst(x,.6,z,building?14:5,f,f?PARTICLE.TOXIC:PARTICLE.SPARK,1.6);
    const n=Math.round((building?9:3)*this.budget.density);
    for(let i=0;i<n;i++){
      const a=this.random()*6.283,d=this.random()*size*.8;
      const p=this.puff(x+Math.cos(a)*d,.5+this.random(),z+Math.sin(a)*d,size*(.6+this.random()*.5),building?6+this.random()*4:2+this.random()*2,f);
      p.age=-i*.09;
    }
    this.soundExplosion=Math.max(this.soundExplosion,building?2:1);
    if(building)this.flash=Math.min(.16,this.flash+.13);
  }
  event(e){
    if(e.type===VFX_EVENT.SHOT){
      if(!this.visible(e.x,e.z)&&!this.visible(e.tx,e.tz))return;
      const shots=Math.min(e.count,this.quality===0?2:4);
      for(let i=0;i<shots;i++){
        const offset=(i-(shots-1)/2)*.75,a=Math.atan2(e.tx-e.x,e.tz-e.z);
        const x=e.x+Math.cos(a)*offset,z=e.z-Math.sin(a)*offset;
        const t=this.particles.take(PARTICLE.TRACER,x,e.y,z,.13+(e.faction?.05:0),e.heavy?.12:.07,e.faction,this.random());
        t.tx=e.tx+(this.random()-.5)*1.3;t.ty=e.ty;t.tz=e.tz+(this.random()-.5)*1.3;t.age=-i*.025;
        const p=this.particles.take(PARTICLE.FLASH,x+Math.sin(a)*.7,e.y,z+Math.cos(a)*.7,.13,e.heavy?.75:.43,e.faction,this.random());
        p.yaw=a;p.age=-i*.025;
      }
      this.puff(e.x,e.y,e.z,.6,.65,e.faction,1);
      const tx=e.tx+(this.random()-.5)*1.5,tz=e.tz+(this.random()-.5)*1.5;
      this.burst(tx,e.ty,tz,e.building?7:4,e.targetFaction,e.building?PARTICLE.SPARK:e.targetFaction?PARTICLE.TOXIC:PARTICLE.DIRT);
      this.burst(tx+.5,.2,tz+.5,4,0,PARTICLE.DIRT);
      this.mark(tx,tz,e.heavy?1.4:.6,e.faction,0);
      if(e.heavy)this.explosion(tx,tz,e.building?1.5:.85,e.faction);
      else if(this.random()<.5)this.puff(tx,.25,tz,.7,1.1,e.targetFaction);
      this.soundShot=e.faction;
    }else if(e.type===VFX_EVENT.CASUALTY){
      const p=this.corpses.take(0,e.x,0,e.z,this.budget.corpseLife,1,e.faction,this.random());
      p.yaw=e.yaw;p.heavy=e.heavy;p.roll=(this.random()-.5)*.7;
      this.mark(e.x,e.z,.9,e.faction,1);
      if(this.visible(e.x,e.z))this.burst(e.x,.65,e.z,4,e.faction,e.faction?PARTICLE.TOXIC:PARTICLE.DIRT,.5);
    }else if(e.type===VFX_EVENT.COLLAPSE){
      this.explosion(e.x,e.z,e.size,e.faction,true);
    }else if(e.type===VFX_EVENT.SQUAD_LOST){
      this.mark(e.x,e.z,3.2,e.faction,1);
    }else if(e.type===VFX_EVENT.WORK){
      if(this.visible(e.tx,e.tz)){this.burst(e.tx,.25,e.tz,Math.min(5,2+e.count),e.faction,PARTICLE.DIRT,.45);if(this.random()<.55)this.puff(e.tx,.35,e.tz,.55,.8,e.faction);}
    }else if(e.type===VFX_EVENT.REPAIR){
      if(this.visible(e.tx,e.tz)){this.burst(e.tx,e.ty,e.tz,4,e.faction,PARTICLE.SPARK,.55);this.puff(e.tx,.7,e.tz,.45,.65,e.faction,1);}
    }else if(e.type===VFX_EVENT.DELIVERY){
      if(this.visible(e.x,e.z))this.burst(e.x,.25,e.z,3,e.faction,PARTICLE.DIRT,.35);
    }
  }
  update(dt,sim,camera=null){
    this.camera=camera;this.clock+=dt;this.flash=Math.max(0,this.flash-dt*.3);
    this.soundShot=-1;this.soundExplosion=0;
    sim.visualEvents.drain(this.consume);
    for(const pool of [this.particles,this.smoke,this.corpses,this.marks]){
      for(let i=0;i<pool.limit;i++){
        const p=pool.slots[i];if(!p.active)continue;
        p.age+=dt;if(p.age>=p.life){p.active=false;continue;}if(p.age<0)continue;
        if(pool===this.particles&&p.kind>=PARTICLE.SPARK&&p.kind!==PARTICLE.FIRE){
          p.vy-=dt*6;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;
          if(p.y<.13){p.y=.13;p.vy=Math.abs(p.vy)*.17;p.vx*=.7;p.vz*=.7;}
          p.roll+=dt*2.5;
        }else if(pool===this.smoke){p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;}
      }
    }
    this.environmentTimer-=dt;
    if(this.environmentTimer<=0){
      this.environmentTimer=this.quality===0?1.2:.7;
      for(const b of sim.buildings){
        if(b.progress<1||!this.visible(b.x,b.z,100))continue;
        const ratio=b.hp/b.maxHp,ruin=b.hp<=0&&sim.time-(b.diedAt??-100)<BALANCE.lifecycle.buildingRuinRetention;
        if((ratio<.65&&b.hp>0)||ruin){
          this.puff(b.x+(this.random()-.5)*b.r,ruin?.6:2.5,b.z+(this.random()-.5)*b.r,ratio<.3?2.8:1.5,4.5,b.f);
          if(ratio<.3&&!ruin){const p=this.particles.take(b.f?PARTICLE.TOXIC:PARTICLE.FIRE,b.x+.6,.9,b.z+b.r*.6,.65,.8,b.f,this.random());p.vy=.2;}
        }else if(b.f===1&&this.quality>0&&this.random()<.3)this.puff(b.x,1,b.z,1.2,3.5,1,2);
      }
      // A very small, fixed environmental emitter set; no off-screen spawn work.
      for(const [x,z] of [[33,59],[78,47],[60,102]])if(this.visible(x,z))this.puff(x,1.7,z,1.4,5,0);
      if(this.quality>0){const x=43+this.random()*26,z=10+this.random()*92;if(this.visible(x,z))this.puff(x,.6,z,8,7,0,2);}
    }
  }
}
// Only long-lived visuals enter the save; live projectiles/smoke restart cleanly.
EffectCoordinator.prototype.snapshot=function(){
  return {version:1,corpses:this.corpses.slots.slice(0,this.corpses.limit).filter(p=>p.active).map(p=>({...p})),marks:this.marks.slots.slice(0,this.marks.limit).filter(p=>p.active).map(p=>({...p}))};
};
EffectCoordinator.prototype.restore=function(data){
  if(!data||data.version!==1)return;
  for(const key of ['corpses','marks']){
    const list=Array.isArray(data[key])?data[key]:[];
    for(const v of list.slice(-this[key].limit)){
      if(!['x','z','age','life','size'].every(k=>Number.isFinite(v[k]))||v.age>=v.life)continue;
      const p=this[key].take(v.kind,v.x,v.y||0,v.z,Math.min(v.life,240),v.size,v.f===1?1:0,v.seed||0);
      p.age=Math.max(0,v.age);p.yaw=v.yaw||0;p.heavy=!!v.heavy;
    }
  }
};
export {EffectCoordinator as Effects};
