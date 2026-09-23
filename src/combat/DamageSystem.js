import {getUnitDefinition} from '../../data/units.js';
import {BALANCE} from '../core/Config.js';
import {terrain} from '../world/World.js';
import {VFX_EVENT} from '../effects/VisualEvents.js';
import {DeathSystem} from './DeathSystem.js';
import {coverAt} from '../world/FieldDefense.js';

export class DamageSystem {
  constructor(simulation){this.simulation=simulation;this.death=new DeathSystem(simulation);}
  apply(attacker,target,power){
    if(this.simulation.match?.state!=='WAR')return false;
    const unitTarget=target.path!==undefined,ground=unitTarget?terrain(target.x,target.z):'';
    const cover=Math.min(ground==='trench'?BALANCE.terrain.trenchDamage:1,unitTarget?coverAt(this.simulation.buildings,target.x,target.z):1);
    const conceal=ground==='forest'?BALANCE.terrain.forestDamage:1;
    if(target.hp<=0)return;
    const before=unitTarget?(target.alive??8):0;
    target.hp=Math.max(0,target.hp-power*cover*conceal);target.lastHit=this.simulation.time;
    this.simulation.matchFlow.objectiveDamaged(target);
    if(unitTarget)target.alive=Math.min(before,Math.ceil(target.hp/getUnitDefinition(target.type).hp));
    this.simulation.visualEvents.emit(VFX_EVENT.SHOT,attacker.x,attacker.path?1.15:5.1,attacker.z,target.x,unitTarget?1:2,target.z,attacker.f,target.f,attacker.alive??1,target.r??1,attacker.yaw??0,attacker.type==='heavy'||attacker.type==='tower',!unitTarget,target.id);
    if(unitTarget)for(let index=target.alive;index<before;index++){
      const ox=(index%4-1.5)*.9,oz=(Math.floor(index/4)-.5)*1.3,yaw=target.yaw;
      this.simulation.visualEvents.emit(VFX_EVENT.CASUALTY,target.x+ox*Math.cos(yaw)+oz*Math.sin(yaw),0,target.z-ox*Math.sin(yaw)+oz*Math.cos(yaw),attacker.x,0,attacker.z,target.f,attacker.f,1,1,yaw,target.type==='heavy',false,target.id);
    }
    if(target.hp===0)this.death.resolve(attacker,target,unitTarget);
    return true;
  }
}
