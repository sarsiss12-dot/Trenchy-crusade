import {FactionEconomyStrategy} from './FactionEconomyStrategy.js';
import {BALANCE} from '../core/Config.js';
export class LegacyBlackGrailEconomy extends FactionEconomyStrategy {
  update(dt){const buildings=this.simulation.buildings,points=this.simulation.points,controlIncome=this.simulation.match?.mode==='SIEGE'?0:points.filter(p=>p.owner===this.faction).length*BALANCE.economy.controlIncome;this.simulation.resources[this.faction]+=dt*(BALANCE.economy.baseIncome+buildings.filter(b=>b.f===this.faction&&b.hp>0&&b.progress===1&&b.type==='supply').length*BALANCE.economy.supplyIncome+controlIncome);}
  canAfford(cost){const value=typeof cost==='number'?cost:cost.supply||0;return this.simulation.resources[this.faction]>=value;}
  charge(cost){const value=typeof cost==='number'?cost:cost.supply||0;if(!this.canAfford(value))return false;this.simulation.resources[this.faction]-=value;return true;}
  refund(cost,factor=1){const value=typeof cost==='number'?cost:cost.supply||0;this.simulation.resources[this.faction]+=Math.floor(value*factor);}
  credit(_type,amount){this.simulation.resources[this.faction]+=amount;return amount;}
  forceCap(){return BALANCE.army.maxSquads*BALANCE.army.squadSize;}
}
