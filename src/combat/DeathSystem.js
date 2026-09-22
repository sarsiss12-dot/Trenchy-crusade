import {VFX_EVENT} from '../effects/VisualEvents.js';
export class DeathSystem {
  constructor(simulation){this.simulation=simulation;}
  resolve(attacker,target,unitTarget){
    target.diedAt=this.simulation.time;
    this.simulation.visualEvents.emit(unitTarget?VFX_EVENT.SQUAD_LOST:VFX_EVENT.COLLAPSE,target.x,0,target.z,0,0,0,target.f,attacker.f,1,target.r??2,target.yaw??0,false,!unitTarget,target.id);
    if(target.id===this.simulation.match?.mainObjectiveId)this.simulation.matchFlow.objectiveDestroyed(target);
    else if(target.f===this.simulation.player)this.simulation.notify(target.path?'Bir manga kaybedildi.':target.names[target.f]+' yıkıldı.');
  }
}
