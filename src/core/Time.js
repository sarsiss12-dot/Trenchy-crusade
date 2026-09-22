import {BALANCE} from './Config.js';
export class Time {
  constructor(step=BALANCE.simulation.step){this.step=step;this.last=0;this.accumulator=0;this.fps=60;}
  reset(now=0){this.last=now;this.accumulator=0;}
  begin(now){const elapsed=Math.min(BALANCE.simulation.maxFrame,(now-this.last)/1000||0);this.last=now;this.fps=this.fps*.9+(elapsed?1/elapsed:60)*.1;this.accumulator+=elapsed;return elapsed;}
  consume(callback){let steps=0;while(this.accumulator>=this.step&&steps<BALANCE.simulation.maxSteps){callback(this.step);this.accumulator-=this.step;steps++;}return steps;}
}
