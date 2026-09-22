import {getUnitDefinition} from '../../data/units.js';
import {BALANCE} from '../core/Config.js';
import {dist} from '../core/math.js';
import {terrain,walkable,pathfind} from '../world/World.js';
import {FormationSystem} from './FormationSystem.js';
import {FACTION_DEFINITIONS} from '../../data/factions.js';

export class MovementSystem {
  constructor(simulation){this.simulation=simulation;this.formation=new FormationSystem();}
  move(ids,x,z,target=null){
    let failed=0;
    const list=this.simulation.squads.filter(s=>ids.includes(s.id)&&s.hp>0),preparation=this.simulation.match?.state==='PREPARATION';
    if(preparation&&list.some(s=>{const zone=FACTION_DEFINITIONS[s.f].deploymentZone;return x<zone.minX||x>zone.maxX;}))return list.length||1;
    list.forEach((s,index)=>{
      const zone=preparation?FACTION_DEFINITIONS[s.f].deploymentZone:null;
      const formation=this.formation.goal(index,list.length,x,z,zone);
      s.target=target?.id||null;s.order=target?'attack':'move';
      let goal=formation;
      if(target){const radius=target.r?target.r+3:3;const angle=Math.atan2(s.z-target.z,s.x-target.x);goal={x:target.x+Math.cos(angle)*radius,z:target.z+Math.sin(angle)*radius};}
      if(preparation&&zone)goal={...goal,x:Math.max(zone.minX+.51,Math.min(zone.maxX-.51,goal.x))};
      const path=pathfind(s.x,s.z,goal.x,goal.z,this.simulation.buildings);s.path=path||[];if(!path)failed++;
    });
    return failed;
  }
  repath(){for(const squad of this.simulation.squads)if(squad.hp>0&&squad.path.length){const target=squad.path.at(-1);squad.path=pathfind(squad.x,squad.z,target.x,target.z,this.simulation.buildings)||[];}}
  updateSquad(squad,definition,enemy,target,dt){
    if(!(enemy&&squad.order!=='move')&&squad.path.length){
      const point=squad.path[0],distance=dist(squad,point),kind=terrain(squad.x,squad.z);
      const multiplier=kind==='mud'?BALANCE.terrain.mudSpeed:kind==='forest'?BALANCE.terrain.forestSpeed:kind==='trench'?BALANCE.terrain.trenchSpeed:1;
      const travel=definition.speed*multiplier*dt;
      if(distance<=travel){squad.x=point.x;squad.z=point.z;squad.path.shift();if(!squad.path.length)squad.order=squad.target?'attack':'hold';}
      else{squad.x+=(point.x-squad.x)/distance*travel;squad.z+=(point.z-squad.z)/distance*travel;squad.yaw=Math.atan2(point.x-squad.x,point.z-squad.z);}
    }else if(target&&!enemy&&Math.floor(this.simulation.time*2)!==squad.replan){squad.replan=Math.floor(this.simulation.time*2);this.move([squad.id],target.x,target.z,target);}
  }
  separate(living,dt){
    const limit=BALANCE.army.separation;
    for(let i=0;i<living.length;i++)for(let j=i+1;j<living.length;j++){
      const a=living[i],b=living[j],distance=dist(a,b);
      if(distance>0&&distance<limit){const force=(limit-distance)*dt*BALANCE.army.separationForce;for(const [squad,sign] of [[a,1],[b,-1]]){const x=squad.x+(a.x-b.x)/distance*force*sign,z=squad.z+(a.z-b.z)/distance*force*sign;if(walkable(x,z,this.simulation.buildings)){squad.x=x;squad.z=z;}}}
    }
  }
}
