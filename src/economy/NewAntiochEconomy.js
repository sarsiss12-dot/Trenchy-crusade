import {FactionEconomyStrategy} from './FactionEconomyStrategy.js';
export class NewAntiochEconomy extends FactionEconomyStrategy {
  engineeredConstruction=true;
  activeGathering=true;
  get state(){return this.simulation.economies[this.faction];}
  cost(definition){return definition.costs;}
  capacity(){
    const capacity={supply:0,material:0,manpower:0};
    for(const building of this.simulation.buildings)if(building.f===this.faction&&building.hp>0&&building.progress===1&&building.storage)for(const key of Object.keys(capacity))capacity[key]+=building.storage[key]||0;
    return capacity;
  }
  update(){const capacity=this.capacity();for(const key of Object.keys(this.state.stock))this.state.stock[key]=Math.min(this.state.stock[key],capacity[key]||this.state.stock[key]);this.simulation.resources[this.faction]=this.state.stock.supply;this.state.capacity=capacity;this.state.forceCap=this.forceCap();}
  normalize(cost){return typeof cost==='number'?{supply:cost,material:0,manpower:0}:{supply:0,material:0,manpower:0,...cost};}
  canAfford(cost){const value=this.normalize(cost);return Object.keys(value).every(key=>(this.state.stock[key]||0)>=value[key]);}
  missing(cost){const value=this.normalize(cost);return Object.keys(value).filter(key=>(this.state.stock[key]||0)<value[key]);}
  charge(cost){const value=this.normalize(cost);if(!this.canAfford(value))return false;for(const key of Object.keys(value))this.state.stock[key]-=value[key];this.simulation.resources[this.faction]=this.state.stock.supply;return true;}
  refund(cost,factor=1){const value=this.normalize(cost),capacity=this.capacity();for(const key of Object.keys(value))this.state.stock[key]=Math.min(capacity[key]??Infinity,this.state.stock[key]+Math.floor(value[key]*factor));this.simulation.resources[this.faction]=this.state.stock.supply;}
  credit(type,amount){const capacity=this.capacity(),space=Math.max(0,(capacity[type]??0)-this.state.stock[type]),accepted=Math.min(space,amount);this.state.stock[type]+=accepted;this.state.delivered[type]=(this.state.delivered[type]||0)+accepted;this.simulation.resources[this.faction]=this.state.stock.supply;return accepted;}
  forceCap(){let total=0;for(const building of this.simulation.buildings)if(building.f===this.faction&&building.hp>0&&building.progress===1)total+=building.forceCap||0;return total;}
}
