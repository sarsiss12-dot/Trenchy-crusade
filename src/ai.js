import {AIController} from './ai/AIController.js';
export const updateAI=(simulation,dt)=>new AIController(simulation).update(dt);
export {AIController};
