export class SelectionSystem {
  constructor(){this.ids=new Set();}
  clear(){this.ids.clear();}
  replace(ids){this.ids=new Set(ids);return this.ids;}
  add(id){this.ids.add(id);}
  has(id){return this.ids.has(id);}
  array(){return [...this.ids];}
  prune(simulation){for(const id of this.ids)if(!simulation.squads.some(s=>s.id===id&&s.hp>0)&&!simulation.buildings.some(b=>b.id===id&&b.hp>0))this.ids.delete(id);}
  selectAll(simulation){return this.replace(simulation.squads.filter(s=>s.f===simulation.player&&s.hp>0).map(s=>s.id));}
}
