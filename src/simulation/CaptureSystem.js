import {BALANCE} from '../core/Config.js';
import {dist} from '../core/math.js';
export class CaptureSystem {
  constructor(simulation){this.simulation=simulation;}
  update(living,dt){for(const point of this.simulation.points){const near=[0,1].map(faction=>living.some(squad=>squad.f===faction&&dist(squad,point)<BALANCE.capture.radius)),faction=near[0]&&!near[1]?0:near[1]&&!near[0]?1:-1;if(faction!==-1&&faction!==point.owner){if(point.claim!==faction){point.claim=faction;point.progress=0;}point.progress+=dt;if(point.progress>=BALANCE.capture.duration){point.owner=faction;point.progress=0;this.simulation.notify(faction===this.simulation.player?'İkmal noktası ele geçirildi: +3/sn':'Düşman bir ikmal noktası ele geçirdi');}}else if(faction===-1)point.progress=Math.max(0,point.progress-dt*BALANCE.capture.decay);}}
}
