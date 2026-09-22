import {getUnitDefinition} from '../../data/units.js';
export class PerformancePanel {
  constructor(element){this.element=element;}
  update(fps,sim,renderer,art,effects){const living=sim.squads.filter(squad=>squad.hp>0),soldiers=living.reduce((sum,squad)=>sum+Math.ceil(squad.hp/getUnitDefinition(squad.type).hp),0);this.element.innerHTML=Math.round(fps)+' FPS · '+living.length+' MANGA / '+soldiers+' ASKER<br>'+art.visible+' GÖRÜNÜR BİRİM/YAPI · '+renderer.drawCalls+' ÇİZİM<br>LOD '+art.near+' YAKIN / '+art.far+' UZAK · '+renderer.instances+' PARÇA<br>FX '+effects.particles.count()+'/'+effects.particles.limit+' · DUMAN '+effects.smoke.count()+' · İZ '+effects.marks.count()+' · CESET '+effects.corpses.count();}
}
