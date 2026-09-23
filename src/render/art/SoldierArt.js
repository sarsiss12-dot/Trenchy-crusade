import {FACTIONS,clamp} from '../../data.js';
import {getFactionVisual} from '../factions/FactionVisualRegistry.js';
const IRON=[.22,.28,.29],BOOT=[.075,.09,.085],BONE=[.66,.63,.43];
const CLOTH=[.39,.36,.27],FLESH=[.35,.19,.19],SORE=[.46,.39,.16];
// A shared pose builder keeps a casualty visually continuous with its live model.
export function soldierArt(batch,x,z,yaw,f,heavy,lod,time,walking=false,fall=0,fade=1,seed=0,hit=0,engineer=false,recoil=0){
  const organic=getFactionVisual(f).organic,t=clamp(fall,0,1),angle=t*1.49,scale=heavy?1.28:1;
  const cp=Math.cos(angle),sp=Math.sin(angle),c=Math.cos(yaw),s=Math.sin(yaw);
  const bob=walking?Math.sin(time*9+seed*6)*.055:0;
  const body=organic?FLESH:FACTIONS[0].ink;
  const add=(kind,dx,y,dz,sx,sy,sz,color,alpha=1,pitch=0,roll=0,glow=0)=>{
    y*=scale;dx*=scale;dz*=scale;
    const py=y*cp-dz*sp+.16+t*.07+bob,pz=y*sp+dz*cp;
    const color2=hit>0?[color[0]+hit*.22,color[1]+hit*.13,color[2]+hit*.06]:color;
    batch.add(kind,x+dx*c+pz*s,py,z-dx*s+pz*c,sx*scale,sy*scale,sz*scale,color2,yaw,alpha*fade,angle+pitch,roll,glow);
  };
  batch.add('cylinder',x,.10,z,.8+t*.6,.014,.8+t*.7,BOOT,yaw,fade*.85);
  const stride=walking?Math.sin(time*9+seed*6)*.32:0;
  add('box',-.15,.30,0,.18,.57,.23,BOOT,1,stride);
  add('box',.15,.30,0,.18,.57,.23,BOOT,1,-stride);
  add(organic?'sphere':'box',0,.91,0,organic?.60:.54,.72,.39,body,1,organic?.17:0);
  add(organic?'sphere':'cylinder',0,1.48,organic?.12:0,.44,.39,.44,organic?BONE:IRON);
  // Faction identity survives the far LOD: tabard + helmet vs hunched back + horn.
  if(!organic){
    add('box',0,.63,.20,.35,.67,.06,CLOTH);
    add('cone',0,1.77,0,.14,.32,.14,IRON);
    add('box',.29,1,.32-recoil*.22,.13,.13,heavy?1.34:.97,BOOT,1,-recoil*.08);
    if(engineer){add('box',0,1.03,-.31,.68,.82,.28,[.38,.29,.17]);add('box',-.48,.82,.04,.12,.92,.14,[.72,.55,.25],1,0,.2);add('cylinder',.47,.88,-.2,.18,.75,.18,[.31,.34,.31],1,0,.55);}
    else if((seed*100|0)%3===0)add('box',0,1.05,-.28,.42,.48,.2,CLOTH,lod);
  }else{
    add('sphere',-.12,1.14,-.23,.63,.68,.47,SORE);
    add('cone',.13,1.86,.07,.15,.66,.15,BONE,1,-.20);
    add('box',.34,.87,.32,.13,.20,.78,FLESH,1,.17);
  }
  if(lod<=0)return;
  add('sphere',-.32,1.07,.03,.30,.28,.31,organic?FLESH:IRON,lod);
  add('sphere',.32,1.07,.03,.30,.28,.31,organic?SORE:IRON,lod);
  add('box',0,1.41,.24,.29,.20,.14,organic?BONE:BOOT,lod);
  add('sphere',-.10,1.49,.30,.085,.07,.07,organic?[.65,.73,.26]:[.79,.46,.18],lod,0,0,.35);
  add('sphere',.10,1.49,.30,.085,.07,.07,organic?[.65,.73,.26]:[.79,.46,.18],lod,0,0,.35);
  if(!organic){
    add('box',0,1,-.26,.37,.42,.22,CLOTH,lod);
    add('box',0,.79,.25,.055,.25,.022,BONE,lod);
    add('box',0,.83,.255,.20,.055,.023,BONE,lod);
    add('box',-.33,.77,0,.13,.50,.18,CLOTH,lod);
    if(heavy){add('box',-.48,1.09,.05,.22,.62,.52,IRON,lod);add('box',.48,1.09,.05,.22,.62,.52,IRON,lod);add('box',0,1.18,-.34,.72,.76,.3,IRON,lod);}
    if(engineer){add('cylinder',0,1.76,0,.55,.18,.55,[.73,.58,.27],lod);add('box',.43,.82,.2,.1,.18,.72,IRON,lod,0,.3);}
  }else{
    for(let i=0;i<3;i++)add('box',0,.83+i*.13,.25,.41,.055,.07,BONE,lod,0,(i-1)*.08);
    add('cone',-.35,1.47,-.12,.15,.49,.15,BONE,lod,-.5);
    add('sphere',-.28,.70,.03,.20,.27,.22,SORE,lod);
    if(heavy)add('cone',.42,1.42,0,.24,.6,.24,BONE,lod,0,-.4);
  }
}
