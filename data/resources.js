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
  Object.freeze({type:'supply',x:30,z:76,amount:280}),Object.freeze({type:'supply',x:39,z:18,amount:240}),
  Object.freeze({type:'supply',x:75,z:55,amount:260}),Object.freeze({type:'supply',x:87,z:91,amount:240}),
  Object.freeze({type:'material',x:31,z:59,amount:240}),Object.freeze({type:'material',x:48,z:43,amount:220}),
  Object.freeze({type:'material',x:76,z:70,amount:260}),Object.freeze({type:'material',x:83,z:19,amount:220}),
  Object.freeze({type:'manpower',x:17,z:63,amount:54}),Object.freeze({type:'manpower',x:46,z:96,amount:48}),
  Object.freeze({type:'manpower',x:67,z:14,amount:48}),Object.freeze({type:'manpower',x:94,z:48,amount:54})
]);
