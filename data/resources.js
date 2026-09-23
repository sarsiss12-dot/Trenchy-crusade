export const RESOURCE_TYPES=Object.freeze({SUPPLY:'supply',MATERIAL:'material',MANPOWER:'manpower'});
export const RESOURCE_DEFINITIONS=Object.freeze([
  Object.freeze({id:'supply',name:'İkmal',symbol:'▣',nodeName:'Cephe İkmal Yığını',cargo:24,gatherTime:3.2,color:Object.freeze([.55,.48,.31])}),
  Object.freeze({id:'material',name:'Malzeme',symbol:'⚙',nodeName:'Savaş Enkazı',cargo:20,gatherTime:4,color:Object.freeze([.38,.42,.40])}),
  Object.freeze({id:'manpower',name:'İnsan Gücü',symbol:'✚',nodeName:'Sevk Noktası',cargo:6,gatherTime:5,color:Object.freeze([.50,.43,.34])})
]);
export const RESOURCE_BY_ID=new Map(RESOURCE_DEFINITIONS.map(definition=>[definition.id,definition]));
export const getResourceDefinition=id=>RESOURCE_BY_ID.get(id);

// Fixed authored positions keep matches deterministic and avoid runtime random placement.
export const RESOURCE_NODE_LAYOUT=Object.freeze([
  Object.freeze({type:'supply',x:38,z:114,amount:280}),Object.freeze({type:'supply',x:58,z:27,amount:240}),
  Object.freeze({type:'supply',x:113,z:83,amount:260}),Object.freeze({type:'supply',x:131,z:137,amount:240}),
  Object.freeze({type:'material',x:47,z:89,amount:240}),Object.freeze({type:'material',x:72,z:65,amount:220}),
  Object.freeze({type:'material',x:114,z:105,amount:260}),Object.freeze({type:'material',x:125,z:29,amount:220}),
  Object.freeze({type:'manpower',x:25,z:95,amount:54}),Object.freeze({type:'manpower',x:69,z:144,amount:48}),
  Object.freeze({type:'manpower',x:101,z:21,amount:48}),Object.freeze({type:'manpower',x:141,z:72,amount:54})
]);
