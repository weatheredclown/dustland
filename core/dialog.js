// ===== Dialog =====
const overlay=document.getElementById('overlay');
const choicesEl=document.getElementById('choices');
const textEl=document.getElementById('dialogText');
const nameEl=document.getElementById('npcName');
const titleEl=document.getElementById('npcTitle');
const portEl=document.getElementById('port');
let currentNPC=null;
Object.defineProperty(globalThis,'currentNPC',{get:()=>currentNPC,set:v=>{currentNPC=v;}});
const dialogState={ tree:null, node:null };
let selectedChoice=0;

function dlgHighlightChoice(){
  [...choicesEl.children].forEach((c,i)=>{
    if(c.classList?.toggle) c.classList.toggle('sel', i===selectedChoice);
  });
}

function dlgMoveChoice(dir){
  const total=choicesEl.children.length;
  if(total===0) return;
  selectedChoice=(selectedChoice+dir+total)%total;
  dlgHighlightChoice();
}

function handleDialogKey(e){
  if(!dialogState.tree) return false;
  switch(e.key){
    case 'ArrowUp':
    case 'ArrowLeft':
    case 'w':
    case 'W':
    case 'a':
    case 'A':
      dlgMoveChoice(-1); return true;
    case 'ArrowDown':
    case 'ArrowRight':
    case 's':
    case 'S':
    case 'd':
    case 'D':
      dlgMoveChoice(1); return true;
    case 'Enter':{
      const el=choicesEl.children[selectedChoice];
      if(el?.click) el.click(); else el?.onclick?.();
      return true; }
    case 'Escape':
      closeDialog(); return true;
  }
  return false;
}

function normalizeDialogTree(tree){
  const out={};
  for(const id in tree){
    const n=tree[id];
    const next=(n.next||n.choices||[]).map(c=>{
      if(typeof c==='string') return {id:c,label:c};
      const {to,id:cid,label,text,checks=[],effects=[],...rest}=c;
      const obj={id:to||cid,label:label||text||'(Continue)',checks,effects,...rest};
      if(to) obj.to=to;
      return obj;
    });
    out[id]={text:n.text||'',checks:n.checks||[],effects:n.effects||[],next};
  }
  return out;
}

function runEffects(effects){
  for(const fn of effects||[]){ if(typeof fn==='function') fn({player,party,state}); }
}

function resolveCheck(check, actor=leader(), rng=Math.random){
  const roll = Dice.skill(actor, check.stat, 0, ROLL_SIDES, rng);
  const dc = check.dc || 0;
  const success = roll >= dc;
  log?.(`Check ${check.stat} rolled ${roll} vs DC ${dc}: ${success?'success':'fail'}`);
  runEffects(success ? check.onSuccess : check.onFail);
  return { success, roll, dc, stat: check.stat };
}


function processQuestFlag(c){
  if(!currentNPC?.quest || !c?.q) return;
  if(c.q==='accept') defaultQuestProcessor(currentNPC,'accept');
  if(c.q==='turnin') defaultQuestProcessor(currentNPC,'do_turnin');
}

function joinParty(join){
  if(!join) return;
  const opts = {};
  if(join.portraitSheet){
    opts.portraitSheet = join.portraitSheet;
  } else if(currentNPC?.portraitSheet){
    opts.portraitSheet = currentNPC.portraitSheet;
  }
  const m=makeMember(join.id, join.name, join.role, opts);
  if(addPartyMember(m)){
    removeNPC(currentNPC);
  }
}

// Teleport actor to a new position.
// g: { map?, x?, y?, target?:'npc'|'player', rel?:true }
//   target defaults to player (party).
//   rel=true offsets from current position.
function handleGoto(g){
  if(!g) return;
  const tgtNPC = g.target === 'npc' ? currentNPC : null;
  const base = tgtNPC || party;
  const x = g.rel ? base.x + (g.x || 0) : (g.x != null ? g.x : base.x);
  const y = g.rel ? base.y + (g.y || 0) : (g.y != null ? g.y : base.y);
  if(tgtNPC){
    if(g.map) tgtNPC.map = g.map;
    tgtNPC.x = x;
    tgtNPC.y = y;
    if(tgtNPC._loop){
      tgtNPC._loop.path = [];
      tgtNPC._loop.job = null;
    }
  }else{
    if(g.map==='world'){
      startWorld();
      setPartyPos(x, y);
      setMap('world');
    }else{
      setPartyPos(x, y);
      if(g.map) setMap(g.map); else if(typeof centerCamera==='function') centerCamera(party.x,party.y,state.map);
    }
  }
  updateHUD?.();
}

function advanceDialog(stateObj, choiceIdx){
  const prevNode = stateObj.node;
  const node=stateObj.tree[stateObj.node];
  const choice=node.next[choiceIdx];
  if(!choice){ stateObj.node=null; return {next:null, text:null, close:true, success:false}; }

  if(currentNPC?.processChoice?.(choice)){
    return {next:null, text:null, close:false, success:true};
  }

  runEffects(choice.checks);

  const res={next:null, text:null, close:false, success:true};
  const finalize=(text, ok)=>{ res.text=text||null; res.close=true; res.success=!!ok; stateObj.node=null; return res; };

  if(choice.reqItem || choice.reqSlot){
    const requiredCount = choice.reqCount || 1;
    const hasEnough = choice.reqItem
      ? countItems(choice.reqItem) >= requiredCount
      : player.inv.some(it => it.slot === choice.reqSlot);

    if(!hasEnough){
      return finalize(choice.failure || 'You lack the required item.', false);
    }
    Actions.applyQuestReward(choice.reward);
    joinParty(choice.join);
    processQuestFlag(choice);
    runEffects(choice.effects);
    if(choice.goto){
      handleGoto(choice.goto);
      res.close=true; res.success=true; stateObj.node=null; return res;
    }
    return finalize(choice.success || '', true);
  }

  if(choice.costItem || choice.costSlot){
    const costCount = choice.costCount || 1;
    const hasEnough = choice.costItem
      ? countItems(choice.costItem) >= costCount
      : player.inv.some(it => it.slot === choice.costSlot);

    if(!hasEnough){
      return finalize(choice.failure || 'You lack the required item.', false);
    }

    if (choice.costItem) {
      for (let i = 0; i < costCount; i++) {
        const itemIdx = findItemIndex(choice.costItem);
        if (itemIdx > -1) removeFromInv(itemIdx);
      }
    } else if (choice.costSlot) {
      const itemIdx = player.inv.findIndex(it=> it.slot===choice.costSlot);
      if (itemIdx > -1) removeFromInv(itemIdx);
    }

    Actions.applyQuestReward(choice.reward);
    joinParty(choice.join);
    processQuestFlag(choice);
    runEffects(choice.effects);
    if(choice.goto){
      handleGoto(choice.goto);
      res.close=true; res.success=true; stateObj.node=null; return res;
    }
    return finalize(choice.success || '', true);
  }

  if(choice.check){
    const { success, roll, dc } = resolveCheck(choice.check, leader());
    log?.(`Dialog check ${choice.check.stat}: ${roll} vs ${dc}`);
    if(!success){
      return finalize(choice.failure || 'Failed.', false);
    }
  }

  Actions.applyQuestReward(choice.reward);
  joinParty(choice.join);
  processQuestFlag(choice);
  runEffects(choice.effects);

  if (choice.q === 'accept' && currentNPC?.quest) {
    const meta = currentNPC.quest;
    const requiredCount = meta.count || 1;
    const hasItems = !meta.item || countItems(meta.item) >= requiredCount;
    const hasFlag = !meta.reqFlag || (typeof flagValue === 'function' && flagValue(meta.reqFlag));
    if (meta.status === 'active' && hasItems && hasFlag) {
      res.next = prevNode;
      stateObj.node = prevNode;
      return res;
    }
  }

  if (choice.applyModule) {
    const moduleData = globalThis[choice.applyModule];
    if (moduleData) {
      applyModule(moduleData, { fullReset: false });
    } else {
      console.error(`Module ${choice.applyModule} not found in global scope.`);
    }
  }

  if(choice.goto){
    handleGoto(choice.goto);
    res.close=true; res.success=true; stateObj.node=null; return res;
  }

  const nextId = choice.to || choice.id;
  if (nextId) {
    res.next = nextId;
    stateObj.node = nextId;
    return res;
  }

  return finalize(choice.text || '', true);
}

const onceChoices = globalThis.usedOnceChoices || (globalThis.usedOnceChoices = new Set());

function setPortrait(portEl, npc){
  if(!npc.portraitSheet){
    portEl.style.backgroundImage = '';
    portEl.style.background = npc.color || '#274227';
    return;
  }
  portEl.style.background = 'transparent';
  if(/_4\.[a-z]+$/i.test(npc.portraitSheet)){
    const frame = Math.floor(Math.random() * 4);
    const col = frame % 2;
    const row = Math.floor(frame/2);
    const posX = col === 0 ? '0%' : '100%';
    const posY = row === 0 ? '0%' : '100%';
    portEl.style.backgroundImage = `url(${npc.portraitSheet})`;
    portEl.style.backgroundSize = '200% 200%';
    portEl.style.backgroundPosition = `${posX} ${posY}`;
  } else {
    portEl.style.backgroundImage = `url(${npc.portraitSheet})`;
    portEl.style.backgroundSize = '100% 100%';
    portEl.style.backgroundPosition = 'center';
  }
}

function openDialog(npc, node='start'){
  currentNPC=npc;
  const rawTree = typeof npc.tree === 'function' ? npc.tree() : npc.tree;
  dialogState.tree=normalizeDialogTree(rawTree||{});
  dialogState.node=node;
  nameEl.textContent=npc.name;
  titleEl.textContent=npc.title;

  setPortrait(portEl, npc);

  const desc = npc.desc;
  if(desc){
    const small=document.createElement('div');
    small.className='small npcdesc';
    small.textContent=desc;
    const hdr=titleEl.parentElement;
    [...hdr.querySelectorAll('.small.npcdesc')].forEach(n=>n.remove());
    hdr.appendChild(small);
  }

  renderDialog();
  overlay.classList.add('shown');
  setGameState(GAME_STATE.DIALOG);
}

function closeDialog(){
  overlay.classList.remove('shown');
  currentNPC=null;
  dialogState.tree=null;
  dialogState.node=null;
  choicesEl.innerHTML='';
  const back= state.map==='world'?GAME_STATE.WORLD:GAME_STATE.INTERIOR;
  setGameState(back);
}

function renderDialog(){
  if(!dialogState.tree) return;
  currentNPC?.processNode?.(dialogState.node);
  if(!dialogState.tree || !dialogState.node) return;
  const node=dialogState.tree[dialogState.node];
  if(!node){ closeDialog(); return; }

  runEffects(node.checks);
  runEffects(node.effects);

  textEl.textContent=node.text;
  choicesEl.innerHTML='';

  if(!node.next || node.next.length===0){
    const cont=document.createElement('div');
    cont.className='choice';
    cont.textContent='(Continue)';
    cont.onclick=()=> closeDialog();
    choicesEl.appendChild(cont);
    selectedChoice=0;
    dlgHighlightChoice();
    return;
  }

  let choices=node.next.map((opt,idx)=>({opt,idx}));

  choices = choices.filter(({opt})=> !opt.if || checkFlagCondition(opt.if));

  if(currentNPC?.quest){
    const meta=currentNPC.quest;
    choices=choices.filter(({opt})=>{
      if(opt.q==='accept' && meta.status!=='available') return false;
      if(opt.q==='turnin' && (meta.status!=='active' || (meta.item && !hasItem(meta.item)))) return false;
      return true;
    });
  }

  choices=choices.filter(({opt})=>{
    if(!opt.once) return true;
    const key=`${currentNPC.id}::${dialogState.node}::${opt.label}`;
    return !onceChoices.has(key);
  });

  const isExit=opt=> opt.to==='bye';
  choices.sort((a,b)=>{
    const aExit=isExit(a.opt);
    const bExit=isExit(b.opt);
    return aExit===bExit?0:(aExit?1:-1);
  });

  choices.forEach(({opt,idx})=>{
    const div=document.createElement('div');
    div.className='choice';
    div.textContent=opt.label||'(Continue)';
    div.onclick=()=>{
      const key=`${currentNPC.id}::${dialogState.node}::${opt.label}`;
      const result=advanceDialog(dialogState,idx);
      if(opt.once && result?.success) onceChoices.add(key);
      if(result && result.text!==null){
        textEl.textContent=result.text;
        choicesEl.innerHTML='';
        const cont=document.createElement('div');
        cont.className='choice';
        cont.textContent='(Continue)';
        cont.onclick=()=>{ if(result.close) closeDialog(); else { dialogState.node=result.next; renderDialog(); } };
        choicesEl.appendChild(cont);
      } else {
        if(result && result.close) closeDialog();
        else renderDialog();
      }
    };
    choicesEl.appendChild(div);
  });
  selectedChoice=0;
  dlgHighlightChoice();
}

const dialogExports = { overlay, choicesEl, textEl, nameEl, titleEl, portEl, openDialog, closeDialog, renderDialog, advanceDialog, resolveCheck, handleDialogKey, handleGoto };
Object.assign(globalThis, dialogExports);
