import {NewAntiochEconomy} from './NewAntiochEconomy.js';
import {LegacyBlackGrailEconomy} from './LegacyBlackGrailEconomy.js';
const TYPES={newAntioch:NewAntiochEconomy,legacyBlackGrail:LegacyBlackGrailEconomy};
export class EconomyRegistry {
  constructor(simulation,factions){this.strategies=factions.map(faction=>new (TYPES[faction.definition.systems.economy]||LegacyBlackGrailEconomy)(simulation,faction.index));}
  get(faction){return this.strategies[faction];}
  update(dt){for(const strategy of this.strategies)strategy.update(dt);}
}
