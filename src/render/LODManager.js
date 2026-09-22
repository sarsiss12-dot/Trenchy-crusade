import {clamp} from '../core/math.js';
export class LODManager { level(renderer){const pixels=renderer.height/renderer.cam.zoom;return clamp((pixels-6)/6,0,1);} isNear(renderer){return this.level(renderer)>.5;} }
export const lodManager=new LODManager();
