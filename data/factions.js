export const FACTION_DEFINITIONS = Object.freeze([
  Object.freeze({
    id:'newAntioch', index:0, name:'New Antioch', short:'ANTIOCH', color:'#9ebdca', gameplayRole:'DEFENDER', deploymentZone:Object.freeze({minX:1,maxX:50}),
    ink:Object.freeze([.46,.59,.62]), accent:Object.freeze([.64,.22,.12]), base:Object.freeze([19,82]), resource:'İkmal',
    visualProfile:Object.freeze({strategy:'newAntioch', organic:false, smokeTint:'soot'}),
    allowedUnits:Object.freeze(['infantry','heavy','engineer']), allowedBuildings:Object.freeze(['hq','barracks','workshop','supply','materialDepot','hospital','observation','defense']),
    systems:Object.freeze({economy:'newAntioch', construction:'engineered'}),startingArmy:Object.freeze([Object.freeze({type:'infantry',count:4}),Object.freeze({type:'engineer',count:1})])
  }),
  Object.freeze({
    id:'blackGrail', index:1, name:'Black Grail', short:'GRAIL', color:'#a4b56c', gameplayRole:'ATTACKER', deploymentZone:Object.freeze({minX:62,maxX:111}),
    ink:Object.freeze([.35,.42,.22]), accent:Object.freeze([.5,.22,.23]), base:Object.freeze([93,30]), resource:'Öz',
    visualProfile:Object.freeze({strategy:'blackGrail', organic:true, smokeTint:'toxic'}),
    allowedUnits:Object.freeze(['infantry','heavy']), allowedBuildings:Object.freeze(['hq','barracks','workshop','supply','hospital','tower','chapel']),
    systems:Object.freeze({economy:'legacyBlackGrail', construction:'growth'}),startingArmy:Object.freeze([Object.freeze({type:'infantry',count:4})])
  })
]);

export const FACTION_BY_ID = new Map(FACTION_DEFINITIONS.map(definition => [definition.id, definition]));
