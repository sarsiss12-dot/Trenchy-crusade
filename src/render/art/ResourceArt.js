import {getResourceDefinition} from '../../../data/resources.js';
export function resourceNodeArt(batch,node){
  if(node.depleted)return;const definition=getResourceDefinition(node.type),ratio=Math.max(.18,node.amount/node.maxAmount),x=node.x,z=node.z,color=definition.color;
  batch.add('ring',x,.12,z,3.8,.06,3.8,color);
  if(node.type==='supply'){for(let i=0;i<Math.ceil(5*ratio);i++){const dx=(i%3-1)*.75,dz=(Math.floor(i/3)-.5)*.8;batch.add('box',x+dx,.35,z+dz,1.1,.65,.75,color,i*.12);batch.add('box',x+dx,.69,z+dz,.7,.08,.08,[.16,.18,.16],i*.12);}}
  else if(node.type==='material'){for(let i=0;i<Math.ceil(7*ratio);i++){const a=i*2.399,d=.3+(i%3)*.55;batch.add(i%2?'cylinder':'box',x+Math.cos(a)*d,.28+i%2*.18,z+Math.sin(a)*d,.55,.35+.3*(i%2),1.15,color,a);}}
  else{batch.add('box',x,.5,z,3.2,.15,2.5,[.32,.29,.22]);batch.add('cone',x,1.5,z,3.6,2.2,3,[.45,.39,.28]);batch.add('box',x,1.55,z+1.5,.16,2.2,.16,[.63,.58,.42]);batch.add('box',x+.55,2.25,z+1.5,1.1,.65,.05,color);}
}
