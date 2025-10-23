type StarterItem = {
  id: string;
  name: string;
  type: 'misc';
  use: {
    type: 'hydrate';
    amount: number;
    text: string;
  };
};

const starterItems: StarterItem[] = [
  {
    id: 'starter_canteen',
    name: 'Canteen',
    type: 'misc',
    use: { type: 'hydrate', amount: 2, text: 'You take a drink.' }
  }
];

type StarterItemsNamespace = DustlandNamespace & {
  starterItems: StarterItem[];
};

const dustland = (globalThis.Dustland ??= {}) as StarterItemsNamespace;
dustland.starterItems = starterItems;
