import {getUnitDefinition} from '../../data/units.js';
export function createSquad(id,faction,type,x,z){
  const definition=getUnitDefinition(type);
  if(!definition)throw Error('Bilinmeyen birlik: '+type);
  const squad={id,f:faction,type,x,z,hp:definition.hp*definition.squadSize,maxHp:definition.hp*definition.squadSize,alive:definition.squadSize,path:[],order:'hold',target:null,cooldown:0,yaw:0,firing:0,lastHit:-100,stuck:0,formation:{type:'LINE',spacing:1}};
  if(type==='engineer')squad.worker={state:'IDLE',nodeId:null,targetBuildingId:null,depotId:null,cargoType:null,cargo:0,timer:0,auto:false,autoResourceType:null,searchCooldown:0,effectCooldown:0};
  return squad;
}
