import {BALANCE} from '../core/Config.js';
import {FACTION_DEFINITIONS} from '../../data/factions.js';

export const MATCH_STATE=Object.freeze({SETUP:'SETUP',PREPARATION:'PREPARATION',WAR:'WAR',VICTORY:'VICTORY',DEFEAT:'DEFEAT'});
export const MATCH_EVENT=Object.freeze({MATCH_SETUP:'MATCH_SETUP',PREPARATION_STARTED:'PREPARATION_STARTED',PREPARATION_WARNING:'PREPARATION_WARNING',WAR_STARTED:'WAR_STARTED',MAIN_OBJECTIVE_DAMAGED:'MAIN_OBJECTIVE_DAMAGED',MAIN_OBJECTIVE_CRITICAL:'MAIN_OBJECTIVE_CRITICAL',DEFENDER_VICTORY:'DEFENDER_VICTORY',ATTACKER_VICTORY:'ATTACKER_VICTORY'});

export function validateSiegeRoles(definitions=FACTION_DEFINITIONS){
  if(!definitions.some(f=>f.gameplayRole==='ATTACKER')||!definitions.some(f=>f.gameplayRole==='DEFENDER'))throw Error('SIEGE modu en az bir ATTACKER ve DEFENDER gerektirir');
  return true;
}

export function createSiegeMatchState(duration=BALANCE.match.durationSeconds,buildings=[],elapsed=0,winner=null,player=0){
  validateSiegeRoles();
  const roles=FACTION_DEFINITIONS.map(f=>f.gameplayRole),defender=roles.indexOf('DEFENDER');
  const mainObjectiveId=buildings.find(b=>b.f===defender&&b.mainObjectiveForRole==='DEFENDER')?.id
    ??buildings.find(b=>b.f===defender&&b.type==='hq')?.id
    ??null;
  const preparationRemaining=Math.max(0,BALANCE.match.preparationSeconds-Math.max(0,elapsed));
  const warElapsed=Math.max(0,Math.max(0,elapsed)-BALANCE.match.preparationSeconds);
  const matchRemaining=Math.max(0,duration-warElapsed);
  let state=preparationRemaining>0?MATCH_STATE.PREPARATION:MATCH_STATE.WAR,outcome=null;
  if(winner!==null&&winner!==undefined){
    outcome=roles[winner]||null;
    state=winner===player?MATCH_STATE.VICTORY:MATCH_STATE.DEFEAT;
  }
  return {mode:BALANCE.match.mode,state,preparationRemaining,matchRemaining,duration,warningEmitted:preparationRemaining<=BALANCE.match.warningSeconds,criticalEmitted:false,roles,mainObjectiveId,outcome};
}

export class MatchFlow {
  constructor(simulation){this.simulation=simulation;}
  emit(type,data={}){this.simulation.gameplayEvents.push({tick:this.simulation.tick,type,...data});if(this.simulation.gameplayEvents.length>64)this.simulation.gameplayEvents.shift();}
  setup(duration=BALANCE.match.durationSeconds){const s=this.simulation;s.match=createSiegeMatchState(duration,[],0,null,s.player);s.match.state=MATCH_STATE.SETUP;this.emit(MATCH_EVENT.MATCH_SETUP);}
  start(){const s=this.simulation;s.match.state=MATCH_STATE.PREPARATION;this.emit(MATCH_EVENT.PREPARATION_STARTED);s.notify('HAZIRLIK — birliklerini konuşlandır.');}
  bindObjective(){const s=this.simulation,defender=s.match.roles.indexOf('DEFENDER');s.match.mainObjectiveId=s.buildings.find(b=>b.f===defender&&b.mainObjectiveForRole==='DEFENDER')?.id??s.buildings.find(b=>b.f===defender&&b.type==='hq')?.id??null;}
  update(dt){const s=this.simulation,m=s.match;if(!m||[MATCH_STATE.VICTORY,MATCH_STATE.DEFEAT].includes(m.state))return;if(m.state===MATCH_STATE.PREPARATION){m.preparationRemaining=Math.max(0,m.preparationRemaining-dt);if(m.preparationRemaining<1e-9)m.preparationRemaining=0;if(!m.warningEmitted&&m.preparationRemaining<=BALANCE.match.warningSeconds){m.warningEmitted=true;this.emit(MATCH_EVENT.PREPARATION_WARNING,{remaining:Math.ceil(m.preparationRemaining)});s.notify('HAZIRLIK BİTİYOR — '+Math.ceil(m.preparationRemaining));}if(m.preparationRemaining===0){m.state=MATCH_STATE.WAR;this.emit(MATCH_EVENT.WAR_STARTED);s.notify('SAVAŞ BAŞLADI');}}else if(m.state===MATCH_STATE.WAR){m.matchRemaining=Math.max(0,m.matchRemaining-dt);if(m.matchRemaining<1e-9)m.matchRemaining=0;if(m.matchRemaining===0)this.resolve('DEFENDER');}}
  objectiveDamaged(target){const m=this.simulation.match;if(!m||target.id!==m.mainObjectiveId||m.state!==MATCH_STATE.WAR)return;this.emit(MATCH_EVENT.MAIN_OBJECTIVE_DAMAGED,{health:target.hp});if(target.hp/target.maxHp<=.25&&!m.criticalEmitted){m.criticalEmitted=true;this.emit(MATCH_EVENT.MAIN_OBJECTIVE_CRITICAL,{health:target.hp});}}
  objectiveDestroyed(target){const m=this.simulation.match;if(m&&target.id===m.mainObjectiveId&&m.state===MATCH_STATE.WAR)this.resolve('ATTACKER');}
  resolve(role){const s=this.simulation,m=s.match,winner=m.roles.indexOf(role);m.outcome=role;m.state=winner===s.player?MATCH_STATE.VICTORY:MATCH_STATE.DEFEAT;s.winner=winner;this.emit(role==='ATTACKER'?MATCH_EVENT.ATTACKER_VICTORY:MATCH_EVENT.DEFENDER_VICTORY);s.notify(role==='ATTACKER'?'SALDIRAN ZAFERİ — ana savunma merkezi düştü.':'SAVUNAN ZAFERİ — kuşatma süresi doldu.');}
}
