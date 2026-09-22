import {EffectCoordinator as Effects} from '../effects/EffectCoordinator.js';
import {effectArt} from '../render/art/EffectArt.js';
import {Batch} from '../render/Batch.js';
import {Simulation} from '../simulation/Simulation.js';
import {Renderer} from '../render/Renderer.js';
import {landscape,dynamicArt} from '../render/art/BattlefieldArt.js';
import {BUILDINGS,UNITS,FACTIONS,clamp} from '../data.js';
import {terrain,walkable} from '../world/World.js';
import {AudioEngine} from '../audio/AudioManager.js';
import {CommandSystem} from '../input/CommandSystem.js';
import {SelectionSystem} from '../input/SelectionSystem.js';
import {TouchControls} from '../input/TouchControls.js';
import {MoveCommand,AttackCommand,BuildCommand,StopCommand,TrainCommand,CancelCommand,SetRallyCommand,GatherCommand,RepairCommand,AssistConstructionCommand,SetAutoGatherCommand} from '../input/Commands.js';
import {Notifications} from '../ui/Notifications.js';
import {BuildMenu} from '../ui/BuildMenu.js';
import {HUD} from '../ui/HUD.js';
import {Minimap} from '../ui/Minimap.js';
import {PerformancePanel} from '../ui/PerformancePanel.js';
import {OverlayRenderer} from '../ui/OverlayRenderer.js';
import {BALANCE} from './Config.js';

export class Game {
  constructor(){
const $=id=>document.getElementById(id),canvas=$('world'),overlay=$('overlay'),ctx=overlay.getContext('2d'),map=$('minimap');
let renderer;
try {
  renderer=new Renderer(canvas);
}catch(e) {
  $('start').innerHTML='<div class="menuCard"><h2>Görüntü başlatılamadı</h2><p>'+e.message+'</p></div>';
  throw e;
}
renderer.setStatic(landscape());
let sim=new Simulation(),selection=new SelectionSystem(),selected=selection.ids,mode='pan',playing=false,paused=false,faction=0,ghost=null,drag=null,pointers=new Map(),pinch=null,last=0,acc=0,uiTimer=0,saveTimer=0,fps=60,eventTime=-1,ended=false,keys=new Set(),stress=false;
const audio=new AudioEngine();
const commandSystem=new CommandSystem(sim);
const effects=new Effects(1),frameBatch=new Batch(),smokeBatch=new Batch();
let endDelay=0,perfTimer=0;
const SAVE='trench-ashen-v1';
const notifications=new Notifications($('toast'),BALANCE.ui.notificationMilliseconds),hud=new HUD($),minimap=new Minimap(map),performancePanel=new PerformancePanel($('perf')),overlayRenderer=new OverlayRenderer(ctx),buildMenu=new BuildMenu($('buildPanel'),$('buildingList'));
function notify(message){notifications.show(message);}
function resize() {
  renderer.resize();
  overlay.width=renderer.width*(devicePixelRatio>1?1.5:1);
  overlay.height=renderer.height*(devicePixelRatio>1?1.5:1);
  ctx.setTransform(overlay.width/renderer.width,0,0,overlay.height/renderer.height,0,0);
}
window.addEventListener('resize',resize);
window.addEventListener('pagehide',()=>save());
resize();
function start(player,load=false) {
  try {
    sim=load?Simulation.restore(localStorage.getItem(SAVE)):new Simulation(player,true,{duration:Number($('matchDuration').value)});
    commandSystem.bind(sim);
  }catch(e) {
    notify('Kayıt okunamadı; yeni sefer başlatıldı.');
    sim=new Simulation(player);
    commandSystem.bind(sim);
  }
  effects.clear();effects.clock=sim.time;effects.restore(sim.visuals);
  acc=0;endDelay=0;
  faction=sim.player;
  selected.clear();
  ghost=null;
  playing=true;
  paused=false;
  ended=false;
  stress=false;
  eventTime=-1;
  $('start').hidden=true;
  $('menu').hidden=true;
  $('placement').hidden=true;
  $('buildPanel').hidden=true;
  $('continue').hidden=false;
  $('selectionType').textContent=FACTIONS[faction].name.toUpperCase()+' / SEFER KUVVETİ';
  home();
  updateUI();
  notify(sim.economySystem.get(sim.player).activeGathering?'Mühendisleri kaynak alanına gönder; yükü üsse taşısınlar.':'İlk emir: bir manga seç ve cepheye gönder.');
}
function home() {
  const [x,z]=FACTIONS[sim.player].base;
  renderer.cam.x=x+(sim.player?-10:10);
  renderer.cam.z=z;
  renderer.cam.zoom=innerWidth<600?BALANCE.camera.mobileZoom:BALANCE.camera.desktopZoom;
  renderer.updateCamera();
}
function save() {
  if(!playing||stress)return;
  try {
    const data=JSON.parse(sim.serialize());
    data.visuals=effects.snapshot();
    localStorage.setItem(SAVE,JSON.stringify(data));
    $('saveStatus').textContent='Kayıt: '+new Date().toLocaleTimeString('tr-TR');
  }catch(e) {
    $('saveStatus').textContent='Tarayıcı kayda izin vermiyor.';
  }
}
try {
  $('resume').hidden=!localStorage.getItem(SAVE);
}catch {
}
$('begin').onclick=()=>start(faction);
$('resume').onclick=()=>start(faction,true);
document.querySelectorAll('[data-faction]').forEach(b=>b.onclick=()=> {
  faction=+b.dataset.faction; document.querySelectorAll('[data-faction]').forEach(x=>x.classList.toggle('chosen',x===b)); const base=FACTIONS[faction].base; renderer.cam.x=base[0]; renderer.cam.z=base[1]; renderer.updateCamera();
});
function menu(open) {
  paused=open;
  $('menu').hidden=!open;
  if(open) {
    $('menuTitle').textContent=sim.winner===null?'Savaş duraklatıldı':sim.winner===sim.player?'Geçit bizim.':'Cephe çöktü.';
    $('menuInfo').textContent=sim.winner===null?'İlerlemen bu cihazda otomatik kaydedilir.':'Süre '+Math.floor(sim.time/60)+' dk · Hayatta kalan '+sim.count(sim.player)+' manga.';
    $('continue').hidden=sim.winner!==null;
    save();
  }
}
$('pause').onclick=()=>menu(!paused);
$('continue').onclick=()=>menu(false);
$('save').onclick=()=> {
  save();
  notify(stress?'Performans senaryosu kaydedilmez.':'Sefer kaydedildi.');
};
$('restart').onclick=()=> {
  save();
  playing=false;
  paused=false;
  $('menu').hidden=true;
  $('start').hidden=false;
  try {
    $('resume').hidden=!localStorage.getItem(SAVE);
  }catch {
  }
};
$('sound').onclick=()=> {
  $('sound').textContent='Ses: '+(audio.toggle()?'açık':'kapalı');
};
let quality=1;
const qs=[1,1.4,2];
$('quality').onclick=()=> {
  quality=(quality+1)%3;
  renderer.quality=qs[quality];
  resize();
  $('quality').textContent='Görüntü: '+['ekonomik','dengeli','yüksek'][quality];
};
$('effectQuality').onclick=()=>{
  effects.setQuality((effects.quality+1)%3);
  $('effectQuality').textContent='Efekt yoğunluğu: '+effects.budget.name;
};
function setMode(m) {
  mode=m;
  $('pan').classList.toggle('active',m==='pan');
  $('select').classList.toggle('active',m==='select');
}
$('pan').onclick=()=>setMode('pan');
$('select').onclick=()=>setMode('select');
$('all').onclick=()=> {
  selected=selection.replace(sim.squads.filter(s=>s.f===sim.player&&s.hp>0).map(s=>s.id));
  updateUI();
};
$('deselect').onclick=()=>{selected.clear();updateUI();};
$('home').onclick=home;
$('plus').onclick=()=>renderer.zoom(.85);
$('minus').onclick=()=>renderer.zoom(1.18);
function selectedBuilding() {
  return sim.buildings.find(b=>selected.has(b.id)&&b.hp>0&&b.f===sim.player);
}
$('buildMenu').onclick=()=>buildMenu.toggle(BUILDINGS,sim.player,sim,definition=>{
  const engineered=sim.economySystem.get(sim.player).engineeredConstruction;let engineerIds=engineered?sim.squads.filter(squad=>selected.has(squad.id)&&squad.f===sim.player&&squad.type==='engineer'&&squad.hp>0).map(squad=>squad.id):[];
  if(engineered&&!engineerIds.length){const engineer=sim.squads.find(squad=>squad.f===sim.player&&squad.type==='engineer'&&squad.hp>0);if(!engineer){notify('İnşa için muharebe mühendisi gerekli.');return;}engineerIds=[engineer.id];selected=selection.replace(engineerIds);}
  const point=renderer.ground(renderer.width*.52,renderer.height*.45);
  ghost={...definition,type:definition.id,f:sim.player,x:point.x,z:point.z,valid:false,engineerIds};
  checkGhost();buildMenu.close();$('placement').hidden=false;notify('Zemine dokunarak konum seç; ardından inşayı onayla.');
});
$('closeBuild').onclick=()=>buildMenu.close();
function checkGhost() {
  if(!ghost)return;
  const err=sim.placement(sim.player,ghost.type,ghost.x,ghost.z);
  ghost.valid=!err;
  $('placementText').textContent=err||ghost.names[sim.player]+' · '+buildMenu.cost(ghost,sim.player)+' · ✓ geçerli zemin';
  $('confirmBuild').disabled=!!err;
}
$('cancelBuild').onclick=()=> {
  ghost=null;
  $('placement').hidden=true;
};
$('confirmBuild').onclick=()=> {
  if(!ghost)return;
  const error=commandSystem.dispatch(BuildCommand(sim.player,ghost.type,ghost.x,ghost.z,ghost.engineerIds));
  if(error) {
    notify(error);
    checkGhost();
  }else {
    ghost=null;
    $('placement').hidden=true;
    updateUI();
  }
};
function train(type) {
  let b=selectedBuilding();
  const producer=UNITS.find(unit=>unit.id===type)?.producer;
  if(!b||b.type!==producer)b=sim.buildings.find(x=>x.f===sim.player&&x.type===producer&&x.hp>0&&x.progress===1);
  const err=commandSystem.dispatch(TrainCommand(b?.id,type));
  notify(err||'Manga üretim kuyruğuna alındı.');
  updateUI();
}
$('trainInf').onclick=()=>train('infantry');
$('trainHeavy').onclick=()=>train('heavy');
$('trainEngineer').onclick=()=>train('engineer');
$('autoGather').onclick=()=>{const engineers=sim.squads.filter(squad=>selected.has(squad.id)&&squad.f===sim.player&&squad.type==='engineer'&&squad.hp>0),enabled=!engineers.length||!engineers.every(squad=>squad.worker.auto),error=commandSystem.dispatch(SetAutoGatherCommand(engineers.map(squad=>squad.id),enabled));notify(error||(enabled?'Otomatik toplama etkin.':'Otomatik toplama kapalı.'));updateUI();};
$('stop').onclick=()=> {
  const b=selectedBuilding();
  if(b) {
    commandSystem.dispatch(CancelCommand(b.id));
    notify('İptal edildi; kaynak iade edildi.');
  }else {
    commandSystem.dispatch(StopCommand([...selected]));
  }
  updateUI();
};
function hit(px,py) {
  let best=null,score=Infinity;
  for(const e of [...sim.squads,...sim.buildings,...sim.resourceNodes]) {
    const resource=typeof e.id==='string';if(resource?e.depleted:e.hp<=0)continue;
    const p=renderer.project(e.x,resource ? .7 : e.path ? 1 : 2,e.z),d=Math.hypot(p.x-px,p.y-py),radius=resource?28:e.path?24:Math.max(24,e.r*renderer.height/renderer.cam.zoom);
    if(d<radius&&d<score) {
      score=d;
      best=e;
    }
  }
  return best;
}
function tap(x,y) {
  if(!playing||paused)return;
  const p=renderer.ground(x,y);
  if(ghost) {
    ghost.x=Math.round(p.x);
    ghost.z=Math.round(p.z);
    checkGhost();
    return;
  }
  const target=hit(x,y);
  const resourceTarget=target&&typeof target.id==='string';
  const engineers=sim.squads.filter(squad=>squad.hp>0&&selected.has(squad.id)&&squad.f===sim.player&&squad.type==='engineer');
  if(resourceTarget&&engineers.length){const error=commandSystem.dispatch(GatherCommand(engineers.map(squad=>squad.id),target.id,true));notify(error||'Kaynak toplama ve teslim rotası kuruldu.');orderMarker={x:target.x,z:target.z,t:performance.now(),attack:false};return;}
  if(!resourceTarget&&target?.f===sim.player&&engineers.length&&target.progress<1){const error=commandSystem.dispatch(AssistConstructionCommand(engineers.map(squad=>squad.id),target.id));notify(error||'Mühendisler şantiyeye yardım ediyor.');return;}
  if(!resourceTarget&&target?.f===sim.player&&engineers.length&&target.progress===1&&target.hp<target.maxHp){const error=commandSystem.dispatch(RepairCommand(engineers.map(squad=>squad.id),target.id));notify(error||'Onarım emri verildi.');return;}
  if(target?.f===sim.player) {
    selected=selection.replace([target.id]);
    updateUI();
    return;
  }
  const squads=sim.squads.filter(s=>s.f===sim.player&&s.hp>0&&selected.has(s.id));
  if(squads.length) {
    const failed=commandSystem.dispatch(target&&!resourceTarget?AttackCommand(squads.map(s=>s.id),target.id,p.x,p.z):MoveCommand(squads.map(s=>s.id),p.x,p.z));
    if(failed)notify('Bazı mangalar hedefe ulaşamıyor. Geçit veya açık zemin seç.');
    else notify(target&&!resourceTarget?'Saldırı emri verildi.':'İntikal emri verildi.');
    orderMarker= {
      x:target?.x??p.x,z:target?.z??p.z,t:performance.now(),attack:!!target&&!resourceTarget
    };
  }else {
    const b=selectedBuilding();
    if(['barracks','workshop'].includes(b?.type)&&walkable(p.x,p.z,sim.buildings)) {
      commandSystem.dispatch(SetRallyCommand(b.id,p.x,p.z));
      notify('Kışla toplanma noktası belirlendi.');
    }else if(target&&!resourceTarget) {
      selected=selection.replace([target.id]);
      updateUI();
    }else {
      selected.clear();
      updateUI();
    }
  }
}
let orderMarker=null;
const touchControls=new TouchControls(canvas,{
  down(point,event,active){
    if(!playing||paused)return;pointers=active;
    if(active.size===2){const[a,b]=[...active.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),x:(a.x+b.x)/2,y:(a.y+b.y)/2};drag=null;}
    else if(active.size===1)drag={x:point.x,y:point.y,cx:point.x,cy:point.y,moved:false,select:(mode==='select'||event.shiftKey)&&event.button!==2,button:event.button};
  },
  move(point,previous,event,active){
    pointers=active;if(active.size===2){const[a,b]=[...active.values()],distance=Math.hypot(a.x-b.x,a.y-b.y),x=(a.x+b.x)/2,y=(a.y+b.y)/2;if(pinch){renderer.zoom(pinch.d/Math.max(1,distance));renderer.pan(x-pinch.x,y-pinch.y);}pinch={d:distance,x,y};}
    else if(drag){if(Math.hypot(point.x-drag.x,point.y-drag.y)>7)drag.moved=true;drag.cx=point.x;drag.cy=point.y;if(drag.moved&&!drag.select)renderer.pan(point.x-previous.x,point.y-previous.y);}
  },
  up(point,previous,event,active){
    pointers=active;if(pinch){if(!active.size)pinch=null;drag=null;return;}
    if(drag){if(drag.moved&&drag.select){const x1=Math.min(drag.x,drag.cx),x2=Math.max(drag.x,drag.cx),y1=Math.min(drag.y,drag.cy),y2=Math.max(drag.y,drag.cy);selected=selection.replace(sim.squads.filter(squad=>{const projected=renderer.project(squad.x,1,squad.z);return squad.f===sim.player&&squad.hp>0&&projected.x>x1&&projected.x<x2&&projected.y>y1&&projected.y<y2;}).map(squad=>squad.id));updateUI();}else if(!drag.moved)tap(point.x,point.y);drag=null;}
  }
});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('wheel',e=> {
  e.preventDefault(); renderer.zoom(Math.exp(e.deltaY*.001));
}, {
  passive:false
});
function mapMove(e) {
  const r=map.getBoundingClientRect();
  renderer.cam.x=clamp((e.clientX-r.left)/r.width*BALANCE.world.size,BALANCE.camera.edgeMargin,BALANCE.world.size-BALANCE.camera.edgeMargin);
  renderer.cam.z=clamp((e.clientY-r.top)/r.height*BALANCE.world.size,BALANCE.camera.edgeMargin,BALANCE.world.size-BALANCE.camera.edgeMargin);
  renderer.updateCamera();
}
let mapping=false;
map.onpointerdown=e=> {
  mapping=true;
  map.setPointerCapture(e.pointerId);
  mapMove(e);
};
map.onpointermove=e=> {
  if(mapping)mapMove(e);
};
map.onpointerup=()=>mapping=false;
map.onpointercancel=()=>mapping=false;
window.addEventListener('keydown',e=> {
  if(!playing)return; keys.add(e.key.toLowerCase()); if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault(); if(e.repeat)return; const k=e.key.toLowerCase(); if(k==='escape') {
    if(ghost)$('cancelBuild').click(); else if(!$('buildPanel').hidden)$('closeBuild').click(); else menu(!paused);
  }
  if(paused)return; if(k==='b')setMode('select'); if(k==='v')setMode('pan'); if(k==='a')$('all').click(); if(k==='h')home(); if(k===' ')menu(true);
});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=> {
  keys.clear(); pointers.clear(); drag=null;
});
document.addEventListener('visibilitychange',()=> {
  last=0; acc=0; if(document.hidden) {
    save(); if(playing&&sim.winner===null)menu(true);
  }
});
canvas.addEventListener('webglcontextlost',e=> {
  e.preventDefault(); save(); paused=true; notify('Grafik bağlamı kayboldu; kurtarma bekleniyor.');
});
canvas.addEventListener('webglcontextrestored',()=> {
  renderer=new Renderer(canvas); renderer.setStatic(landscape()); home(); resize(); menu(true); notify('Görüntü geri yüklendi; savaşa dönebilirsin.');
});
function updateUI(){
  hud.update(sim,selected);checkGhost();
  const events=sim.events.filter(event=>event.t>eventTime);
  if(events.length){notify(events.at(-1).msg);eventTime=events.at(-1).t;}
}
function drawMap(){minimap.draw(sim,renderer);}
$('stress').onclick=()=> {
  save();
  sim=new Simulation(sim.player);
  commandSystem.bind(sim);
  effects.clear();endDelay=0;ended=false;acc=0;
  stress=true;
  sim.squads=[];
  for(let f=0; f<2; f++)for(let i=0; i<10; i++)sim.addSquad(f,i%3===0?'heavy':'infantry',f?77+(i%3)*3:33-(i%3)*3,24+Math.floor(i/3)*17);
  selected.clear();
  renderer.cam= {
    x:56,z:56,zoom:100
  };
  renderer.updateCamera();
  sim.ai.wave=9999;
  sim.ai.tick=9999;
  menu(false);
  notify('160 asker senaryosu. Ana sefer kaydı korunur.');
};
$('effectStress').onclick=()=>{
  save();
  sim=new Simulation(sim.player);commandSystem.bind(sim);sim.squads=[];sim.buildings=[];
  sim.ai.tick=sim.ai.wave=99999;sim.match.state='WAR';effects.clear();acc=0;endDelay=0;ended=false;
  stress=true;playing=true;selected.clear();
  for(let f=0;f<2;f++)for(let i=0;i<10;i++){
    const z=18+i*7.5,x=f?64:48;
    sim.addSquad(f,i%3===0?'heavy':'infantry',x,z);
  }
  renderer.cam={x:56,z:56,zoom:100};renderer.updateCamera();
  menu(false);notify('Efekt testi: 160 asker çatışıyor. Ana kayıt korunur.');
};
function frame(now) {
  const elapsed=last?(now-last)/1000:0;
  const dt=Math.min(elapsed,BALANCE.simulation.maxFrame);
  last=now;
  fps=fps*.94+(elapsed?1/elapsed:60)*.06;
  if(playing&&!paused) {
    acc+=dt;
    while(acc>=BALANCE.simulation.step) {
      sim.step(BALANCE.simulation.step);
      acc-=BALANCE.simulation.step;
    }
    const k=BALANCE.camera.panSpeed*dt;
    if(keys.has('arrowleft'))renderer.pan(k,0);
    if(keys.has('arrowright')||keys.has('d'))renderer.pan(-k,0);
    if(keys.has('arrowup')||keys.has('w'))renderer.pan(0,k);
    if(keys.has('arrowdown')||keys.has('s'))renderer.pan(0,-k);
    saveTimer+=dt;
    if(saveTimer>BALANCE.lifecycle.autosaveSeconds) {
      saveTimer=0;
      save();
    }
    effects.update(dt,sim,renderer);
    if(effects.soundShot>=0)audio.shot(effects.soundShot);
    if(effects.soundExplosion)audio.explosion(effects.soundExplosion);
    if(sim.winner!==null&&!ended){
      endDelay+=dt;
      if(endDelay>1.8){ended=true;save();menu(true);}
    }
  }
  uiTimer+=dt;
  if(uiTimer>BALANCE.ui.refresh) {
    uiTimer=0;
    updateUI();
    drawMap();
    notifications.update();
  }
  const art=dynamicArt(sim,renderer,selected,ghost,frameBatch,playing?effects.clock:sim.time);
  smokeBatch.reset();effectArt(effects,art.batch,smokeBatch,renderer);
  renderer.render(art.batch,smokeBatch);
  orderMarker=overlayRenderer.draw(sim,renderer,selected,drag,orderMarker);
  if(effects.flash>0){ctx.strokeStyle='rgba(207,151,77,'+effects.flash+')';ctx.lineWidth=12;ctx.strokeRect(6,6,renderer.width-12,renderer.height-12);ctx.lineWidth=1;}
  perfTimer+=dt;
  if(perfTimer>=BALANCE.ui.performanceRefresh){
    perfTimer=0;
    performancePanel.update(fps,sim,renderer,art,effects);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
// Small read-only diagnostics, plus explicit test entry point via UI actions.
const diagnostics= {
  get effects(){return effects;},
  get sim() {
    return sim;
  },get renderer() {
    return renderer;
  },get selected() {
    return [...selected];
  },get paused() {
    return paused;
  },get ghost() {
    return ghost;
  },get fps() {
    return fps;
  },start,save
};
this.diagnostics=diagnostics;
window.game=diagnostics;
  }
}
