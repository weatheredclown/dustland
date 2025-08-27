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
  constructor(){
    this.children=[];
    this.style={};
    this._className='';
    this.classList={
      classes:new Set(),
      toggle:(cls,cond)=>{ cond?this.classList.classes.add(cls):this.classList.classes.delete(cls); },
      contains:(cls)=>this.classList.classes.has(cls),
      add:(cls)=>{ this.classList.classes.add(cls); },
      remove:(cls)=>{ this.classList.classes.delete(cls); }
    };
  }
  appendChild(child){ this.children.push(child); child.parentElement=this; }
  prepend(child){ this.children.unshift(child); child.parentElement=this; }
  querySelector(sel){
    if(sel==='.portrait'){
      const e=new Elem();
      this.children.push(e);
      return e;
    }
    return null;
  }
  querySelectorAll(sel){
    if(sel==='.pcard') return this.children.filter(c=>c.classList.contains('pcard'));
    return [];
  }
  set innerHTML(v){ this._innerHTML=v; if(v==='') this.children=[]; }
  get innerHTML(){ return this._innerHTML; }
  set className(v){ this._className=v; this.classList.classes=new Set(v.split(/\s+/).filter(Boolean)); }
  get className(){ return Array.from(this.classList.classes).join(' '); }
  focus(){ this.onfocus?.(); }
  getContext(){ return dummyCtx; }
  addEventListener(){ }
  removeEventListener(){ }
  remove(){ }
}

class CanvasElem extends Elem {
  constructor(){
    super();
    this.width=0;
    this.height=0;
  }
}

const dummyCtx={ fillRect(){}, strokeRect(){}, drawImage(){}, clearRect(){}, beginPath(){}, moveTo(){}, lineTo(){}, stroke(){},
  save(){}, restore(){}, translate(){}, fillText(){}, globalAlpha:1, font:'' };

function makeDocument(){
  const elements={ '.tabs': new Elem() };
  return {
    body:new Elem(),
    getElementById(id){ if(!elements[id]) elements[id]=(id==='game'?new CanvasElem():new Elem()); return elements[id]; },
    createElement(tag){ return tag==='canvas'?new CanvasElem():new Elem(); },
    querySelector(sel){ return elements[sel] || null; }
  };
}

const full = await fs.readFile(new URL('../dustland-engine.js', import.meta.url), 'utf8');

export function createGameProxy(party){
  const document=makeDocument();
  const window={
    document,
    AudioContext:AudioCtx,
    webkitAudioContext:AudioCtx,
    Audio,
    HTMLCanvasElement:CanvasElem,
    addEventListener:()=>{},
    removeEventListener:()=>{},
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
    AudioContext:AudioCtx,
    webkitAudioContext:AudioCtx,
    Audio,
    EventBus,
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
    player:{ hp:10, ap:2, scrap:0 },
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
