// Stateless façade keeps explosion composition out of combat and simulation code.
export class ExplosionSystem { constructor(coordinator){this.coordinator=coordinator;} spawn(x,z,size,faction,building=false){return this.coordinator.explosion(x,z,size,faction,building);} }
