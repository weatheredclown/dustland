// ===================== DUSTLAND CONTENT PACK v1 ======================

// Safe helpers (don’t collide with your existing ones)
function dropItemSafe(map, x, y, item) {
  const spot = findFreeDropTile(map, x, y);
  itemDrops.push({ map, x: spot.x, y: spot.y, ...item });
}

function hasItem(name) { return player.inv.some(it => it.name === name); }
function leader() { return party.leader(); }
function skillRoll(stat, add = 0, sides = ROLL_SIDES) {
  return Dice.skill(leader(), stat, add, sides);
}

// ---------- World Items (static seeds around the central road) ----------
function seedStaticItems() {
  const midY = Math.floor(WORLD_H/2);
  // Starter line along the road (safe from water)
  dropItemSafe('world', 8,  midY, {name:'Pipe Rifle', slot:'weapon', mods:{ATK:+2}});
  dropItemSafe('world', 10, midY, {name:'Leather Jacket', slot:'armor', mods:{DEF:+1}});
  dropItemSafe('world', 12, midY, {name:'Lucky Bottlecap', slot:'trinket', mods:{LCK:+1}});

  // A few ruins goodies
  const spots = [
    {x: 28, y: midY-4}, {x: 35, y: midY+6}, {x: 52, y: midY-3},
    {x: 67, y: midY+5}, {x: 83, y: midY-2}, {x: 95, y: midY+2}
  ];
  const loot = [
    {name:'Crowbar', slot:'weapon', mods:{ATK:+1}},
    {name:'Rebar Club', slot:'weapon', mods:{ATK:+1}},
    {name:'Kevlar Scrap Vest', slot:'armor', mods:{DEF:+2}},
    {name:'Goggles', slot:'trinket', mods:{PER:+1}},
    {name:'Wrench', slot:'trinket', mods:{INT:+1}},
    {name:'Lucky Rabbit Foot', slot:'trinket', mods:{LCK:+1}},
  ];
  spots.forEach((s,i)=> dropItemSafe('world', s.x, s.y, loot[i % loot.length]));
}

// ---------- Quests ----------
/*
  Q_WATERPUMP  : Fix the farm pump (find Valve)
  Q_RECRUIT_GRIN: Recruit Grin the Scav
  Q_POSTAL     : Return the Lost Satchel
  Q_TOWER      : Repair radio tower console
  Q_IDOL       : Recover the Rust Idol for the Hermit
  Q_TOLL       : Deal with the Duchess (nod / refuse)
*/
const Q = {
  HALL_KEY: 'q_hall_key',
  WATERPUMP: 'q_waterpump',
  RECRUIT_GRIN: 'q_recruit_grin',
  POSTAL: 'q_postal',
  TOWER: 'q_tower',
  IDOL: 'q_idol',
  TOLL: 'q_toll',
};

// ---------- NPC Factories ----------
function npc_PumpKeeper(x, y) {
  const quest = new Quest(
    Q.WATERPUMP,
    'Water for the Pump',
    'Find a Valve and help Mara restart the pump.',
    { item:'Valve', reward:{name:'Rusted Badge', slot:'trinket', mods:{LCK:+1}}, xp:4 }
  );
  return makeNPC('pump', 'world', x, y, '#9ef7a0', 'Mara the Pump-Keeper', 'Parched Farmer', 'Sunburnt hands, hopeful eyes. Smells faintly of mud.', {
    start: { text: ['I can hear the pump wheeze. Need a Valve to breathe again.', 'Pump’s choking on sand. Only a Valve will save it.'],
      choices: [
        {label:'(Accept) I will find a Valve.', to:'accept', q:'accept'},
        {label:'(Hand Over Valve)', to:'turnin', q:'turnin'},
        {label:'(Leave)', to:'bye'}
      ]},
    accept: { text: 'Bless. Try the roadside ruins.',
      choices:[{label:'(Ok)', to:'bye'}] },
    turnin: { text: 'Let me see...',
      choices:[{label:'(Give Valve)', to:'do_turnin'}] },
    do_turnin: { text: 'It fits! Water again. Take this.',
      choices:[{label:'(Continue)', to:'bye'}] },
  }, quest);
}

function npc_Grin(x,y){
  const quest = new Quest(
    Q.RECRUIT_GRIN,
    'Recruit Grin',
    'Convince or pay Grin to join.'
  );
  const processNode = function(node){
    if(node==='start'){
      defaultQuestProcessor(this,'accept');
    }
    if(node==='rollcha'){
      const r = skillRoll('CHA'); const dc = DC.TALK;
      textEl.textContent = `Roll: ${r} vs DC ${dc}. ${r>=dc ? 'Grin smirks: "Alright."' : 'Grin shrugs: "Not buying it."'}`;
      if(r>=dc){
        const m = makeMember('grin', 'Grin', 'Scavenger');
        m.stats.AGI += 1; m.stats.PER += 1;
        addPartyMember(m);
        removeNPC(this);
        defaultQuestProcessor(this,'do_turnin');
      }
    }
    if(node==='dopay'){
      const tIndex = player.inv.findIndex(it=> it.slot==='trinket');
      if(tIndex>-1){
        removeFromInv(tIndex);
        const m = makeMember('grin', 'Grin', 'Scavenger');
        addPartyMember(m);
        removeNPC(this);
        log('Grin joins you.');
        defaultQuestProcessor(this,'do_turnin');
      } else {
        textEl.textContent = 'You have no trinket to pay with.';
      }
    }
  };
  return makeNPC('grin','world',x,y,'#caffc6','Grin','Scav-for-Hire','Lean scav with a crowbar and half a smile.',{
    start:{ text:['Got two hands and a crowbar. You got a plan?','Crowbar’s itching for work. You hiring?'],
      choices:[
        {label:'(Recruit) Join me.', to:'rec'},
        {label:'(Chat)', to:'chat'},
        {label:'(Leave)', to:'bye'}
      ]},
    chat:{ text:['Keep to the road. The sand eats soles and souls.','Stay off the dunes. Sand chews boots.'],
      choices:[{label:'(Nod)', to:'bye'}] },
    rec:{ text:'Convince me. Or pay me.',
      choices:[
        {label:'(CHA) Talk up the score', to:'cha'},
        {label:'(Pay) Give 1 trinket as hire bonus', to:'pay'},
        {label:'(Back)', to:'start'}
      ]},
    cha:{ text:'Roll vs CHA...',
      choices:[{label:'(Roll)', to:'rollcha'}] },
    rollcha:{ text:'…', choices:[{label:'(Ok)', to:'bye'}] },
    pay:{ text:'Hand me something shiny.',
      choices:[{label:'(Give random trinket)', to:'dopay'}] },
    dopay:{ text:'Deal.', choices:[{label:'(Ok)', to:'bye'}] },
  }, quest, processNode);
}

function npc_Postmaster(x,y){
  const quest = new Quest(
    Q.POSTAL,
    'Lost Parcel',
    'Find and return the Lost Satchel to Ivo.',
    { item:'Lost Satchel', reward:{name:'Brass Stamp', slot:'trinket', mods:{LCK:+1}}, xp:4 }
  );
  return makeNPC('post','world',x,y,'#b8ffb6','Postmaster Ivo','Courier of Dust','Dusty courier seeking a lost parcel.',{
    start:{ text:'Lost a courier bag on the road. Grey canvas. Reward if found.',
      choices:[
        {label:'(Accept) I will look.', to:'accept', q:'accept'},
        {label:'(Turn in Satchel)', to:'turnin', q:'turnin'}, {label:'(Leave)', to:'bye'}
      ]},
    accept:{ text:'Much obliged.',
      choices:[{label:'(Ok)', to:'bye'}] },
    turnin:{ text:'You got it?',
      choices:[{label:'(Give Lost Satchel)', to:'do_turnin'}] },
    do_turnin:{ text:'Mail moves again. Take this stamp. Worth more than water.',
      choices:[{label:'(Ok)', to:'bye'}] }
  }, quest);
}

function npc_TowerTech(x,y){
  const quest = new Quest(
    Q.TOWER,
    'Dead Air',
    'Repair the radio tower console (Toolkit helps).',
    { item:'Toolkit', reward:{name:'Tuner Charm', slot:'trinket', mods:{PER:+1}}, xp:5 }
  );
  const processNode = function(node){
    if(node==='rollint'){
      if(!player.inv.some(it=> it.name==='Toolkit')){
        textEl.textContent = 'You need a Toolkit to even try.';
        return;
      }
      const r = skillRoll('INT'); const dc = DC.REPAIR;
      textEl.textContent = `Roll: ${r} vs DC ${dc}. ${r>=dc ? 'Static fades. The tower hums.' : 'You cross a wire and pop a fuse.'}`;
      if(r>=dc){
        defaultQuestProcessor(this,'do_turnin');
      }
    }
  };
  return makeNPC('tower','world',x,y,'#a9f59f','Rella','Radio Tech','Tower technician with grease-stained hands.',{
    start:{ text:'Tower’s console fried. If you got a Toolkit and brains, lend both.',
      choices:[
        {label:'(Accept) I will help.', to:'accept', q:'accept'},
        {label:'(Repair) INT check with Toolkit', to:'repair', q:'turnin'},
        {label:'(Leave)', to:'bye'}
      ]},
    accept:{ text:'I owe you static and thanks.', choices:[{label:'(Ok)', to:'bye'}] },
    repair:{ text:'Roll vs INT...',
      choices:[{label:'(Roll)', to:'rollint'}] },
    rollint:{ text:'…', choices:[{label:'(Ok)', to:'bye'}] }
  }, quest, processNode);
}

function npc_IdolHermit(x,y){
  const quest = new Quest(
    Q.IDOL,
    'Rust Idol',
    'Recover the Rust Idol from roadside ruins.',
    { item:'Rust Idol', reward:{name:'Pilgrim Thread', slot:'trinket', mods:{CHA:+1}}, xp:5 }
  );
  return makeNPC('hermit','world',x,y,'#9abf9a','The Shifting Hermit','Pilgrim','A cloaked hermit murmuring about rusted idols.',{
    start:{ text:'Something rust-holy sits in the ruins. Bring the Idol.',
      choices:[
        {label:'(Accept)', to:'accept', q:'accept'},
        {label:'(Offer Rust Idol)', to:'turnin', q:'turnin'},
        {label:'(Leave)', to:'bye'}
      ]},
    accept:{ text:'The sand will guide or bury you.', choices:[{label:'(Ok)', to:'bye'}] },
    turnin:{ text:'Do you carry grace?',
      choices:[{label:'(Give Idol)', to:'do_turnin'}] },
    do_turnin:{ text:'The idol warms. You are seen.',
      choices:[{label:'(Ok)', to:'bye'}] }
  }, quest);
}

// Shadow version of your Duchess (kept light)
function npc_Duchess(x,y){
  const quest = new Quest(
    Q.TOLL,
    'Toll-Booth Etiquette',
    'You met the Duchess on the road.',
    {xp:2}
  );
  const processNode = function(node){
    if(node==='pay' || node==='ref'){
      defaultQuestProcessor(this,'accept');
      defaultQuestProcessor(this,'do_turnin');
    }
  };
  return makeNPC('duchess','world',x,y,'#a9f59f','Scrap Duchess','Toll-Queen','A crown of bottlecaps; eyes like razors.',{
    start:{text:['Road tax or road rash.','Coins or cuts. Your pick.'],
      choices:[
        {label:'(Pay) Nod and pass', to:'pay'},
        {label:'(Refuse)', to:'ref'},
        {label:'(Leave)', to:'bye'}
      ]},
    pay:{text:'Wise. Move along.', choices:[{label:'(Ok)', to:'bye'}]},
    ref:{text:'Brave. Or foolish.', choices:[{label:'(Ok)', to:'bye'}]}
  }, quest, processNode);
}

function npc_Raider(x,y){
  const processNode = function(node){
    if(node==='rollcha'){
      const r = skillRoll('CHA'); const dc = DC.TALK;
      textEl.textContent = `Roll: ${r} vs DC ${dc}. ${r>=dc ? 'He grunts and lets you pass.' : 'He tightens his grip.'}`;
    }
    if(node==='do_fight'){
      const res = quickCombat({DEF:5, loot:{name:'Raider Knife', slot:'weapon', mods:{ATK:+1}}});
      const msg = res.result==='loot' ? 'The raider collapses. You take his knife.' :
                  res.result==='bruise' ? 'A sharp blow leaves a bruise.' :
                  'You back away from the raider.';
      textEl.textContent = `Roll: ${res.roll} vs DEF ${res.dc}. ${msg}`;
      if(res.result==='loot') removeNPC(this);
    }
  };
  return makeNPC('raider','world',x,y,'#f88','Road Raider','Bandit','Scarred scav looking for trouble.',{
    start:{text:'A raider blocks the path, eyeing your gear.', choices:[
      {label:'(Fight)', to:'do_fight'},
      {label:'(Talk) Stand down', to:'rollcha'},
      {label:'(Leave)', to:'bye'}
    ]},
    rollcha:{text:'', choices:[{label:'(Continue)', to:'bye'}]},
    do_fight:{text:'', choices:[{label:'(Continue)', to:'bye'}]}
  }, null, processNode);
}

function npc_Trader(x,y){
  const processNode = function(node){
    if(node==='sell'){
      const items = player.inv.map((it,idx)=>({label:`Sell ${it.name} (${Math.max(1, it.value || 0)} ${CURRENCY})`, to:'sell', sellIndex:idx}));
      if(items.length===0){
        this.tree.sell.text = 'Nothing to sell.';
      } else {
        this.tree.sell.text = 'What are you selling?';
      }
      items.push({label:'(Back)', to:'start'});
      this.tree.sell.choices = items;
    }
  };
  const processChoice = function(c){
    if(typeof c.sellIndex==='number'){
      const it = player.inv.splice(c.sellIndex,1)[0];
      const val = Math.max(1, it.value || 0);
      player.scrap += val;
      renderInv(); updateHUD();
      textEl.textContent = `Sold ${it.name} for ${val} ${CURRENCY}.`;
      currentNode='sell';
      renderDialog();
      return true;
    }
  };
  return makeNPC('trader','world',x,y,'#caffc6','Cass the Trader','Shopkeep','A roving merchant weighing your wares.',{
    start:{ text:'Got goods to sell? I pay in scrap.', choices:[
      {label:'(Sell items)', to:'sell'},
      {label:'(Leave)', to:'bye'}
    ]},
    sell:{ text:'What are you selling?', choices:[] }
  }, null, processNode, processChoice);
}

function npc_ExitDoor(x,y){
  const quest = new Quest(
    Q.HALL_KEY,
    'Find the Rusted Key',
    'Search the hall for a Rusted Key to unlock the exit.',
    {item:'Rusted Key', moveTo:{x:hall.entryX-1,y:2}}
  );

  return makeNPC(
    'exitdoor', HALL_ID, x, y,
    '#a9f59f',
    'Caretaker Kesh',          // was 'Locked Door'
    'Hall Steward',            // was 'Needs Key'
    'Weary caretaker guarding the hall\'s chained exit.',
    {
      start: { text: 'Caretaker Kesh eyes the chained exit.',
        choices: [
          {label:'(Search for key)', to:'accept', q:'accept'},
          {label:'(Use Rusted Key)', to:'do_turnin', q:'turnin'},
          {label:'(Leave)', to:'bye'}
        ]},
      accept:{ text:'Try the crates. And don’t scuff the floor.', choices:[{label:'(Okay)', to:'bye'}] },
      do_turnin:{ text:'Kesh unlocks the chain. “Off you go.”', choices:[{label:'(Continue)', to:'bye'}] }
    },
    quest,
    function(node){
      if(node==='do_turnin'){ startRealWorld(); closeDialog(); }
    }
  );
}

function npc_KeyCrate(x,y){
  return makeNPC('keycrate',HALL_ID,x,y,'#9ef7a0','Dusty Crate','','A dusty crate that might hide something useful.',{
    start:{text:'A dusty crate rests here.',choices:[{label:'(Open)',to:'open'}]},
    open:{text:'Inside you find a Rusted Key.',choices:[{label:'(Take Rusted Key)',to:'take'}]},
    take:{text:'You pocket the key.',choices:[{label:'(Done)',to:'bye'}]}
  }, null, function(node){
    if(node==='take'){
      addToInv({name:'Rusted Key'});
      this.tree.start={text:'An empty crate.',choices:[{label:'(Leave)',to:'bye'}]};
    }
  });
}

function npc_HallDrifter(x,y){
  return makeNPC('hallflavor',HALL_ID,x,y,'#b8ffb6','Lone Drifter','Mutters','A drifter muttering to themselves.',{
    start:{text:'"Dust gets in everything."',choices:[{label:'(Nod)',to:'bye'}]}
  });
}

const NPC_FACTORY = {
  pump: npc_PumpKeeper,
  grin: npc_Grin,
  post: npc_Postmaster,
  tower: npc_TowerTech,
  hermit: npc_IdolHermit,
  duchess: npc_Duchess,
  raider: npc_Raider,
  trader: npc_Trader,
  exitdoor: npc_ExitDoor,
  keycrate: npc_KeyCrate,
  hallflavor: npc_HallDrifter
};
// ---------- World NPC + item seeding ----------
function seedWorldContent(){
  // Items
  seedStaticItems();

  // Quest macguffins placed along/near the road (safe)
  const midY = Math.floor(WORLD_H/2);
  dropItemSafe('world', 18, midY-2, {name:'Valve'});
  dropItemSafe('world', 26, midY+3, {name:'Lost Satchel'});
  dropItemSafe('world', 60, midY-1, {name:'Rust Idol'});

  // NPC placements (roadside)
  NPCS.push(npc_PumpKeeper(14, midY-1));
  NPCS.push(npc_Grin(22, midY));
  NPCS.push(npc_Postmaster(30, midY+1));
  NPCS.push(npc_TowerTech(48, midY-2));
  NPCS.push(npc_Raider(56, midY-1));
  NPCS.push(npc_Trader(34, midY-1));
  NPCS.push(npc_IdolHermit(68, midY+2));
  NPCS.push(npc_Duchess(40, midY));

  // Populate some building interiors
  const interiorLoot = [
    {name:'Canned Beans', value:2},
    {name:'Scrap Wire', value:1},
    {name:'Old Coin', value:5}
  ];
  const interiorLines = ['Stay safe out there.', 'Not much left for scavvers.'];
  let lootIx = 0, lineIx = 0;
  buildings.filter(b=>!b.boarded).forEach((b,i)=>{
    const I = interiors[b.interiorId];
    if(!I) return;
    const cx = Math.floor(I.w/2), cy = Math.floor(I.h/2);
    dropItemSafe(b.interiorId, cx, cy, interiorLoot[lootIx++ % interiorLoot.length]);
    if(i % 2 === 0){
      NPCS.push(makeNPC('hut_dweller'+i, b.interiorId, cx+1, cy, '#a9f59f', 'Hut Dweller','', 'A weary dweller taking shelter.', {
        start:{ text: interiorLines[lineIx++ % interiorLines.length], choices:[{label:'(Leave)', to:'bye'}] }
      }));
    }
  });
}
// =================== END DUSTLAND CONTENT PACK v1 =====================
