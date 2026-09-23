import {getBuildingDefinition} from '../../data/buildings.js';
export function createBuilding(id,faction,type,x,z,ready=false){
  const definition=getBuildingDefinition(type);
  if(!definition)throw Error('Bilinmeyen yapı: '+type);
  const {names,cost,costs,time,hp,r,desc,symbol,production,footprint,requires,forceCap=0,storage=null,category='SUPPORT',mainObjectiveForRole=null,segmentLength=0,cover=1,movement=null}=definition;
  return {id,names,cost,costs,time,hp,r,desc,symbol,production,footprint,requires,forceCap,storage,category,mainObjectiveForRole,segmentLength,cover,movement,yaw:0,type,f:faction,x,z,maxHp:hp,progress:ready?1:0,queue:[],cooldown:0,assignedEngineers:[]};
}
