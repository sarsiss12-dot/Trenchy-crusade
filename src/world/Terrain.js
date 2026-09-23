import {hash} from '../core/math.js';
export const crossings=[36,84,132];
export const forests=[{x:49,z:43,r:13},{x:119,z:123,r:15},{x:28,z:75,r:11},{x:138,z:92,r:10}];
export const craters=Array.from({length:42},(_,i)=>({x:38+hash(i,7)*92,z:8+hash(i,8)*152,r:1.4+hash(i,9)*2.9})).filter(c=>Math.abs(c.x-84)>8);
export const trenchSegments=Object.freeze([Object.freeze({x:62,minZ:48,maxZ:66}),Object.freeze({x:106,minZ:105,maxZ:123})]);
// Short abandoned earthworks are terrain cover, not a ready-made defensive line.
export function terrain(x,z){if(x<1||z<1||x>167||z>167)return'edge';if(Math.abs(x-84)<4)return crossings.some(b=>Math.abs(z-b)<4)?'bridge':'river';if(trenchSegments.some(segment=>Math.abs(x-segment.x)<2.2&&z>segment.minZ&&z<segment.maxZ))return'trench';if(forests.some(f=>Math.hypot(x-f.x,z-f.z)<f.r))return'forest';if(craters.some(c=>Math.hypot(x-c.x,z-c.z)<c.r))return'mud';return'land';}
