import {EffectPool} from './EffectPool.js';
export const PARTICLE=Object.freeze({TRACER:0,FLASH:1,SPARK:2,DIRT:3,FIRE:4,DEBRIS:5,TOXIC:6});
export class ParticleSystem extends EffectPool { constructor(){super(560);} }
