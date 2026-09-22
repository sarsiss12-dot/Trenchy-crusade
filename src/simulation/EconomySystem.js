import {factionRegistry} from '../factions/FactionRegistry.js';
import {EconomyRegistry} from '../economy/EconomyRegistry.js';
export class EconomySystem {
  constructor(simulation){this.simulation=simulation;this.registry=new EconomyRegistry(simulation,factionRegistry.all());}
  update(dt){this.registry.update(dt);}
  get(faction){return this.registry.get(faction);}
}
