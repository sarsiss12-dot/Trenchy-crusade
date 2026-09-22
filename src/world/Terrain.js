import {hash} from '../core/math.js';
export const crossings=[24,56,88];
export const forests=[{x:34,z:29,r:10},{x:78,z:82,r:11},{x:20,z:48,r:8},{x:91,z:62,r:7}];
export const craters=Array.from({length:28},(_,i)=>({x:28+hash(i,7)*58,z:8+hash(i,8)*96,r:1.4+hash(i,9)*2.6})).filter(c=>Math.abs(c.x-56)>7);
// Short abandoned earthworks are terrain cover, not a ready-made defensive line.
export function terrain(x,z){if(x<1||z<1||x>111||z>111)return'edge';if(Math.abs(x-56)<4)return crossings.some(b=>Math.abs(z-b)<4)?'bridge':'river';if((Math.abs(x-43)<2.2&&z>34&&z<46)||(Math.abs(x-69)<2.2&&z>70&&z<82))return'trench';if(forests.some(f=>Math.hypot(x-f.x,z-f.z)<f.r))return'forest';if(craters.some(c=>Math.hypot(x-c.x,z-c.z)<c.r))return'mud';return'land';}
