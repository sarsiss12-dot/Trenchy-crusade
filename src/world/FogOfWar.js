import {BALANCE} from '../core/Config.js';
import {getUnitDefinition} from '../../data/units.js';
export const VISIBILITY=Object.freeze({UNEXPLORED:0,EXPLORED:1,VISIBLE:2});
export class FogOfWar {
  constructor(simulation){this.simulation=simulation;this.cell=BALANCE.fog.cell;this.width=Math.ceil(BALANCE.world.size/this.cell);this.timer=0;this.grids=[new Uint8Array(this.width*this.width),new Uint8Array(this.width*this.width)];}
  restore(saved){if(!Array.isArray(saved))return;for(let f=0;f<2;f++)if(Array.isArray(saved[f])&&saved[f].length===this.grids[f].length)this.grids[f].set(saved[f]);}
  snapshot(){return this.grids.map(grid=>Array.from(grid,value=>value===VISIBILITY.VISIBLE?VISIBILITY.EXPLORED:value));}
  index(x,z){const cx=Math.max(0,Math.min(this.width-1,Math.floor(x/this.cell))),cz=Math.max(0,Math.min(this.width-1,Math.floor(z/this.cell)));return cz*this.width+cx;}
  state(faction,x,z){return this.grids[faction]?.[this.index(x,z)]??VISIBILITY.UNEXPLORED;}
  visible(faction,entity){return entity.f===faction||this.state(faction,entity.x,entity.z)===VISIBILITY.VISIBLE;}
  reveal(grid,x,z,radius){const minX=Math.max(0,Math.floor((x-radius)/this.cell)),maxX=Math.min(this.width-1,Math.floor((x+radius)/this.cell)),minZ=Math.max(0,Math.floor((z-radius)/this.cell)),maxZ=Math.min(this.width-1,Math.floor((z+radius)/this.cell)),rr=radius*radius;for(let zc=minZ;zc<=maxZ;zc++)for(let xc=minX;xc<=maxX;xc++){const px=(xc+.5)*this.cell,pz=(zc+.5)*this.cell;if((px-x)**2+(pz-z)**2<=rr)grid[zc*this.width+xc]=VISIBILITY.VISIBLE;}}
  update(dt,force=false){this.timer-=dt;if(!force&&this.timer>0)return;this.timer=BALANCE.fog.refresh;for(let faction=0;faction<2;faction++){const grid=this.grids[faction];for(let i=0;i<grid.length;i++)if(grid[i]===VISIBILITY.VISIBLE)grid[i]=VISIBILITY.EXPLORED;for(const squad of this.simulation.squads)if(squad.f===faction&&squad.hp>0){const definition=getUnitDefinition(squad.type);this.reveal(grid,squad.x,squad.z,definition?.vision??(definition?.combatUnit?BALANCE.fog.combatVision:BALANCE.fog.supportVision));}for(const building of this.simulation.buildings)if(building.f===faction&&building.hp>0&&building.progress===1){const radius=building.type==='observation'?BALANCE.fog.observationVision:['tower','defense'].includes(building.type)?BALANCE.fog.armedBuildingVision:BALANCE.fog.buildingVision;this.reveal(grid,building.x,building.z,radius);}}}
}
