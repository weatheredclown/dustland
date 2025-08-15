(function(){
  const seed = 123456;
  const midY = Math.floor(WORLD_H/2);

  function makeHall(){
    const w=30, h=22;
    const grid=Array.from({length:h},(_,y)=> Array.from({length:w},(_,x)=>{
      const edge = y===0||y===h-1||x===0||x===w-1; return edge? TILE.WALL : TILE.FLOOR;
    }));
    for(let x=2;x<w-2;x++){ grid[6][x]=TILE.WALL; grid[12][x]=TILE.WALL; }
    grid[6][5]=TILE.DOOR; grid[6][24]=TILE.DOOR; grid[12][15]=TILE.DOOR;
    grid[1][15]=TILE.WALL;
    return {id:'hall', w, h, grid, entryX:15, entryY:18};
  }

  const buildings=[
    {x:20,y:midY-8,w:6,h:5,doorX:23,doorY:midY-4,interiorId:'hut_a'},
    {x:40,y:midY-8,w:6,h:5,doorX:43,doorY:midY-4,interiorId:'hut_b'},
    {x:60,y:midY-8,w:6,h:5,doorX:63,doorY:midY-4,interiorId:'hut_c'}
  ];

  const items=[
    {map:'world',x:8,y:midY,name:'Pipe Rifle',slot:'weapon',mods:{ATK:+2}},
    {map:'world',x:10,y:midY,name:'Leather Jacket',slot:'armor',mods:{DEF:+1}},
    {map:'world',x:12,y:midY,name:'Lucky Bottlecap',slot:'trinket',mods:{LCK:+1}},
    {map:'world',x:18,y:midY-2,name:'Valve'},
    {map:'world',x:26,y:midY+3,name:'Lost Satchel'},
    {map:'world',x:60,y:midY-1,name:'Rust Idol'},
    {map:'hut_a',x:3,y:3,name:'Canned Beans',value:2}
  ];

  const quests=[
    {id:'q_waterpump',title:'Water for the Pump',desc:'Find a Valve and help Mara restart the pump.',item:'Valve',reward:{name:'Rusted Badge',slot:'trinket',mods:{LCK:+1}},xp:4},
    {id:'q_postal',title:'Lost Parcel',desc:'Find and return the Lost Satchel to Ivo.',item:'Lost Satchel',reward:{name:'Brass Stamp',slot:'trinket',mods:{LCK:+1}},xp:4}
  ];

  const npcs=[
    {
      id:'pump',map:'world',x:14,y:midY-1,color:'#9ef7a0',name:'Mara the Pump-Keeper',title:'Parched Farmer',desc:'Sunburnt hands, hopeful eyes. Smells faintly of mud.',questId:'q_waterpump',
      tree:{
        start:{text:'Pump\u2019s choking on sand. Only a Valve will save it.',choices:[
          {label:'(Accept) I will find a Valve.',to:'accept',q:'accept'},
          {label:'(Hand Over Valve)',to:'turnin',q:'turnin'},
          {label:'(Leave)',to:'bye'}
        ]},
        accept:{text:'Bless. Try the roadside ruins.',choices:[{label:'(Ok)',to:'bye'}]},
        turnin:{text:'Let me see...',choices:[{label:'(Give Valve)',to:'do_turnin'}]},
        do_turnin:{text:'It fits! Water again. Take this.',choices:[{label:'(Continue)',to:'bye'}]}
      }
    },
    {
      id:'post',map:'world',x:30,y:midY+1,color:'#b8ffb6',name:'Postmaster Ivo',title:'Courier of Dust',desc:'Dusty courier seeking a lost parcel.',questId:'q_postal',
      tree:{
        start:{text:'Lost a courier bag on the road. Grey canvas. Reward if found.',choices:[
          {label:'(Accept) I will look.',to:'accept',q:'accept'},
          {label:'(Turn in Satchel)',to:'turnin',q:'turnin'},
          {label:'(Leave)',to:'bye'}
        ]},
        accept:{text:'Much obliged.',choices:[{label:'(Ok)',to:'bye'}]},
        turnin:{text:'You got it?',choices:[{label:'(Give Lost Satchel)',to:'do_turnin'}]},
        do_turnin:{text:'Mail moves again. Take this stamp. Worth more than water.',choices:[{label:'(Ok)',to:'bye'}]}
      }
    },
    {
      id:'hut_dweller1',map:'hut_a',x:4,y:3,color:'#a9f59f',name:'Hut Dweller',title:'',desc:'A weary dweller taking shelter.',
      tree:{start:{text:'Stay safe out there.',choices:[{label:'(Leave)',to:'bye'}]}}
    }
  ];

  const moduleData={
    seed,
    interiors:[makeHall()],
    buildings,
    items,
    npcs,
    quests,
    start:{map:'hall',x:15,y:18}
  };

  const _startGame = startGame;
  startGame = function(){
    genWorld(moduleData.seed, moduleData);
    applyModule(moduleData);
    setMap(moduleData.start.map, 'Dustland');
    player.x = moduleData.start.x;
    player.y = moduleData.start.y;
    centerCamera(player.x, player.y, moduleData.start.map);
    renderInv(); renderQuests(); renderParty(); updateHUD();
    log('Adventure begins.');
  };
})();

