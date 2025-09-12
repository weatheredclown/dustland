import fs from 'node:fs/promises';
import vm from 'node:vm';

class AudioCtx {
  createOscillator(){ return { connect(){}, start(){}, stop(){}, frequency:{ value:0 }, type:'' }; }
  createGain(){ return { connect(){}, gain:{ value:0, exponentialRampToValueAtTime(){} } }; }
  get destination(){ return {}; }
  resume(){}
  suspend(){}
  get currentTime(){ return 0; }
}

class Audio {
  constructor(){ this.addEventListener = () => {}; }
  cloneNode(){ return new Audio(); }
  play(){ return Promise.resolve(); }
  pause(){}
}

class Elem {
  constructor(tag='div'){
    this.tagName=tag.toUpperCase();
    this.children=[];
    this.style={ _props:{}, setProperty(k,v){ this._props[k]=v; }, getPropertyValue(k){ return this._props[k]||''; } };
    this._className='';
    this.classList={
      classes:new Set(),
      toggle(cls,cond){
        if(cond===undefined) cond=!this.classes.has(cls);
        cond?this.classes.add(cls):this.classes.delete(cls);
        return cond;
      },
      contains:(cls)=>this.classList.classes.has(cls),
      add:(cls)=>{ this.classList.classes.add(cls); },
      remove:(cls)=>{ this.classList.classes.delete(cls); }
    };
    this.listeners={};
    this.value='';
    this.textContent='';
  }
  appendChild(child){ this.children.push(child); child.parentElement=this; }
  prepend(child){ this.children.unshift(child); child.parentElement=this; }
  _match(sel,elem){
    if(sel.startsWith('.')) return elem.classList.contains(sel.slice(1));
    return elem.tagName===sel.toUpperCase();
  }
  querySelector(sel){ return this.querySelectorAll(sel)[0]||null; }
  querySelectorAll(sel){
    const res=[];
    const walk=e=>{ e.children.forEach(c=>{ if(this._match(sel,c)) res.push(c); walk(c); }); };
    walk(this);
    if(sel==='.portrait' && res.length===0){ const e=new Elem(); this.children.push(e); return [e]; }
    if(sel==='.pcard') return res.filter(c=>c.classList.contains('pcard'));
    return res;
  }
  set innerHTML(v){ this._innerHTML=v; if(v==='') this.children=[]; }
  get innerHTML(){ return this._innerHTML; }
  set className(v){ this._className=v; this.classList.classes=new Set(v.split(/\s+/).filter(Boolean)); }
  get className(){ return Array.from(this.classList.classes).join(' '); }
  focus(){ this.onfocus?.(); }
  getContext(){ return dummyCtx; }
  addEventListener(type,fn){ (this.listeners[type]=this.listeners[type]||[]).push(fn); }
  removeEventListener(type,fn){ this.listeners[type]=(this.listeners[type]||[]).filter(f=>f!==fn); }
  dispatchEvent(evt){
    evt.target ??= this;
    (this.listeners[evt.type]||[]).forEach(fn=>fn.call(this, evt));
  }
  remove(){ }
}

class CanvasElem extends Elem {
  constructor(){
    super('canvas');
    this.width=0;
    this.height=0;
  }
}

const dummyCtx={ fillRect(){}, strokeRect(){}, drawImage(){}, clearRect(){}, beginPath(){}, moveTo(){}, lineTo(){}, stroke(){},
  save(){}, restore(){}, translate(){}, fillText(){}, globalAlpha:1, font:'' };

function makeDocument(){
  const elements={ '.tabs': new Elem() };
  const getElementById=id=>{
    if(!elements[id]){
      elements[id]=(id==='game'?new CanvasElem():new Elem());
      elements[id].id=id;
    }
    return elements[id];
  };
  return {
    body:new Elem('body'),
    getElementById,
    createElement(tag){ return tag==='canvas'?new CanvasElem():new Elem(tag); },
    querySelector(sel){ if(elements[sel]) return elements[sel]; return this.body.querySelector(sel); },
    querySelectorAll(sel){ return this.body.querySelectorAll(sel); }
  };
}

const full = await fs.readFile(new URL('../scripts/dustland-engine.js', import.meta.url), 'utf8');

export function createGameProxy(party){
  const document=makeDocument();
  const stubTimeout=(fn)=>{ queueMicrotask(fn); return 0; };
  const stubClear=()=>{};
  const winListeners={};
  const window={
    document,
    setTimeout:stubTimeout,
    clearTimeout:stubClear,
    AudioContext:AudioCtx,
    webkitAudioContext:AudioCtx,
    Audio,
    HTMLCanvasElement:CanvasElem,
    addEventListener:(t,f)=>{ (winListeners[t]=winListeners[t]||[]).push(f); },
    removeEventListener:(t,f)=>{ winListeners[t]=(winListeners[t]||[]).filter(fn=>fn!==f); },
    dispatchEvent:evt=>{ (winListeners[evt.type]||[]).forEach(fn=>fn(evt)); },
    KeyboardEvent: class { constructor(type,init={}){ this.type=type; Object.assign(this,init); } },
    Event: class { constructor(type,init={}){ this.type=type; Object.assign(this,init); } },
    innerWidth:800
  };
  party.flags={};
  const EventBus=(function(){
    const listeners={};
    return {
      on:(evt,fn)=>{ (listeners[evt]=listeners[evt]||[]).push(fn); },
      emit:(evt,payload)=>{ (listeners[evt]||[]).forEach(fn=>fn(payload)); }
    };
  })();
  const context={
    window,
    document,
    navigator:{ userAgent:'Test' },
    setTimeout:stubTimeout,
    clearTimeout:stubClear,
    AudioContext:AudioCtx,
    webkitAudioContext:AudioCtx,
    Audio,
    EventBus,
    Dustland:{ eventBus: EventBus },
    requestAnimationFrame:()=>0,
    move:()=>{},
    interact:()=>{},
    showTab:()=>{},
    takeNearestItem:()=>{},
    toast:()=>{},
    NPCS:[],
    party,
    selectedMember:0,
    state:{ map:'world' },
    player:{ hp:10, scrap:0 },
    save:()=>{},
    load:()=>{},
    resetAll:()=>{},
    genWorld:()=>{},
    buildings:[],
    interiors:{},
    assert:()=>{},
    openCreator:()=>{},
    closeCreator:()=>{},
    startGame:()=>{},
    overlay:null,
    handleDialogKey:()=>false,
    handleCombatKey:()=>false,
    showMini:false,
    console,
    URLSearchParams,
    location:{ search:'', hash:'' },
    statLine:()=>'',
    xpToNext:()=>100,
    unequipItem:()=>{}
  };
  vm.createContext(context);
  vm.runInContext(full, context);
  return { context, document };
}

export { makeDocument };
