import {clamp} from '../core/math.js';
import {BALANCE} from '../core/Config.js';
export class FormationSystem {
  goal(index,count,x,z){const margin=2,max=BALANCE.world.size-margin;return {x:clamp(x+(count>1?(index%3-1)*3.5:0),margin,max),z:clamp(z+(count>1?(Math.floor(index/3)-Math.floor(count/6))*3.5:0),margin,max)};}
}
