(function(){
  const dustland = (globalThis.Dustland ??= {} as DustlandNamespace);

  const starterItems: StarterItem[] = [
    {
      id: 'starter_canteen',
      name: 'Canteen',
      type: 'misc',
      use: { type: 'hydrate', amount: 2, text: 'You take a drink.' }
    }
  ];

  dustland.starterItems = starterItems;
})();
