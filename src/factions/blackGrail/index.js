import {Faction} from '../Faction.js';
import {FACTION_BY_ID} from '../../../data/factions.js';
export const blackGrail = new Faction(FACTION_BY_ID.get('blackGrail'),{
  income:({defaultIncome})=>defaultIncome,
  construction:context=>context
});
