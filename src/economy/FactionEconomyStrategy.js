export class FactionEconomyStrategy {
  constructor(simulation,faction){this.simulation=simulation;this.faction=faction;}
  engineeredConstruction=false;
  activeGathering=false;
  update(){}
  cost(definition){return definition.cost;}
  canAfford(){return true;}
  charge(){return true;}
  refund(){}
  credit(){}
  forceCap(){return 80;}
  capacity(){return {};}
}
