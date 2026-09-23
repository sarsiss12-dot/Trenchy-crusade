import {atmosphereArt} from './AtmosphereArt.js';
import {getFactionVisual} from '../factions/FactionVisualRegistry.js';
import {soldierArt} from './SoldierArt.js';
import {resourceNodeArt} from './ResourceArt.js';
import {constructionSiteArt,placementFeedbackArt} from './ConstructionArt.js';
import {
  Batch
}
from '../Batch.js';
import {
  hash,FACTIONS,UNITS,clamp
}
from '../../data.js';
import {
  terrain,forests,craters,crossings
}
from '../../world/World.js';
import {trenchSegments} from '../../world/Terrain.js';
import {BALANCE} from '../../core/Config.js';
import {VISIBILITY} from '../../world/FogOfWar.js';
const C= {
  earth:[.27,.255,.215],mud:[.16,.145,.115],stone:[.43,.44,.39],metal:[.24,.29,.29],sand:[.49,.43,.31],bone:[.68,.64,.43],flesh:[.34,.17,.19],black:[.10,.13,.13]
};
const tint=(c,v)=>c.map(x=>x*v);
export function landscape() {
  const b=new Batch(),add=(...a)=>b.add(...a);
  const center=BALANCE.world.size/2;add('box',center,-1.1,center,BALANCE.world.size+2,2,BALANCE.world.size+2,C.earth);
  for(let z=1; z<BALANCE.world.size; z+=2)for(let x=1; x<BALANCE.world.size; x+=2) {
    const t=terrain(x,z),h=hash(x,z),c=t==='river'?[.21,.29,.28]:t==='trench'?[.13,.14,.12]:t==='mud'?C.mud:t==='forest'?[.22,.25,.18]:C.earth;
    add('box',x,t==='river'?-.08:t==='trench'?-.02:.015, z,2.02,.12,2.02,tint(c,.985+h*.03));
    if(t==='land'&&h>.91)add('sphere',x,.06,z,.5+h,.25,.7,C.stone);
  }
  for(const c of craters) {
    add('cylinder',c.x,.13,c.z,c.r*2,.22,c.r*2,[.20,.19,.15]);
    add('cylinder',c.x,.26,c.z,c.r*1.65,.08,c.r*1.65,[.12,.14,.12]);
    add('cylinder',c.x,.31,c.z,c.r,.02,c.r,[.20,.25,.23]);
  }
  for(const segment of trenchSegments)for(let z=segment.minZ; z<segment.maxZ; z+=1.35) {
    const x=segment.x;
    for(const dx of[-2,2]) {
      add('sphere',x+dx,.35,z,1.2,.66,1.6,C.sand);
      if(hash(x,z)>.48)add('sphere',x+dx,.77,z,1,.5,1.3,tint(C.sand,.85));
    }
    if(z%4<1.5)add('box',x,.10,z,2.8,.12,.45,[.29,.24,.17]);
  }
  for(const z of crossings) {
    for(let x=center-5; x<=center+5; x+=.65)add('box',x,.23,z,.58,.26,7.5,[.35,.30,.22]);
    for(const side of[-1,1]) {
      add('box',center,.5,z+side*3.5,11,.3,.25,C.metal);
      for(const x of[center-5,center-2,center+2,center+5])add('box',x,.9,z+side*3.5,.18,1.8,.18,C.metal);
    }
  }
  for(const f of forests)for(let i=0; i<23; i++) {
    const a=hash(i,f.x)*6.28,r=Math.sqrt(hash(i,f.z))*f.r,x=f.x+Math.cos(a)*r,z=f.z+Math.sin(a)*r,h=3+hash(x,z)*4;
    add('sphere',x+1,.12,z-.5,3,.035,2,[.15,.17,.13]);
    add('cone',x,h*.5,z,.65,h,.65,[.20,.21,.16]);
    add('box',x+.6,h*.65,z,1.8,.2,.25,[.22,.24,.17],.7);
    if(i%3!==0) {
      add('cone',x,h*.65,z,2.6,h*.65,2.6,[.14,.20,.16]);
      add('cone',x,h*.88,z,1.9,h*.45,1.9,[.19,.24,.17]);
    }
  }
  for(let i=0; i<95; i++) {
    const x=8+hash(i,51)*(BALANCE.world.size-16),z=7+hash(i,52)*(BALANCE.world.size-14);
    if(['river','bridge'].includes(terrain(x,z)))continue;
    if(i%4===0) {
      add('box',x,.65,z,.12,1.5,.14,[.28,.29,.24],.12);
      add('box',x,1,z,.85,.14,.15,[.29,.30,.25]);
    }else {
      add('box',x,.35,z,1.6,.2,.2,C.metal,.7);
      add('box',x,.35,z,.2,.8,1.6,C.metal,.7);
    }
  }
  // shattered shrine and armoured wrecks
  for(const [x,z]of[[33,59],[78,47],[60,102]]) {
    add('box',x,.7,z,4,1.3,2.2,[.27,.28,.23],.35);
    add('box',x,1.5,z,2,.8,1.5,[.32,.31,.24],.35);
    add('box',x+1.5,1.5,z,3,.25,.25,C.black,.35);
    for(const s of[-1,1])add('box',x,.45,z+s*1.2,4.5,.6,.5,C.black,.35);
  }
  for(const [x,z]of[[18,15],[91,96]]) {
    add('box',x,.3,z,9,.5,6,C.stone);
    for(let i=0; i<4; i++)add('box',x-4+i*2.6,1.8+hash(i,x),z,1,3+hash(i,x)*2,1,C.stone);
    add('box',x-4,1.8,z+2,1,3.5,4,C.stone);
  }
  atmosphereArt(b);
  return b;
}
export function buildingArt(b,v,time,ghost=false) {
  const f=v.f,organic=getFactionVisual(f).organic,p=ghost?1:v.progress,health=ghost?1:v.hp/v.maxHp;
  const dead=v.hp<=0,deathAge=dead?Math.max(0,time-(v.diedAt??time-5)):0;
  const collapse=dead?clamp(deathAge/1.15,0,1):0;
  const scale=(.2+.8*p)*(1-collapse*.84),baseY=.2;
  const col=ghost?(v.valid?[.38,.65,.51]:[.70,.22,.16]):null;
  const hit=!ghost&&time-(v.lastHit??-10)<.16;
  const shade=ghost?1:.58+.42*clamp(health,0,1);
  const breath=organic&&!dead?1+Math.sin(time*1.45+v.id)*.018:1;
  const add=(kind,dx,y,dz,sx,sy,sz,c,rot=0,pitch=0,roll=0,glow=0)=>{
    const material=col||[c[0]*shade+(hit?.15:0),c[1]*shade+(hit?.10:0),c[2]*shade+(hit?.045:0)];
    b.add(kind,v.x+dx+collapse*y*.17,baseY+y*scale,v.z+dz,
      sx*breath,sy*scale,sz*breath,material,rot,ghost?.62:1,pitch,roll+collapse*.25,glow);
  };
  const stone=organic?[.30,.23,.22]:C.stone,metal=organic?C.flesh:C.metal,accent=FACTIONS[f].accent;
  if(['trench','sandbag','barbedWire'].includes(v.type)){
    const length=v.segmentLength||6,yaw=v.yaw||0,c=Math.cos(yaw),s=Math.sin(yaw);
    const segmentAdd=(kind,dx,y,dz,sx,sy,sz,color,localRot=0,pitch=0,roll=0,glow=0)=>add(kind,dx*c-dz*s,y,dx*s+dz*c,sx,sy,sz,color,yaw+localRot,pitch,roll,glow);
    if(v.type==='trench'){for(let i=-2;i<=2;i++){segmentAdd('sphere',i*length/5,.35,-.8,1.45,.7,1.15,C.sand);segmentAdd('sphere',i*length/5,.35,.8,1.45,.7,1.15,C.sand);}segmentAdd('box',0,.08,0,length,.12,1.4,C.mud);}
    if(v.type==='sandbag')for(let row=0;row<2;row++)for(let i=-2;i<=2;i++)segmentAdd('sphere',i*length/5+(row?.35:0),.28+row*.38,0,1.35,.48,.72,C.sand);
    if(v.type==='barbedWire'){for(const i of[-1,0,1]){segmentAdd('box',i*length/3,.55,0,.12,1.1,.12,metal);segmentAdd('ring',i*length/3,.6,0,1.3,.08,1.3,metal);}segmentAdd('box',0,.55,0,length,.06,.06,metal);}
    if(!ghost&&p<1)constructionSiteArt(b,v);return;
  }
  if(!organic&&p<1&&!ghost){constructionSiteArt(b,v);return;}
  if(dead&&collapse>=1){
    // A bounded visual ruin pass is selected by dynamicArt; not a collision object.
    b.add('cylinder',v.x,.11,v.z,v.r*2.7,.03,v.r*2.4,[.075,.075,.065]);
    for(let i=0;i<9;i++){
      const a=i*2.399+v.id,d=(.25+hash(i,v.id)*.7)*v.r;
      const size=.5+hash(i+2,v.id)*1.7;
      b.add(organic?'sphere':'box',v.x+Math.cos(a)*d,.25+size*.13,v.z+Math.sin(a)*d,size,size*.4,size*.65,organic?[.22,.115,.12]:[.27,.28,.24],a,1,hash(i,5)*.35,hash(i,8)*.25);
    }
    if(organic){
      b.add('sphere',v.x,.35,v.z,v.r*1.7,.7,v.r*1.2,[.28,.15,.16]);
      b.add('cone',v.x+.5,.8,v.z,.3,1.5,.3,C.bone,.5,1,.6,.5);
    }else{
      b.add('box',v.x-v.r*.55,.65,v.z,.6,1.3,v.r*1.7,[.28,.29,.26],0,1,0,.15);
      b.add('box',v.x,.33,v.z,2.6,.25,1.4,[.20,.24,.23],.4,1,.15,.14);
    }
    return;
  }
  b.add('sphere',v.x+1,.14,v.z-.7,v.r*2.5,.04,v.r*2.1,[.15,.17,.14]);
  add(organic?'sphere':'box',0,.14,0,v.r*2.25,.3,v.r*2.25,organic?[.25,.21,.19]:[.27,.29,.26]);
  const cross=(x,y,z,size)=> {
    add('box',x,y,z,.19,size,.18,C.bone);
    add('box',x,y+size*.16,z,size*.65,.19,.2,C.bone);
  };
  if(!organic) {
    const wall=(w,h,d)=> {
      add('box',0,h/2,0,w,h,d,stone);
      add('box',0,h*.57,0,w+.08,.2,d+.08,[.24,.27,.25]);
      for(const side of[-1,1])add('box',side*w*.46,h*.45,0,.4,h*.9,d+.5,tint(stone,.8));
      add('box',0,.9,d/2+.05,.85,1.8,.12,C.black);
    };
    if(v.type==='hq') {
      wall(6,3.8,4.8);
      add('box',0,4.2,0,6.6,.7,5.2,metal);
      add('box',-2,5,0,1.4,2,1.7,stone);
      add('cone',-2,6.3,0,2,1,2,metal);
      cross(-2,7.3,0,1.5);
      for(let i=-1; i<=1; i++)add('box',i*1.6,4.9,-1.8,.5,.85,.5,stone);
    }
    if(v.type==='barracks') {
      wall(5,1.7,3.8);
      add('cylinder',0,2,0,5.5,1,4.2,metal);
      for(let i=-1; i<=1; i++)add('box',i*1.5,1.9,2.14,.7,.35,.08,C.black);
    }
    if(v.type==='workshop') {
      wall(4.8,2.5,4);
      add('box',0,3,0,5.2,.6,4.4,metal);
      add('cylinder',-1.5,4,-1, .65,4,.65,C.black);
      add('cylinder',-.3,3.5,-1,.6,3,.6,metal);
      add('box',3,3,0,.22,5,.22,C.sand);
      add('box',1.6,5.4,0,3,.2,.2,C.sand);
      add('box',.3,4.8,0,.1,1,.1,metal);
    }
    if(v.type==='supply') {
      for(const x of[-1,1]) {
        add('cylinder',x,1.5,0,1.6,2.8,1.6,metal);
        add('cone',x,3,0,1.7,.55,1.7,C.sand);
      }
      for(const z of[-1.6,1.6])add('box',0,.6,z,3.5,1.2,.9,C.sand);
    }
    if(v.type==='materialDepot') {
      add('box',0,1.45,0,5.7,2.6,4.5,stone);add('box',0,2.95,0,6.1,.45,4.9,metal);
      for(const x of[-1.7,0,1.7]){add('cylinder',x,1.15,2.35,.72,2.1,.72,metal);add('box',x,.45,-2.4,1.2,.75,.9,C.sand);}
      add('box',2.55,3.8,0,.18,3,.18,C.metal);add('box',1.5,5.1,0,2.2,.16,.16,C.sand);
    }
    if(v.type==='hospital') {
      wall(5,1.2,4);
      add('cone',0,2.2,0,7,2.2,5.7,[.56,.51,.39]);
      add('box',0,1.1,2.4,1,.8,.12,[.63,.59,.46]);
      add('box',0,1.1,2.48,.65,.18,.03,accent);
      add('box',0,1.1,2.48,.18,.65,.03,accent);
    }
    if(v.type==='tower') {
      for(const x of[-1,1])for(const z of[-1,1])add('box',x,2.3,z,.4,4.5,.4,metal);
      add('box',0,4.5,0,3,.5,3,stone);
      add('box',0,5,0,2.7,.7,2.7,metal);
      add('box',0,5.1,1.8,.3,.3,2.6,C.black);
      add('cone',0,6.3,0,3.6,1.2,3.6,metal);
    }
    if(v.type==='observation') {
      for(const x of[-1,1])for(const z of[-1,1])add('box',x,2.1,z,.32,4.2,.32,metal);
      add('box',0,4.15,0,3.4,.45,3.4,stone);add('box',0,4.75,0,2.8,.8,2.8,metal);
      add('cylinder',0,6,0,.18,2.7,.18,C.sand);add('box',.6,6.8,0,1.2,.75,.06,accent);
    }
    if(v.type==='defense') {
      add('box',0,.75,0,5.2,1.2,3.4,stone);for(const x of[-1.9,-.65,.65,1.9])add('sphere',x,1.35,1.25,1.2,.65,1,C.sand);
      add('cylinder',0,1.75,0,2.4,.8,2.4,metal);add('box',0,2.15,1.75,.32,.32,3.4,C.black);
    }
    if(v.type==='chapel') {
      wall(3.2,3.3,4.6);
      add('cone',0,4.1,0,5,2,6,metal);
      add('box',0,5, -1,1.4,3,1.4,stone);
      add('cone',0,6.9,-1,2,1.3,2,metal);
      cross(0,8,-1,1.4);
      add('box',0,2.5,2.4,.55,.9,.09,accent);
    }
    if(v.type!=='hospital'&&v.type!=='tower'){
      for(const side of [-1,1]){
        add('box',side*v.r*.73,1.5,v.r*.56,.32,2.8,.6,[.33,.35,.31]);
        add('cone',side*v.r*.73,3,v.r*.56,.55,.6,.65,metal);
      }
      add('box',0,1.55,v.r*.65,.75,.25,.06,C.bone);
      add('box',0,1.55,v.r*.67,.20,.95,.06,C.bone);
    }
    for(let i=0;i<4;i++)add('sphere',v.r*.6-i*.8,.3,-v.r*.83,1,.5,.65,C.sand);
    add('cylinder',v.r*.83,2.5,-v.r*.6,.10,5,.10,metal);
    add('box',v.r*.83+.6,4.4,-v.r*.6,1.1,1.2,.08,accent);
    cross(v.r*.83+.6,4.4,-v.r*.6, .65);
  }else {
    const body=(w,h,d)=> {
      add('sphere',0,h*.45,0,w,h,d,C.flesh);
      add('sphere',-.5,h*.65,.2,w*.7,h*.75,d*.7,[.38,.23,.23]);
      for(let i=0;i<5;i++){
        const y=.7+i*h*.13,width=w*(.84-i*.07);
        add('box',0,y,d*.40,width,.16,.22,C.bone,0,0,(i%2-.5)*.05);
        add('cone',-width*.5,y+.25,d*.35,.24,.7,.25,C.bone,0,0,-.3);
        add('cone',width*.5,y+.25,d*.35,.24,.7,.25,C.bone,0,0,.3);
      }
      add('sphere',w*.25,h*.6,d*.38,.75,.9,.55,[.47,.46,.18]);
      add('sphere',w*.25,h*.6,d*.63,.30,.40,.12,[.63,.69,.23],0,0,0,.3);
      for(let i=0; i<6; i++) {
        const a=i/6*6.28;
        add('cone',Math.cos(a)*w*.38,h*.25,Math.sin(a)*d*.38,.8,h*.8,.8,C.bone,a);
        add('sphere',Math.cos(a)*w*.5,.45,Math.sin(a)*d*.5,2.6,.7,1,[.30,.27,.19],-a);
      }
    };
    if(v.type==='hq') {
      body(7,6,6);
      for(let i=0; i<3; i++) {
        add('cone',(i-1)*1.7,6+i%2,0,1,4+i%2,1,C.bone);
        add('sphere',(i-1)*1.5,4.5,2.1,1.4,1.6,1,[.39,.44,.20]);
      }
      add('sphere',0,2,2.8,2.4,2.8,.6,C.black);
    }
    if(v.type==='barracks') {
      body(5.4,3.5,4.5);
      for(let i=0; i<4; i++)add('sphere',(i%2-.5)*2.1,1.4,2+Math.floor(i/2)*.4,1.4,2,1.3,[.43,.45,.23]);
    }
    if(v.type==='workshop') {
      body(4,4,4);
      for(let i=0; i<3; i++) {
        add('cone',(i-1)*1.3,4.4,0,.7,4,.7,C.bone);
        add('sphere',(i-1)*1.3,3.1,0,1.1,1.9,1.1,[.29,.38,.22]);
      }
      add('sphere',2,.8,1,2,1.6,2,C.flesh);
    }
    if(v.type==='supply') {
      for(let i=0; i<3; i++) {
        const a=i*2.1;
        add('sphere',Math.cos(a),1.8,Math.sin(a),2.5,3.5,2.5,[.36,.42,.21]);
        add('cone',Math.cos(a),3.4,Math.sin(a),.6,1.6,.6,C.bone);
      }
      add('sphere',0,.2,0,6,.4,6,[.23,.29,.15]);
    }
    if(v.type==='hospital') {
      body(3,2,3);
      for(let i=0; i<7; i++) {
        const a=i*.9;
        add('cylinder',Math.cos(a)*2,1.5,Math.sin(a)*2,.25,3,.25,C.bone);
        add('sphere',Math.cos(a)*2,3,Math.sin(a)*2,1.8,.8,1.8,[.47,.39,.24]);
      }
    }
    if(v.type==='tower') {
      body(2.7,4,2.7);
      add('cone',0,5,0,2.2,5,2.2,C.flesh);
      for(let i=0; i<4; i++) {
        const a=i*1.57;
        add('cone',Math.cos(a),5,Math.sin(a),.6,3,.6,C.bone);
      }
      add('sphere',0,5.1,.8,1.4,1.4,1.2,[.57,.57,.25]);
    }
    if(v.type==='chapel') {
      add('cylinder',0,.5,0,5.6,1,5.6,C.flesh);
      for(const x of[-1.7,1.7]) {
        add('cone',x,2.5,0,1.2,5,1.2,C.bone);
        add('sphere',x,3,0,1.2,2,1,C.flesh);
      }
      add('cone',0,2,0,3,2.8,3,[.36,.40,.22]);
      add('cylinder',0,3.4,0,3.1,.45,3.1,C.bone);
      add('sphere',0,3.7,0,2.5,.5,2.5,[.26,.38,.17]);
    }
  }
  if(!ghost&&health<.68&&!dead){
    const count=health<.3?6:3;
    for(let i=0;i<count;i++){
      const dx=(hash(i,v.id)-.5)*v.r*1.5,y=.6+hash(i+8,v.id)*1.8;
      add(organic?'sphere':'box',dx,y,v.r*.68,.17,.7,.10,[.07,.065,.055],0,0,(hash(i,7)-.5)*1.3);
    }
    if(health<.3){
      add('box',v.r*.4,2.7,v.r*.15,1.7,.13,.45,organic?C.bone:C.metal,.4,.12,.45);
      add('sphere',-.6,.18,v.r*.85,1.8,.28,1,[.12,.105,.085]);
    }
  }
  if(p<1&&!ghost) {
    b.add('ring',v.x,.4,v.z,v.r*2.7,.1,v.r*2.7,[.70,.49,.21]);
    if(!organic) {
      for(let i=-1; i<=1; i+=2)add('box',i*v.r,2,0,.12,4,v.r*2.2,C.sand);
      add('box',0,3,0,v.r*2.2,.14,v.r*2.2,C.sand);
    }
  }
  if(ghost)placementFeedbackArt(b,v);
}
export function dynamicArt(sim,r,selected,ghost,targetBatch=null,visualTime=sim.time) {
  const b=targetBatch?targetBatch.reset():new Batch();
  let visible=0,near=0,far=0;
  let ruins=0;
  if(sim.fogOfWar){const fog=sim.fogOfWar,grid=fog.grids[sim.player];for(let z=0;z<fog.width;z++)for(let x=0;x<fog.width;x++){const state=grid[z*fog.width+x];if(state===VISIBILITY.VISIBLE)continue;const shade=state===VISIBILITY.EXPLORED?.12:.025;b.add('box',(x+.5)*fog.cell,.18,(z+.5)*fog.cell,fog.cell+.08,.12,fog.cell+.08,[shade,shade*1.08,shade]);}}
  for(const node of sim.resourceNodes||[]){if(node.depleted||sim.fogOfWar?.state(sim.player,node.x,node.z)===VISIBILITY.UNEXPLORED)continue;const projected=r.project(node.x,0,node.z);if(projected.x< -80||projected.x>r.width+80||projected.y< -100||projected.y>r.height+100)continue;resourceNodeArt(b,node);}
  for(let bi=sim.buildings.length-1;bi>=0;bi--) {
    const v=sim.buildings[bi];
    if(v.f!==sim.player&&!sim.fogOfWar?.visible(sim.player,v))continue;
    if(v.hp<=0&&(!Number.isFinite(v.diedAt)||visualTime-v.diedAt>180||ruins++>=32))continue;
    const p=r.project(v.x,0,v.z);
    if(p.x< -150||p.x>r.width+150||p.y< -160||p.y>r.height+160)continue;
    buildingArt(b,v,visualTime);
    visible++;
    if(selected.has(v.id))b.add('ring',v.x,.3,v.z,v.r*2.8,.1,v.r*2.8,[.77,.73,.47]);
  }
  for(const s of sim.squads) {
    if(s.hp<=0||s.f!==sim.player&&!sim.fogOfWar?.visible(sim.player,s))continue;
    const p=r.project(s.x,0,s.z);
    if(p.x< -80||p.x>r.width+80||p.y< -100||p.y>r.height+100)continue;
    visible++;
    const d=UNITS.find(u=>u.id===s.type),n=Math.ceil(s.hp/d.hp),col=FACTIONS[s.f].ink,selectedS=selected.has(s.id),pixel=r.height/r.cam.zoom,lod=clamp((pixel-6)/6,0,1);
    if(lod>.5)near+=n;
    else far+=n;
    if(selectedS)b.add('ring',s.x,.27,s.z,5.9,.1,5.9,[.72,.75,.48]);
    if(selectedS) {
      const span=2.8;
      for(const dx of [-span,span])for(const dz of [-span,span]){
        b.add('box',s.x+dx,.3,s.z+dz,.7,.035,.08,[.83,.78,.50]);
        b.add('box',s.x+dx,.3,s.z+dz,.08,.035,.7,[.83,.78,.50]);
      }
    }
    for(let i=0;i<n;i++){
      const ox=(i%4-1.5)*.9,oz=(Math.floor(i/4)-.5)*1.3,a=s.yaw;
      const x=s.x+ox*Math.cos(a)+oz*Math.sin(a),z=s.z-ox*Math.sin(a)+oz*Math.cos(a);
      const hit=clamp(1-(visualTime-(s.lastHit??-100))/.15,0,1);
      const recoil=clamp((s.firing||0)/.16,0,1)*(.65+.35*Math.sin(i*2.17));
      soldierArt(b,x,z,a,s.f,s.type==='heavy',lod,visualTime,s.path.length>0,0,1,i*.13,hit,s.type==='engineer',recoil);
    }
    if(s.type==='engineer'&&s.worker?.cargo>0){const cargoColor=s.worker.cargoType==='supply'?[.55,.48,.31]:s.worker.cargoType==='material'?[.38,.42,.40]:[.50,.43,.34];b.add('box',s.x,.9,s.z-.8,1.4,.65,.8,cargoColor,s.yaw);}
  }
  if(sim.match?.mode!=='SIEGE')for(const p of sim.points) {
    const c=p.owner===-1?[.59,.52,.33]:FACTIONS[p.owner].ink;
    b.add('ring',p.x,.25,p.z,8,.1,8,c);
    b.add('cylinder',p.x,1.7,p.z,.12,3.4,.12,C.metal);
    b.add('box',p.x+.55,2.9,p.z,1.1,.7,.05,c);
    b.add('box',p.x, .4,p.z,1.7,.8,1.3,C.sand);
  }
  if(ghost)buildingArt(b, {
    ...ghost,hp:100,progress:1
  },sim.time,true);
  return {
    batch:b,visible,near,far
  };
}
