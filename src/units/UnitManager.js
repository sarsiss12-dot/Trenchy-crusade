import {createSquad} from './Squad.js';
import {BALANCE} from '../core/Config.js';
export class UnitManager {
  constructor(simulation){this.simulation=simulation;}
  add(faction,type,x,z){const squad=createSquad(this.simulation.nextId++,faction,type,x,z);this.simulation.squads.push(squad);return squad;}
  count(faction){let count=0;for(const squad of this.simulation.squads)if(squad.f===faction&&squad.hp>0)count++;return count;}
  living(){return this.simulation.squads.filter(squad=>squad.hp>0);}
  purge(){const now=this.simulation.time;this.simulation.squads=this.simulation.squads.filter(squad=>squad.hp>0||now-(squad.diedAt??now)<BALANCE.lifecycle.deadSquadRetention);}
}
