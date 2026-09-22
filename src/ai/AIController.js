import {dist} from '../core/math.js';
import {AIOrders} from './AIOrders.js';
export class AIController {
  constructor(simulation){this.simulation=simulation;}
  update(dt){
    const sim=this.simulation,faction=1-sim.player;sim.ai.tick-=dt;sim.ai.wave-=dt;
    if(sim.ai.tick<=0){
      sim.ai.tick=6;const buildings=sim.buildings.filter(b=>b.f===faction&&b.hp>0),engineers=sim.squads.filter(s=>s.f===faction&&s.type==='engineer'&&s.hp>0);
      if(faction===0)for(const [index,engineer] of engineers.entries())if(engineer.worker.state==='IDLE'&&!engineer.worker.auto)sim.setAutoGather([engineer.id],true,index%2?'material':'supply');
      const wants=faction===0?['workshop','materialDepot','observation','hospital','defense','supply']:['supply','tower','workshop','hospital','chapel'];
      const type=wants.find(wanted=>!buildings.some(b=>b.type===wanted))||(buildings.filter(b=>b.type==='supply').length<2?'supply':null);
      if(type){const hq=buildings.find(b=>b.type==='hq'),workerIds=engineers.slice(0,2).map(s=>s.id);if(hq&&(faction!==0||workerIds.length))for(let i=0;i<20;i++){const angle=i*2.399,radius=10+Math.floor(i/7)*5,x=hq.x+Math.cos(angle)*radius,z=hq.z+Math.sin(angle)*radius;if(!AIOrders.build(sim,faction,type,x,z,workerIds))break;}}
      for(const barracks of buildings.filter(b=>b.type==='barracks'&&b.progress===1&&b.queue.length<1))AIOrders.train(sim,barracks,buildings.some(v=>v.type==='workshop'&&v.progress===1)&&sim.count(faction)%3===0?'heavy':'infantry');
      const workshop=buildings.find(b=>b.type==='workshop'&&b.progress===1&&b.queue.length<1);if(faction===0&&workshop&&engineers.length<2)AIOrders.train(sim,workshop,'engineer');
      const threat=sim.squads.find(s=>s.f!==faction&&s.hp>0&&buildings.some(b=>dist(b,s)<22));if(threat)AIOrders.move(sim,sim.squads.filter(s=>s.f===faction&&s.hp>0&&s.type!=='engineer').slice(0,3).map(s=>s.id),threat.x,threat.z,threat);
    }
    if(sim.ai.wave<=0){sim.ai.wave=45;const squads=sim.squads.filter(s=>s.f===faction&&s.hp>0&&s.type!=='engineer'),goal=sim.points.find(p=>p.owner!==faction),hq=sim.buildings.find(b=>b.f!==faction&&b.type==='hq'&&b.hp>0);if(sim.time>180&&squads.length>=5&&hq)AIOrders.move(sim,squads.map(s=>s.id),hq.x,hq.z,hq);else if(goal)AIOrders.move(sim,squads.slice(0,Math.max(2,squads.length-2)).map(s=>s.id),goal.x,goal.z);}
  }
}
