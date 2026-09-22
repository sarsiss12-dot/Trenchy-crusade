import {FACTION_DEFINITIONS} from '../../data/factions.js';
import {createSiegeMatchState} from '../simulation/MatchFlow.js';

const points=()=>[
  {x:48,z:24,owner:-1,progress:0,claim:-1},
  {x:64,z:56,owner:-1,progress:0,claim:-1},
  {x:48,z:88,owner:-1,progress:0,claim:-1}
];

export class GameState {
  static create(player=0){
    return {player,time:0,tick:0,resources:[400,500],economies:[{strategy:'newAntioch',stock:{supply:400,material:300,manpower:60},capacity:{supply:0,material:0,manpower:0},forceCap:0,delivered:{supply:0,material:0,manpower:0},population:{civilianPopulation:0,recruitablePopulation:60,housingCapacity:90,foodDemand:0,commandCapacity:32}},{strategy:'legacyBlackGrail',population:{reserve:0}}],resourceNodes:[],buildings:[],squads:[],points:points(),nextId:1,winner:null,gameplayEvents:[],match:null,ai:{tick:0,wave:45}};
  }
  static serialize(source){
    return JSON.stringify({version:3,player:source.player,time:source.time,tick:source.tick,resources:source.resources,economies:source.economies,resourceNodes:source.resourceNodes,buildings:source.buildings,squads:source.squads,points:source.points,nextId:source.nextId,winner:source.winner,gameplayEvents:source.gameplayEvents,match:source.match,ai:source.ai});
  }
  static parse(raw){
    const data=JSON.parse(raw);
    if(![1,2,3].includes(data.version)||!Array.isArray(data.squads)||!Array.isArray(data.buildings))throw Error('Uyumsuz kayıt');
    if(!FACTION_DEFINITIONS[data.player])throw Error('Bilinmeyen faction');
    if(data.version===1){data.version=2;data.economies=[{strategy:'newAntioch',stock:{supply:data.resources[0]??400,material:300,manpower:60},capacity:{supply:0,material:0,manpower:0},forceCap:0,delivered:{supply:0,material:0,manpower:0}},{strategy:'legacyBlackGrail'}];data.resourceNodes=[];for(const squad of data.squads)if(squad.type==='engineer'&&!squad.worker)squad.worker={state:'IDLE',nodeId:null,targetBuildingId:null,depotId:null,cargoType:null,cargo:0,timer:0,auto:false,autoResourceType:null,searchCooldown:0,effectCooldown:0};}
    if(data.version<3){
      data.version=3;
      data.tick=Math.round((data.time||0)/.05);
      data.gameplayEvents=[];
      data.match=createSiegeMatchState(undefined,data.buildings,data.time||0,data.winner,data.player);
    }
    return data;
  }
  static isSerializable(source){try{const json=GameState.serialize(source);return !/(visualEvents|renderer|mesh|WebGL)/.test(json);}catch{return false;}}
}
