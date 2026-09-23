export const FIELD_TYPES=Object.freeze(['trench','sandbag','barbedWire']);
export function pointNearSegment(entity,x,z,padding=0){const half=(entity.segmentLength||entity.r*2)/2,c=Math.cos(entity.yaw||0),s=Math.sin(entity.yaw||0),dx=x-entity.x,dz=z-entity.z,along=dx*c-dz*s,across=dx*s+dz*c;return Math.abs(along)<=half+padding&&Math.abs(across)<=1.35+padding;}
export function fieldTerrainAt(buildings,x,z){const trench=buildings.find(b=>b.hp>0&&b.progress===1&&b.type==='trench'&&pointNearSegment(b,x,z));return trench?'trench':null;}
export function coverAt(buildings,x,z){let cover=1;for(const b of buildings)if(b.hp>0&&b.progress===1&&b.cover<cover&&pointNearSegment(b,x,z,1.2))cover=b.cover;return cover;}
export function wireSpeedAt(buildings,squad){let speed=1;for(const b of buildings)if(b.hp>0&&b.progress===1&&b.type==='barbedWire'&&pointNearSegment(b,squad.x,squad.z,.5))speed=Math.min(speed,b.movement?.[b.f===squad.f?'friendly':'enemy']??1);return speed;}
