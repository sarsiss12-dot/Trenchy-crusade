import {FACTION_DEFINITIONS} from '../../data/factions.js';
import {getBuildingDefinition} from '../../data/buildings.js';
import {createSiegeMatchState} from '../simulation/MatchFlow.js';
import {createSquad} from '../units/Squad.js';
import {getUnitDefinition} from '../../data/units.js';
import {RESOURCE_NODE_LAYOUT} from '../../data/resources.js';

const hydrateLegacyBuilding=building=>{
  const definition=getBuildingDefinition(building.type);
  if(!definition)return building;
  return {...building,
    names:definition.names,cost:definition.cost,costs:definition.costs,time:definition.time,r:definition.r,desc:definition.desc,symbol:definition.symbol,
    production:definition.production,footprint:definition.footprint,requires:definition.requires,forceCap:definition.forceCap??0,storage:definition.storage??null,
    category:definition.category??'SUPPORT',mainObjectiveForRole:definition.mainObjectiveForRole??null,
    hp:building.hp??definition.hp,maxHp:building.maxHp??definition.hp,progress:building.progress??1,
    queue:Array.isArray(building.queue)?building.queue:[],cooldown:building.cooldown??0,
    assignedEngineers:Array.isArray(building.assignedEngineers)?building.assignedEngineers:[]
  };
};
const redeployLegacySquads=squads=>{for(const squad of squads){const zone=FACTION_DEFINITIONS[squad.f]?.deploymentZone;if(!zone)continue;squad.x=Math.max(zone.minX+.51,Math.min(zone.maxX-.51,squad.x));squad.path=[];squad.target=null;squad.order='hold';if(squad.worker){squad.worker.state='IDLE';squad.worker.nodeId=null;squad.worker.targetBuildingId=null;squad.worker.depotId=null;squad.worker.pendingNodeId=null;squad.worker.pendingEngineering=null;squad.worker.timer=0;squad.worker.auto=false;squad.worker.searchCooldown=0;}}};
const redeployLegacyBuildings=buildings=>{for(const building of buildings){building.assignedEngineers=[];if(building.hp<=0)continue;const zone=FACTION_DEFINITIONS[building.f]?.deploymentZone;if(!zone)continue;const footprint=building.footprint||building.r||0,margin=.51;building.x=Math.max(zone.minX+footprint+margin,Math.min(zone.maxX-footprint-margin,building.x));building.rally=null;}};
const resetMigratedSquad=squad=>{squad.path=[];squad.target=null;squad.order='hold';if(squad.worker){squad.worker.state='IDLE';squad.worker.nodeId=null;squad.worker.targetBuildingId=null;squad.worker.depotId=null;squad.worker.pendingNodeId=null;squad.worker.pendingEngineering=null;squad.worker.timer=0;squad.worker.auto=false;squad.worker.searchCooldown=0;}};
const migrateExpandedBattlefield=data=>{
  const spatial=[...(data.squads||[]),...(data.buildings||[]),...(data.resourceNodes||[])];
  const legacyMap=spatial.length>0&&spatial.every(entity=>(entity.x??0)<=112&&(entity.z??0)<=112);
  if(!legacyMap)return;
  const scale=1.5,clamp=value=>Math.max(1.5,Math.min(166.5,value*scale));
  for(const building of data.buildings||[]){building.x=clamp(building.x);building.z=clamp(building.z);building.assignedEngineers=[];if(building.rally)building.rally={x:clamp(building.rally.x),z:clamp(building.rally.z)};}
  for(const squad of data.squads||[]){squad.x=clamp(squad.x);squad.z=clamp(squad.z);resetMigratedSquad(squad);}
  if(data.match?.state==='PREPARATION'){redeployLegacyBuildings(data.buildings||[]);redeployLegacySquads(data.squads||[]);}
  if(Array.isArray(data.points))for(const point of data.points){point.x=clamp(point.x);point.z=clamp(point.z);}
  const previous=new Map((data.resourceNodes||[]).map(node=>[node.id,node]));
  data.resourceNodes=RESOURCE_NODE_LAYOUT.map((item,index)=>{const id='resource-'+(index+1),saved=previous.get(id),depleted=!!saved?.depleted||Number(saved?.amount)<=0,amount=depleted?0:Math.max(0,Math.min(item.amount,Number.isFinite(saved?.amount)?saved.amount:item.amount));return{id,type:item.type,x:item.x,z:item.z,r:1.8,amount,maxAmount:item.amount,depleted};});
};
const ensureLegacyNewAntiochEngineer=data=>{
  const hasEngineer=data.squads.some(squad=>squad.f===0&&squad.type==='engineer'&&squad.hp>0);
  if(hasEngineer)return;
  const definition=getUnitDefinition('engineer'),economy=data.economies?.[0],stock=economy?.stock||{},hasWorkshop=data.buildings.some(building=>building.f===0&&building.type==='workshop'&&building.hp>0&&building.progress===1);
  const forceCap=data.buildings.filter(building=>building.f===0&&building.hp>0&&building.progress===1).reduce((sum,building)=>sum+(building.forceCap||0),0);
  const forceUsed=data.squads.filter(squad=>squad.f===0&&squad.hp>0).reduce((sum,squad)=>sum+(getUnitDefinition(squad.type)?.forceCost||0),0)+data.buildings.filter(building=>building.f===0&&building.hp>0).reduce((sum,building)=>sum+(building.queue||[]).reduce((queued,item)=>queued+(getUnitDefinition(item.type)?.forceCost||0),0),0);
  const costs=definition.costs||{},canAfford=Object.keys(costs).every(key=>(stock[key]||0)>=costs[key]),canTrain=hasWorkshop&&canAfford&&forceUsed+(definition.forceCost||0)<=forceCap;
  if(canTrain)return;
  const ids=[...data.squads,...data.buildings].map(entity=>Number.isInteger(entity.id)?entity.id:0),[x,z]=FACTION_DEFINITIONS[0].base;
  data.nextId=Math.max(Number.isInteger(data.nextId)?data.nextId:1,...ids.map(id=>id+1));
  data.squads.push(createSquad(data.nextId++,0,'engineer',x+5,z-4));
};

const points=()=>[
  {x:48,z:24,owner:-1,progress:0,claim:-1},
  {x:64,z:56,owner:-1,progress:0,claim:-1},
  {x:48,z:88,owner:-1,progress:0,claim:-1}
];

export class GameState {
  static create(player=0){
    return {player,time:0,tick:0,resources:[400,500],fog:null,economies:[{strategy:'newAntioch',stock:{supply:400,material:300,manpower:60},capacity:{supply:0,material:0,manpower:0},forceCap:0,delivered:{supply:0,material:0,manpower:0},population:{civilianPopulation:0,recruitablePopulation:60,housingCapacity:90,foodDemand:0,commandCapacity:32}},{strategy:'legacyBlackGrail',population:{reserve:0}}],resourceNodes:[],buildings:[],squads:[],points:points(),nextId:1,winner:null,gameplayEvents:[],match:null,ai:{tick:0,wave:45}};
  }
  static serialize(source){
    return JSON.stringify({version:4,player:source.player,time:source.time,tick:source.tick,resources:source.resources,fog:source.fog,economies:source.economies,resourceNodes:source.resourceNodes,buildings:source.buildings,squads:source.squads,points:source.points,nextId:source.nextId,winner:source.winner,gameplayEvents:source.gameplayEvents,match:source.match,ai:source.ai});
  }
  static parse(raw){
    const data=JSON.parse(raw);
    if(![1,2,3,4].includes(data.version)||!Array.isArray(data.squads)||!Array.isArray(data.buildings))throw Error('Uyumsuz kayıt');
    if(!FACTION_DEFINITIONS[data.player])throw Error('Bilinmeyen faction');
    if(data.version===1){data.version=2;data.economies=[{strategy:'newAntioch',stock:{supply:data.resources[0]??400,material:300,manpower:60},capacity:{supply:0,material:0,manpower:0},forceCap:0,delivered:{supply:0,material:0,manpower:0}},{strategy:'legacyBlackGrail'}];data.resourceNodes=[];for(const squad of data.squads)if(squad.type==='engineer'&&!squad.worker)squad.worker={state:'IDLE',nodeId:null,targetBuildingId:null,depotId:null,cargoType:null,cargo:0,timer:0,auto:false,autoResourceType:null,searchCooldown:0,effectCooldown:0};}
    if(data.version<4)migrateExpandedBattlefield(data);
    if(data.version<3){
      data.version=3;
      data.tick=Math.round((data.time||0)/.05);
      data.gameplayEvents=[];
      data.buildings=data.buildings.map(hydrateLegacyBuilding);
      redeployLegacyBuildings(data.buildings);
      ensureLegacyNewAntiochEngineer(data);
      redeployLegacySquads(data.squads);
      data.match=createSiegeMatchState(undefined,data.buildings,0,data.winner,data.player);
    }
    if(data.version<4){data.version=4;data.fog=null;}
    return data;
  }
  static isSerializable(source){try{const json=GameState.serialize(source);return !/(visualEvents|renderer|mesh|WebGL)/.test(json);}catch{return false;}}
}
