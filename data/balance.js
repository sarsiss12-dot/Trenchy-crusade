export const BALANCE = Object.freeze({
  simulation: Object.freeze({ step: 0.05, maxFrame: 0.1, maxSteps: 5 }),
  match: Object.freeze({mode:'SIEGE', preparationSeconds:60, durationSeconds:600, durationOptions:Object.freeze([300,600,1800,3600]), warningSeconds:10, captureVictory:false}),
  world: Object.freeze({ size: 112, cell: 2, grid: 56 }),
  army: Object.freeze({ maxSquads: 10, squadSize: 8, separation: 2.5, separationForce: 0.65, baseForceCap:32 }),
  economy: Object.freeze({ baseIncome: 2, supplyIncome: 2, controlIncome: 3 }),
  capture: Object.freeze({ radius: 5, duration: 8, decay: 0.5 }),
  terrain: Object.freeze({ mudSpeed: 0.58, forestSpeed: 0.76, trenchSpeed: 0.83, trenchDamage: 0.58, forestDamage: 0.78 }),
  support: Object.freeze({ hospitalRadius: 12, hospitalDelay: 5, hospitalHeal: 16, workshopRadius: 14, workshopRepair: 7, chapelRadius: 18, chapelDamage: 1.2 }),
  tower: Object.freeze({ range: 22, damage: 22, period: 1.4 }),
  construction: Object.freeze({ maxSameType: 3, baseRadius: 20, obstacleMargin: 2, pointMargin: 3, cancelRefund: 0.75, queueLimit: 3, engineerRadius:5.5, engineerCap:3, engineerFactors:Object.freeze([1,.65,.4]), workEffectPeriod:.65 }),
  logistics:Object.freeze({arrivalRadius:2.8,deliveryRadius:5.5,autoSearchPeriod:2,gatherTick:.25}),
  repair:Object.freeze({radius:4.8,rate:18,materialPerHp:.08,combatDelay:4,effectPeriod:.55}),
  camera: Object.freeze({ minZoom: 27, maxZoom: 100, desktopZoom: 55, mobileZoom: 67, panSpeed:300, edgeMargin:4 }),
  ui: Object.freeze({ refresh:0.2, performanceRefresh:0.25, notificationMilliseconds:3800 }),
  lifecycle: Object.freeze({ deadSquadRetention: 15, buildingRuinRetention: 22, autosaveSeconds: 10 }),
  effects: Object.freeze({
    visualEventCapacity: 256,
    quality: Object.freeze([
      Object.freeze({name:'Düşük', particles:144, smoke:36, corpses:48, marks:80, density:.5, corpseLife:25, markLife:80}),
      Object.freeze({name:'Orta', particles:320, smoke:72, corpses:96, marks:160, density:.8, corpseLife:45, markLife:150}),
      Object.freeze({name:'Yüksek', particles:560, smoke:120, corpses:144, marks:240, density:1, corpseLife:60, markLife:210})
    ])
  })
});
