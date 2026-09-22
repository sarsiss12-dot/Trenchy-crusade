import {Faction} from '../Faction.js';
import {FACTION_BY_ID} from '../../../data/factions.js';
export const newAntioch = new Faction(FACTION_BY_ID.get('newAntioch'),{
  income:({defaultIncome})=>defaultIncome,
  construction:context=>context
});
