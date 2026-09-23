import {BALANCE} from '../core/Config.js';
import {terrain} from './Terrain.js';
export function walkable(x,z,buildings=[],ignoreId=0){const kind=terrain(x,z);return kind!=='river'&&kind!=='edge'&&!buildings.some(b=>b.hp>0&&b.id!==ignoreId&&b.category!=='FIELD_DEFENSE'&&Math.hypot(x-b.x,z-b.z)<b.r+.8);}
export function pathfind(sx,sz,tx,tz,buildings=[]){
  const {grid,cell}=BALANCE.world,coord=value=>Math.max(0,Math.min(grid-1,Math.floor(value/cell))),start=coord(sz)*grid+coord(sx),end=coord(tz)*grid+coord(tx),blocked=new Uint8Array(grid*grid);
  for(let z=0;z<grid;z++)for(let x=0;x<grid;x++)blocked[z*grid+x]=!walkable(x*cell+1,z*cell+1,buildings);
  if(blocked[end])return null;blocked[start]=0;
  const costs=new Float32Array(grid*grid).fill(Infinity),parent=new Int32Array(grid*grid).fill(-1),closed=new Uint8Array(grid*grid),open=[start];costs[start]=0;
  const heuristic=index=>Math.hypot(index%grid-end%grid,Math.floor(index/grid)-Math.floor(end/grid));
  while(open.length){let best=0;for(let i=1;i<open.length;i++)if(costs[open[i]]+heuristic(open[i])<costs[open[best]]+heuristic(open[best]))best=i;const node=open.splice(best,1)[0];if(node===end){const path=[];let current=end;while(current!==start){path.push({x:(current%grid)*cell+1,z:Math.floor(current/grid)*cell+1});current=parent[current];}path.reverse();return path;}closed[node]=1;const x=node%grid,z=Math.floor(node/grid);for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dz)continue;const nx=x+dx,nz=z+dz,index=nz*grid+nx;if(nx<0||nz<0||nx>=grid||nz>=grid||blocked[index]||closed[index])continue;if(dx&&dz&&(blocked[z*grid+nx]||blocked[nz*grid+x]))continue;const kind=terrain(nx*cell+1,nz*cell+1),next=costs[node]+(dx&&dz?1.414:1)*(kind==='mud'?1.7:kind==='forest'?1.25:1);if(next<costs[index]){costs[index]=next;parent[index]=node;if(!open.includes(index))open.push(index);}}}
  return null;
}
