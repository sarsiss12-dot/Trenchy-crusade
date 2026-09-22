import {newAntioch} from './newAntioch/index.js';
import {blackGrail} from './blackGrail/index.js';
export class FactionRegistry {
  constructor(factions=[newAntioch,blackGrail]){this.byIndex=new Map();this.byId=new Map();for(const faction of factions){this.byIndex.set(faction.index,faction);this.byId.set(faction.id,faction);}}
  get(value){return typeof value==='number'?this.byIndex.get(value):this.byId.get(value);}
  all(){return [...this.byIndex.values()];}
}
export const factionRegistry=new FactionRegistry();
