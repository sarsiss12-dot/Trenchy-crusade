export class Faction {
  constructor(definition,hooks={}){this.definition=definition;this.hooks=Object.freeze({...hooks});}
  get id(){return this.definition.id;}
  get index(){return this.definition.index;}
  allowsUnit(type){return this.definition.allowedUnits.includes(type);}
  allowsBuilding(type){return this.definition.allowedBuildings.includes(type);}
  income(context){return this.hooks.income?.(context)??context.defaultIncome;}
  construction(context){return this.hooks.construction?.(context)??context;}
  serialize(){return this.definition.id;}
}
