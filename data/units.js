export const UNIT_DEFINITIONS = Object.freeze([
  Object.freeze({id:'infantry', names:Object.freeze(['Siper Muhafızları','Veba Müritleri']), cost:100, costs:Object.freeze({supply:80,material:0,manpower:8}), time:12, hp:100, damage:10, range:15, speed:4.3, period:1.1, squadSize:8,forceCost:8,producer:'barracks',requires:Object.freeze([])}),
  Object.freeze({id:'heavy', names:Object.freeze(['Zırhlı Haçlılar','Çürük Muhafızlar']), cost:175, costs:Object.freeze({supply:120,material:40,manpower:8}), time:18, hp:155, damage:16, range:18, speed:3.3, period:1.45, squadSize:8,forceCost:8,producer:'barracks',requires:Object.freeze(['workshop'])}),
  Object.freeze({id:'engineer',names:Object.freeze(['Muharebe Mühendisleri','—']),cost:90,costs:Object.freeze({supply:50,material:30,manpower:5}),time:15,hp:82,damage:4,range:9,speed:4,period:1.6,squadSize:5,forceCost:5,producer:'workshop',requires:Object.freeze(['workshop']),support:true})
]);

export const UNIT_BY_ID = new Map(UNIT_DEFINITIONS.map(definition => [definition.id, definition]));
export const getUnitDefinition = id => UNIT_BY_ID.get(id);
