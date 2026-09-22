import {getUnitDefinition} from '../../data/units.js';
import {BALANCE} from '../core/Config.js';
import {dist} from '../core/math.js';
export class CombatSystem {
  constructor(simulation,damageSystem){this.simulation=simulation;this.damageSystem=damageSystem;}
  enemy(source,range){let best=null,bestDistance=range;for(const candidate of [...this.simulation.squads,...this.simulation.buildings]){if(candidate.hp<=0||candidate.f===source.f||candidate.progress<1)continue;const distance=dist(source,candidate)-(candidate.r||0);if(distance<bestDistance){best=candidate;bestDistance=distance;}}return best;}
  updateSquad(squad,dt){
    const definition=getUnitDefinition(squad.type);squad.cooldown-=dt;squad.firing=Math.max(0,squad.firing-dt);
    const target=squad.target?[...this.simulation.squads,...this.simulation.buildings].find(entity=>entity.id===squad.target&&entity.hp>0):null;
    const enemy=target&&dist(squad,target)-(target.r||0)<definition.range?target:this.enemy(squad,definition.range);
    if(enemy){squad.yaw=Math.atan2(enemy.x-squad.x,enemy.z-squad.z);if(squad.cooldown<=0){const aura=this.simulation.buildings.some(building=>building.f===squad.f&&building.type==='chapel'&&building.hp>0&&building.progress===1&&dist(squad,building)<BALANCE.support.chapelRadius);this.damageSystem.apply(squad,enemy,definition.damage*Math.ceil(squad.hp/definition.hp)*(aura?BALANCE.support.chapelDamage:1));squad.cooldown=definition.period;squad.firing=.16;}}
    return {definition,target,enemy};
  }
}
