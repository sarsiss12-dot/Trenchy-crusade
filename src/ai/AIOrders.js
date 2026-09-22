export const AIOrders=Object.freeze({
  build:(simulation,faction,type,x,z,engineerIds=[])=>simulation.build(faction,type,x,z,engineerIds),
  train:(simulation,building,type)=>simulation.train(building,type),
  move:(simulation,ids,x,z,target)=>simulation.move(ids,x,z,target)
});
