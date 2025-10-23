type DustlandWithStarterItems = NonNullable<typeof globalThis.Dustland> & {
  starterItems: StarterItem[];
};

(function(){
  if(!globalThis.Dustland){
    globalThis.Dustland = {};
  }
  const dustland = globalThis.Dustland as DustlandWithStarterItems;
  dustland.starterItems = [
    {
      id: 'starter_canteen',
      name: 'Canteen',
      type: 'misc',
      use: { type: 'hydrate', amount: 2, text: 'You take a drink.' }
    }
  ];
})();
