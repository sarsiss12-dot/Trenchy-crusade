import {createBuilding} from './Building.js';
export class BuildingManager {
  constructor(simulation){this.simulation=simulation;}
  add(faction,type,x,z,ready=false){const building=createBuilding(this.simulation.nextId++,faction,type,x,z,ready);this.simulation.buildings.push(building);return building;}
}
