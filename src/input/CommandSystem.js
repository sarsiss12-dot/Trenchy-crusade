import {COMMAND} from './Commands.js';
export class CommandSystem {
  constructor(simulation){this.simulation=simulation;this.sequence=0;this.history=[];}
  bind(simulation){this.simulation=simulation;}
  dispatch(command){
    const sim=this.simulation;this.sequence++;if(this.history.length>=64)this.history.shift();this.history.push({sequence:this.sequence,command:JSON.parse(JSON.stringify(command))});
    if(command.type===COMMAND.MOVE)return sim.move(command.ids,command.x,command.z);
    if(command.type===COMMAND.ATTACK){const target=[...sim.squads,...sim.buildings].find(entity=>entity.id===command.targetId&&entity.hp>0);return sim.move(command.ids,command.x,command.z,target||null);}
    if(command.type===COMMAND.BUILD)return sim.build(command.faction,command.buildingType,command.x,command.z,command.engineerIds||[]);
    if(command.type===COMMAND.GATHER)return sim.gather(command.ids,command.nodeId,command.auto);
    if(command.type===COMMAND.REPAIR)return sim.repair(command.ids,command.buildingId);
    if(command.type===COMMAND.ASSIST_CONSTRUCTION)return sim.assistConstruction(command.ids,command.buildingId);
    if(command.type===COMMAND.SET_AUTO_GATHER)return sim.setAutoGather(command.ids,command.enabled,command.resourceType);
    if(command.type===COMMAND.STOP){sim.engineeringSystem.stop(command.ids);sim.logisticsSystem.stop(command.ids);for(const squad of sim.squads)if(command.ids.includes(squad.id)&&squad.hp>0){squad.path=[];squad.target=null;squad.order='hold';}return '';}
    const building=sim.buildings.find(item=>item.id===command.buildingId);
    if(command.type===COMMAND.TRAIN)return sim.train(building,command.unitType);
    if(command.type===COMMAND.CANCEL)return sim.cancel(building);
    if(command.type===COMMAND.SET_RALLY){if(building)building.rally={x:command.x,z:command.z};return '';}
    throw Error('Bilinmeyen komut: '+command.type);
  }
}
