import {clamp} from '../core/math.js';
import {BALANCE} from '../core/Config.js';
export class FormationSystem {
  goal(index,count,x,z,zone=null){
    const margin=2,max=BALANCE.world.size-margin,inset=.51;
    const minX=zone?Math.max(margin,zone.minX+inset):margin,maxX=zone?Math.min(max,zone.maxX-inset):max;
    return {x:clamp(x+(count>1?(index%3-1)*3.5:0),minX,maxX),z:clamp(z+(count>1?(Math.floor(index/3)-Math.floor(count/6))*3.5:0),margin,max)};
  }
}
