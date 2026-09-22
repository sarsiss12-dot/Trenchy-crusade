import {hash} from '../../data.js';
import {terrain,crossings,forests} from '../../world/World.js';
const RUST=[.27,.20,.135],CHAR=[.105,.115,.103],MUD=[.18,.16,.12],STONE=[.30,.31,.27];
// Decoration never changes the walkability grid or battlefield layout.
export function atmosphereArt(b){
  for(let i=0;i<72;i++){
    const x=34+hash(i,150)*44,z=7+hash(i,151)*98;
    if(['river','bridge'].includes(terrain(x,z)))continue;
    const r=.8+hash(i,152)*2.7;
    b.add('cylinder',x,.085,z,r*2,.012,r*1.3,MUD,hash(i,153)*6.28);
    if(i%3===0){
      b.add('cylinder',x,.103,z,r*1.2,.015,r*.8,CHAR);
      for(let j=0;j<4;j++){const a=j*1.57+hash(i,155);b.add('sphere',x+Math.cos(a)*r*.65,.19,z+Math.sin(a)*r*.65,r*.46,.22,r*.38,STONE,a);}
    }
    if(i%2===0)b.add('box',x,.16,z,1.3,.12,.24,RUST,hash(i,156)*6.28,1,.1,.13);
  }
  // Broken wire sections leave every bridge approach open.
  for(const x of [39,73])for(let z=14;z<100;z+=5.3){
    if(crossings.some(c=>Math.abs(z-c)<6))continue;
    const lean=(hash(x,z)-.5)*.65;
    b.add('box',x,.65,z,.13,1.6,.13,RUST,0,1,0,lean);
    b.add('box',x,.44,z+1.8,.065,.065,3.8,CHAR,0,1,.1,0);
    b.add('box',x,.95,z+1.8,.055,.055,3.8,CHAR,0,1,-.07,0);
    for(let j=0;j<4;j++){
      b.add('box',x,.7,z+j*.9,.42,.035,.035,RUST,.7,1,.7,.5);
      b.add('box',x,.7,z+j*.9,.035,.42,.035,RUST,0,1,.5,.5);
    }
  }
  for(const f of forests)for(let i=0;i<8;i++){
    const a=hash(i,f.x+170)*6.28,r=hash(i,f.z+170)*f.r,x=f.x+Math.cos(a)*r,z=f.z+Math.sin(a)*r,h=3+hash(x,z)*3;
    b.add('cone',x,h*.5,z,.45,h,.48,CHAR,0,1,0,.1);
    b.add('box',x+.6,h*.7,z,.16,2.2,.16,CHAR,.3,1,0,-.9);
    b.add('box',x-.4,h*.6,z+.2,.12,1.7,.12,CHAR,.8,1,.9,.5);
    b.add('box',x,.18,z,3.4,.30,.45,CHAR,a,1,.03,.05);
  }
  for(const z of crossings)for(const x of [49,63]){
    b.add('cylinder',x,.09,z-4,4,.025,2.7,CHAR,.4);
    for(let j=0;j<3;j++){
      b.add('box',x+j*.7,.32,z-4,.55,.58,.6,[.30,.28,.21],.1);
      b.add('box',x+j*.7,.65,z-4,.65,.08,.68,RUST,.1);
    }
    b.add('box',x,.22,z+4,2,.14,.23,[.29,.24,.16],.5);
  }
  // Shattered buttresses, shell cases and discarded armour.
  for(const [x,z] of [[36,39],[76,70],[46,103],[67,7]]){
    b.add('box',x,.23,z,4.8,.45,3.2,CHAR);
    b.add('box',x-1,1.1,z,.7,2.2,3.1,STONE,.07,1,0,.12);
    b.add('box',x+1.4,.9,z-.8,1,1.8,1.1,STONE,-.2,1,.12,.25);
    for(let j=0;j<6;j++)b.add('box',x+(hash(j,x)-.5)*5,.2,z+(hash(j,z)-.5)*4,.5,.35,.7,STONE,hash(j,190)*6.28);
  }
}
