(function(){
  type StarterItem = {
    id: string;
    name: string;
    type: string;
    use: {
      type: string;
      amount: number;
      text: string;
    };
  };

  type StarterDustland = DustlandNamespace & {
    starterItems?: StarterItem[];
  };

  const dustland: StarterDustland =
    (globalThis.Dustland as StarterDustland | undefined) ||
    (globalThis.Dustland = {} as StarterDustland);

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
