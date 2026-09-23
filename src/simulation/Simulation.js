import {GameState} from '../core/GameState.js';
import {VisualEvents} from '../effects/VisualEvents.js';
import {FACTION_DEFINITIONS} from '../../data/factions.js';
import {SimulationClock} from './SimulationClock.js';
import {EconomySystem} from './EconomySystem.js';
import {CaptureSystem} from './CaptureSystem.js';
import {UnitManager} from '../units/UnitManager.js';
import {BuildingManager} from '../buildings/BuildingManager.js';
import {MovementSystem} from '../units/MovementSystem.js';
import {DamageSystem} from '../combat/DamageSystem.js';
import {CombatSystem} from '../combat/CombatSystem.js';
import {ConstructionSystem} from '../buildings/ConstructionSystem.js';
import {AIController} from '../ai/AIController.js';
import {ResourceNodeManager} from '../world/ResourceNodeManager.js';
import {LogisticsSystem} from '../units/LogisticsSystem.js';
import {EngineeringSystem} from '../units/EngineeringSystem.js';
import {getUnitDefinition} from '../../data/units.js';
import {MatchFlow} from './MatchFlow.js';
import {FogOfWar} from '../world/FogOfWar.js';

export class Simulation {
  constructor(player=0,initialize=true,options={}){Object.assign(this,GameState.create(player));this.visualEvents=new VisualEvents();this.events=[];this.attachSystems();if(initialize)this.initializeMatch(options);}
  attachSystems(){this.clock=new SimulationClock();this.matchFlow=new MatchFlow(this);this.unitManager=new UnitManager(this);this.buildingManager=new BuildingManager(this);this.movementSystem=new MovementSystem(this);this.resourceNodeManager=new ResourceNodeManager(this);this.economySystem=new EconomySystem(this);this.logisticsSystem=new LogisticsSystem(this,this.resourceNodeManager,this.movementSystem);this.engineeringSystem=new EngineeringSystem(this,this.movementSystem);this.damageSystem=new DamageSystem(this);this.combatSystem=new CombatSystem(this,this.damageSystem);this.constructionSystem=new ConstructionSystem(this,this.buildingManager,this.unitManager,this.combatSystem,this.movementSystem,this.engineeringSystem);this.captureSystem=new CaptureSystem(this);this.fogOfWar=new FogOfWar(this);this.fogOfWar.restore(this.fog);this.aiController=new AIController(this);}
  initializeMatch(options={}){this.matchFlow.setup(options.duration);this.resourceNodeManager.initialize();for(let faction=0;faction<FACTION_DEFINITIONS.length;faction++){const definition=FACTION_DEFINITIONS[faction],[x,z]=definition.base,direction=faction?-1:1;this.addBuilding(faction,'hq',x,z,true);this.addBuilding(faction,'barracks',x+direction*8,z-7,true);this.addBuilding(faction,'supply',x,z-direction*10,true);let slot=0;for(const group of definition.startingArmy)for(let index=0;index<group.count;index++,slot++)this.addSquad(faction,group.type,x+direction*(group.type==='engineer'?5:10),z+(group.type==='engineer'?-4:3+slot*3));}this.matchFlow.bindObjective();this.matchFlow.start();this.economySystem.update(0);this.fogOfWar.update(0,true);this.fog=this.fogOfWar.snapshot();}
  notify(msg){this.events.push({t:this.time,msg});if(this.events.length>30)this.events.shift();}
  addBuilding(...args){return this.buildingManager.add(...args);}
  addSquad(...args){return this.unitManager.add(...args);}
  count(faction){return this.unitManager.count(faction);}
  placement(...args){return this.constructionSystem.placement(...args);}
  build(...args){return this.constructionSystem.build(...args);}
  train(...args){return this.constructionSystem.train(...args);}
  cancel(...args){return this.constructionSystem.cancel(...args);}
  repath(){return this.movementSystem.repath();}
  move(...args){return this.movementSystem.move(...args);}
  enemy(...args){return this.combatSystem.enemy(...args);}
  damage(...args){return this.damageSystem.apply(...args);}
  gather(...args){return this.logisticsSystem.gather(...args);}
  setAutoGather(...args){return this.logisticsSystem.setAuto(...args);}
  assistConstruction(...args){return this.engineeringSystem.assist(...args);}
  repair(...args){return this.engineeringSystem.repair(...args);}
  forceUsed(faction){let total=0;for(const squad of this.squads)if(squad.f===faction&&squad.hp>0)total+=getUnitDefinition(squad.type)?.forceCost||0;for(const building of this.buildings)if(building.f===faction&&building.hp>0)for(const queued of building.queue)total+=getUnitDefinition(queued.type)?.forceCost||0;return total;}
  forceCap(faction){return this.economySystem.get(faction).forceCap();}
  step(dt){if(this.winner!==null)return;this.tick++;this.clock.advance(this,dt);this.matchFlow.update(dt);this.economySystem.update(dt);this.constructionSystem.update(dt);for(const squad of this.squads){if(squad.hp<=0)continue;const combat=this.combatSystem.updateSquad(squad,dt);this.movementSystem.updateSquad(squad,combat.definition,combat.enemy,combat.target,dt);}this.logisticsSystem.update(dt);this.engineeringSystem.update(dt);const living=this.unitManager.living();this.movementSystem.separate(living,dt);if(this.match?.mode!=='SIEGE')this.captureSystem.update(living,dt);this.aiController.update(dt);this.fogOfWar.update(dt);this.fog=this.fogOfWar.snapshot();this.unitManager.purge();}
  serialize(){return GameState.serialize(this);}
  static restore(raw){const data=GameState.parse(raw),simulation=new Simulation(data.player,false);Object.assign(simulation,data);simulation.visualEvents=new VisualEvents();simulation.events=[];simulation.attachSystems();simulation.resourceNodeManager.initialize();simulation.economySystem.update(0);return simulation;}
}
