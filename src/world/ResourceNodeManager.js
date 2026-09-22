import {RESOURCE_NODE_LAYOUT,getResourceDefinition} from '../../data/resources.js';
import {dist} from '../core/math.js';
export class ResourceNodeManager {
  constructor(simulation){this.simulation=simulation;}
  initialize(){if(this.simulation.resourceNodes.length)return;this.simulation.resourceNodes=RESOURCE_NODE_LAYOUT.map((item,index)=>({id:'resource-'+(index+1),type:item.type,x:item.x,z:item.z,r:1.8,amount:item.amount,maxAmount:item.amount,depleted:false}));}
  get(id){return this.simulation.resourceNodes.find(node=>node.id===id);}
  nearest(origin,type=null,maxDistance=48){let best=null,bestDistance=maxDistance;for(const node of this.simulation.resourceNodes){if(node.depleted||node.amount<=0||type&&node.type!==type)continue;const distance=dist(origin,node);if(distance<bestDistance){best=node;bestDistance=distance;}}return best;}
  take(node,requested){const amount=Math.min(requested,node.amount);node.amount-=amount;if(node.amount<=0){node.amount=0;node.depleted=true;}return amount;}
  definition(node){return getResourceDefinition(node.type);}
}
