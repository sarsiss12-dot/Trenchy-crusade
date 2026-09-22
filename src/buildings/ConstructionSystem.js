import {getBuildingDefinition} from '../../data/buildings.js';
import {getUnitDefinition} from '../../data/units.js';
import {FACTION_DEFINITIONS} from '../../data/factions.js';
import {crossings,terrain,walkable} from '../world/World.js';
import {BALANCE} from '../core/Config.js';
import {dist} from '../core/math.js';
import {WORKER_STATE} from '../units/LogisticsSystem.js';
import {VFX_EVENT} from '../effects/VisualEvents.js';

export class ConstructionSystem {
  constructor(simulation,buildingManager,unitManager,combatSystem,movementSystem,engineeringSystem){Object.assign(this,{simulation,buildingManager,unitManager,combatSystem,movementSystem,engineeringSystem});}
  definitionAllowed(faction,definition){return !!definition&&FACTION_DEFINITIONS[faction].allowedBuildings.includes(definition.id)&&(!definition.factions||definition.factions.includes(faction));}
  complete(faction,type){return this.simulation.buildings.some(building=>building.f===faction&&building.type===type&&building.hp>0&&building.progress===1);}
  missingRequirement(faction,definition){return (definition.requires||[]).find(type=>!this.complete(faction,type));}
  buildCost(faction,definition){return this.simulation.economySystem.get(faction).cost(definition);}
  unitCost(faction,definition){return this.simulation.economySystem.get(faction).cost(definition);}
  placement(faction,type,x,z){
    const definition=getBuildingDefinition(type),rules=BALANCE.construction,world=BALANCE.world;
    if(!this.definitionAllowed(faction,definition)||type==='hq')return 'Bu yapı bu faction tarafından kurulamaz';
    const missing=this.missingRequirement(faction,definition);if(missing)return getBuildingDefinition(missing).names[faction]+' gerekli';
    if(!this.simulation.economySystem.get(faction).canAfford(this.buildCost(faction,definition)))return 'Yetersiz kaynak';
    if(this.simulation.buildings.filter(building=>building.hp>0&&building.f===faction&&building.type===type).length>=rules.maxSameType)return 'Bu yapıdan en fazla 3 tane';
    if(!this.simulation.buildings.some(building=>building.hp>0&&building.progress===1&&building.f===faction&&dist(building,{x,z})<rules.baseRadius))return 'Tamamlanmış üssüne 20 m yakın olmalı';
    const footprint=definition.footprint||definition.r;if(x-footprint<1||z-footprint<1||x+footprint>world.size-1||z+footprint>world.size-1)return 'Harita sınırına çok yakın';\n    if(this.simulation.match?.state==='PREPARATION'){const zone=FACTION_DEFINITIONS[faction].deploymentZone;if(x-footprint<zone.minX||x+footprint>zone.maxX)return 'Hazırlık bölgesi dışına kurulamaz';}
    for(let index=0;index<16;index++){const angle=index/16*Math.PI*2,kind=terrain(x+Math.cos(angle)*footprint,z+Math.sin(angle)*footprint);if(['river','bridge','trench','edge'].includes(kind))return 'Geçit, siper veya su üzerine kurulamaz';}
    if(x>47&&x<65&&crossings.some(value=>Math.abs(z-value)<5.5))return 'Ana geçiş yolunu kapatamazsın';
    if(this.simulation.buildings.some(building=>building.hp>0&&dist(building,{x,z})<(building.footprint||building.r)+footprint+rules.obstacleMargin))return 'Başka yapıya çok yakın';
    if(this.simulation.resourceNodes.some(node=>!node.depleted&&dist(node,{x,z})<node.r+footprint+1))return 'Kaynak alanını kapatamazsın';
    if(this.simulation.points.some(point=>dist(point,{x,z})<footprint+rules.pointMargin))return 'İkmal noktasını kapatamazsın';
    if(this.simulation.squads.some(squad=>squad.hp>0&&dist(squad,{x,z})<footprint+rules.obstacleMargin))return 'Manganın yolu üzerinde';
    return '';
  }
  build(faction,type,x,z,engineerIds=[]){
    const error=this.placement(faction,type,x,z);if(error)return error;const definition=getBuildingDefinition(type),economy=this.simulation.economySystem.get(faction);
    if(economy.engineeredConstruction&&!this.engineeringSystem.engineers(engineerIds,faction).length)return 'Şantiye için muharebe mühendisi seçilmeli';
    if(!economy.charge(this.buildCost(faction,definition)))return 'Yetersiz kaynak';
    const building=this.buildingManager.add(faction,type,x,z);building.workEffectCooldown=0;
    if(economy.engineeredConstruction)this.engineeringSystem.assist(engineerIds,building.id);
    if(faction===this.simulation.player)this.simulation.notify(definition.names[faction]+' şantiyesi kuruldu');this.movementSystem.repath();return '';
  }
  train(building,type){
    if(!building||building.hp<=0||building.progress<1)return 'Tamamlanmış üretim yapısı seç';const definition=getUnitDefinition(type);
    if(!definition||!FACTION_DEFINITIONS[building.f].allowedUnits.includes(type))return 'Bilinmeyen birlik';
    if(definition.producer!==building.type||!building.production?.includes(type))return definition.names[building.f]+' bu yapıda üretilemez';
    const missing=(definition.requires||[]).find(required=>!this.complete(building.f,required));if(missing)return 'Önce '+getBuildingDefinition(missing).names[building.f]+' kur';
    if(this.simulation.forceUsed(building.f)+definition.forceCost>this.simulation.forceCap(building.f))return 'Kuvvet kapasitesine ulaşıldı';
    const economy=this.simulation.economySystem.get(building.f),cost=this.unitCost(building.f,definition);if(!economy.canAfford(cost))return 'Yetersiz kaynak';
    if(building.queue.length>=BALANCE.construction.queueLimit)return 'Üretim kuyruğu dolu';economy.charge(cost);building.queue.push({type,time:0});return '';
  }
  cancel(building){if(!building||building.hp<=0)return;const economy=this.simulation.economySystem.get(building.f);if(building.progress<1&&building.type!=='hq'){economy.refund(this.buildCost(building.f,building),BALANCE.construction.cancelRefund);building.hp=0;for(const id of building.assignedEngineers||[])this.engineeringSystem.stop([id]);this.movementSystem.repath();}else if(building.queue.length){const queued=building.queue.pop(),definition=getUnitDefinition(queued.type);economy.refund(this.unitCost(building.f,definition));}}
  workers(building){const result=[];for(const id of building.assignedEngineers||[]){const squad=this.simulation.squads.find(item=>item.id===id&&item.hp>0&&item.type==='engineer'&&item.worker?.targetBuildingId===building.id);if(squad&&dist(squad,building)<=building.r+BALANCE.construction.engineerRadius)result.push(squad);if(result.length>=BALANCE.construction.engineerCap)break;}return result;}
  constructionRate(workers){let multiplier=0;for(let index=0;index<workers.length;index++)multiplier+=BALANCE.construction.engineerFactors[index]||0;return multiplier;}
  finish(building){building.progress=1;for(const id of building.assignedEngineers||[]){const squad=this.simulation.squads.find(item=>item.id===id);if(squad?.worker?.targetBuildingId===building.id){squad.worker.state=WORKER_STATE.IDLE;squad.worker.targetBuildingId=null;squad.path=[];}}building.assignedEngineers=[];if(building.f===this.simulation.player)this.simulation.notify(building.names[building.f]+' hazır');this.simulation.economySystem.update(0);}
  updateConstruction(building,dt){
    if(!this.simulation.economySystem.get(building.f).engineeredConstruction){building.progress=Math.min(1,building.progress+dt/building.time);if(building.progress===1)this.finish(building);return;}
    const workers=this.workers(building);if(!workers.length)return;const rate=this.constructionRate(workers);building.progress=Math.min(1,building.progress+dt/building.time*rate);building.workEffectCooldown-=dt;
    if(building.workEffectCooldown<=0){const worker=workers[0];this.simulation.visualEvents.emit(VFX_EVENT.WORK,worker.x,.4,worker.z,building.x,.3,building.z,building.f,building.f,workers.length,building.r,worker.yaw,false,true,building.id);building.workEffectCooldown=BALANCE.construction.workEffectPeriod;}
    if(building.progress===1)this.finish(building);
  }
  updateProduction(building,dt){if(!building.queue.length)return;const queued=building.queue[0],definition=getUnitDefinition(queued.type);queued.time+=dt;if(queued.time<definition.time)return;let position=null;for(let index=0;index<16;index++){const angle=index/16*6.283,x=building.x+Math.cos(angle)*(building.r+3),z=building.z+Math.sin(angle)*(building.r+3),zone=this.simulation.match?.state==='PREPARATION'?FACTION_DEFINITIONS[building.f].deploymentZone:null;if(zone&&(x<zone.minX||x>zone.maxX))continue;if(walkable(x,z,this.simulation.buildings)&&!this.simulation.squads.some(squad=>squad.hp>0&&dist(squad,{x,z})<2)){position={x,z};break;}}if(position){const squad=this.unitManager.add(building.f,queued.type,position.x,position.z);building.queue.shift();if(building.rally)this.movementSystem.move([squad.id],building.rally.x,building.rally.z);if(building.f===this.simulation.player)this.simulation.notify(definition.names[building.f]+' göreve hazır');}}
  update(dt){
    for(const building of this.simulation.buildings){if(building.hp<=0)continue;if(building.progress<1){this.updateConstruction(building,dt);continue;}building.cooldown-=dt;this.updateProduction(building,dt);
      if(['tower','defense'].includes(building.type)&&building.cooldown<=0){const enemy=this.combatSystem.enemy(building,BALANCE.tower.range);if(enemy){this.combatSystem.damageSystem.apply(building,enemy,BALANCE.tower.damage);building.cooldown=BALANCE.tower.period;}}
      if(building.type==='hospital')for(const squad of this.simulation.squads)if(squad.f===building.f&&squad.hp>0&&dist(squad,building)<BALANCE.support.hospitalRadius&&this.simulation.time-squad.lastHit>BALANCE.support.hospitalDelay)squad.hp=Math.min((squad.alive??8)*getUnitDefinition(squad.type).hp,squad.hp+dt*BALANCE.support.hospitalHeal);
      if(building.type==='workshop'&&building.f===1)for(const target of this.simulation.buildings)if(target.f===building.f&&target.hp>0&&target.progress===1&&dist(target,building)<BALANCE.support.workshopRadius)target.hp=Math.min(target.maxHp,target.hp+dt*BALANCE.support.workshopRepair);
    }
  }
}
